import { Get, Returns, Summary } from "@tsed/schema";
import { Configuration, Controller, Inject } from "@tsed/di";

@Controller("/utils")
export class UtilsCtrl {
  @Inject(Configuration) config: Configuration;

  @Get("/settings")
  @Summary("Get current settings")
  @Returns(200)
  async settings(): Promise<any> {
    const { SERVER_PRIVATE_KEY, ...rest } = this.config.get("missions");
    return rest;
  }
}
