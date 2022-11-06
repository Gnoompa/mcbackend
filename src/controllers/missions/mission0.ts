import { MissionCompleteResponse } from "./../../models/missions/common/responses/missionCompleteServerResponseModel";
import { Mission0PingResponse } from "./../../models/missions/mission0/dto/responses/mission0PingResponse";
import { Mission0RequestPayloadModel } from "./../../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { VerifySignedEthMessage } from "./../../middleware/verifySignedEthMessage";
import { Mission0StartResponse } from "./../../models/missions/mission0/dto/responses/Mission0StartResponse";
import { Description, Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { Mission0Service } from "../../services/mission0/service";
import { UseBefore } from "@tsed/platform-middlewares";
import { CheckSignatureTimestamp } from "../../middleware/checkSignatureTimestamp";
import { VerifyAvatarOwner } from "../../middleware/verifyAvatarOwner";
import { UserDataAppender } from "../../middleware/userDataAppender";

@Controller("/0")
export class Mission0Ctrl {
  @Inject(Mission0Service)
  private mission0Service: Mission0Service;

  @Post("/start")
  @Summary("Initial signed message from frontend to start mission 1")
  @Description("Return {success: true} or error if mission has been started or has been completed (TBD) already")
  @Returns(200, Mission0StartResponse)
  @Returns(400).Description("Mission has been started already")
  @UseBefore(UserDataAppender)
  @UseBefore(CheckSignatureTimestamp)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async start(@BodyParams() payload: Mission0RequestPayloadModel): Promise<Mission0StartResponse> {
    const { address, landId, avatarId, missionId } = payload;
    await this.mission0Service.startMission({ address, avatarId: +avatarId, landId: +landId, missionId: +missionId });
    return { success: true };
  }

  @Post("/ping")
  @Summary("Frontend should ping periodically to confirm if user is on mission")
  @Description("Returns signed serverside message or error if mission has been cancelled (ping delayed)")
  @Returns(200, [Mission0PingResponse, MissionCompleteResponse])
  @Returns(400).Description("Mission has not been started or expired")
  @UseBefore(UserDataAppender)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async ping(@BodyParams() payload: Mission0RequestPayloadModel): Promise<Mission0PingResponse | MissionCompleteResponse> {
    const { address, landId, avatarId } = payload;
    const missionServiceResponse = await this.mission0Service.ping({ address, avatarId: +avatarId, landId: +landId });
    return missionServiceResponse;
  }

  // @Get("/is-user-completed-mission")
  // @Summary("Check if address completed mission in last 60 days")
  // @Description("Returns boolean")
  // @Returns(200, IsUserCompleteMissionResponse)
  // async isFinished(@QueryParams() payload: IsUserCompleteMissionRequest): Promise<boolean> {
  //   const { address } = payload;
  //   return this.mission0Service.isUserCompletedMission(address);
  // }
}
