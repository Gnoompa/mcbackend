import * as winUtil from "./../utils/randoms/index";
import * as gameMapFunctions from "./../services/mission2/utils/gameMap";
import { Mission2DataMapper } from "./../models/missions/mission2/model";
import { Land } from "../models/missions/common/land.model";
import { LandsPostgresRepository } from "../repositories/missions/landsPostgresRepository";
import { Mission1CheckResponse } from "../models/missions/mission1/dto/responses/Mission1CheckResponse";
import { RewardsService } from "../services/RewardsService";
import { Mission0 } from "../models/missions/mission0/model";
import { MissionsPostgresRepository } from "../repositories/missions/missionsPostgresRepository";
import { PlatformTest } from "@tsed/common";
import { Server } from "../Server";
import { sleep } from "../utils/sleep";

import { BadRequest, Unauthorized } from "@tsed/exceptions";
import { VerifyAvatarOwner } from "../middleware/verifyAvatarOwner";
import { VerifySignedEthMessage } from "../middleware/verifySignedEthMessage";
import { Mission0Service } from "../services/mission0/service";
import { Mission1Service } from "../services/mission1/service";
import { Mission2Service } from "../services/mission2/service";
import { GEAR_CATEGORY, GEAR_TYPE, OnChainRepository } from "../repositories/missions/missionsOnchainRepository";
import { Mission0PostgresRepository } from "../repositories/missions/mission0/mission0PostgresRepository";
import { Mission1PostgresRepository } from "../repositories/missions/mission1/mission1PostgresRepository";
import { Mission2PostgresRepository } from "../repositories/missions/mission2/mission2PostgresRepository";

import { LandsService } from "../services/LandsService";
import { MissionStatus } from "../models/missions/common/mission.model";
import { mission2MockData } from "./mission2.mock";

jest.setTimeout(20000);

