import { Land, LandDataMapper, LandModel } from "../../models/missions/common/land.model";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";

import { Configuration, Inject, Injectable } from "@tsed/common";

@Injectable()
export class LandsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;
  private mission2DailyLimits: number;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
    this.mission2DailyLimits = config.get("missions").missions["2"].missionDailyLimit;
  }

  async upsertLandsData(onChainLandData: Land[]): Promise<void> {
    this.postgresClient.transaction(async (trx) => {
      await LandModel(this.postgresClient)
        .transacting(trx)
        .where({ network: this.network })
        .whereNotIn(
          "id",
          onChainLandData.map((land) => land.id)
        )
        .del();
      for (const land of onChainLandData) {
        const landModel = LandDataMapper(this.network).toModel(land);
        await LandModel(this.postgresClient).transacting(trx).insert(landModel).onConflict(["id", "network"]).merge();
      }
    });
  }

  async getLandMissionsLimit(landId: number): Promise<number> {
    const landModel = await LandModel(this.postgresClient).where({ id: landId, network: this.network }).first();
    if (!landModel) {
      throw new Error("getLandMissionsLimit land not found:" + landId);
    }
    return landModel.available_mission_count;
  }

  async getLandById(landId: number): Promise<Land> {
    const landModel = await LandModel(this.postgresClient).where({ id: landId, network: this.network }).first();
    if (!landModel) {
      throw new Error("getLandMissionsLimit land not found:" + landId);
    }
    return LandDataMapper(this.network).fromModel(landModel);
  }

  async getLandsWithActualLimits(): Promise<(Land & { limits: number })[]> {
    const rawData = await this.postgresClient.raw(`
    SELECT lands.*, (lands."available_mission_count" - COUNT( missions.id ))::int as limits
    FROM lands 
    LEFT JOIN missions 
    on missions."land_id"  = lands.id
      and (missions."mission_id" = 0 or missions."mission_id" = 1)
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      GROUP BY lands.id, 
      lands."available_mission_count" , 
      lands."is_private" , 
      lands."owner" , 
      lands.revshare , 
      lands.network , 
      lands."reset_hour" 
    `);

    return rawData.rows as unknown as (Land & { limits: number })[];
  }

  async getOwnerLands(args: { address: string }): Promise<Land[]> {
    const { address } = args;
    const lands = await LandModel(this.postgresClient).where({ owner: address });
    return lands.map((land) => LandDataMapper(this.network).fromModel(land));
  }

  async getAvailableLandsForMission2(args: { address?: string; excludedLandId?: number }): Promise<Land[]> {
    const { address, excludedLandId } = args;
    const publicRequest = !address;
    const rawData = await this.postgresClient.raw(`
    select * from 
    (SELECT lands.*, (${this.mission2DailyLimits} - COUNT( missions.id ))::int as limits
    FROM lands 
      LEFT JOIN missions 
      on missions."land_id"  = lands.id
      and missions."mission_id" = 2
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      ${!publicRequest ? `and lands.owner = '${address}'` : ""}
      ${publicRequest ? `and lands."is_private" = false` : ""}
      GROUP BY lands.id, 
          lands."available_mission_count" , 
          lands."is_private" , 
          lands."owner" , 
          lands.revshare , 
          lands.network , 
          lands."reset_hour",
          lands."blocked_at"
          ) as l
  where l.limits > 0
    and l.transport_hub_level > 0
    and (l.blocked_at is null or l.blocked_at < now() - interval '10 seconds')
		${excludedLandId ? `and l.id != ${excludedLandId}` : ""};`);

    return rawData.rows as unknown as Land[];
  }

  async getAvailableLands(args: { address?: string; excludedLandId?: number }): Promise<Land[]> {
    const { address, excludedLandId } = args;
    const publicRequest = !address;
    const rawData = await this.postgresClient.raw(`
    select * from 
    (SELECT lands.*, (lands."available_mission_count" - COUNT( missions.id ))::int as limits
    FROM lands 
      LEFT JOIN missions 
      on missions."land_id"  = lands.id
      and (missions."mission_id" = 0 or missions."mission_id" = 1)
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      ${!publicRequest ? `and lands.owner = '${address}'` : ""}
      ${publicRequest ? `and lands."is_private" = false` : ""}
      GROUP BY lands.id, 
          lands."available_mission_count" , 
          lands."is_private" , 
          lands."owner" , 
          lands.revshare , 
          lands.network , 
          lands."reset_hour",
          lands."blocked_at"
          ) as l
	where l.limits > 0
		and (l.blocked_at is null or l.blocked_at < now() - interval '10 seconds')
		${excludedLandId ? `and l.id != ${excludedLandId}` : ""};`);

    return rawData.rows as unknown as Land[];
  }

  async blockLandFor10Seconds(args: { landId: number }) {
    const { landId } = args;
    await LandModel(this.postgresClient).where({ id: landId, network: this.network }).update({ blocked_at: new Date() });
  }

  async getLandAvailableMissions(landId: number): Promise<number> {
    const rawData = await this.postgresClient.raw(`
    select * from 
    (SELECT lands.*, (lands."available_mission_count" - COUNT( missions.id ))::int as limits
    FROM lands 
      LEFT JOIN missions 
      on missions."land_id"  = lands.id
      and (missions."mission_id" = 0 or missions."mission_id" = 1)
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      and lands.id = ${+landId}
      GROUP BY lands.id, 
          lands."available_mission_count" , 
          lands."is_private" , 
          lands."owner" , 
          lands.revshare , 
          lands.network , 
          lands."reset_hour",
          lands."blocked_at"
          ) as l
    `);

    if (!rawData.rows.length) throw new Error(`Land with id ${landId} doesn't exist`);
    return rawData.rows[0].limits as unknown as number;
  }

  async getLandAvailableMissions2(landId: number): Promise<number> {
    const rawData = await this.postgresClient.raw(`
    select * from 
    (SELECT lands.*, (${this.mission2DailyLimits} - COUNT( missions.id ))::int as limits
    FROM lands 
      LEFT JOIN missions 
      on missions."land_id"  = lands.id
      and missions."mission_id" = 2
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      and lands.id = ${landId} 
      GROUP BY lands.id, 
          lands."available_mission_count" , 
          lands."is_private" , 
          lands."owner" , 
          lands.revshare , 
          lands.network , 
          lands."reset_hour",
          lands."blocked_at"
          ) as l
      where l.transport_hub_level > 0;
    
    `);

    if (!rawData.rows.length) return 0;
    return rawData.rows[0].limits as unknown as number;
  }

  async getAllLandsCrosschain(args: { address: string }) {
    const { address } = args;
    const lands = await LandModel(this.postgresClient).where({ owner: address });
    return lands.map((land) => LandDataMapper(this.network).fromModelCrosschain(land));
  }

  // tests helpers
  async getAllLandsWithLimits(): Promise<(Land & { limits: number })[]> {
    const rawData = await this.postgresClient.raw(`
    select * from 
    (SELECT lands.*, (lands."available_mission_count" - COUNT( missions.id ))::int as limits
    FROM lands 
      LEFT JOIN missions 
      on missions."land_id"  = lands.id
      and (missions."mission_id" = 0 or missions."mission_id" = 1)
      and (
        	missions.status = 'started'
        		or 
        	(
        		missions.status = 'completed' 
        		and 
        		(
        			(
        				lands."reset_hour" <= date_part('hour', NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now()) + make_interval( hours => lands."reset_hour") 
        			)
        			or 
        			(
        				lands."reset_hour" > date_part('hour',  NOW()) 
        				and 
        				missions."finished_at" > date_trunc('day', now() - interval '1 day') + make_interval( hours => lands."reset_hour")
    				)
        		)
        	)
        )
      where lands.network = '${this.network}'
      GROUP BY lands.id, 
          lands."available_mission_count" , 
          lands."is_private" , 
          lands."owner" , 
          lands.revshare , 
          lands.network , 
          lands."reset_hour",
          lands."blocked_at"
          ) as l
    `);

    return rawData.rows as unknown as (Land & { limits: number })[];
  }

  async getTransportHubLevel(landId: number): Promise<number> {
    const land = await LandModel(this.postgresClient).where({ id: landId }).first();
    if (!land) throw new Error("no land with id " + landId);
    return land?.transport_hub_level;
  }
}
