import { Description, Example, Property, Title } from "@tsed/schema";

export type LandsLimits = {
  [landId: string]: {
    limits: number;
    limits2: number;
  };
};

export type AvatarsLimits = {
  [avatarId: string]: number;
};

export class GetMissionLimitsResponse {
  @Title("Avatars Limits")
  @Description("Object with avatarId's as fileds names and number of available missions as values")
  @Example({ "1": 4, "23": 2 })
  @Property()
  public avatars: AvatarsLimits;

  @Title("Lands Limits")
  @Description("Object with landId's as fileds names and number of available missions as values")
  @Example({ "123": 4, "21000": 2 })
  @Property()
  public lands: LandsLimits;
}
