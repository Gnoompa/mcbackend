import { LandCrosschain } from "./../../../missions/common/land.model";
import { Property, Title } from "@tsed/schema";

export class GetLandsResponse {
  @Title("lands")
  @Property()
  public lands: LandCrosschain[];
}
