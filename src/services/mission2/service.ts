import { MissionCompleteResponse } from "./../../models/missions/common/responses/missionCompleteServerResponseModel";
import { WormAction } from "./../../models/missions/mission2/dto/requests/mission2WormRequestPayloadModel";
import { isWinByChoice } from "./../../utils/randoms/index";
import { Direction } from "./../../models/missions/mission2/dto/requests/mission2MoveRequestPayloadModel";
import { OnChainRepository } from "./../../repositories/missions/missionsOnchainRepository";
import { Mission2, Resources } from "./../../models/missions/mission2/model";
import { Mission2BaseResponse } from "./../../models/missions/mission2/dto/responses/Mission2BaseResponse";
import { Mission2Settings } from "./../../config/missions/index";
import { Inject, Service } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { BaseMission } from "../BaseMission";
import { Mission2PostgresRepository } from "../../repositories/missions/mission2/mission2PostgresRepository";

import {
  calculateAddedDynamites,
  calculateAddedMovesFromLockedGears,
  calculateAddedMovesFromAvatarLevel,
  calculateMiningDiscount,
  calculateNewPosition,
  calculateResourcesBonus,
  calculateWormWinChanceBonus,
  countScannedResources,
  findObstacleNextTile,
  findWormNextTile,
  GameMap,
  generateInitialPosition,
  generateMap,
  getSurroundings,
  getSurroundingTiles,
  isObstacleNextTile,
  isPositionValid,
  isTileWithFuel,
  isTileWithResource,
  isWormNextTile,
  MAP_OBJECT,
  removeObjectFromMap,
  Tile,
  TilePosition
} from "./utils/gameMap";
import { currentLevelFromXp } from "../../utils/xp/formula";

export type MoveResponse = {
  position: TilePosition;
  moves: number;
  tiles: Tile[]; // -1: obstacle, 0 - empty, 1-3 rarity resource
  worm: boolean;
};

export type MineResponse = {
  moves: number;
  resources: Resources;
  tiles: Tile[];
};

export type DynamiteResponse = {
  dynamites: number;
  moves: number;
  tiles: Tile[];
};

export type ScanResponse = {
  resourcesScanned: number;
  moves: number;
  tiles?: Tile[];
};

export type WormResponse = {
  figntStatus?: "win" | "lose";
  resources?: Resources;
  position: TilePosition;
  moves?: number;
  tiles?: Tile[];
};

export type FuelResponse = {
  position: TilePosition;
  moves: number;
  tiles?: Tile[];
};

@Service()
export class Mission2Service extends BaseMission<Mission2BaseResponse> {
  private settings: Mission2Settings;
  protected missionId: number;

  @Inject(Mission2PostgresRepository)
  private mission2Repo: Mission2PostgresRepository;

  @Inject(OnChainRepository)
  private onChainRepository: OnChainRepository;

  $beforeInit() {
    this.missionId = 2;
    this.settings = this.config.get("missions").missions["2"];
  }

  async start(args: { address: string; avatarId: number; landId: number }): Promise<Mission2BaseResponse> {
    const { address, avatarId, landId } = args;

    const transportCondition = await this.onChainRepo.getTransportCondition(address);
    if (transportCondition === 0) {
      throw new BadRequest(`Your transport is fully damaged, restore it first.`);
    }

    const map = generateMap();
    const position = generateInitialPosition(map);
    const initialMoves = this.settings.moves;
    const initialDynamites = this.settings.dynamites;
    const scans = this.settings.scans.amount;
    const resources: Resources = {
      common: 0,
      rare: 0,
      legendary: 0
    };

    const lockedGears = await this.onChainRepository.getLockedGears(address);
    // const lockedGears: LockedGears = {
    //   transport: undefined,
    //   gear1: undefined,
    //   gear2: undefined,
    //   gear3: undefined
    // };

    const avatarXp = await this.onChainRepo.getAvatarCurrentXP({ avatarId });
    const avatarLevel = currentLevelFromXp(avatarXp);

    const dynamites = initialDynamites + calculateAddedDynamites(lockedGears);
    const moves = initialMoves + calculateAddedMovesFromLockedGears(lockedGears) + calculateAddedMovesFromAvatarLevel(avatarLevel);
    const miningMovesDiscount = calculateMiningDiscount(lockedGears);
    const finalResourcesBonus = calculateResourcesBonus(lockedGears);
    const wormWinChanceBonus = calculateWormWinChanceBonus(lockedGears);

    await this.mission2Repo.createMission2Record({
      avatarId,
      address,
      landId,
      map,
      position,
      moves,
      dynamites,
      scans,
      resources,
      miningMovesDiscount,
      finalResourcesBonus,
      wormWinChanceBonus
    });

    return {
      position,
      moves,
      dynamites,
      scans,
      tiles: getSurroundingTiles(map, position),
      resources
    };
  }

