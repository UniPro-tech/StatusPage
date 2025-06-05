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

export async function GET() {
  datadogClientConfiguration.unstableOperations["v2.searchIncidents"] = true;

  const res = await apiInstance.searchIncidents({
    query: "state:(stable OR active OR resolved)",
    sort: "-created",
    pageSize: 25,
  });
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
