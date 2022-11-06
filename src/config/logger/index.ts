import { $log, PlatformLoggerSettings } from "@tsed/common";
import { isProduction } from "../envs";

// require("./logger-loggly/loggly.js");
import "@tsed/logger-loggly";

import "./userDataAppender";

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json"
    }
  });
}

$log.appenders.set("loggly", {
  type: "loggly",
  level: ["info"],
  layout: { type: "json" },
  options: {
    token: process.env.LOGGLY_TOKEN,
    subdomain: "marscolony1",
    tags: ["marscolony", process.env.NETWORK],
    json: true
  }
});

export default <PlatformLoggerSettings>{
  disableRoutesSummary: isProduction,
  logRequest: false,
  disableBootstrapLog: false,
  level: process.env.LOG_LEVEL || "info",
  requestFields: ["reqId", "method", "url", "headers", "body", "query", "params", "duration", "userData"]
};
