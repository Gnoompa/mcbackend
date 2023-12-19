import { Configuration, Inject, Logger, Module } from "@tsed/common";

export type AllowlistProof = string;

export enum ALLOWLIST {
  FREE_LAND
}

@Module()
export class AllowlistService {
  @Inject(Configuration) config: Configuration;

  @Inject(Logger)
  private logger: Logger;

  async getAllowlistIds() {
    return ALLOWLIST;
  }

  async getAllowlist(allowlistId: ALLOWLIST) {}

  async getIsInAllowlist(allowlistId: ALLOWLIST, merkleTreeLeaf: string) {}

  async getAllowlistProof(allowlistId: ALLOWLIST, merkleTreeLeaf: string) {}
}
