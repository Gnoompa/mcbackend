import { Mission1, Mission1DataMapper } from "./../../../models/missions/mission1/model";
import { MissionModel, MissionStatus } from "./../../../models/missions/common/mission.model";
import { POSTGRES_DATA_SOURCE } from "./../../../datasources/Postgres/index";
import { Configuration, Inject, Injectable } from "@tsed/common";
import { v4 } from "uuid";

@Injectable()
export class Mission1PostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
  }

  // avatars
  async createMission1Record(params: { address: string; avatarId: number; landId: number; password: string }) {
    const { avatarId, landId, address, password } = params;

    const mission1Record: MissionModel = Mission1DataMapper.toModel({
      id: v4(),
      avatarId,
      landId,
      address,
      network: this.network,
      missionId: 1,
      startedAt: new Date(),
      status: MissionStatus.Started,
      finishedAt: undefined,
      password,
      attempts: 0
    });

    await MissionModel(this.postgresClient).insert(mission1Record);
  }

  async updateAttemptToMission1Record(params: { avatarId: number; newAttempt: number }) {
    const { avatarId, newAttempt } = params;
    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 1, status: MissionStatus.Started })
      .update({
        data: this.postgresClient.raw(`jsonb_set(??, '{attempts}', ?)`, ["data", newAttempt])
      });
  }

  async getMission1Record(params: { avatarId: number }): Promise<Mission1 | undefined> {
    const { avatarId } = params;

    const missionRecord = await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, mission_id: 1, status: MissionStatus.Started })
      .first();
    if (!missionRecord) return;

    return Mission1DataMapper.fromModel(missionRecord);
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
