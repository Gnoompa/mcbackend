import { LandsService } from "./LandsService";
import { Mission } from "../models/missions/common/mission.model";
import { MissionCompleteResponse } from "../models/missions/common/responses/missionCompleteServerResponseModel";
import { OnChainRepository } from "../repositories/missions/missionsOnchainRepository";
import { Configuration, Inject, Logger } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { MissionsPostgresRepository } from "../repositories/missions/missionsPostgresRepository";
import { RewardsService } from "./RewardsService";
import { sleep } from "../utils/sleep";

// @Module()
export abstract class BaseMission<T> {
  @Inject(Configuration)
  protected config: Configuration;

  @Inject()
  private landsService: LandsService;

  @Inject()
  private missionsRepo: MissionsPostgresRepository;
  @Inject()
  protected onChainRepo: OnChainRepository;

  @Inject()
  logger: Logger;

  @Inject()
  protected rewardsService: RewardsService;

  protected abstract missionId: number;

  async $onInit() {
    setInterval(() => {
      this.removeOldMissions();
      this.checkIfStartedMissionsHasBeenFailed().catch((error) => {
        this.logger.error("error in startFailedMissionsEndlessLoops:" + error.message);
        throw error;
      });
    }, 5000 + Math.random() * 1000);
  }

  async removeOldMissions() {
    await this.missionsRepo.removeOldMissions();
  }

  async checkIfStartedMissionsHasBeenFailed() {
    const avatarsOnMissions = await this.missionsRepo.getAvatarsOnMissions({ missionId: this.missionId });
    for (const avatarId of avatarsOnMissions) {
      const activeAvatarMission = await this.missionsRepo.getAvatarActiveMission(avatarId);
      if (!activeAvatarMission) continue;
      if (this.isMissionFailed(activeAvatarMission)) {
        await this.missionFailed(activeAvatarMission);
      }
    }
  }

  async missionFailed(mission: Mission, reason: string | null = null) {
    const { address, avatarId, landId, missionId } = mission;
    this.logger.info({ message: "mission:failed", missionId, reason, userData: { address, avatarId, landId } });
    await this.missionsRepo.markMissionAsFailed({ avatarId });
    if (!reason) return;
    throw new BadRequest(reason);
  }

  abstract start(args: { avatarId: number; address: string; landId: number }): Promise<T>;

  abstract isMissionFailed(mission: Mission): boolean;

  async startMission(args: { address: string; avatarId: number; landId: number; missionId: number }): Promise<T> {
    const { address, avatarId, landId, missionId } = args;

    // avatar has no active missions now
    const isAvatarOnMission = await this.missionsRepo.isAvatarOnMission({ avatarId });
    if (isAvatarOnMission) throw new BadRequest(`Avatar ${avatarId} is on mission already`);

    const isAvatarInCryoChamber = await this.onChainRepo.isAvatarInCryochamber(avatarId);
    if (isAvatarInCryoChamber) throw new BadRequest(`Avatar ${avatarId} is in cryochamber now`);

    // address has no active missions now
    const isAddressOnMission = await this.missionsRepo.isAddressOnMission({ address });
    if (isAddressOnMission) throw new BadRequest(`Address ${address} is on mission already`);

    // check if avatar is below missions limits
    const avatarAvailableMissionsCount = await this.landsService.getAvatarAvailableMissions(avatarId);
    if (avatarAvailableMissionsCount < 1) throw new BadRequest(`Avatar ${avatarId} has no available missions now`);

    // check if land is below missions limits
    const landAvailableMissionsCount = await this.landsService.getLandAvailableMissions(landId, missionId);
    if (landAvailableMissionsCount < 1) throw new BadRequest(`Land ${landId} has no available missions now`);

    while (await this.landsService.isLandLockedForMissionStart(landId)) {
      this.logger.info({ message: "mission:land-locked", missionId, userData: { address, avatarId, landId } });
      await sleep(1000);
    }
    this.landsService.lockLandForMissionStart(landId);

    try {
      this.logger.info({ message: "mission:started", missionId, userData: { address, avatarId, landId } });
      const startResponse = await this.start({ avatarId, address, landId });
      this.landsService.unlockLandForMissionStart(landId);
      return startResponse;
    } catch (error) {
      this.landsService.unlockLandForMissionStart(landId);
      throw error;
    }
  }

  async complete(args: { address: string; avatarId: number; landId: number; missionId: number }): Promise<MissionCompleteResponse> {
    const { avatarId, address, landId, missionId } = args;
    this.logger.info({ message: "mission:completed", missionId, userData: { address, avatarId, landId } });

    const { response, message, signature } = await this.rewardsService.createFinishMessage({ address, avatarId, landId, missionId });
    await this.missionsRepo.markMissionAsCompleted({ avatarId });
    return { status: "complete", data: response, message, signature };
  }

  async leaveMission(avatarId: number) {
    await this.missionsRepo.markMissionAsFailed({ avatarId });
  }
}
