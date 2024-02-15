import { Knex } from "knex";

export const SCOPE_ID = "stats";

export enum StatType {
  Shares = "shares"
}

export type TStat = {
  type: StatType;
  source: string;
  id: string;
  old_value: number;
  new_value: number;
  created_at: string;
  updated_at: string;
};

export const StatModel = (knex: Knex) => knex<TStat>("stats");

StatModel.getDefault = (type: StatType): TStat => {
  return {
    type,
    source: "",
    id: "",
    old_value: 0,
    new_value: 0,
    created_at: "",
    updated_at: ""
  };
};
