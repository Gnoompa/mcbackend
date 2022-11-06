import { Mission, MissionModel, MissionStatus } from "./../../../models/missions/common/mission.model";

export type Mission0 = Mission & {
  missionLastPing: Date;
};

export const Mission0DataMapper = {
  toModel: (mission: Mission0): MissionModel => {
    return {
      id: mission.id, // uuidv4
      avatar_id: mission.avatarId,
      land_id: mission.landId,
      address: mission.address,
      network: mission.network,
      mission_id: 0,
      started_at: mission.startedAt,
      status: mission.status,
      finished_at: mission.finishedAt,
      data: {
        missionLastPing: mission.missionLastPing.getTime()
      }
    };
  },
  fromModel: (data: MissionModel): Mission0 => {
    return {
      id: data.id, // uuidv4
      avatarId: data.avatar_id,
      landId: data.land_id,
      address: data.address,
      network: data.network,
      missionId: 0,
      startedAt: new Date(data.started_at),
      status: data.status as MissionStatus,
      finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
      missionLastPing: new Date(data.data.missionLastPing)
    };
  }
};