  isMissionFailed(mission: Mission2): boolean {
    if (mission.missionId !== 2) return false;

    const missionStartTime = mission.startedAt;
    // this.logger.debug("mission2 StartTime", missionStartTime);
    const timeFromMissionStart = new Date().getTime() - missionStartTime.getTime();
    // this.logger.debug({ timeFromMissionStart });

    return timeFromMissionStart > this.settings.timeToComplete;
  }

  async move(args: { address: string; avatarId: number; landId: number; direction: Direction }): Promise<MoveResponse> {
    const { address, avatarId, landId, direction } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    const moves = mission.moves - 1;

    if (moves < 0) {
      await this.missionFailed(mission, `Mission failed:  no more moves`);
    }

    const map = mission!.map;

    // check if user can move this direction, e.g. tile is not obstacle or worm or stone
    const position = mission!.position;
    // console.log({ position });
    const newPosition = calculateNewPosition(position, direction);

    if (!isPositionValid(map, newPosition)) {
      throw new BadRequest(`Invalid move`);
    }

    // console.log({ newPosition });

    await this.mission2Repo.updateMoves({ avatarId, moves });
    await this.mission2Repo.updatePosition({ avatarId, newPosition, prevPosition: position });

    const isWormHere = isWormNextTile(map, newPosition);

    if (isWormHere) {
      await this.mission2Repo.updateWorm({ avatarId, worm: true });
    }

    return {
      position: newPosition,
      moves,
      tiles: getSurroundings(map, newPosition),
      worm: isWormHere
    };
  }

  async wormAction(args: { address: string; avatarId: number; landId: number; action: WormAction }): Promise<WormResponse> {
    const { address, avatarId, landId, action } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (!mission.worm) {
      throw new BadRequest(`No worm around`);
    }

    if (action === "fight") {
      const isWin = isWinByChoice(mission.wormWinChanceBonus);
      if (!isWin) {
        await this.missionFailed(mission, `Mission failed:  worm has won`);
      }
      // win: remove worm from map

      const map = [...mission.map];
      const wormTile = findWormNextTile(map, mission.position);
      const updatedMap = removeObjectFromMap(map, wormTile);

      await this.mission2Repo.updateMapInMission2Record({ avatarId, updatedMap });
      await this.mission2Repo.updateWorm({ avatarId, worm: false });

      return {
        position: mission.position,
        figntStatus: "win"
      };
    }

    const decreaseOneRecourse = (resources: Resources): [changed: boolean, updatedRecources?: Resources] => {
      if (resources.common > 0) {
        resources.common -= 1;
        return [true, resources];
      }

      if (resources.rare > 0) {
        resources.rare -= 1;
        return [true, resources];
      }

      if (resources.legendary > 0) {
        resources.legendary -= 1;
        return [true, resources];
      }

      return [false];
    };

    if (action === "pay") {
      const [changed, updatedResources] = decreaseOneRecourse(mission.resources);

      const map = [...mission.map];
      const wormTile = findWormNextTile(map, mission.position);
      const updatedMap = removeObjectFromMap(map, wormTile);

      await this.mission2Repo.updateMapInMission2Record({ avatarId, updatedMap });
      await this.mission2Repo.updateWorm({ avatarId, worm: false });

      if (changed) {
        await this.mission2Repo.updateResources({ avatarId, resources: updatedResources! });
        return {
          position: mission.position,
          resources: updatedResources
        };
      }

      throw new BadRequest("you have no resources to pay");
    }

    if (action === "retreat") {
      const moves = (mission.moves -= this.settings.worm.retreatPenalty);

      if (moves < 0) {
        await this.missionFailed(mission, `Mission failed:  no more moves`);
      }

      await this.mission2Repo.updateMoves({ avatarId, moves });
      await this.mission2Repo.updateWorm({ avatarId, worm: false });
      await this.mission2Repo.updatePosition({ avatarId, newPosition: mission.prevPosition, prevPosition: mission.prevPosition });

      return {
        position: mission.prevPosition,
        moves,
        tiles: getSurroundings(mission.map, mission.position)
      };
    }

    throw new BadRequest("wrong action");
  }

