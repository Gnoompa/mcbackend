import { Description, Example, Property, Title } from "@tsed/schema";

export class Mission1CheckResponse {
  @Title("Success")
  @Description("False if attempt was wrong and last")
  @Example(true)
  @Property()
  public success: boolean;

  @Title("Is Password")
  @Description("True if mission completed")
  @Example(true)
  @Property()
  public isPassword?: boolean;

  @Title("Similarity")
  @Description("Number of letters on the right positions")
  @Example(4)
  @Property()
  public similarity?: number;
}
