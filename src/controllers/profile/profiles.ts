import { Controller, Inject } from "@tsed/di";
import { UseBefore } from "@tsed/platform-middlewares";
import { BodyParams, QueryParams } from "@tsed/platform-params";
import { Get, Post, Returns, Summary } from "@tsed/schema";
import { SetProfilePayloadModel } from "../../models/profiles/dto/requests/setProfilePayloadModel";
import { GetProfileResponse } from "../../models/profiles/dto/responses/getProfileResponse";
import { ProfilesService } from "../../services/ProfilesService";
import { CheckSignatureTimestamp } from "./../../middleware/checkSignatureTimestamp";
import { VerifySignedEthMessage } from "./../../middleware/verifySignedEthMessage";
import { GetAvatarsResponse } from "./../../models/profiles/dto/responses/getAvatarsResponse";
import { GetLandsResponse } from "./../../models/profiles/dto/responses/getLandsResponse";
import { AvatarsService } from "./../../services/AvatarsService";
import { LandsService } from "./../../services/LandsService";

@Controller("/")
export class ProfilesCtrl {
  @Inject(ProfilesService)
  private profilesService: ProfilesService;

  @Inject(AvatarsService)
  private avatarsService: AvatarsService;

  @Inject(LandsService)
  private landsService: LandsService;

  @Post("/profile")
  @Summary("Set profile data")
  @Returns(200)
  @UseBefore(CheckSignatureTimestamp)
  @UseBefore(VerifySignedEthMessage)
  async setProfile(@BodyParams() payload: SetProfilePayloadModel) {
    const { address, name, twitter, discord } = payload;
    await this.profilesService.setProfileData(address, name, twitter, discord);
  }

  @Get("/profile")
  @Summary("Get profile data")
  @Returns(200, GetProfileResponse)
  async getProfile(@QueryParams("address") address: string) {
    const profile = await this.profilesService.getProfileData(address);
    return profile;
  }

  @Get("/avatars")
  @Summary("Get avatars crosschain data")
  @Returns(200, GetAvatarsResponse)
  async getAvatars(@QueryParams("address") address: string) {
    const avatars = await this.avatarsService.getAllAvatarsCrosschain(address);
    return avatars;
  }

  @Get("/lands")
  @Summary("Get lands crosschain data")
  @Returns(200, GetLandsResponse)
  async getLands(@QueryParams("address") address: string) {
    const lands = await this.landsService.getAllLandsCrosschain(address);
    return lands;
  }
}
