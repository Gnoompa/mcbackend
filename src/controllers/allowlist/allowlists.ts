import { Controller, Inject } from "@tsed/di";
import { QueryParams } from "@tsed/platform-params";
import { Get, Returns, Summary } from "@tsed/schema";
import { AllowlistService } from "../../services/AllowlistService";

@Controller("/")
export class AllowlistsCtrl {
  @Inject(AllowlistService)
  private allowlistService: AllowlistService;

  @Get("/isInAllowlist")
  @Summary("Get if allowlisted for particular allowlist")
  @Returns(200, Number)
  async getIsInAllowlist(@QueryParams("allowlistId") allowlistId: number, @QueryParams("allowlistTarget") allowlistTarget: string) {    
    return await this.allowlistService.getIsInAllowlist(allowlistId, allowlistTarget);
  }

  @Get("/allowlistProof")
  @Summary("Get Merkle Tree proof for a particular allowlist")
  @Returns(200, String)
  async getAllowlistProof(@QueryParams("allowlistId") allowlistId: number, @QueryParams("allowlistTarget") allowlistTarget: string) {
    return await this.allowlistService.getAllowlistProof(allowlistId, allowlistTarget);
  }
}
