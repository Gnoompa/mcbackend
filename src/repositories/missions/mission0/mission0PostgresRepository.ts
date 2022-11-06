import { MissionModel, MissionStatus } from "./../../../models/missions/common/mission.model";
import { Mission0, Mission0DataMapper } from "./../../../models/missions/mission0/model";
import { Configuration, Inject, Injectable } from "@tsed/common";
import { POSTGRES_DATA_SOURCE } from "../../../datasources/Postgres";
import { v4 } from "uuid";

@Injectable()
export class Mission0PostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
  }

  // avatars
  async createMission0Record(params: { address: string; avatarId: number; landId: number }) {
    const { avatarId, landId, address } = params;

    const mission0Record: MissionModel = Mission0DataMapper.toModel({
      id: v4(),
      avatarId,
      landId,
      address,
      network: this.network,
      missionId: 0,
      startedAt: new Date(),
      status: MissionStatus.Started,
      finishedAt: undefined,
      missionLastPing: new Date()
    });

    await MissionModel(this.postgresClient).insert(mission0Record);
  }

  async updateMission0Record(params: { avatarId: number }) {
    const { avatarId } = params;
    // const key = `${this.network}:Mission:Start:EventAvatar:${avatarId}`;
    // await Promise.all([this.redisClient.hset(key, "missionLastPing", new Date().toUTCString())]);
    // await MissionModel(this.postgresClient).where({ avatarId }).update({ missionLastPing: new Date() });
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 0, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{missionLastPing}', ?)`, ["data", new Date().getTime()])
      });
  }

  async getMission0Record(params: { avatarId: number }): Promise<Mission0 | undefined> {
    const { avatarId } = params;
    // const key = `${this.network}:Mission:Start:EventAvatar:${avatarId}`;
    // const record = await this.redisClient.hgetall(key);

    const missionRecord = await MissionModel(this.postgresClient)
      .where({ avatar_id: avatarId, mission_id: 0, network: this.network, status: MissionStatus.Started })
      .first();

    if (!missionRecord) return;

    // if (!Object.entries(record).length) return;
    // const missionStarted = new Date(missionRecord.missionStarted);
    // const lastPing = new Date(missionRecord.missionLastPing);
    // const landId = Number(record.landId);
    // const address = record.address;

    return Mission0DataMapper.fromModel(missionRecord);
  }

  // tests helpers

  async createMissionWithCustomPing(args: { landId: number; address: string; avatarId: number; ping: Date }) {
    const { landId, address, avatarId, ping } = args;
    const mission0Record: MissionModel = Mission0DataMapper.toModel({
      id: v4(),
      avatarId,
      landId,
      address,
      network: this.network,
      missionId: 0,
      startedAt: new Date(),
      status: MissionStatus.Started,
      finishedAt: undefined,
      missionLastPing: ping
    });

    await MissionModel(this.postgresClient).insert(mission0Record);
  }
}
