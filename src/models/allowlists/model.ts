import { Knex } from "knex";

export type Allowlist = {
  id: number;
  target: string;
  data: string;
};

export type AllowlistModel = Allowlist;

export const AllowlistModel = (knex: Knex) => knex<AllowlistModel>("allowlists");

AllowlistModel.getDefault = (target: string): Allowlist => {
  return {
    id: 0,
    target,
    data: ""
  };
};
