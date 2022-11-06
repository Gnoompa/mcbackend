import { AvatarCrosschain } from "./../../../missions/common/avatar.model";
import { Property, Title } from "@tsed/schema";

export class GetAvatarsResponse {
  @Title("avatars")
  @Property()
  public avatars: AvatarCrosschain[];
}
