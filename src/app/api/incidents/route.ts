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
const apiInstance = new v2.IncidentsApi(datadogClientConfiguration);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const state = searchParams.getAll("state"); // state[]=a&state[]=b の形式で複数取得
  const sort = searchParams.get("sort") as "-created" | "created" | null;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
  const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

  datadogClientConfiguration.unstableOperations["v2.searchIncidents"] = true;

  const res = await apiInstance.searchIncidents({
    query:
      state.length > 0 ? `state:(${state.join(" OR ")})` : "state:(active OR stable OR resolved)",
    sort: sort || "-created",
    pageSize: limit || 10,
    pageOffset: offset || 0,
  });
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
