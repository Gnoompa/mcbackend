import { Description, Example, Property, Title } from "@tsed/schema";

export class Mission1StartRequestPayloadModel {
  @Title("Message")
  @Description("Message to sign for next 24 hours, crosschain.")
  @Example("MarsColony Pass 1666792394.089")
  @Property()
  public message: string;

  @Title("Address")
  @Description("User's wallet address")
  @Example("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
  @Property()
  public address: string;

  @Title("avatarId")
  @Example(123)
  @Property()
  public avatarId: number;

  @Title("landId")
  @Example(1)
  @Property()
  public landId: number;

  @Title("missionId")
  @Example(1)
  @Property()
  public missionId: number;

  @Title("Signature")
  @Description("User's signature for message")
  @Example(
    "0x849732d744990d13335b34973f71c06586637965c8fd99fe3640d5c0db5fc6c32912eb2e13e3628346a66c19d65875ee422492a14f1d9a35c59e1b0a5a6ed04a1b"
  )
  @Property()
  public signature: string;
}
