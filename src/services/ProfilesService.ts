import { ProfileModel } from "./../models/profiles/model";
import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { ProfilesPostgresRepository } from "../repositories/profiles/profilesPostgresRepository";

@Module()
export class ProfilesService {
  @Inject(Configuration) config: Configuration;

  @Inject(ProfilesPostgresRepository)
  private profilesRepo: ProfilesPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  async getProfileData(address: string) {
    const profile = await this.profilesRepo.getProfileData(address);
    if (!profile) return ProfileModel.getDefault(address);
    return profile;
  }

  async setProfileData(address: string, name: string, twitter: string, discord: string) {
    await this.profilesRepo.setProfileData({ address, name, twitter, discord });
  }
}
