module.exports = {
  apps: [
    {
      name: "harmain",
      script: "./dist/src/index.js",
      instances: 1,
      exec_mode: "cluster",
      listen_timeout: 100000,
      instance_var: "APP_INSTANCE_ID",
      env_prod: {
        NODE_ENV: "production",
        LOG_LEVEL: "info"
      },
      env_debug: {
        NODE_ENV: "development",
        LOG_LEVEL: "debug"
      }
    }
  ]
};
