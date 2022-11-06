import { MissionCompleteResponse } from "./../../models/missions/common/responses/missionCompleteServerResponseModel";
import { BaseMission } from "../BaseMission";
import { Mission0 } from "./../../models/missions/mission0/model";
import { Mission0PostgresRepository } from "./../../repositories/missions/mission0/mission0PostgresRepository";
import { Mission0PingResponse } from "./../../models/missions/mission0/dto/responses/mission0PingResponse";
import { Inject, InjectContext, PlatformContext, Service } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";

@Service()
export class Mission0Service extends BaseMission<void> {
  @InjectContext()
  protected $ctx?: PlatformContext;
  private timeToComplete: number;
  private pingDelay: number;
  protected missionId: number;

  @Inject(Mission0PostgresRepository)
  private mission0Repo: Mission0PostgresRepository;

  $beforeInit() {
    this.missionId = 0;
    this.timeToComplete = this.config.get("missions").missions["0"].timeToComplete;
    this.pingDelay = Number(this.config.get("missions").missions["0"].pingDelay) * 1000;
  }

  async start(args: { address: string; avatarId: number; landId: number }): Promise<void> {
    const { address, avatarId, landId } = args;
    await this.mission0Repo.createMission0Record({ avatarId, address, landId });
    return;
  }

  isMissionFailed(mission: Mission0): boolean {
    if (mission.missionId !== 0) return false;
    const missionLastPing = mission.missionLastPing;

    this.logger.debug({ missionLastPing });

    const delay = new Date().getTime() - missionLastPing.getTime();
    return delay > this.pingDelay;
  }

  async ping(args: { address: string; avatarId: number; landId: number }): Promise<Mission0PingResponse | MissionCompleteResponse> {
    const { address, avatarId, landId } = args;
    const mission = await this.mission0Repo.getMission0Record({ avatarId });
    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    this.$ctx?.logger.info("mission 0 ping request");

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed because of late ping`);
    }

    const missionStartTime = mission.startedAt;
    // this.logger.debug("missionStartTime", missionStartTime);
    const timeFromMissionStart = new Date().getTime() - missionStartTime.getTime();
    // this.logger.debug({ timeFromMissionStart });

    if (timeFromMissionStart < this.timeToComplete) {
      // mission is not complete yet, create new redis key with ttl
      await this.mission0Repo.updateMission0Record({ avatarId });
      return { status: "pong" };
    }

    // mission complete
    return await this.complete({ address, avatarId, landId, missionId: 0 });
  }
}
