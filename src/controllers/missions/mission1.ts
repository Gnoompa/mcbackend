import { UserDataAppender } from "./../../middleware/userDataAppender";
import { MissionCompleteResponse } from "./../../models/missions/common/responses/missionCompleteServerResponseModel";
import { Mission1CheckResponse } from "./../../models/missions/mission1/dto/responses/Mission1CheckResponse";
import { Mission1StartRequestPayloadModel } from "./../../models/missions/mission1/dto/requests/mission1StartRequestPayloadModel";
import { VerifySignedEthMessage } from "./../../middleware/verifySignedEthMessage";
import { Mission1StartResponse } from "./../../models/missions/mission1/dto/responses/Mission1StartResponse";
import { Description, Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { Mission1Service } from "../../services/mission1/service";
import { UseBefore } from "@tsed/platform-middlewares";
import { CheckSignatureTimestamp } from "../../middleware/checkSignatureTimestamp";
import { VerifyAvatarOwner } from "../../middleware/verifyAvatarOwner";
import { Mission1CheckRequestPayloadModel } from "../../models/missions/mission1/dto/requests/mission1CheckRequestPayloadModel";

@Controller("/1")
export class Mission1Ctrl {
  @Inject(Mission1Service)
  private mission1Service: Mission1Service;

  @Post("/start")
  @Summary("Initial signed message from frontend to start mission 1")
  @Description("Return {success: true} or error if mission has been started or has been completed (TBD) already")
  @Returns(200, Mission1StartResponse)
  @Returns(400).Description("Mission has been started already")
  @UseBefore(CheckSignatureTimestamp)
  @UseBefore(VerifySignedEthMessage)
  async start(@BodyParams() payload: Mission1StartRequestPayloadModel): Promise<Mission1StartResponse> {
    const { address, landId, avatarId, missionId } = payload;
    const response = await this.mission1Service.startMission({ address, avatarId: +avatarId, landId: +landId, missionId: +missionId });
    return response;
  }

  @Post("/check")
  @Summary("Frontend send a word to check if it's a password")
  @Description("Returns isPassword = true if mission complete, and Similarity number if not completed yet")
  @Returns(200, [Mission1CheckResponse, MissionCompleteResponse])
  @Returns(400).Description("Mission has not been started or expired")
  @UseBefore(UserDataAppender)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async check(@BodyParams() payload: Mission1CheckRequestPayloadModel): Promise<Mission1CheckResponse | MissionCompleteResponse> {
    const { address, word, landId, avatarId } = payload;
    const checkResponse = await this.mission1Service.check({ address, avatarId: +avatarId, landId: +landId, word });
    return checkResponse;
  }
}
