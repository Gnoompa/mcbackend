import { Description, Example, Property, Title } from "@tsed/schema";

export class MissionCompleteResponse {
  @Title("status")
  @Example("complete")
  @Property()
  public status = "complete";

  @Title("Data")
  @Example([{ name: "XP earned", value: "25", type: "basic" }])
  @Property()
  public data: {
    name: string;
    value?: string;
    type: "basic" | "accent";
  }[];

  @Title("message")
  @Example("3b7d4bad9bdd2b0d0003304567000000250000000000000000")
  @Property()
  public message: string;

  @Title("Signature")
  @Description("MissionId signed by server")
  @Example(
    "0x849732d744990d13335b34973f71c06586637965c8fd99fe3640d5c0db5fc6c32912eb2e13e3628346a66c19d65875ee422492a14f1d9a35c59e1b0a5a6ed04a1b"
  )
  @Property()
  public signature: string;
}
