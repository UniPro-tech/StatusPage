import { client } from "@datadog/datadog-api-client";

export const datadogClientConfiguration = client
  .createConfiguration({
    authMethods: {
      apiKeyAuth: process.env.DATADOG_API_KEY || "",
      appKeyAuth: process.env.DATADOG_APP_KEY || "",
    },
  })
  .setServerVariables({
    site: process.env.DATADOG_API_SITE || "datadoghq.com",
  });
