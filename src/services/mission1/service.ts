import { MissionCompleteResponse } from "./../../models/missions/common/responses/missionCompleteServerResponseModel";
import { Mission1StartResponse } from "./../../models/missions/mission1/dto/responses/Mission1StartResponse";
import { Mission1 } from "./../../models/missions/mission1/model";
import { Mission1PostgresRepository } from "./../../repositories/missions/mission1/mission1PostgresRepository";
import { calculateWordsSettings } from "./../../utils/decrypt/wordsSettingsFromXp";
import { getSimilarity } from "../../utils/decrypt/similarity";
import { Mission1CheckResponse } from "../../models/missions/mission1/dto/responses/Mission1CheckResponse";
import { Inject, Service } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { BaseMission } from "../BaseMission";
import { currentLevelFromXp } from "../../utils/xp/formula";
import { words } from "./words";

const dictionary = words.split(" ");

@Service()
export class Mission1Service extends BaseMission<Mission1StartResponse> {
  private timeToComplete: number;
  private attempts: number;
  private wordLength: number;
  private dictionary: string[];
  private wordsCount: number;
  protected missionId: number;

  @Inject(Mission1PostgresRepository)
  private mission1Repo: Mission1PostgresRepository;

  $beforeInit() {
    this.missionId = 1;
    this.timeToComplete = this.config.get("missions").missions["1"].timeToComplete;
    this.attempts = this.config.get("missions").missions["1"].attempts;
    this.wordLength = parseInt(this.config.get("missions").missions["1"].wordLength);
    this.dictionary = dictionary;
    this.wordsCount = parseInt(this.config.get("missions").missions["1"].wordsCount);
  }

  async start(args: { address: string; avatarId: number; landId: number }): Promise<Mission1StartResponse> {
    const { address, avatarId, landId } = args;
    const getMultipleRandomWords = (arr: string[], num: number): string[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());

      return shuffled.slice(0, num);
    };

    // tune difficulty settings depending on avatar xp level

    const avatarXp = await this.onChainRepo.getAvatarCurrentXP({ avatarId });
    const avatarXpLevel = currentLevelFromXp(avatarXp);

    const { wordLength, wordsCount } = calculateWordsSettings(this.wordLength, this.wordsCount, avatarXpLevel);

    const dictionary = this.dictionary.filter((word) => word.length === wordLength);

    const words = getMultipleRandomWords(dictionary, wordsCount);

    const password = words[Math.floor(Math.random() * words.length)];

    this.logger.debug({ words, password });

    await this.mission1Repo.createMission1Record({ avatarId, address, landId, password });

    return { success: true, words };
  }

  isMissionFailed(mission: Mission1): boolean {
    if (mission.missionId !== 1) return false;

    const missionStartTime = mission.startedAt;
    // this.logger.debug("mission1 StartTime", missionStartTime);
    const timeFromMissionStart = new Date().getTime() - missionStartTime.getTime();
    // this.logger.debug({ timeFromMissionStart });

    return timeFromMissionStart > this.timeToComplete;
  }

  async check(args: {
    address: string;
    avatarId: number;
    landId: number;
    word: string;
  }): Promise<Mission1CheckResponse | MissionCompleteResponse> {
    const { address, avatarId, landId, word } = args;
    const mission = await this.mission1Repo.getMission1Record({ avatarId });
    if (!mission) throw new BadRequest(`Mission has not been started or expired`);

    // console.log(avatarMission, landId);
    if (mission.landId !== landId) {
      throw new BadRequest(`Avatar has started mission not on this land`);
    }

    if (this.isMissionFailed(mission)) {
      await this.missionFailed(mission, `Mission failed: you were late to complete it`);
    }

    // check word logic implement here

    if (word === mission.password) {
      // mission complete
      return await this.complete({ address, avatarId, landId, missionId: 1 });
    }

    const similarity = getSimilarity(word, mission.password);

    // password still not guessed, check attempts
    if (mission.attempts + 1 >= this.attempts) {
      // mission failed
      await this.missionFailed(mission);

      return { success: false, isPassword: false, similarity };
    }

    // process new attempt

    await this.mission1Repo.updateAttemptToMission1Record({ avatarId, newAttempt: mission.attempts + 1 });
    return { success: true, isPassword: false, similarity };
  }
}
