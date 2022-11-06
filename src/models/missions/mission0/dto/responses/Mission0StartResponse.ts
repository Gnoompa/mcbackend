import { Description, Example, Property, Title } from "@tsed/schema";

export class Mission0StartResponse {
  @Title("Success")
  @Description("True if mission has been started successfully")
  @Example(true)
  @Property()
  public success: boolean;
}
