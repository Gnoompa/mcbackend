import { Context, Inject, Logger, Middleware, MiddlewareMethods, Req } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";
import fs from "fs";
import jwt from "jsonwebtoken";

@Middleware()
export class AuthJWTMiddleware implements MiddlewareMethods {
  @Inject(Logger) logger: Logger;

  async use(@Req() request: Req, @Context() ctx: Context): Promise<void> {
    const params = ctx.endpoint.get(AuthJWTMiddleware);
    const token = request.headers.authorization?.substring(7);

    if (token) {
      const key = fs.readFileSync(__dirname + "/../../../jwt_public.pem");
      const tokenBody = jwt.verify(token, key, { algorithms: ["RS256"] });

      if (params.role && (tokenBody as { entity: string })?.entity != params.role) {
        throw new Unauthorized("Wront JWT role");
      }
    } else {
      throw new Unauthorized("Absent JWT");
    }
  }
}
