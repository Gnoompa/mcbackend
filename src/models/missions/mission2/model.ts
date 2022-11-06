import { GameMap, Tile, TilePosition } from "./../../../services/mission2/utils/gameMap";
import { Mission, MissionModel, MissionStatus } from "./../../../models/missions/common/mission.model";

export type Resources = {
  common: number;
  rare: number;
  legendary: number;
};

export type Mission2 = Mission & {
  map: GameMap;
  position: TilePosition;
  prevPosition: TilePosition;
  moves: number;
  dynamites: number;
  scans: number;
  resources: Resources;
  miningMovesDiscount: number;
  finalResourcesBonus: number;
  wormWinChanceBonus: number;
  worm: boolean;
};

export const Mission2DataMapper = {
  toModel: (mission: Mission2): MissionModel => {
    return {
      id: mission.id, // uuidv4
      avatar_id: mission.avatarId,
      land_id: mission.landId,
      address: mission.address,
      network: mission.network,
      mission_id: 2,
      started_at: mission.startedAt,
      status: mission.status,
      finished_at: mission.finishedAt,
      data: {
        position: mission.position,
        prev_position: mission.prevPosition,
        map: mission.map,
        moves: mission.moves,
        dynamites: mission.dynamites,
        scans: mission.scans,
        resources: mission.resources,
        mining_moves_discount: mission.miningMovesDiscount,
        final_resources_bonus: mission.finalResourcesBonus,
        worm_win_chance_bonus: mission.wormWinChanceBonus,
        worm: mission.worm
      }
    };
  },
  fromModel: (data: MissionModel): Mission2 => {
    return {
      id: data.id, // uuidv4
      avatarId: data.avatar_id,
      landId: data.land_id,
      address: data.address,
      network: data.network,
      missionId: 2,
      startedAt: new Date(data.started_at),
      status: data.status as MissionStatus,
      finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
      map: data.data.map,
      position: data.data.position,
      prevPosition: data.data.prev_position,
      moves: data.data.moves,
      dynamites: data.data.dynamites,
      scans: data.data.scans,
      resources: data.data.resources,
      miningMovesDiscount: data.data.mining_moves_discount,
      finalResourcesBonus: data.data.final_resources_bonus,
      wormWinChanceBonus: data.data.worm_win_chance_bonus,
      worm: data.data.worm
    };
  }
};
