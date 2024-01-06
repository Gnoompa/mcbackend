import { Knex } from "knex";

export enum StatType {
  Shares
}

export type Stat = {
  type: StatType;
  userId: string;
  snapshotValue: string;
  currentValue: string;
  createdAt: string;
  updatedAt: string;
  updatedAtBlockNumber: number;
  chainId: number;
};

export type StatModel = Stat;

export const StatModel = (knex: Knex) => knex<StatModel>("Stats");

StatModel.getDefault = (type: StatType): Stat => {
  return {
    type,
    userId: "",
    snapshotValue: "",
    currentValue: "",
    createdAt: "",
    updatedAt: "",
    updatedAtBlockNumber: 0,
    chainId: 0
  };
};
