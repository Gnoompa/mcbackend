import dotenv from "dotenv";

const configPath = () => {
  const path = { path: __dirname + "/../../../.test.env" };
  return process.env.NODE_ENV === "test" ? path : undefined;
};

export const envs = {
  ...process.env,
  ...dotenv.config(configPath()).parsed
};
export const isProduction = process.env.NODE_ENV === "production";
