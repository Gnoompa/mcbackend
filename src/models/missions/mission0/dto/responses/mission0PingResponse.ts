import { Description, Example, Property, Title } from "@tsed/schema";

export class Mission0PingResponse {
  @Title("Status")
  @Description("Status of the mission")
  @Example("pong")
  @Property()
  public status: "pong";
}
