import { Mission, MissionModel, MissionStatus } from "./../../../models/missions/common/mission.model";

export type Mission1 = Mission & {
  password: string;
  attempts: number;
};

export const Mission1DataMapper = {
  toModel: (mission: Mission1): MissionModel => {
    return {
      id: mission.id, // uuidv4
      avatar_id: mission.avatarId,
      land_id: mission.landId,
      address: mission.address,
      network: mission.network,
      mission_id: 1,
      started_at: mission.startedAt,
      status: mission.status,
      finished_at: mission.finishedAt,
      data: {
        password: mission.password,
        attempts: mission.attempts
      }
    };
  },
  fromModel: (data: MissionModel): Mission1 => {
    return {
      id: data.id, // uuidv4
      avatarId: data.avatar_id,
      landId: data.land_id,
      address: data.address,
      network: data.network,
      missionId: 1,
      startedAt: new Date(data.started_at),
      status: data.status as MissionStatus,
      finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
      password: data.data.password,
      attempts: data.data.attempts
    };
  }
};
