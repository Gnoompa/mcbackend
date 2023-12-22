import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { Configuration, Inject, Module } from "@tsed/common";
import { AllowlistsPostgresRepository } from "../repositories/allowlists/allowlistsPostgresRepository";

export type AllowlistProof = string;

export enum ALLOWLIST {
  DISCOUNTED_LAND = 1
}

export const ALLOWLIST_MT_LEAF_ENCODING = {
  [ALLOWLIST.DISCOUNTED_LAND]: ["address", "uint256", "bytes32"]
};

@Module()
export class AllowlistService {
  @Inject(Configuration) config: Configuration;

  @Inject(AllowlistsPostgresRepository)
  private allowlistRepo: AllowlistsPostgresRepository;

  async getAllowlistIds() {
    return ALLOWLIST;
  }

  async getIsInAllowlist(allowlistId: ALLOWLIST, allowlistTarget: string) {
    return await this.allowlistRepo.getAllowlistTargetData(allowlistId, allowlistTarget);
  }

  async getAllowlistProof(allowlistId: ALLOWLIST, allowlistTarget: string) {
    let response;

    const allowlistTargetData = await this.getIsInAllowlist(allowlistId, allowlistTarget);

    if (allowlistTargetData) {
      const allowlistData = await this.allowlistRepo.getAllowlistData(allowlistId);

      response = JSON.stringify(
        StandardMerkleTree.of(
          allowlistData?.map((allowlist) => [allowlist.target, ...allowlist.data.split(",")]) as string[][],
          ALLOWLIST_MT_LEAF_ENCODING[allowlistId]
        ).getProof([allowlistTarget, ...allowlistTargetData.data.split(",")])
      );
    }

    return response;
  }
}
