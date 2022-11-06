import { Direction } from "./../../../models/missions/mission2/dto/requests/mission2MoveRequestPayloadModel";
import { GEAR_TYPE, LockedGears } from "./../../../repositories/missions/missionsOnchainRepository";
import { initialMapState } from "./../initialMap";

export type GameMap = number[][];
export type TilePosition = { x: number; y: number };
export type Tile = TilePosition & { state: MAP_OBJECT };

export type GatePosition = 0 | 1 | 2 | 3;
export type ObstaclePosition = 0 | 1 | 2;

export enum MAP_OBJECT {
  STONE = -1,
  EMPTY = 0,
  COMMON_RESOURCE = 1,
  RARE_RESOURCE = 2,
  LEGENDARY_RESOURCE = 3,
  WORM = 4,
  OBSTACLE = 5,
  GATE = 6,
  FUEL = 7
}
export const clone = (arrayOfArrays: number[][]): number[][] => {
  return arrayOfArrays.map((array) => [...array]);
};

export const GameMap = {
  getTileState(map: GameMap, tile: TilePosition): MAP_OBJECT {
    // console.log({ tile, map });
    return map[tile.y][tile.x];
  },
  updateTile(map: GameMap, tile: TilePosition, object: MAP_OBJECT): GameMap {
    const updatedMap = clone(map);
    updatedMap[tile.y][tile.x] = object;
    return updatedMap;
  },
  getTile(map: GameMap, tile: TilePosition): Tile {
    return {
      ...tile,
      state: map[tile.y][tile.x]
    };
  }
};

export const removeElementFromArray = <T>(array: T[], element: T): T[] => {
  const index = array.indexOf(element);
  array.splice(index, 1);
  return [...array];
};

export const genExitGates = (): [gate1: GatePosition, gate2: GatePosition] => {
  let exitGates = [0, 1, 2, 3];
  const exitGate1 = exitGates[Math.floor(Math.random() * 4)];
  exitGates = removeElementFromArray(exitGates, exitGate1);
  const exitGate2 = exitGates[Math.floor(Math.random() * 3)];
  return [exitGate1 as GatePosition, exitGate2 as GatePosition];
};

const gatesTiles = [
  { x: 0, y: 0 },
  { x: 20, y: 0 },
  { x: 0, y: 11 },
  { x: 20, y: 11 }
];

export const placeGatesOnMap = (map: GameMap, exitGate1: GatePosition, exitGate2: GatePosition): GameMap => {
  // console.log({ exitGate1, exitGate2 });

  let mapWithGates: GameMap = clone(map);

  const gate1Tile = gatesTiles[exitGate1];
  mapWithGates = GameMap.updateTile(mapWithGates, gate1Tile, MAP_OBJECT.GATE);

  const gate2Tile = gatesTiles[exitGate2];
  mapWithGates = GameMap.updateTile(mapWithGates, gate2Tile, MAP_OBJECT.GATE);

  return mapWithGates;
};

export const genObstacles = (): [obstacle1: ObstaclePosition, obstacle2: ObstaclePosition] => {
  let obstacles = [0, 1, 2];
  const obstacle1 = Math.floor(Math.random() * 3);
  obstacles = removeElementFromArray(obstacles, obstacle1);
  const obstacle2 = obstacles[Math.floor(Math.random() * 2)];
  return [obstacle1 as ObstaclePosition, obstacle2 as ObstaclePosition];
};

export const placeObstaclesOnMap = (map: GameMap, obstacle1: ObstaclePosition, obstacle2: ObstaclePosition): GameMap => {
  const obstacleTiles = {
    0: { x: 8, y: 1 },
    1: { x: 13, y: 6 },
    2: { x: 10, y: 10 }
  };

  let mapWithObstacles: GameMap = clone(map);

  const obstacle1Tile = obstacleTiles[obstacle1];
  mapWithObstacles = GameMap.updateTile(mapWithObstacles, obstacle1Tile, MAP_OBJECT.OBSTACLE);

  const obstacle2Tile = obstacleTiles[obstacle2];
  mapWithObstacles = GameMap.updateTile(mapWithObstacles, obstacle2Tile, MAP_OBJECT.OBSTACLE);

  return mapWithObstacles;
};

export const getEmptyTiles = (map: GameMap): TilePosition[] => {
  const emptyTiles: TilePosition[] = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 0) {
        emptyTiles.push({ x, y });
      }
    }
  }

  return emptyTiles;
};

const isTileAroundGate = (tile: TilePosition): boolean => {
  const gatesTiles = [
    { x: 0, y: 0 },
    { x: 16, y: 0 }
  ];
  for (const gate of gatesTiles) {
    // console.log("gate", gate, tile);
    if (tile.x > gate.x - 2 && tile.x < gate.x + 2 && tile.y > gate.y - 2 && tile.y < gate.y + 2) return true;
  }
  return false;
};

