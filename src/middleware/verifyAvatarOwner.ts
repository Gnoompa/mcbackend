import { Mission0RequestPayloadModel } from "./../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { BodyParams, Inject, Logger, Middleware } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";

import { OnChainRepository } from "../repositories/missions/missionsOnchainRepository";

@Middleware()
export class VerifyAvatarOwner {
  @Inject(Logger) logger: Logger;
  @Inject(OnChainRepository) onChainRepo: OnChainRepository;
  async use(@BodyParams() payload: Mission0RequestPayloadModel): Promise<void> {
    const { address, avatarId } = payload;

    //check if address is owner of the avatar
    const avatarOwner = await this.onChainRepo.getAvatarOwnerAddress({ avatarId: +avatarId });
    this.logger.debug({ event: "VerifyAvatarOwner", avatarId, address, avatarOwner });
    if (avatarOwner !== address) throw new Unauthorized(`You are not an avatar owner`);
  }
}
