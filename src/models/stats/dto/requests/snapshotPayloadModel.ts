import { Example, OneOf, Property, Required, Title } from "@tsed/schema";
import { StatType } from "../../model";

export class SnapshotPayloadModel {
  @Title("type")
  @Example("shares")
  @Property()
  @Required()
  @OneOf(StatType)
  public type: StatType;

  @Title("source")
  @Example("polygon")
  @Property()
  @Required()
  public source: string;

  @Title("userId")
  @Example("0x7582177F9E536aB0b6c721e11f383C326F2Ad1D5")
  @Property()
  @Required()
  public userId: string;

  @Title("valueDiff")
  @Example("10")
  @Property()
  @Required()
  public valueDiff: string;
}
