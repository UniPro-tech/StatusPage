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

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const monitorId = params.get("monitor_id");
  const fromDate = new Date(
    params.get("from") || Date.now() - 90 * 24 * 60 * 60 * 1000
  ); // デフォルトは90日前
  const res = await apiInstance.listEvents({
    filterQuery: `@monitor_id:${monitorId}`,
    filterFrom: fromDate.toISOString(),
    filterTo: "now",
    pageLimit: 100, // 1ページあたりのイベント数
  });

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
