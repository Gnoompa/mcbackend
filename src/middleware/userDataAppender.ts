import { Mission0RequestPayloadModel } from "./../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { BodyParams, Context, Middleware } from "@tsed/common";

@Middleware()
export class UserDataAppender {
  async use(@BodyParams() payload: Mission0RequestPayloadModel, @Context() ctx: Context & { userData: any }): Promise<void> {
    const { address, avatarId, landId, missionId } = payload;
    ctx.userData = { landId: +landId, avatarId: +avatarId, missionId: +missionId, address };
  }
}
