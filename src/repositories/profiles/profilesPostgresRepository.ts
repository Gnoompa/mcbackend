import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";
import { Profile, ProfileModel } from "./../../models/profiles/model";

import { Configuration, Inject, Injectable } from "@tsed/common";

@Injectable()
export class ProfilesPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
  }

  async getProfileData(address: string): Promise<Profile | undefined> {
    const profile = await ProfileModel(this.postgresClient).where({ address }).first();

    return profile;
  }

  async setProfileData(args: { address: string; name: string; twitter: string; discord: string }) {
    const { address, name, twitter, discord } = args;
    const profileModel: ProfileModel = {
      address,
      name,
      twitter,
      discord
    };
    await ProfileModel(this.postgresClient).insert(profileModel).onConflict(["address"]).merge();
  }
}
