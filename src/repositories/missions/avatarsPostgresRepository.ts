import { Avatar, AvatarDataMapper, AvatarModel } from "./../../models/missions/common/avatar.model";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";

import { Configuration, Inject, Injectable } from "@tsed/common";

@Injectable()
export class AvatarsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;
  private network: string;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
    this.network = config.get("onchain").current_network;
  }

  async upsertAvatarsData(onChainAvatarData: Avatar[]): Promise<void> {
    this.postgresClient.transaction(async (trx) => {
      await AvatarModel(this.postgresClient)
        .transacting(trx)
        .where({ network: this.network })
        .whereNotIn(
          "id",
          onChainAvatarData.map((avatar) => avatar.id)
        )
        .del();
      for (const avatar of onChainAvatarData) {
        const avatarModel = AvatarDataMapper(this.network).toModel(avatar);
        await AvatarModel(this.postgresClient).transacting(trx).insert(avatarModel).onConflict(["id", "network"]).merge();
      }
    });
  }

  async getAvatarById(avatarId: number): Promise<Avatar> {
    const avatarModel = await AvatarModel(this.postgresClient).where({ id: avatarId, network: this.network }).first();
    if (!avatarModel) {
      throw new Error("getLandMissionsLimit land not found:" + avatarId);
    }
    return AvatarDataMapper(this.network).fromModel(avatarModel);
  }

  async getAllAvatarsCrosschain(args: { address: string }) {
    const { address } = args;
    const avatars = await AvatarModel(this.postgresClient).where({ owner: address });
    return avatars.map((avatar) => AvatarDataMapper(this.network).fromModelCrosschain(avatar));
  }
}
