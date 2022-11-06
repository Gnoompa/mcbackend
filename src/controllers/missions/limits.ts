import { LandsService } from "./../../services/LandsService";
import { MissionsLimitsPayloadModel } from "./../../models/missions/common/dto/requests/missionsLimitsPayloadModel";
import { AvatarsLimits, GetMissionLimitsResponse, LandsLimits } from "./../../models/missions/common/responses/getMissionLimitsResponse";
import { BadRequest } from "@tsed/exceptions";
import { Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";

@Controller("/limits")
export class LimitsCtrl {
  @Inject(LandsService)
  private landsService: LandsService;

  @Post("/")
  @Summary("Get mission limits of lands and avatars")
  // @Description("")
  @Returns(200, GetMissionLimitsResponse)
  // @Returns(400).Description("Mission has been started already")
  async limits(@BodyParams() payload: MissionsLimitsPayloadModel): Promise<GetMissionLimitsResponse> {
    const { landIds, avatarIds } = payload;

    // todo add framework validation
    if (!landIds || !Array.isArray(landIds)) throw new BadRequest("landIds not valid");
    if (!avatarIds || !Array.isArray(avatarIds)) throw new BadRequest("avatarIds not valid");

    const landsLimits: LandsLimits = {};
    const avatarsLimits: AvatarsLimits = {};

    for (const landId of landIds) {
      const limits = await this.landsService.getLandAvailableMissions(+landId, 0);
      const limits2 = await this.landsService.getLandAvailableMissions(+landId, 2);
      landsLimits[+landId] = { limits, limits2 };
    }

    for (const avatarId of avatarIds) {
      const avatarLimit = await this.landsService.getAvatarAvailableMissions(avatarId);
      avatarsLimits[avatarId] = avatarLimit;
    }

    return {
      avatars: avatarsLimits,
      lands: landsLimits
    };
  }
}
