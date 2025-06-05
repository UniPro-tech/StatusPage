import { v2, client } from "@datadog/datadog-api-client";

const datadogClientConfiguration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: process.env.DATADOG_API_KEY || "",
    appKeyAuth: process.env.DATADOG_APP_KEY || "",
  },
});

datadogClientConfiguration.setServerVariables({
  site: process.env.DATADOG_API_SITE || "datadoghq.com",
});
const apiInstance = new v2.EventsApi(datadogClientConfiguration);

export async function GET() {
  const res = await apiInstance.listEvents({
    filterQuery:
      "(source:alert (@monitor_id:3741790 OR monitor_id:3741790)) OR (source:datadog monitor_id:3741790 tags:downtime)",
    filterFrom: "now-90d",
    filterTo: "now",
  });
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
