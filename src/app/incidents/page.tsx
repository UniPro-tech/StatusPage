import { IncidentItem } from "@/lib/datadog";
import { v2 } from "@datadog/datadog-api-client";
import { Suspense } from "react";
import IncidentsSuspention from "./Suspense";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "インシデント一覧",
  description: "Datadogのインシデント一覧を表示します。",
  openGraph: {
    title: "インシデント一覧",
    description: "Datadogのインシデント一覧を表示します。",
    url: "/incidents",
    siteName: "Status Page",
  },
};

export default async function IncidentPage() {
  const incidentsReqParams = new URLSearchParams();

  // APIのレスポンスを最新のものにするために、sortパラメータを設定
  incidentsReqParams.append("sort", "-created");

  // ページング
  incidentsReqParams.append("limit", "20");
  incidentsReqParams.append("offset", "0");

  // devか本番かでAPIのベースURLを切り替えるよ！
  const apiBaseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://status.uniproject.jp";

  const incidentsPromise = fetch(`${apiBaseUrl}/api/incidents?${incidentsReqParams.toString()}`)
    .then((res) => res.json())
    .then((data: v2.IncidentSearchResponse) => {
      if (!data.data.attributes) {
        throw new Error("Invalid incident data format");
      }
      if (data.data.attributes.incidents.length === 0) {
        return [];
      }
      const incidents =
        data.data.attributes?.incidents.map((incident) => {
          if (
            !incident.data ||
            !incident.data.attributes ||
            !incident.data.attributes.created ||
            !incident.data.attributes.modified
          ) {
            throw new Error("Invalid incident data format");
          }
          return {
            id: incident.data.attributes.publicId?.toString() || incident.data.id,
            title: incident.data.attributes.title,
            created: new Date(incident.data.attributes.created),
            modified: new Date(incident.data.attributes.modified),
            state: incident.data.attributes.state,
            severity: incident.data.attributes.severity,
            timeToDetect: incident.data.attributes.timeToDetect,
            timeToRepair: incident.data.attributes.timeToRepair,
            timeToResolve: incident.data.attributes.timeToResolve,
            timeToInternalResponse: incident.data.attributes.timeToInternalResponse,
            customerImpact: {
              customerImpacted: incident.data.attributes.customerImpacted,
              customerImpactScope: incident.data.attributes.customerImpactScope,
              customerImpactStart: incident.data.attributes.customerImpactStart
                ? new Date(incident.data.attributes.customerImpactStart)
                : null,
              customerImpactEnd: incident.data.attributes.customerImpactEnd
                ? new Date(incident.data.attributes.customerImpactEnd)
                : null,
              customerImpactDuration: incident.data.attributes.customerImpactDuration,
            },
            fields: incident.data.attributes.fields,
            relationships: Object.fromEntries(
              Object.entries(incident.data.relationships || {}).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ([key, rel]: [string, any]) => [
                  key,
                  {
                    data: Array.isArray(rel.data)
                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        rel.data.map((d: any) => ({
                          id: d.id,
                          type: d.type,
                        }))
                      : rel.data
                      ? [
                          {
                            id: rel.data.id,
                            type: rel.data.type,
                          },
                        ]
                      : [],
                  },
                ]
              )
            ),
            incidentId: incident.data.id,
            incidentUrl: `https://app.datadoghq.com/incidents/${incident.data.id}`,
            createdAt: incident.data.attributes.created
              ? new Date(incident.data.attributes.created)
              : null,
            modifiedAt: incident.data.attributes.modified
              ? new Date(incident.data.attributes.modified)
              : null,
            resolvedAt: incident.data.attributes.resolved
              ? new Date(incident.data.attributes.resolved)
              : null,
            visibility: incident.data.attributes.visibility,
          } as IncidentItem;
        }) || [];
      return incidents;
    });
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">インシデント一覧</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ul className="space-y-4">
            <Suspense fallback={<li className="text-gray-500">読み込み中...</li>}>
              <IncidentsSuspention incidentsPromise={incidentsPromise} />
            </Suspense>
          </ul>
        </div>
      </div>
    </main>
  );
}
