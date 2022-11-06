import { initialMapState } from "./initialMap";
import {
  generateMap,
  genExitGates,
  genObstacles,
  getEmptyTiles,
  MAP_OBJECT,
  placeGatesOnMap,
  placeObstaclesOnMap,
  placeResourcesOnMap,
  GameMap,
  generateInitialPosition
} from "./utils/gameMap";

describe.only("MapGeneration", () => {
  it("generate 2 exit gates in different positions from 0 to 3", () => {
    const gatesPositions = [0, 1, 2, 3];

    for (let i = 0; i < 1000; i++) {
      const [gate1, gate2] = genExitGates();

      expect(gate1 !== gate2).toBeTruthy();
      expect(gatesPositions.includes(gate1)).toBeTruthy();
      expect(gatesPositions.includes(gate2)).toBeTruthy();
    }
  });

  it("place gates on map", () => {
    const missionMap = placeGatesOnMap(initialMapState, 0, 1);
    expect(missionMap[0][0] === MAP_OBJECT.GATE).toBeTruthy();
    expect(missionMap[0][20] === MAP_OBJECT.GATE).toBeTruthy();
  });

  it("generate 2 obstacle positions in different positions from 0 to 2", () => {
    const obstaclePositions = [0, 1, 2];

    for (let i = 0; i < 1000; i++) {
      const [obstacle1, obstacle2] = genObstacles();

      expect(obstacle1 !== obstacle2).toBeTruthy();
      expect(obstaclePositions.includes(obstacle1)).toBeTruthy();
      expect(obstaclePositions.includes(obstacle2)).toBeTruthy();
    }
  });

  it("place obstacles on map", () => {
    const missionMap = placeObstaclesOnMap(initialMapState, 0, 1);
    expect(missionMap[1][8] === MAP_OBJECT.OBSTACLE).toBeTruthy();
    expect(missionMap[6][13] === MAP_OBJECT.OBSTACLE).toBeTruthy();
  });

  it("place placeResourcesOnMap", () => {
    const missionMap = placeResourcesOnMap([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);

    const emptyTiles = getEmptyTiles(missionMap);

    expect(emptyTiles.length).toBe(4);
  });

  it("generateMap", () => {
    for (let i = 0; i < 1000; i++) {
      const map = generateMap();

      const objects = {
        gates: 0,
        obstacles: 0,
        worms: 0,
        rare: 0,
        common: 0,
        legendary: 0,
        fuels: 0
      };

      for (let x = 0; x < map[0].length; x++) {
        for (let y = 0; y < map.length; y++) {
          switch (GameMap.getTileState(map, { x, y })) {
            case MAP_OBJECT.GATE:
              objects.gates++;
              break;
            case MAP_OBJECT.OBSTACLE:
              objects.obstacles++;
              break;
            case MAP_OBJECT.COMMON_RESOURCE:
              objects.common++;
              break;
            case MAP_OBJECT.RARE_RESOURCE:
              objects.rare++;
              break;
            case MAP_OBJECT.LEGENDARY_RESOURCE:
              objects.legendary++;
              break;
            case MAP_OBJECT.WORM:
              objects.worms++;
              break;
            case MAP_OBJECT.FUEL:
              objects.fuels++;
              break;
          }
        }
      }
      // console.log({ objects });
      expect(objects.common === 5).toBeTruthy();
      expect(objects.rare === 3).toBeTruthy();
      expect(objects.legendary === 2).toBeTruthy();
      expect(objects.gates === 2).toBeTruthy();
      expect(objects.obstacles === 2).toBeTruthy();
      expect(objects.worms === 4).toBeTruthy();
      expect(objects.fuels === 3).toBeTruthy();
    }
  });

  it("generate initial position", () => {
    // for (let i = 0; i < 1000; i++) {
    const map = generateMap();
    const initialPosition = generateInitialPosition(map);
    console.log({ initialPosition });
  });

  it.only("map integtity visual checks", () => {
    const getObject = (state: number): string => {
      switch (state) {
        case -1:
          return " *";
        case 0:
          return " _";
        case 1:
          return " C";
        case 2:
          return " R";
        case 3:
          return " L";
        case 4:
          return " W";
        case 5:
          return " O";
        case 6:
          return " G";
        case 7:
          return " F";
        default:
          return " ?";
      }
    };
    const format = (map: GameMap) => {
      let result = "";
      for (let y = 0; y < map.length; y++) {
        result += "\r\n";
        for (let x = 0; x < map[y].length; x++) {
          result += getObject(map[y][x]);
        }
      }
      return result;
    };
    const map = generateMap();
    console.log(format(map));
  });
});
