import { Example, Property, Required, Title } from "@tsed/schema";

export class StatSnapshotModel {
  @Title("id")
  @Example("0x7582177F9E536aB0b6c721e11f383C326F2Ad1D5")
  @Property()
  @Required()
  public id: string;

  @Title("new_value")
  @Example("10")
  @Property()
  @Required()
  public new_value: number;
}
