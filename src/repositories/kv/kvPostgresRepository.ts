import { Configuration, Inject, Injectable } from "@tsed/common";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";

export type KV = {
  key: string;
  value: string;
};

@Injectable()
export class KVPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
  }

  async get(key: string): Promise<KV> {
    return this.postgresClient.table("kv").where({ key }).first();
  }

  async set(key: string, value: string): Promise<any> {
    return this.postgresClient.table("kv").insert({ key, value }).onConflict("key").merge();
  }
}
