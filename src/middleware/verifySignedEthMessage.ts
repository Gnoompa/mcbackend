import { Mission0RequestPayloadModel } from "./../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { BodyParams, Inject, Logger, Middleware } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";

import { ethers } from "ethers";

@Middleware()
export class VerifySignedEthMessage {
  @Inject(Logger) logger: Logger;
  async use(@BodyParams() payload: Mission0RequestPayloadModel): Promise<void> {
    const { message, address, signature } = payload;
    const isValid = await this.verifyMessage(message, address, signature);
    if (!isValid) {
      throw new Unauthorized("Unauthorized. Invalid signature.");
    }
  }

  async verifyMessage(message: string, address: string, signature: string) {
    try {
      const signerAddr = await ethers.utils.verifyMessage(message, signature);

      if (signerAddr !== address) {
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error("verifyMessage error", err);
      return false;
    }
  }
}
