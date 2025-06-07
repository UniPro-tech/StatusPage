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
const apiInstance = new v2.DowntimesApi(datadogClientConfiguration);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const res = await apiInstance.listDowntimes({
    currentOnly: searchParams.get("current_only") === "true",
    pageLimit: searchParams.get("page_limit")
      ? parseInt(searchParams.get("page_limit") || "100", 10)
      : 100,
    pageOffset: searchParams.get("page_offset")
      ? parseInt(searchParams.get("page_offset") || "0", 10)
      : 0,
  });
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
