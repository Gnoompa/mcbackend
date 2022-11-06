import { Description, Example, Property, Title } from "@tsed/schema";

export class Mission1StartResponse {
  @Title("Success")
  @Description("True if mission has been started successfully")
  @Example(true)
  @Property()
  public success: boolean;

  @Title("Words")
  @Description("Array of words to guess the password")
  @Example(["word1", "word2"])
  @Property()
  public words: string[];
}
