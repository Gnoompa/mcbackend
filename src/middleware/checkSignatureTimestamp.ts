import { Mission0RequestPayloadModel } from "./../models/missions/mission0/dto/requests/mission0RequestPayloadModel";
import { BodyParams, Middleware } from "@tsed/common";
import { isNotLaterThan1Day } from "../utils/time";
import { BadRequest } from "@tsed/exceptions";

@Middleware()
export class CheckSignatureTimestamp {
  async use(@BodyParams() payload: Mission0RequestPayloadModel): Promise<void> {
    const { message } = payload;
    const timestamp = +message.split(" ").at(-1)! * 1000;
    const date = new Date(timestamp);

    const isNotLate = isNotLaterThan1Day(date);
    if (!isNotLate) {
      throw new BadRequest("Invalid timestamp.");
    }
  }
}
