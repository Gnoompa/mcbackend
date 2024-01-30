import { Controller, Inject } from "@tsed/di";
import { BodyParams, QueryParams } from "@tsed/platform-params";
import { Get, Post, Returns, Summary } from "@tsed/schema";
import { SnapshotPayloadModel } from "src/models/stats/dto/requests/snapshotPayloadModel";
import { StatsService } from "src/services/StatsService";

@Controller("/")
export class StatsCtrl {
  @Inject(StatsService)
  private statsService: StatsService;

  @Post("/snapshot")
  @Summary("Make stats snapshot")
  @Returns(200, Number)
  async snapshot(@BodyParams("stats", SnapshotPayloadModel) stats: SnapshotPayloadModel[]) {
    return await this.statsService.snapshotStats(stats);
  }

  @Get("/stats")
  @Summary("Get user and neighbour stats")
  @Returns(200, Number)
  async getStats(
    @QueryParams("type") type: string,
    @QueryParams("source") source: string,
    @QueryParams("userId") userId: string,
    @QueryParams("limit") limit: number
  ) {
    // return await this.statsService.getIsInAllowlist(allowlistId, allowlistTarget);
  }
}
