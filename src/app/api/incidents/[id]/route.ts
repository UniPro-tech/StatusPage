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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  if (!id) {
    return new Response("Incident ID is required", { status: 400 });
  }

  datadogClientConfiguration.unstableOperations["v2.getIncident"] = true;

  const res = await apiInstance.getIncident({
    incidentId: id,
  });

  if (!res) {
    return new Response("Incident not found", { status: 404 });
  }

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
