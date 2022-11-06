import { Description, Example, Property, Title } from "@tsed/schema";

export class GetRandomLandIdPayloadModel {
  @Title("Address")
  @Description("Player address")
  @Example("0x12345....ff")
  @Property()
  public address: string;

  @Title("LandId")
  @Description("Land to exclude from search")
  @Example(1234)
  @Property()
  public excludedLandId?: number;
}
