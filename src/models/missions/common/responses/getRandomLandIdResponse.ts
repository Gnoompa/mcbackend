import { Description, Example, Property, Title } from "@tsed/schema";

export class GetRandomLandIdResponse {
  @Title("Success status")
  @Description("True/False")
  @Example(true)
  @Property()
  public success: boolean;

  @Title("Random Land Id")
  @Description("LandId for next mission for address")
  @Example(1234)
  @Property()
  public landId?: number;

  @Title("error text")
  @Description("some error text")
  @Example("no more lands")
  @Property()
  public errorText?: string;
}