export const placeResourcesOnMap = (map: GameMap): GameMap => {
  const resources = [
    MAP_OBJECT.COMMON_RESOURCE,
    MAP_OBJECT.COMMON_RESOURCE,
    MAP_OBJECT.COMMON_RESOURCE,
    MAP_OBJECT.COMMON_RESOURCE,
    MAP_OBJECT.COMMON_RESOURCE,
    MAP_OBJECT.RARE_RESOURCE,
    MAP_OBJECT.RARE_RESOURCE,
    MAP_OBJECT.RARE_RESOURCE,
    MAP_OBJECT.LEGENDARY_RESOURCE,
    MAP_OBJECT.LEGENDARY_RESOURCE,
    MAP_OBJECT.FUEL,
    MAP_OBJECT.FUEL,
    MAP_OBJECT.FUEL
  ];

  let updatedMap = clone(map);

  // console.log("updated map", updatedMap);

  for (const resource of resources) {
    // exclude tile near gates +-2 x/y
    // to not invoke worm on initial move

    const emptyTiles = getEmptyTiles(updatedMap).filter((tile) => !isTileAroundGate(tile));

    // console.log({ resource, emptyTiles });

    const resourseTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    // console.log("resource tile", resourseTile);
    updatedMap = GameMap.updateTile(updatedMap, resourseTile, resource);
  }

  return updatedMap;
};

export const getResourcesPositions = (map: GameMap): TilePosition[] => {
  const tilesWithResources: TilePosition[] = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (
        [MAP_OBJECT.COMMON_RESOURCE, MAP_OBJECT.RARE_RESOURCE, MAP_OBJECT.LEGENDARY_RESOURCE, MAP_OBJECT.FUEL].includes(
          GameMap.getTileState(map, { x, y })
        )
      ) {
        tilesWithResources.push({ x, y });
      }
    }
  }

  return tilesWithResources;
};

export const findAvailableSurroundingTiles = (map: GameMap, tile: TilePosition): TilePosition[] => {
  const availableTiles: TilePosition[] = [];
  // console.log("tile", tile);
  // select all surrounding tiles
  for (let x = tile.x - 1; x <= tile.x + 1; x++) {
    for (let y = tile.y - 1; y <= tile.y + 1; y++) {
      if (x < 0 || y < 0 || x > map[0].length - 1 || y > map.length - 1) continue;
      if (GameMap.getTileState(map, { x, y }) === MAP_OBJECT.EMPTY && x !== tile.x && y !== tile.y) {
        availableTiles.push({ x, y });
      }
    }
  }

  return availableTiles;
};

export const placeWormsOnMap = (map: GameMap): GameMap => {
  const resourcesPositions = getResourcesPositions(map);
  let finalMap: GameMap = clone(map);
  let worm = 0;
  let attempts = 0;

  /* below is possible infinite loop 
  e.g. can not place 4th worm due to the lack of space, 
  so i've added attemtps counter
  */

  const resourcesWithWorms: TilePosition[] = [];

  while (worm < 4 && attempts < 50) {
    // do not place worm around same recource twice
    const filteredResources = resourcesPositions.filter(
      (resource) => !resourcesWithWorms.some((res) => res.x === resource.x && res.y === resource.y)
    );
    const resourceToPlaceWormAround = filteredResources[Math.floor(Math.random() * filteredResources.length)];
    // console.log({ resourceToPlaceWormAround });
    const availableTiles = findAvailableSurroundingTiles(finalMap, resourceToPlaceWormAround);
    // console.log({ availableTiles });
    if (availableTiles.length === 0) continue;
    const tileToPlaceResource = availableTiles[Math.floor(Math.random() * availableTiles.length)];
    // console.log({ tileToPlaceResource });
    finalMap = GameMap.updateTile(finalMap, tileToPlaceResource, MAP_OBJECT.WORM);
    resourcesWithWorms.push(resourceToPlaceWormAround);
    worm++;
    attempts++;
  }
  return finalMap;
};

export const generateMap = (): GameMap => {
  const [exitGate1, exitGate2] = genExitGates();
  // console.log({ initialMapState });
  let missionMap = clone(initialMapState);
  missionMap = placeGatesOnMap(missionMap, exitGate1, exitGate2);

  const [obstacle1, obstacle2] = genObstacles();
  missionMap = placeObstaclesOnMap(missionMap, obstacle1, obstacle2);
  missionMap = placeResourcesOnMap(missionMap);
  missionMap = placeWormsOnMap(missionMap);

  // console.log({ missionMap });

  return missionMap;
};

