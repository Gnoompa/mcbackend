import { landResetHour } from "./../../../utils/time/index";
import { Knex } from "knex";

export type Land = {
  id: number;
  availableMissionCount: number;
  isPrivate: boolean;
  owner: string;
  revshare: number;
  blocked_at?: Date; // timestamp of 10 seconds blocking start
  transportHubLevel: number;
};

export type LandCrosschain = Land & { network: string };

export type LandModel = {
  id: number;
  available_mission_count: number;
  is_private: boolean;
  owner: string;
  revshare: number;
  blocked_at?: Date;
  network: string;
  reset_hour: number;
  transport_hub_level: number;
};

export const LandModel = (knex: Knex) => knex<LandModel>("lands");

export const LandDataMapper = (network: string) => {
  return {
    toModel: (land: Land): LandModel => {
      const landModel: LandModel = {
        id: land.id,
        available_mission_count: land.availableMissionCount,
        is_private: land.isPrivate,
        owner: land.owner,
        revshare: land.revshare,
        reset_hour: landResetHour(land.id),
        network,
        transport_hub_level: land.transportHubLevel
      };
      if (land.blocked_at) landModel.blocked_at = land.blocked_at;
      return landModel;
    },
    fromModel: (data: LandModel): Land => {
      return {
        id: data.id,
        availableMissionCount: data.available_mission_count,
        isPrivate: data.is_private,
        owner: data.owner,
        revshare: data.revshare,
        blocked_at: data.blocked_at,
        transportHubLevel: data.transport_hub_level
      };
    },
    fromModelCrosschain: (data: LandModel): LandCrosschain => {
      return {
        id: data.id,
        availableMissionCount: data.available_mission_count,
        isPrivate: data.is_private,
        owner: data.owner,
        revshare: data.revshare,
        blocked_at: data.blocked_at,
        transportHubLevel: data.transport_hub_level,
        network: data.network
      };
    }
  };
};
