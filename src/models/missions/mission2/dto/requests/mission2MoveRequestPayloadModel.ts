import { Mission2BaseRequestPayloadModel } from "./mission2BaseRequestPayloadModel";
import { Description, Example, Property, Title } from "@tsed/schema";

export type Direction = "up" | "down" | "right" | "left";

export class Mission2MoveRequestPayloadModel extends Mission2BaseRequestPayloadModel {
  @Title("Direction")
  @Description("Direction of movement")
  @Example("up")
  @Property()
  public direction: Direction;
}
