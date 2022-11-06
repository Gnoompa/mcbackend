import { LandsService } from "./../../services/LandsService";
import { GetRandomLandIdPayloadModel } from "./../../models/missions/common/dto/requests/getRandomLandIdPayloadModel";
import { GetRandomLandIdResponse } from "./../../models/missions/common/responses/getRandomLandIdResponse";
import { Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";

@Controller("/random-land")
export class RandomLandCtrl {
  @Inject(LandsService)
  private landsService: LandsService;

  @Post("/")
  @Summary("Get random land for address for missions 0 and 1")
  // @Description("")
  @Returns(200, GetRandomLandIdResponse)
  // @Returns(400).Description("Mission has been started already")
  async randomLand(@BodyParams() payload: GetRandomLandIdPayloadModel): Promise<GetRandomLandIdResponse> {
    const randomLand = await this.landsService.getRandomLandForMissions_0_1(payload);
    if (!randomLand) {
      return { success: false, errorText: "No lands available for mission. Try later..." };
    }

    return {
      success: true,
      landId: randomLand
    };
  }

  @Post("/2")
  @Summary("Get random land for address for missions 0 and 1")
  // @Description("")
  @Returns(200, GetRandomLandIdResponse)
  // @Returns(400).Description("Mission has been started already")
  async randomLandForMining(@BodyParams() payload: GetRandomLandIdPayloadModel): Promise<GetRandomLandIdResponse> {
    const randomLand = await this.landsService.getRandomLandForMission_2(payload);
    if (!randomLand) {
      return { success: false, errorText: "No lands available for mission. Try later..." };
    }

    return {
      success: true,
      landId: randomLand
    };
  }
}
