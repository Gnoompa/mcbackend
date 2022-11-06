import { MissionStatus } from "../models/missions/common/mission.model";
import { v4 } from "uuid";
export const mission2MockData = {
  id: v4(),
  avatar_id: 3,
  land_id: 21000,
  mission_id: 2,
  address: "0x586DB0024db553c613f12020494C83325F8e563B",
  network: "development",
  started_at: new Date(),
  status: MissionStatus.Started,
  finished_at: undefined,
  data: {
    map: [
      [0, 0, 0, 0, 0, 0, 0, -1, -1, -1, 0, 2, 1, -1, 0, 0, 0, 0, 0, 0, 0],
      [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
      [-1, -1, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, -1, -1],
      [-1, -1, -1, -1, -1, 0, 0, 0, -1, -1, -1, 0, 0, 0, -1, 0, 0, 3, 0, -1, -1],
      [-1, -1, 0, 0, 1, 7, 0, 0, -1, -1, 0, 0, 0, -1, -1, 0, 0, -1, -1, -1, -1],
      [-1, -1, 0, 4, 0, -1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 0, 0, 0, 0, -1, -1],
      [-1, -1, 0, 4, 0, -1, -1, -1, 0, 0, 0, 0, 4, 5, 0, -1, 2, 0, 0, -1, -1],
      [-1, -1, -1, 0, 7, 0, 0, -1, 0, 0, -1, 0, -1, -1, -1, 0, 0, 0, -1, -1, -1],
      [-1, -1, -1, -1, -1, 0, 0, -1, 0, 0, -1, -1, -1, 0, 0, 0, 0, 0, 0, -1, -1],
      [-1, -1, -1, -1, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, -1, -1, 0, -1, -1, -1],
      [0, 0, 0, -1, -1, 0, 1, 2, 0, 0, 5, 7, 5, -1, -1, 0, 0, 1, -1, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, -1, -1, -1, 0, 0, 0, 0, 0, 6]
    ],
    moves: 129,
    scans: 2,
    position: { x: 0, y: 11 },
    dynamites: 1,
    resources: { common: 0, rare: 0, legendary: 0 },
    prev_position: { x: 0, y: 11 },
    final_resources_bonus: 0.015,
    mining_moves_discount: 2,
    worm_win_chance_bonus: 0
  }
};
