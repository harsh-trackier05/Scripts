module.exports = {
    apps: [
      {
        name: "billing-script",
        script: "./billingScript.js",
        log_date_format : "YYYY-MM-DD HH:mm Z",
        exec_mode: "fork",
        env_production: {
          NODE_ENV: "production",
        },
      },
    ],
  };
