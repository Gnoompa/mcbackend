import "@tsed/ajv";
import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject } from "@tsed/di";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import methodOverride from "method-override";
import { join } from "path";
// import "@tsed/swagger";
import { config } from "./config";
import * as allowlist from "./controllers/allowlist/allowlists";
import * as missions from "./controllers/missions";
import * as profile from "./controllers/profile";
import { AvatarsService } from "./services/AvatarsService";
import { StatsService } from "./services/StatsService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  componentsScan: false,
  mount: {
    "/missions": [...Object.values(missions)],
    "/profile": [...Object.values(profile)],
    "/allowlist": [...Object.values(allowlist)]
  },
  middlewares: [
    cors(),
    cookieParser(),
    compress({}),
    methodOverride(),
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    })
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: ["**/*.spec.ts"]
  // swagger: [
  //   {
  //     path: "/v2/docs",
  //     specVersion: "2.0" // by default
  //   }
  // ]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Inject()
  protected avatarsService: AvatarsService;

  @Inject()
  protected statsService: StatsService;

  @Configuration()
  protected settings: Configuration;
}
