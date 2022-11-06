import { Example, MaxLength, MinLength, Property, Required, Title } from "@tsed/schema";

export class SetProfilePayloadModel {
  @Title("address")
  @Example("0x44A8Ff416E4eb863Ac9D01dC2056f3dab974A56D")
  @Property()
  @Required()
  public address: string;

  @Title("name")
  @Example("0xName")
  @Property()
  @Required()
  @MaxLength(15)
  @MinLength(3)
  public name: string;

  @Title("address")
  @Example("twitter.handle")
  @Property()
  public twitter: string;

  @Title("discord")
  @Example("Name#5656")
  @Property()
  public discord: string;

  @Title("Signature")
  @Example(
    "0x849732d744990d13335b34973f71c06586637965c8fd99fe3640d5c0db5fc6c32912eb2e13e3628346a66c19d65875ee422492a14f1d9a35c59e1b0a5a6ed04a1b"
  )
  @Property()
  public signature: string;

  @Title("Message")
  @Example("MarsColony Pass 1666792394.089")
  @Property()
  public message: string;
}
