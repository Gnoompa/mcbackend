import { Knex } from "knex";

export type Avatar = {
  id: number;
  owner: string;
  name: string;
  xp: number;
};

export type AvatarCrosschain = Avatar & { network: string };

export type AvatarModel = {
  id: number;
  owner: string;
  name: string;
  xp: number;
  network: string;
};

export const AvatarModel = (knex: Knex) => knex<AvatarModel>("avatars");

export const AvatarDataMapper = (network: string) => {
  return {
    toModel: (avatar: Avatar): AvatarModel => {
      const avatarModel: AvatarModel = {
        id: avatar.id,
        owner: avatar.owner,
        name: avatar.name,
        xp: avatar.xp,
        network
      };
      return avatarModel;
    },
    fromModel: (data: AvatarModel): Avatar => {
      return {
        id: data.id,
        owner: data.owner,
        name: data.name,
        xp: data.xp
      };
    },
    fromModelCrosschain: (data: AvatarModel): AvatarCrosschain => {
      return {
        id: data.id,
        owner: data.owner,
        name: data.name,
        xp: data.xp,
        network: data.network
      };
    }
  };
};
