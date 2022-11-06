import { Description, Example, Property, Title } from "@tsed/schema";

export class IsUserCompleteMissionRequest {
  @Title("Address")
  @Description("Player address")
  @Example("0x12345....ff")
  @Property()
  public address: string;
}
