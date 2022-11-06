import { getResourcesPositions, TilePosition } from "./../../../services/mission2/utils/gameMap";
import { Mission1, Mission1DataMapper } from "../../../models/missions/mission1/model";
import { MissionModel, MissionStatus } from "../../../models/missions/common/mission.model";
import { POSTGRES_DATA_SOURCE } from "../../../datasources/Postgres/index";
import { Configuration, Inject, Injectable } from "@tsed/common";
import { v4 } from "uuid";
import { GameMap } from "../../../services/mission2/utils/gameMap";
import { Mission2Settings } from "../../../config/missions";
import { Mission2, Mission2DataMapper, Resources } from "../../../models/missions/mission2/model";

@Injectable()
export class Mission2PostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;
  private settings: Mission2Settings;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
    this.settings = config.get("missions").missions["2"];
  }

  // avatars
  async createMission2Record(params: {
    address: string;
    avatarId: number;
    landId: number;
    map: GameMap;
    position: TilePosition;
    moves: number;
    dynamites: number;
    scans: number;
    resources: Resources;
    miningMovesDiscount: number;
    finalResourcesBonus: number;
    wormWinChanceBonus: number;
  }) {
    const {
      avatarId,
      landId,
      address,
      map,
      position,
      moves,
      dynamites,
      scans,
      resources,
      miningMovesDiscount,
      finalResourcesBonus,
      wormWinChanceBonus
    } = params;

    const mission2Record: MissionModel = Mission2DataMapper.toModel({
      id: v4(),
      avatarId,
      landId,
      address,
      network: this.network,
      missionId: 2,
      startedAt: new Date(),
      status: MissionStatus.Started,
      finishedAt: undefined,
      map,
      position,
      prevPosition: position,
      moves,
      dynamites,
      scans,
      resources,
      miningMovesDiscount,
      finalResourcesBonus,
      wormWinChanceBonus,
      worm: false
    });

    await MissionModel(this.postgresClient).insert(mission2Record);
  }

  async updateMapInMission2Record(params: { avatarId: number; updatedMap: GameMap }) {
    const { avatarId, updatedMap } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{map}', ?)`, ["data", JSON.stringify(updatedMap)])
      });
  }

  async updateMoves(params: { avatarId: number; moves: number }) {
    const { avatarId, moves } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{moves}', ?)`, ["data", moves])
      });
  }

  async updateScans(params: { avatarId: number; scans: number }) {
    const { avatarId, scans } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{scans}', ?)`, ["data", scans])
      });
  }

  async updateWorm(params: { avatarId: number; worm: boolean }) {
    const { avatarId, worm } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{worm}', ?)`, ["data", worm])
      });
  }

  async updateResources(params: { avatarId: number; resources: Resources }) {
    const { avatarId, resources } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{resources}', ?)`, ["data", JSON.stringify(resources)])
      });
  }

  async updateDynamites(params: { avatarId: number; dynamites: number }) {
    const { avatarId, dynamites } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{dynamites}', ?)`, ["data", dynamites])
      });
  }

  async updatePosition(params: { avatarId: number; newPosition: TilePosition; prevPosition: TilePosition }) {
    const { avatarId, newPosition, prevPosition } = params;
    // const missionRecord = await this.getMission2Record({ avatarId });

    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{prev_position}', ?)`, ["data", JSON.stringify(prevPosition)])
      });

    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{position}', ?)`, ["data", JSON.stringify(newPosition)])
      });
  }

  async getMission2Record(params: { avatarId: number }): Promise<Mission2 | undefined> {
    const { avatarId } = params;

    const missionRecord = await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 2, status: MissionStatus.Started })
      .first();
    if (!missionRecord) return;

    // console.log({ missionRecord });

    return Mission2DataMapper.fromModel(missionRecord);
  }

  // tests helpers

  async createMissionWithCustomStartTime(args: { landId: number; address: string; avatarId: number; startTime: Date }) {
    const { landId, address, avatarId, startTime } = args;
    const missionRecord: MissionModel = Mission1DataMapper.toModel({
      id: v4(),
      avatarId,
      landId,
      address,
      network: this.network,
      missionId: 0,
      startedAt: startTime,
      status: MissionStatus.Started,
      finishedAt: undefined,
      password: "",
      attempts: 0
    });

    await MissionModel(this.postgresClient).insert(missionRecord);
  }
}
