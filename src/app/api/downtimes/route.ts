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

  const currentOnly = searchParams.get("current_only") === "true";
  const include = searchParams.get("include") || undefined;
  const pageLimit = parseInt(searchParams.get("page_limit") || "20", 10);
  const offsetParam = parseInt(searchParams.get("page_offset") || "0", 10);

  // ① totalCountを得るために1回目（offset: 0）
  const firstRes = await apiInstance.listDowntimes({
    currentOnly,
    include,
    pageLimit,
    pageOffset: 0,
  });

  const count = firstRes.meta?.page?.totalFilteredCount ?? 0;

  // ② Datadogが古い順でしか返せないので、offsetを後ろから計算
  const pageOffset = count > 0 ? Math.max(count - pageLimit * (offsetParam + 1), 0) : 0;

  // ③ 実際に取得したいページを取得
  const res = await apiInstance.listDowntimes({
    currentOnly,
    include,
    pageLimit,
    pageOffset,
  });

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
