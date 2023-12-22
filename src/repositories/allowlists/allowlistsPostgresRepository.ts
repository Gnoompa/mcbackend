import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";
import { Allowlist, AllowlistModel } from "../../models/allowlists/model";

import { Configuration, Inject, Injectable } from "@tsed/common";
import { ALLOWLIST } from "../../services/AllowlistService";

@Injectable()
export class AllowlistsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
  }

  async getAllowlistData(id: ALLOWLIST): Promise<Allowlist[] | undefined> {
    return await AllowlistModel(this.postgresClient).where({ id });
  }

  async getAllowlistTargetData(id: ALLOWLIST, target: string): Promise<Allowlist | undefined> {
    return await AllowlistModel(this.postgresClient).where({ id, target }).first();
  }
}
