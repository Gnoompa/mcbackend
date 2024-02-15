import { Controller, Inject } from "@tsed/di";
import { UseAuth } from "@tsed/platform-middlewares";
import { BodyParams, QueryParams } from "@tsed/platform-params";
import { Get, Post, Summary } from "@tsed/schema";
import { AuthJWTMiddleware } from "../../middleware/authJWT";
import { StatSnapshotModel } from "../../models/stats/dto/requests/statSnapshot";
import { StatType } from "../../models/stats/model";
import { StatsService } from "../../services/StatsService";

@Controller("/")
export class StatsCtrl {
  @Inject(StatsService)
  private statsService: StatsService;

  @Post("/snapshot")
  @Summary("Make stats snapshot")
  @UseAuth(AuthJWTMiddleware, { role: "cron" })
  async snapshot(
    @BodyParams("stats", StatSnapshotModel) stats: StatSnapshotModel[],
    @BodyParams("type", String) type: StatType,
    @BodyParams("source", String) source: string
  ) {
    return await this.statsService.snapshotStats(stats, type, source);
  }

  @Get("/stats")
  @Summary("Get paginated stats")
  async getStats(
    @QueryParams("type") type: StatType,
    @QueryParams("source") source: string,
    @QueryParams("from") from: number,
    @QueryParams("limit") limit: number
  ) {
    return await this.statsService.getStats(type, source, from, limit);
  }

  @Get("/relativeStats")
  @Summary("Get single and neighbour stats")
  async relativeStats(
    @QueryParams("type") type: StatType,
    @QueryParams("source") source: string,
    @QueryParams("id") id: string,
    @QueryParams("neighbourLimit") neighbourLimit: number
  ) {
    return await this.statsService.getRelativeStats(type, source, id, neighbourLimit);
  }
}