export const generateInitialPosition = (map: GameMap): TilePosition => {
  const gates: TilePosition[] = [];

  if (GameMap.getTileState(map, gatesTiles[0]) === MAP_OBJECT.GATE) gates.push(gatesTiles[0]);
  if (GameMap.getTileState(map, gatesTiles[1]) === MAP_OBJECT.GATE) gates.push(gatesTiles[1]);
  if (GameMap.getTileState(map, gatesTiles[2]) === MAP_OBJECT.GATE) gates.push(gatesTiles[2]);
  if (GameMap.getTileState(map, gatesTiles[3]) === MAP_OBJECT.GATE) gates.push(gatesTiles[3]);

  return gates[Math.floor(Math.random() * gates.length)];
};

export const getSurroundingTiles = (map: GameMap, tile: TilePosition): Tile[] => {
  const tiles: Tile[] = [];
  for (let x = tile.x - 1; x <= tile.x + 1; x++) {
    for (let y = tile.y - 1; y <= tile.y + 1; y++) {
      if (x < 0 || y < 0 || x > map[0].length - 1 || y > map.length - 1) continue;
      tiles.push({ x, y, state: GameMap.getTileState(map, { x, y }) });
    }
  }

  return tiles;
};

const isGearLocked = (gears: LockedGears, gearType: GEAR_TYPE): boolean => {
  if (gears.transport && gears.transport.id > 0 && gearType === gears.transport?.type) return true;
  if (gears.gear1 && gears.gear1.id > 0 && gearType === gears.gear1?.type) return true;
  if (gears.gear2 && gears.gear2.id > 0 && gearType === gears.gear2?.type) return true;
  if (gears.gear3 && gears.gear3.id > 0 && gearType === gears.gear3?.type) return true;

  return false;
};

export const calculateAddedDynamites = (gears: LockedGears): number => {
  return isGearLocked(gears, GEAR_TYPE.THE_WRAITH) ? 2 : 0;
};

export const calculateAddedMovesFromLockedGears = (gears: LockedGears): number => {
  if (isGearLocked(gears, GEAR_TYPE.ROCKET_FUEL)) return 4;
  if (isGearLocked(gears, GEAR_TYPE.ENGINE_FURIOUS)) return 6;
  if (isGearLocked(gears, GEAR_TYPE.WD_40)) return 10;
  if (isGearLocked(gears, GEAR_TYPE.POLYMINER)) return 15;
  return 0;
};

export const calculateAddedMovesFromAvatarLevel = (avatarLevel: number): number => {
  if (avatarLevel > 90) return 18;
  if (avatarLevel > 80) return 16;
  if (avatarLevel > 70) return 14;
  if (avatarLevel > 60) return 12;
  if (avatarLevel > 50) return 10;
  if (avatarLevel > 40) return 8;
  if (avatarLevel > 30) return 6;
  if (avatarLevel > 20) return 4;
  if (avatarLevel > 10) return 2;
  return 0;
};

export const calculateMiningDiscount = (gears: LockedGears): number => {
  if (isGearLocked(gears, GEAR_TYPE.TITANIUM_DRILL)) return 0.5;
  if (isGearLocked(gears, GEAR_TYPE.DIAMOND_DRILL)) return 1;
  if (isGearLocked(gears, GEAR_TYPE.LASER_DRILL)) return 2;
  return 0;
};

export const calculateResourcesBonus = (gears: LockedGears): number => {
  // percents/100
  if (isGearLocked(gears, GEAR_TYPE.SMALL_AREA_SCANNER)) return 0.005;
  if (isGearLocked(gears, GEAR_TYPE.MEDIUM_AREA_SCANNER)) return 0.015;
  if (isGearLocked(gears, GEAR_TYPE.LARGE_AREA_SCANNER)) return 0.03;
  return 0;
};

export const calculateWormWinChanceBonus = (gears: LockedGears): number => {
  if (isGearLocked(gears, GEAR_TYPE.ULTRASONIC_TRANSMITTER)) return 73;
  if (isGearLocked(gears, GEAR_TYPE.INFRARED_TRANSMITTER)) return 76;
  if (isGearLocked(gears, GEAR_TYPE.VIBRATION_TRANSMITTER)) return 82;
  return 70;
};

export const calculateNewPosition = (currentPosition: TilePosition, direction: Direction): TilePosition => {
  switch (direction) {
    case "down":
      return { x: currentPosition.x, y: currentPosition.y + 1 };
    case "up":
      return { x: currentPosition.x, y: currentPosition.y - 1 };
    case "left":
      return { x: currentPosition.x - 1, y: currentPosition.y };
    case "right":
      return { x: currentPosition.x + 1, y: currentPosition.y };
  }
};

export const isTileInMap = (map: GameMap, position: TilePosition): boolean => {
  return !(position.x < 0 || position.x >= map[0].length || position.y < 0 || position.y >= map.length);
};

