import { Description, Example, Property, Title } from "@tsed/schema";

export class MissionsLimitsPayloadModel {
  @Title("Lands Ids")
  @Description("Array of requested lands ids")
  @Example([1, 2, 34])
  @Property()
  public landIds: number[];

  @Title("Avatar Ids")
  @Description("Array of requested avatars ids")
  @Example([1, 3, 5])
  @Property()
  public avatarIds: number[];
}
