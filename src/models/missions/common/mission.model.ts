import { Knex } from "knex";

export enum MissionStatus {
  Started = "started",
  Completed = "completed",
  Failed = "failed"
}

export type Mission = {
  id: string; // uuidv4
  avatarId: number;
  landId: number;
  address: string;
  network: string;
  missionId: number;
  startedAt: Date;
  status: MissionStatus;
  finishedAt?: Date;
};

export type MissionModel = {
  id: string; // uuidv4
  avatar_id: number;
  land_id: number;
  address: string;
  network: string;
  mission_id: number;
  started_at: Date;
  status: MissionStatus;
  finished_at?: Date;
  data: { [index: string]: any };
};

export const MissionModel = (knex: Knex) => knex<MissionModel>("missions");
