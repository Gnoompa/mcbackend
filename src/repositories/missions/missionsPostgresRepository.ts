import { AvatarModel } from "./../../models/missions/common/avatar.model";
import { Mission1, Mission1DataMapper } from "./../../models/missions/mission1/model";
import { Mission0, Mission0DataMapper } from "./../../models/missions/mission0/model";
import { LandModel } from "./../../models/missions/common/land.model";
import { MissionModel, MissionStatus } from "./../../models/missions/common/mission.model";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";

import { Configuration, Inject, Injectable } from "@tsed/common";
import { Mission2, Mission2DataMapper } from "../../models/missions/mission2/model";

@Injectable()
export class MissionsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
  }

  async isAvatarOnMission(params: { avatarId: number }): Promise<boolean> {
    const { avatarId } = params;

    const activeMissionRecord = await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, status: MissionStatus.Started })
      .first();

    return !!activeMissionRecord;
  }

  async markMissionAsFailed(params: { avatarId: number }) {
    const { avatarId } = params;

    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, status: MissionStatus.Started })
      .update({ status: MissionStatus.Failed });
  }
  async markMissionAsCompleted(params: { avatarId: number }) {
    const { avatarId } = params;
    // const key = `${this.network}:Mission:Start:EventAvatar:${avatarId}`;
    // await this.redisClient.unlink(key);

    await MissionModel(this.postgresClient)
      .where({ network: this.network, avatar_id: avatarId, status: MissionStatus.Started })
      .update({ status: MissionStatus.Completed, finished_at: new Date() });
  }

  async getAvatarActiveMission(avatarId: number): Promise<Mission0 | Mission1 | Mission2 | undefined> {
    const mission = await MissionModel(this.postgresClient)
      .where({ avatar_id: avatarId, status: MissionStatus.Started, network: this.network })
      .limit(1)
      .first();
    if (!mission) return undefined;
    switch (mission.mission_id) {
      case 0:
        return Mission0DataMapper.fromModel(mission);
      case 1:
        return Mission1DataMapper.fromModel(mission);
      case 2:
        return Mission2DataMapper.fromModel(mission);
    }
  }
  async getAvatarMissionsLimitsSpent(params: { avatarId: number }): Promise<number> {
    const { avatarId } = params;
    // const completedKey = `${this.network}:Avatar:Started:${avatarId}`;
    // const record = await this.redisClient.get(completedKey);

    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);

    const records = await MissionModel(this.postgresClient)
      .where({ avatar_id: avatarId, network: this.network })
      .where("started_at", ">=", day);

    // we declare mission 2 as two attempts
    const missionsLimitsSpent = records.reduce((acc, mission) => {
      if (mission.mission_id === 2) return acc + 2;
      return acc + 1;
    }, 0);

    return missionsLimitsSpent;
  }

  async getAvatarsOnMissions(args: { missionId: number }): Promise<number[]> {
    const { missionId } = args;
    const avatarsOnMissionsRaw = await MissionModel(this.postgresClient).where({
      network: this.network,
      status: MissionStatus.Started,
      mission_id: missionId
    });
    return avatarsOnMissionsRaw.map((record) => record.avatar_id);
  }

  async isAddressOnMission(params: { address: string }): Promise<boolean> {
    const { address } = params;

    // const key = `${this.network}:Mission:Start:EventAddress:${address}`;
    // const record = await this.redisClient.get(key);
    const record = await MissionModel(this.postgresClient)
      .where({ status: MissionStatus.Started, address, network: this.network })
      .limit(1)
      .first();
    return !!record;
  }

  async getMissionsInProgressOnLandCount(params: { landId: number }): Promise<number> {
    const { landId } = params;
    // const key = `${this.network}:Mission:Start:EventLand:${landId}`;
    // const record = await this.redisClient.get(key);
    const record = await MissionModel(this.postgresClient).where({ status: MissionStatus.Started, land_id: landId, network: this.network });
    return record.length;
  }

  async removeOldMissions() {
    await MissionModel(this.postgresClient)
      .where({ network: this.network })
      .where("started_at", "<=", this.postgresClient.raw(`(DATE(NOW()) - INTERVAL '2 DAY')`))
      .delete();
  }
  // tests helpers

  async resetAllDb() {
    await LandModel(this.postgresClient).where({ network: this.network }).del();
    await MissionModel(this.postgresClient).where({ network: this.network }).del();
    await AvatarModel(this.postgresClient).where({ network: this.network }).del();
  }

  async clearMissionsData() {
    await MissionModel(this.postgresClient).where(true).del();
  }
}
