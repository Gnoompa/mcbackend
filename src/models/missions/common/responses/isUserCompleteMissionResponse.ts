import { Description, Example, Property, Title } from "@tsed/schema";

export class IsUserCompleteMissionResponse {
  @Title("Resilt")
  @Description("True if user has completed at least one mission")
  @Example(true)
  @Property()
  public status: boolean;
}
