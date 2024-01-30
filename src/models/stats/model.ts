import { Knex } from "knex";

export const SCOPE_ID = "stats";

export enum StatType {
  Shares
}

export type Stat = {
  type: StatType;
  source: string;
  userId: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
  updatedAt: string;
};

export type StatModel = Stat;

export const StatModel = (knex: Knex) => knex<StatModel>("Stats");

StatModel.getDefault = (type: StatType): Stat => {
  return {
    type,
    source: "",
    userId: "",
    oldValue: "",
    newValue: "",
    createdAt: "",
    updatedAt: ""
  };
};