export const isPositionValid = (map: GameMap, position: TilePosition): boolean => {
  if (!isTileInMap(map, position)) return false;

  const tile = GameMap.getTileState(map, position);
  return ![MAP_OBJECT.STONE, MAP_OBJECT.OBSTACLE, MAP_OBJECT.WORM].includes(tile);
};

export const getSurroundings = (map: GameMap, tile: TilePosition): Tile[] => {
  const surroundingTiles: TilePosition[] = [];
  for (let x = tile.x - 1; x <= tile.x + 1; x++) {
    for (let y = tile.y - 1; y <= tile.y + 1; y++) {
      if (x < 0 || y < 0 || x > map[0].length - 1 || y > map.length - 1) continue;
      surroundingTiles.push({ x, y });
    }
  }

  return surroundingTiles.map((tile) => GameMap.getTile(map, tile));
};

export const isWormNextTile = (map: GameMap, tile: TilePosition): boolean => {
  const tilesToCheckWorm = [
    {
      x: tile.x,
      y: tile.y - 1
    },
    {
      x: tile.x,
      y: tile.y + 1
    },
    {
      x: tile.x - 1,
      y: tile.y
    },
    {
      x: tile.x + 1,
      y: tile.y
    }
  ];

  return tilesToCheckWorm.filter((tile) => isTileInMap(map, tile)).some((tile) => GameMap.getTileState(map, tile) === MAP_OBJECT.WORM);
};

export const isWorm = (map: GameMap, tile: TilePosition): boolean => {
  return GameMap.getTileState(map, tile) === MAP_OBJECT.WORM;
};

export const findWormNextTile = (map: GameMap, tile: TilePosition): TilePosition => {
  const wormTile = [
    {
      x: tile.x,
      y: tile.y - 1
    },
    {
      x: tile.x,
      y: tile.y + 1
    },
    {
      x: tile.x - 1,
      y: tile.y
    },
    {
      x: tile.x + 1,
      y: tile.y
    }
  ]
    .filter((tile) => isTileInMap(map, tile))
    .find((t: TilePosition) => isWorm(map, t));

  if (!wormTile) throw new Error("Worm not found in fight phase");

  return wormTile;
};

export const isTileWithResource = (map: GameMap, position: TilePosition): boolean => {
  const tile = GameMap.getTileState(map, position);
  return [MAP_OBJECT.COMMON_RESOURCE, MAP_OBJECT.LEGENDARY_RESOURCE, MAP_OBJECT.RARE_RESOURCE].includes(tile);
};

export const isObstacleNextTile = (map: GameMap, tile: TilePosition): boolean => {
  const tilesToCheckObstacle = [
    {
      x: tile.x,
      y: tile.y - 1
    },
    {
      x: tile.x,
      y: tile.y + 1
    },
    {
      x: tile.x - 1,
      y: tile.y
    },
    {
      x: tile.x + 1,
      y: tile.y
    }
  ];

  return tilesToCheckObstacle
    .filter((tile) => isTileInMap(map, tile))
    .some((tile) => GameMap.getTileState(map, tile) === MAP_OBJECT.OBSTACLE);
};

export const isObstacle = (map: GameMap, tile: TilePosition): boolean => {
  return GameMap.getTileState(map, tile) === MAP_OBJECT.OBSTACLE;
};

export const findObstacleNextTile = (map: GameMap, tile: TilePosition): TilePosition => {
  const obstacleTile = [
    {
      x: tile.x,
      y: tile.y - 1
    },
    {
      x: tile.x,
      y: tile.y + 1
    },
    {
      x: tile.x - 1,
      y: tile.y
    },
    {
      x: tile.x + 1,
      y: tile.y
    }
  ]
    .filter((tile) => isTileInMap(map, tile))
    .find((t: TilePosition) => isObstacle(map, t));

  if (!obstacleTile) throw new Error("Obstale not found around");

  return obstacleTile;
};

export const countScannedResources = (map: GameMap, position: TilePosition): number => {
  console.log("count scanned resources", map, position);
  let resourcesCount = 0;
  for (let x = position.x - 3; x < position.x + 3; x++) {
    if (x < 0 || x >= map[0].length) continue;
    for (let y = position.y - 3; y < position.y + 3; y++) {
      if (y < 0 || y >= map.length) continue;
      // console.log("loop iteration", { x, y });
      if (isTileWithResource(map, { x, y })) {
        resourcesCount++;
      }
    }
  }

  return resourcesCount;
};

export const isTileWithFuel = (map: GameMap, position: TilePosition): boolean => {
  const tile = GameMap.getTileState(map, position);
  return tile === MAP_OBJECT.FUEL;
};

export const removeObjectFromMap = (map: GameMap, tile: TilePosition): GameMap => {
  return GameMap.updateTile(map, tile, MAP_OBJECT.EMPTY);
};
