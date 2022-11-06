import { Example, Property, Title } from "@tsed/schema";

export class GetProfileResponse {
  @Title("address")
  @Example("0x44A8Ff416E4eb863Ac9D01dC2056f3dab974A56D")
  @Property()
  public address: string;

  @Title("name")
  @Example("0xName")
  @Property()
  public name: string;

  @Title("twitter")
  @Example("twitter.handle")
  @Property()
  public twitter: string;

  @Title("discord")
  @Example("Name#5656")
  @Property()
  public discord: string;
}
