import { join } from "path";
import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";
import { config } from "./config";
import * as missions from "./controllers/missions";
import * as profile from "./controllers/profile";
import { AvatarsService } from "./services/AvatarsService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ErrorFilter } from "./interceptors/ExceptionFilter";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  componentsScan: false,
  mount: {
    "/missions": [...Object.values(missions)],
    "/profile": [...Object.values(profile)]
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
  exclude: ["**/*.spec.ts"],
  swagger: [
    {
      path: "/v2/docs",
      specVersion: "2.0" // by default
    }
  ]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Inject()
  protected avatarsService: AvatarsService;

  @Configuration()
  protected settings: Configuration;
}