  async mine(args: { address: string; avatarId: number; landId: number }): Promise<MineResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    if (!isTileWithResource(mission.map, mission.position)) {
      throw new BadRequest(`No recourse on this tile`);
    }

    const resource = GameMap.getTileState(mission.map, mission.position);

    const resources = { ...mission.resources };
    let moves = mission.moves;

    if (resource === MAP_OBJECT.COMMON_RESOURCE) {
      resources.common += 1;
      moves = moves - this.settings.resources.common.moves_to_mine + mission.miningMovesDiscount;
    }

    if (resource === MAP_OBJECT.RARE_RESOURCE) {
      resources.rare += 1;
      moves = moves - this.settings.resources.rare.moves_to_mine + mission.miningMovesDiscount;
    }

    if (resource === MAP_OBJECT.LEGENDARY_RESOURCE) {
      resources.legendary += 1;
      moves = moves - this.settings.resources.legendary.moves_to_mine + mission.miningMovesDiscount;
    }

    if (moves <= 0) {
      await this.missionFailed(mission, `Mission failed:  no more moves`);
    }

    const map = [...mission.map];
    // const wormTile = findWormNextTile(map, mission.position);
    const updatedMap = removeObjectFromMap(map, mission.position);

    await this.mission2Repo.updateMapInMission2Record({ avatarId, updatedMap });
    await this.mission2Repo.updateResources({ avatarId, resources });
    await this.mission2Repo.updateMoves({ avatarId, moves });

    return {
      moves: moves,
      resources,
      tiles: getSurroundings(updatedMap, mission.position)
    };
  }

  async fuel(args: { address: string; avatarId: number; landId: number }): Promise<FuelResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    if (!isTileWithFuel(mission.map, mission.position)) {
      throw new BadRequest(`No fuel on this tile`);
    }

    let moves = mission.moves - this.settings.fuel.moves_to_mine;

    if (moves < 0) {
      await this.missionFailed(mission, `Mission failed:  no more moves`);
    }

    moves = moves += this.settings.fuel.added_moves;

    const updatedMap = removeObjectFromMap(mission.map, mission.position);
    await this.mission2Repo.updateMapInMission2Record({ avatarId, updatedMap });
    await this.mission2Repo.updateMoves({ avatarId, moves });

    return {
      position: mission.position,
      moves: moves,
      tiles: getSurroundings(updatedMap, mission.position)
    };
  }

  async dynamite(args: { address: string; avatarId: number; landId: number }): Promise<DynamiteResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    if (!isObstacleNextTile(mission.map, mission.position)) {
      throw new BadRequest(`No obstacle here`);
    }

    if (mission.dynamites === 0) {
      throw new BadRequest(`No more dynamites`);
    }

    const dynamites = mission.dynamites - 1;
    await this.mission2Repo.updateDynamites({ avatarId, dynamites });

    const map = [...mission.map];
    const obstacleTile = findObstacleNextTile(map, mission.position);

    const updatedMap = removeObjectFromMap(map, obstacleTile);

    await this.mission2Repo.updateMapInMission2Record({ avatarId, updatedMap });

    return {
      dynamites,
      moves: mission.moves,
      tiles: getSurroundings(updatedMap, mission.position)
    };
  }

  async scan(args: { address: string; avatarId: number; landId: number }): Promise<ScanResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    // this.logger.debug({ missionScans: mission.scans, settingsScans: this.settings.scans.amount });
    if (mission.scans <= 0) {
      throw new BadRequest(`No more scans`);
    }

    const moves = mission.moves - this.settings.scans.cost;

    if (moves < 0) {
      await this.missionFailed(mission, `Mission failed:  no more moves`);
    }

    const scans = mission.scans - 1;
    await this.mission2Repo.updateScans({ avatarId, scans });

    const resourcesScanned = countScannedResources(mission.map, mission.position);

    return {
      resourcesScanned,
      moves,
      tiles: getSurroundings(mission.map, mission.prevPosition)
    };
  }

  async exit(args: { address: string; avatarId: number; landId: number }): Promise<MissionCompleteResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission2Repo.getMission2Record({ avatarId });

    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    if (mission.worm) {
      throw new BadRequest(`Invalid move, worm`);
    }

    // check if we are on the exit tile
    const currentTile = await GameMap.getTileState(mission.map, mission.position);
    if (currentTile !== MAP_OBJECT.GATE) {
      throw new BadRequest("No gate on this tile");
    }

    return await this.complete({ address, avatarId, landId, missionId: 2 });
  }
}