describe("Server", () => {
  let landsService: LandsService;
  let mission0Service: Mission0Service;
  let mission1Service: Mission1Service;
  let mission2Service: Mission2Service;
  let rewardsService: RewardsService;

  let missionsRepo: MissionsPostgresRepository;
  let landsRepo: LandsPostgresRepository;
  let mission0Repo: Mission0PostgresRepository;
  let mission1Repo: Mission1PostgresRepository;
  let mission2Repo: Mission2PostgresRepository;
  let verifyAvatarOwner: VerifyAvatarOwner;
  let verifySignedEthMessage: VerifySignedEthMessage;
  let missionsOnChainRepo: OnChainRepository;

  const choosenPublicLandsWithAvailableMissions = new Set<number>();

  const findUserWithLands = async (): Promise<{ address: string; lands: Array<Land & { limits: number }> }> => {
    const lands = await landsRepo.getLandsWithActualLimits();
    if (!lands.length) throw new Error("No users with land found");

    const randomLand = lands[Math.floor(Math.random() * lands.length)];

    return {
      address: randomLand.owner,
      lands: lands.filter((land) => land.owner === randomLand.owner)
    };
  };

  let userWithLands: { address: string; lands: Array<Land & { limits: number }> };
  let testUserAddress: string;
  let testUserLandId: number;
  const otherUserAddress = "0x15af0091d9adc1398e2076a0921b6035a6bd4f45";
  let otherLand: number;

  beforeAll(PlatformTest.bootstrap(Server));
  beforeAll(async () => {
    landsService = PlatformTest.get<LandsService>(LandsService);
    mission0Service = PlatformTest.get<Mission0Service>(Mission0Service);
    mission1Service = PlatformTest.get<Mission1Service>(Mission1Service);
    mission2Service = PlatformTest.get<Mission2Service>(Mission2Service);
    rewardsService = PlatformTest.get<RewardsService>(RewardsService);

    verifyAvatarOwner = PlatformTest.get<VerifyAvatarOwner>(VerifyAvatarOwner);
    verifySignedEthMessage = PlatformTest.get<VerifySignedEthMessage>(VerifySignedEthMessage);

    missionsRepo = PlatformTest.get<MissionsPostgresRepository>(MissionsPostgresRepository);
    mission0Repo = PlatformTest.get<Mission0PostgresRepository>(Mission0PostgresRepository);
    mission1Repo = PlatformTest.get<Mission1PostgresRepository>(Mission1PostgresRepository);
    mission2Repo = PlatformTest.get<Mission2PostgresRepository>(Mission2PostgresRepository);

    landsRepo = PlatformTest.get<LandsPostgresRepository>(LandsPostgresRepository);
    missionsOnChainRepo = PlatformTest.get<OnChainRepository>(OnChainRepository);

    // console.log("clear db at start");
    await missionsRepo.resetAllDb();

    await sleep(5000);

    // console.log({ landsMap, length: Array.from(landsMap).length });

    userWithLands = await findUserWithLands();
    testUserAddress = userWithLands.address;
  });

  // afterAll(async () => {
  //   await sleep(3000);
  //   await missionsRepo.resetAllDb();
  // });

  afterAll(PlatformTest.reset);

  describe("Cache", () => {
    it("Cache on isAvatarInCryochamber", async () => {
      const isAvatarInCryoChamberFunction = jest.spyOn(missionsOnChainRepo, "isAvatarInCryochamberNotCached");
      const isAvatarInCryoChamber = await missionsOnChainRepo.isAvatarInCryochamber(1);
      // console.log({ isAvatarInCryoChamber });

      // second call to test if cache works
      const isAvatarInCryoChamber2 = await missionsOnChainRepo.isAvatarInCryochamber(1);
      // console.log({ isAvatarInCryoChamber2 });

      expect(isAvatarInCryoChamberFunction).toBeCalledTimes(1);

      // third call with other avatarId should not to be cached
      const isAvatarInCryoChamber3 = await missionsOnChainRepo.isAvatarInCryochamber(2);
      // console.log({ isAvatarInCryoChamber3 });

      expect(isAvatarInCryoChamberFunction).toBeCalledTimes(2);

      jest.spyOn(missionsOnChainRepo, "isAvatarInCryochamberNotCached").mockClear();
    });
  });

  describe("Missions", () => {
    // find user with lands with available missions

    it("should return owners lands with available missions first", async () => {
      console.log("user with lands ", userWithLands.address);
      for (const land of userWithLands.lands) {
        console.log("own land", land);
        if (land.limits <= 0) continue;
        const randomLandId = await landsService.getRandomLandForMissions_0_1({ address: userWithLands.address });
        console.log("owner land", randomLandId);
        expect(randomLandId).toBeDefined();
        expect(userWithLands.lands.some((land) => land.id === randomLandId!)).toBeTruthy;
        testUserLandId = randomLandId!;
      }
    });

    it("should return public lands with available missions", async () => {
      const publicLandsWithAvailableMissions = await landsRepo.getAvailableLands({});

      for (const publicLand of publicLandsWithAvailableMissions) {
        const randomLandId = await landsService.getRandomLandForMissions_0_1({ address: userWithLands.address });
        // console.log({ randomLandId });

        expect(randomLandId).toBeDefined();
        expect(choosenPublicLandsWithAvailableMissions.has(randomLandId!)).toBe(false);
        choosenPublicLandsWithAvailableMissions.add(randomLandId!);
        const choosenLand = await landsRepo.getLandById(randomLandId!);
        expect(choosenLand.owner).not.toEqual(userWithLands.address);
      }
    });

    it("Should return undefined if no more public lands available", async () => {
      const landId = await landsService.getRandomLandForMissions_0_1({ address: userWithLands.address });
      expect(landId).toBeUndefined();
    });

    it("Should start mission first time", async () => {
      // console.log({ testUserLandId });
      const createMission0RecordQuery = jest.spyOn(mission0Repo, "createMission0Record");
      const response = await mission0Service.startMission({ address: testUserAddress, avatarId: 1, landId: testUserLandId, missionId: 0 });
      expect(response).toBeUndefined();
      expect(createMission0RecordQuery).toHaveBeenCalledWith({
        address: testUserAddress,
        avatarId: 1,
        landId: testUserLandId
      });
    });

    it("Should throw avatar is on mission error", async () => {
      await expect(
        mission0Service.startMission({ address: testUserAddress, avatarId: 1, landId: testUserLandId, missionId: 0 })
      ).rejects.toThrow(new BadRequest("Avatar 1 is on mission already"));
    });

    it("Should throw address is on mission error", async () => {
      await expect(
        mission0Service.startMission({ address: testUserAddress, avatarId: 2, landId: testUserLandId, missionId: 0 })
      ).rejects.toThrow(new BadRequest(`Address ${testUserAddress} is on mission already`));
    });

    it("Should throw error if avatar has no available missions", async () => {
      jest.spyOn(missionsRepo, "getAvatarMissionsLimitsSpent").mockResolvedValue(4);

      await expect(
        mission0Service.startMission({ address: otherUserAddress, avatarId: 3, landId: testUserLandId, missionId: 0 })
      ).rejects.toThrow(new BadRequest("Avatar 3 has no available missions now"));

      jest.spyOn(missionsRepo, "getAvatarMissionsLimitsSpent").mockRestore();
    });

    it("Should throw error if land doesn't exist", async () => {
      await expect(mission0Service.startMission({ address: otherUserAddress, avatarId: 3, landId: 21001, missionId: 0 })).rejects.toThrow(
        new BadRequest("Land with id 21001 doesn't exist")
      );
    });

    it("Should throw error if land has no available missions", async () => {
      const allLands = await landsRepo.getAllLandsWithLimits();
      const landWithoutMissions = allLands.find((land) => land.limits === 0);
      if (!landWithoutMissions) throw new Error("No land without missions found");
      const landId = landWithoutMissions.id;
      await expect(mission0Service.startMission({ address: otherUserAddress, avatarId: 3, landId: landId, missionId: 0 })).rejects.toThrow(
        new BadRequest(`Land ${landId} has no available missions now`)
      );
    });

    // it("Should throw error if land mission is in progress and overflows missions limits", async () => {
    //   jest.spyOn(landsService, "getLandAvailableMissions").mockReturnValue(0);
    //   await expect(
    //     mission0Service.startMission({ address: otherUserAddress, avatarId: 3, landId: testUserLandId, missionId: 0 })
    //   ).rejects.toThrow(new BadRequest(`Land ${testUserLandId} has no available missions now`));
    //   jest.spyOn(landsService, "getLandAvailableMissions").mockRestore();
    // });

    it("Should throw error if avatar is not on mission", async () => {
      await expect(mission0Service.ping({ address: otherUserAddress, avatarId: 4, landId: testUserLandId })).rejects.toThrow(
        new BadRequest("Mission has not been started or expired")
      );
    });

    it("Should throw error if user fakes land", async () => {
      const lands = await landsRepo.getAllLandsWithLimits();
      otherLand = lands.filter((land) => land.id !== testUserLandId)[0].id;
      await expect(mission0Service.ping({ address: otherUserAddress, avatarId: 1, landId: otherLand })).rejects.toThrow(
        new BadRequest("Avatar has started mission not on this land")
      );
    });

    it("Should throw error if ping is late", async () => {
      const lateDate = Date.now() - 100000;
      const missionFailedQuery = jest.spyOn(missionsRepo, "markMissionAsFailed");
      const mockedMission: Mission0 = {
        id: "",
        avatarId: 1,
        network: "",
        status: MissionStatus.Started,
        missionId: 0,
        finishedAt: undefined,
        startedAt: new Date(),
        missionLastPing: new Date(lateDate),
        landId: testUserLandId,
        address: testUserAddress
      };

      jest.spyOn(mission0Repo, "getMission0Record").mockResolvedValue(mockedMission);

      await expect(mission0Service.ping({ address: testUserAddress, avatarId: 1, landId: testUserLandId })).rejects.toThrow(
        new BadRequest("Mission failed because of late ping")
      );
      jest.spyOn(mission0Repo, "getMission0Record").mockRestore();

      expect(missionFailedQuery).toBeCalledWith({ avatarId: 1 });
    });

    it("Should return avatar is not on mission after ping late", async () => {
      await expect(mission0Service.ping({ address: testUserAddress, avatarId: 4, landId: testUserLandId })).rejects.toThrow(BadRequest);
      await expect(mission0Service.ping({ address: testUserAddress, avatarId: 4, landId: testUserLandId })).rejects.toThrow(
        "Mission has not been started or expired"
      );
    });

    it("Should start mission again after mission fail", async () => {
      const missionStartedQuery = jest.spyOn(mission0Repo, "createMission0Record");
      const response = await mission0Service.startMission({ address: testUserAddress, avatarId: 1, landId: testUserLandId, missionId: 0 });
      expect(response).toBeUndefined();
      expect(missionStartedQuery).toHaveBeenCalledWith({ address: testUserAddress, avatarId: 1, landId: testUserLandId });
    });

    it("Should return pong if mission is not completed", async () => {
      const response = await mission0Service.ping({ address: testUserAddress, avatarId: 1, landId: testUserLandId });
      expect(response).toEqual({ status: "pong" });
    });

    it("Should complete mission", async () => {
      const missionCompleteQuery = jest.spyOn(missionsRepo, "markMissionAsCompleted");
      const lateDate = Date.now() - 210000;
      const mockedMission: Mission0 = {
        id: "",
        avatarId: 1,
        network: "",
        status: MissionStatus.Started,
        missionId: 0,
        finishedAt: undefined,
        startedAt: new Date(lateDate),
        missionLastPing: new Date(),
        landId: testUserLandId,
        address: testUserAddress
      };

      jest.spyOn(mission0Repo, "getMission0Record").mockResolvedValue(mockedMission);

      jest.spyOn(rewardsService, "createFinishMessage").mockResolvedValue({
        message: "test",
        signature: "signature",
        response: [
          {
            name: "test",
            value: "test",
            type: "basic"
          }
        ]
      });

      const response = await mission0Service.ping({ address: testUserAddress, avatarId: 1, landId: testUserLandId });

      expect(response.status).toEqual("complete");

      jest.spyOn(mission0Repo, "getMission0Record").mockRestore();
      jest.spyOn(rewardsService, "createFinishMessage").mockRestore();

      expect(missionCompleteQuery).toBeCalledWith({ avatarId: 1 });
    });

    it("Land with finished mission is not available as random land now", async () => {
      // await sleep(12000);
      const landId1 = await landsService.getRandomLandForMissions_0_1({ address: testUserAddress });
      const landId2 = await landsService.getRandomLandForMissions_0_1({ address: testUserAddress });
      // not includes land with no available misssions
      expect(![landId1, landId2].includes(1)).toBeTruthy();
    });

    describe("Middlewares", () => {
      it("Should trhow Unauthorized if wrong message signature", async () => {
        await expect(
          verifySignedEthMessage.use({
            message: "Start mission 1652577409.413",
            avatarId: 4072,
            landId: 6241,
            missionId: 0,
            address: "0x9907449886f7bE720a0E45889C9C07ad8c91B24d",
            signature:
              "0x4faff0077e9bb8a951b672ec6ebdad24ce2b36981f129c3350600f8efd49572146b6e97033a642ed4c3dcea0a0cd2e550c27068a2d83a56244ad4be979f6c4061c"
          })
        ).rejects.toThrow(new Unauthorized("Unauthorized. Invalid signature."));
      });

      it("Should throw error if address is not an avatar owner", async () => {
        await expect(
          verifyAvatarOwner.use({
            message: "Start Mission 2:1:0:0",
            address: "nobody",
            signature: "sig",
            avatarId: 4072,
            landId: 6241,
            missionId: 0
          })
        ).rejects.toThrow(new Unauthorized("You are not an avatar owner"));
      });
    });

    describe("decrypt-mission failed mission", () => {
      let words: string[];

      it("Should start a mission success path", async () => {
        const createMission1RecordQuery = jest.spyOn(mission1Repo, "createMission1Record");
        const response = await mission1Service.startMission({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          missionId: 1
        });
        words = response.words;
        expect(Array.isArray(words)).toBeTruthy;
        expect(words.length).toBeGreaterThanOrEqual(6);
        expect(createMission1RecordQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            address: testUserAddress,
            avatarId: 1,
            landId: [...choosenPublicLandsWithAvailableMissions][0]
          })
        );

        // const mission1record = await mission1RedisRepo.getMission1Record({ avatarId: 1 });
        // console.log({ mission1record });
      });

      it("Should fail if avatar is on mission already", async () => {
        const promise = mission1Service.startMission({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          missionId: 1
        });
        await expect(promise).rejects.toThrow(new Unauthorized("Avatar 1 is on mission already"));
      });

      it("Should get response on wrong attempt", async () => {
        const response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });
        expect((response as Mission1CheckResponse).isPassword).toBeFalsy;
        expect((response as Mission1CheckResponse).similarity).toEqual(0);
      });

      it("Should fail mission on 3 more attempts", async () => {
        const mission1FailedQuery = jest.spyOn(missionsRepo, "markMissionAsFailed");
        let response;
        // attempt 2 of 4
        response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });

        // attempt 3 of 4
        response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });

        // attempt 4 of 4
        response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });

        expect((response as Mission1CheckResponse).success).toBeFalsy;
        expect(mission1FailedQuery).toHaveBeenCalledWith({ avatarId: 1 });
      });

      it("Should fail on attempt after mission failed", async () => {
        const response = mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });
        await expect(response).rejects.toThrow(new BadRequest(`Mission has not been started or expired`));
      });
    });

    describe("decrypt-mission success path", () => {
      let words: string[];
      let password: string;
      it("Should start a mission success path", async () => {
        const missionStartedQuery = jest.spyOn(mission1Repo, "createMission1Record");
        const response = await mission1Service.startMission({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          missionId: 1
        });
        words = response.words;
        expect(Array.isArray(words)).toBeTruthy;
        expect(words.length).toBeGreaterThanOrEqual(6);
        expect(missionStartedQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            address: testUserAddress,
            avatarId: 1,
            landId: [...choosenPublicLandsWithAvailableMissions][0]
          })
        );
        const mission1Record = await mission1Repo.getMission1Record({ avatarId: 1 });
        expect(mission1Record).toBeDefined;
        password = mission1Record!.password;
      });

      it("Should get response on wrong attempt", async () => {
        const response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });
        expect((response as Mission1CheckResponse).isPassword).toBeFalsy;
        expect((response as Mission1CheckResponse).similarity).toEqual(0);
      });

      it("Should response on successfull attempt", async () => {
        const missionCompleteQuery = jest.spyOn(missionsRepo, "markMissionAsCompleted");

        const response = await mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: password
        });

        expect((response as Mission1CheckResponse).isPassword).toBeTruthy;

        expect(missionCompleteQuery).toHaveBeenCalledWith({
          avatarId: 1
        });
      });

      it("Should fail on attempt after mission success", async () => {
        const response = mission1Service.check({
          address: testUserAddress,
          avatarId: 1,
          landId: [...choosenPublicLandsWithAvailableMissions][0],
          word: "1".repeat(words.length)
        });
        await expect(response).rejects.toThrow(new BadRequest(`Mission has not been started or expired`));
      });
    });

    describe.skip("Cryochambers", () => {
      it("Can not start mission if avatar is in cryochamber", async () => {
        await expect(
          mission0Service.startMission({
            address: testUserAddress,
            avatarId: 11,
            landId: testUserLandId,
            missionId: 0
          })
        ).rejects.toThrow(new BadRequest("Avatar 11 is in cryochamber now"));
      });
    });

    // describe("Random land", () => {
    //   it("getLandsWithMaxRevshare should returns 2 lands of the same user4", () => {
    //     const landsArray = Array.from(lands).map((a) => a[1]);
    //     const maxRevshareLands = landsService.getLandsWithMaxRevshare(landsArray);
    //     expect(maxRevshareLands.length).toBe(2);
    //     expect(maxRevshareLands[0].revshare).toBe(90);
    //     expect(maxRevshareLands[1].revshare).toBe(90);
    //     expect(maxRevshareLands[0].owner === maxRevshareLands[1].owner).toBeTruthy;
    //   });
    // });

    describe("Fail missions by timeouts", () => {
      it("failMission 0 on late ping", async () => {
        const ping = new Date();
        ping.setDate(ping.getDate() - 1);

        await missionsRepo.clearMissionsData();

        await mission0Repo.createMissionWithCustomPing({
          landId: 1,
          address: "",
          avatarId: 1,
          ping
        });

        await mission0Repo.createMissionWithCustomPing({
          landId: 2,
          address: "",
          avatarId: 2,
          ping: new Date()
        });

        // wait until missions services checks failed missions
        await sleep(7000);

        const failedMissionCheck = await missionsRepo.getAvatarActiveMission(1);
        const notFailedMissionCheck = await missionsRepo.getAvatarActiveMission(2);

        expect(failedMissionCheck).toBeUndefined();
        expect(notFailedMissionCheck).toBeDefined();
        expect(notFailedMissionCheck?.avatarId).toBe(2);
      });

      it("failMission 1 on timeToComplete", async () => {
        await missionsRepo.clearMissionsData();

        const startTime = new Date();
        startTime.setDate(startTime.getDate() - 1);

        await missionsRepo.clearMissionsData();

        await mission1Repo.createMissionWithCustomStartTime({
          landId: 1,
          address: "",
          avatarId: 1,
          startTime
        });

        await mission1Repo.createMissionWithCustomStartTime({
          landId: 2,
          address: "",
          avatarId: 2,
          startTime: new Date()
        });

        // wait until missions services checks failed missions
        await sleep(7000);

        const failedMissionCheck = await missionsRepo.getAvatarActiveMission(1);
        const notFailedMissionCheck = await missionsRepo.getAvatarActiveMission(2);

        expect(failedMissionCheck).toBeUndefined();
        expect(notFailedMissionCheck).toBeDefined();
        expect(notFailedMissionCheck?.avatarId).toBe(2);
      });
    });
  });

  const mission2user = process.env.TEST_PLAYER!;
  const mission2land = +process.env.TEST_PLAYER_LAND!;
  const mission2avatar = 3;

  describe("Mission2", () => {
    it("returns users locked gears", async () => {
      const locks = await missionsOnChainRepo.getLockedGears(mission2user);

      const { transport, gear1, gear2, gear3 } = locks;

      expect(transport?.category).toBe(GEAR_CATEGORY.TRANSPORT);
      expect(transport?.id).toBe(6);
      expect(transport?.type).toBe(GEAR_TYPE.THE_NEBUCHADNEZZAR);
      expect(transport?.durability).toBe(150);
      expect(transport?.locked).toBe(true);
    });

    it("should start mission 2", async () => {
      jest.spyOn(gameMapFunctions, "generateMap").mockImplementation(() =>
        JSON.parse(`[
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0],
        [-1,-1,-1,-1,-1, 0, 0,-1, 0, 0,-1, 0, 0, 0, 0,-1,-1, 0,-1,-1,-1],
        [ 0, 0, 0,-1,-1, 0, 1, 2, 0, 0, 5, 7, 5,-1,-1, 0, 0, 1,-1, 0, 0],
        [ 6, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1, 0,-1,-1,-1, 0, 0, 0, 0, 0, 6]
      ]`)
      );
      console.log({ testUserAddress, testPlayer: process.env.TEST_PLAYER });
      const createMission2RecordQuery = jest.spyOn(mission2Repo, "createMission2Record");
      const response = await mission2Service.startMission({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        missionId: 2
      });

      expect(response.dynamites).toBe(1);
      expect(response.moves).toBe(129);
      expect(response.resources!.common).toBe(0);
      expect(response.resources!.rare).toBe(0);
      expect(response.resources!.legendary).toBe(0);
      expect(response.scans).toBe(2);

      // gate is here
      const gateTile = response.tiles!.find((tile) => tile.state === 6);
      expect(gateTile).toBeDefined();

      //initial position is gate position
      expect(response.position!.x === gateTile!.x && response.position!.y === gateTile!.y).toBeTruthy();

      expect(createMission2RecordQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          moves: 129,
          dynamites: 1,
          position: {
            x: expect.any(Number),
            y: expect.any(Number)
          },
          finalResourcesBonus: expect.any(Number),
          miningMovesDiscount: expect.any(Number),
          wormWinChanceBonus: expect.any(Number),
          resources: {
            common: 0,
            rare: 0,
            legendary: 0
          },
          scans: 2,
          map: expect.any(Array)
        })
      );
    });

    it("invalid move", async () => {
      jest.spyOn(mission2Repo, "getMission2Record").mockImplementationOnce(async () => Mission2DataMapper.fromModel(mission2MockData));
      await expect(
        mission2Service.move({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          direction: "down"
        })
      ).rejects.toThrow(new BadRequest(`Invalid move`));
      jest.spyOn(mission2Repo, "getMission2Record").mockClear();
    });

    it("valid moves", async () => {
      jest.spyOn(mission2Repo, "getMission2Record").mockImplementationOnce(async () => Mission2DataMapper.fromModel(mission2MockData));

      let response = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "up"
      });
      console.log("valid move 1 response", response);
      // });

      await expect(
        mission2Service.move({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          direction: "up"
        })
      ).rejects.toThrow(new BadRequest(`Invalid move`));

      await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "down"
      });

      for (let i = 0; i < 7; i++) {
        await mission2Service.move({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          direction: "right"
        });
      }

      // move on tile with resource
      response = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "up"
      });

      console.log("response tile with response", response);

      expect(response.tiles.find((tile) => tile.x === 7 && tile.y === 10)!.state).toBe(2);

      // fight worm but no worm around -> error
      await expect(
        mission2Service.wormAction({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          action: "fight"
        })
      ).rejects.toThrow(new BadRequest(`No worm around`));

      // try to collect fuel but no fuel -> error
      await expect(
        mission2Service.fuel({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land
        })
      ).rejects.toThrow(new BadRequest(`No fuel on this tile`));

      // try to exit but no gate on tile -> error
      await expect(
        mission2Service.exit({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land
        })
      ).rejects.toThrow(new BadRequest(`No gate on this tile`));

      // test scaner
      const scanResponse = await mission2Service.scan({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land
      });

      console.log("scanResponse", scanResponse);

      // we are on tile with recource, collect
      const mineResponse = await mission2Service.mine({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land
      });

      console.log("mine response", mineResponse);

      expect(mineResponse.tiles.find((tile) => tile.x === 7 && tile.y === 10)!.state).toBe(0);

      // go to obstacle

      await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      const nearObstacleResponse = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      console.log("near obstacle response", nearObstacleResponse);
      expect(nearObstacleResponse.tiles.find((tile) => tile.x === 10 && tile.y === 10)!.state).toBe(5);

      // can not go on tile with obstacle
      await expect(
        mission2Service.move({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          direction: "right"
        })
      ).rejects.toThrow(new BadRequest(`Invalid move`));

      // we are near obstacle. let's use dynamite

      const dynamiteResponse = await mission2Service.dynamite({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land
      });

      console.log("dynamite response", dynamiteResponse);
      expect(dynamiteResponse.dynamites).toBe(0);
      expect(dynamiteResponse.tiles.find((tile) => tile.x === 10 && tile.y === 10)!.state).toBe(0);

      // go to the fuel

      await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      const fuelMoveResponse = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      console.log("fuel move response", fuelMoveResponse);
      expect(fuelMoveResponse.tiles.find((tile) => tile.x === 11 && tile.y === 10)!.state).toBe(7);

      // get fuel

      const getFuelResponse = await mission2Service.fuel({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land
      });

      console.log("get fuel response", getFuelResponse);
      expect(getFuelResponse.moves).toBe(116);

      // we're near next obstacle but have no more dynamite
      await expect(
        mission2Service.dynamite({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land
        })
      ).rejects.toThrow(new BadRequest(`No more dynamites`));

      // go meet the worm

      const wormMoveResponse = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "up"
      });
      console.log("worm move response", wormMoveResponse);
      expect(wormMoveResponse.worm).toBeTruthy();

      // worm is here, can not move, need to make decision
      await expect(
        mission2Service.move({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          direction: "right"
        })
      ).rejects.toThrow(new BadRequest(`Invalid move, worm`));

      // choose retreat, move on prev position

      const retreatResponse = await mission2Service.wormAction({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        action: "retreat"
      });
      console.log("retreat response", retreatResponse);
      expect(retreatResponse.position.x === 11 && retreatResponse.position.y === 10).toBeTruthy();
      expect(retreatResponse.moves).toBe(108);

      // go worm again, it is still here
      const wormMove2Response = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "up"
      });
      console.log("worm move2 response", wormMove2Response);
      expect(wormMove2Response.worm).toBeTruthy();

      // now we chose pay to worm
      const wormPayResponse = await mission2Service.wormAction({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        action: "pay"
      });

      console.log("worm pay response", wormPayResponse);
      expect(wormPayResponse.resources!.rare).toBe(0);

      // go to the next worm

      await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      const wormMove3Response = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });
      console.log("worm move 3 response", wormMove3Response);
      expect(wormMove3Response.worm).toBeTruthy();

      // fight with worm and win

      jest.spyOn(winUtil, "isWinByChoice").mockImplementationOnce(() => true);

      const wormWinResponse = await mission2Service.wormAction({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        action: "fight"
      });

      console.log("worm win response", wormWinResponse);
      expect(wormWinResponse.figntStatus).toBe("win");

      // go to the next worm and loose
      await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "up"
      });

      const nextWormMove = await mission2Service.move({
        address: mission2user,
        avatarId: mission2avatar,
        landId: mission2land,
        direction: "right"
      });

      console.log("next worm move response", nextWormMove);

      jest.spyOn(winUtil, "isWinByChoice").mockImplementationOnce(() => false);

      await expect(
        mission2Service.wormAction({
          address: mission2user,
          avatarId: mission2avatar,
          landId: mission2land,
          action: "fight"
        })
      ).rejects.toThrow(new BadRequest(`Mission failed:  worm has won`));
    });
  });
});
