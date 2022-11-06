import { Mission2BaseRequestPayloadModel } from "./mission2BaseRequestPayloadModel";
import { Description, Example, Property, Title } from "@tsed/schema";

export type WormAction = "retreat" | "pay" | "fight";

export class Mission2WormRequestPayloadModel extends Mission2BaseRequestPayloadModel {
  @Title("Action")
  @Description("Worm action")
  @Example("fight")
  @Property()
  public action: WormAction;
}
