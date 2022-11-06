import { Mission0RequestPayloadModel } from "./../../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { Mission0StartResponse } from "./../../models/missions/mission0/dto/responses/Mission0StartResponse";
import { VerifySignedEthMessage } from "../../middleware/verifySignedEthMessage";
import { Description, Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { UseBefore } from "@tsed/platform-middlewares";
import { UserDataAppender } from "../../middleware/userDataAppender";
import { Mission1Service } from "../../services/mission1/service";

@Controller("/leave-mission")
export class LeaveMissionCtrl {
  @Inject(Mission1Service)
  private mission1Service: Mission1Service;

  @Post("/")
  @Summary("User is leaving mission")
  @Description("Return {success: true}")
  @Returns(200, Mission0StartResponse)
  @UseBefore(UserDataAppender)
  @UseBefore(VerifySignedEthMessage)
  async leave(@BodyParams() payload: Mission0RequestPayloadModel): Promise<Mission0StartResponse> {
    const { avatarId } = payload;
    await this.mission1Service.leaveMission(+avatarId);
    return { success: true };
  }
}
