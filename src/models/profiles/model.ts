import { Knex } from "knex";

export type Profile = {
  address: string;
  name: string;
  twitter: string;
  discord: string;
};

export type ProfileModel = Profile;

export const ProfileModel = (knex: Knex) => knex<ProfileModel>("profiles");

ProfileModel.getDefault = (address: string): Profile => {
  return {
    address,
    name: "",
    twitter: "",
    discord: ""
  };
};
