import { MissionCompleteResponse } from "../../models/missions/common/responses/missionCompleteServerResponseModel";
import { VerifySignedEthMessage } from "../../middleware/verifySignedEthMessage";
import { Description, Post, Returns, Summary } from "@tsed/schema";
import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { UseBefore } from "@tsed/platform-middlewares";
import { CheckSignatureTimestamp } from "../../middleware/checkSignatureTimestamp";
import { VerifyAvatarOwner } from "../../middleware/verifyAvatarOwner";
import {
  DynamiteResponse,
  FuelResponse,
  MineResponse,
  Mission2Service,
  MoveResponse,
  ScanResponse,
  WormResponse
} from "../../services/mission2/service";
import { Mission2MoveRequestPayloadModel } from "../../models/missions/mission2/dto/requests/mission2MoveRequestPayloadModel";
import { Mission2BaseRequestPayloadModel } from "../../models/missions/mission2/dto/requests/mission2BaseRequestPayloadModel";
import { Mission2BaseResponse } from "../../models/missions/mission2/dto/responses/Mission2BaseResponse";
import { Mission2WormRequestPayloadModel } from "../../models/missions/mission2/dto/requests/mission2WormRequestPayloadModel";

@Controller("/2")
export class Mission2Ctrl {
  @Inject(Mission2Service)
  private mission2Service: Mission2Service;

  @Post("/start")
  @Summary("Initial signed message from frontend to start mission 1")
  @Description("Return {success: true} or error if mission has been started or has been completed (TBD) already")
  @Returns(200, Mission2BaseResponse)
  @Returns(400)
  @UseBefore(CheckSignatureTimestamp)
  @UseBefore(VerifySignedEthMessage)
  async start(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<Partial<Mission2BaseResponse>> {
    const { address, landId, avatarId, missionId } = payload;
    const response = await this.mission2Service.startMission({ address, avatarId: +avatarId, landId: +landId, missionId: +missionId });
    return response;
  }

  @Post("/move")
  @Summary("User make move")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async check(@BodyParams() payload: Mission2MoveRequestPayloadModel): Promise<MoveResponse> {
    const { address, landId, avatarId, direction } = payload;

    const response = await this.mission2Service.move({ address, avatarId: +avatarId, landId: +landId, direction });
    return response;
  }

  @Post("/wormAction")
  @Summary("User make wormAction")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async wormAction(@BodyParams() payload: Mission2WormRequestPayloadModel): Promise<WormResponse> {
    const { address, action, landId, avatarId } = payload;
    const response = await this.mission2Service.wormAction({ address, avatarId: +avatarId, landId: +landId, action });
    return response;
  }

  @Post("/mine")
  @Summary("User make mine")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async mine(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<MineResponse> {
    const { address, landId, avatarId } = payload;
    const response = await this.mission2Service.mine({ address, avatarId: +avatarId, landId: +landId });
    return response;
  }

  @Post("/fuel")
  @Summary("User make fuel")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async fuel(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<FuelResponse> {
    const { address, landId, avatarId } = payload;
    const response = await this.mission2Service.fuel({ address, avatarId: +avatarId, landId: +landId });
    return response;
  }

  @Post("/dynamite")
  @Summary("User make mine")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async dynamite(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<DynamiteResponse> {
    const { address, landId, avatarId } = payload;
    const response = await this.mission2Service.dynamite({ address, avatarId: +avatarId, landId: +landId });
    return response;
  }

  @Post("/scan")
  @Summary("User make scan")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async scan(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<ScanResponse> {
    const { address, landId, avatarId } = payload;
    const response = await this.mission2Service.scan({ address, avatarId: +avatarId, landId: +landId });
    return response;
  }

  @Post("/exit")
  @Summary("User make exit")
  @Description("")
  @Returns(200)
  @Returns(400)
  @UseBefore(VerifySignedEthMessage)
  @UseBefore(VerifyAvatarOwner)
  async exit(@BodyParams() payload: Mission2BaseRequestPayloadModel): Promise<MissionCompleteResponse> {
    const { address, landId, avatarId } = payload;
    const response = await this.mission2Service.exit({ address, avatarId: +avatarId, landId: +landId });
    return response;
  }
}
