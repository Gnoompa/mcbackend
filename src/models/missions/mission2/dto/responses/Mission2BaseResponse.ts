import { Tile, TilePosition } from "./../../../../../services/mission2/utils/gameMap";
import { Description, Example, Property, Title } from "@tsed/schema";
import { Resources } from "../../model";

export class Mission2BaseResponse {
  @Title("Position")
  @Description("Vehicle position")
  @Property()
  public position: TilePosition;

  @Title("Moves")
  @Description("moves left")
  @Property()
  public moves: number;

  @Title("Dynamites")
  @Description("Dynamites")
  @Property()
  public dynamites: number;

  @Title("Scans")
  @Description("scans")
  @Property()
  public scans: number;

  @Title("Tiles")
  @Description("surrounding tiles")
  @Property()
  public tiles: Tile[];

  @Title("Resources")
  @Description("collected items")
  @Property()
  public resources: Resources;

  @Title("FightStatus")
  @Description("worm fight status")
  @Property()
  public fightStatus?: "fail" | "win";

  @Title("Scan Result")
  @Description("worm fight status")
  @Property()
  public scanResult?: number;

  @Title("Worm appeared")
  @Property()
  public worm?: boolean;
}
