import { Suspense } from "react";
import SuspenseIncidentPage from "./Suspense";
import { v2 } from "@datadog/datadog-api-client";
import { IncidentItem, IncidentFields } from "@/lib/datadog";
import { Metadata, Viewport } from "next";

type RelationshipData = {
  id: string;
  type: string;
};

export const viewport: Viewport = {
  themeColor: "3b82f6",
};

// DatadogのフィールドをIncidentFieldsの形式に変換する関数
function convertFields(fields: Record<string, unknown>): IncidentFields {
  const result: IncidentFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "object" && value !== null && "type" in value && "value" in value) {
      result[key] = {
        type: (value as { type: string }).type as "dropdown" | "autocomplete" | "textbox",
        value: (value as { value: unknown }).value as string | string[] | null,
      };
    }
  }

  return result;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const incidentId = (await params).id;
  const res = await fetch(
    `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://status.uniproject.jp"
    }/api/incidents/${incidentId}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch incident data");
      }
      return res.json();
    })
    .then((data: v2.IncidentResponse) => {
      if (!data.data?.attributes) {
        throw new Error("Invalid incident data");
      }

      const { attributes } = data.data;

      // フィールドの変換
      const convertedFields = convertFields(attributes.fields || {});

      return {
        data: {
          id: data.data.id,
          title: attributes.title || "",
          created: new Date(attributes.created || Date.now()),
          modified: new Date(attributes.modified || Date.now()),
          state: attributes.state || "unknown",
          severity: attributes.severity || "unknown",
          timeToDetect: attributes.timeToDetect || 0,
          timeToRepair: attributes.timeToRepair || 0,
          timeToResolve: attributes.timeToResolve || 0,
          timeToInternalResponse: attributes.timeToInternalResponse || 0,
          customerImpact: {
            customerImpacted: attributes.customerImpacted || false,
            customerImpactScope: attributes.customerImpactScope || "",
            customerImpactStart: attributes.customerImpactStart
              ? new Date(attributes.customerImpactStart)
              : null,
            customerImpactEnd: attributes.customerImpactEnd
              ? new Date(attributes.customerImpactEnd)
              : null,
            customerImpactDuration: attributes.customerImpactDuration || 0,
          },
          fields: convertedFields,
          relationships: Object.fromEntries(
            Object.entries(data.data.relationships || {}).map(
              ([key, rel]: [string, { data?: RelationshipData | RelationshipData[] }]) => [
                key,
                {
                  data: Array.isArray(rel.data)
                    ? rel.data.map((d) => ({
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
          incidentId: data.data.id,
          incidentUrl: `https://app.datadoghq.com/incidents/${data.data.id}`,
          createdAt: new Date(attributes.created || Date.now()),
          modifiedAt: new Date(attributes.modified || Date.now()),
          resolvedAt: attributes.resolved ? new Date(attributes.resolved) : null,
          visibility: attributes.visibility || "unknown",
        },
      } as { data: IncidentItem };
    });

  return {
    title: `Incident ${res.data.title} - UniProject Status`,
    description: `インシデント ${
      res.data.title
    } の詳細情報です。発生日時: ${res.data.created.toLocaleString("ja-JP")}、状態: ${
      res.data.state
    }、重要度: ${res.data.severity}。`,
    openGraph: {
      title: `Incident ${res.data.title} - UniProject Status`,
      description: `インシデント ${
        res.data.title
      } の詳細情報です。発生日時: ${res.data.created.toLocaleString("ja-JP")}、状態: ${
        res.data.state
      }、重要度: ${res.data.severity}。`,
      url: `https://status.uniproject.jp/incidents/${res.data.incidentId}`,
      type: "article",
      authors: ["UniProject Tech Team"],
      images: [
        {
          url: `https://status.uniproject.jp/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Incident ${res.data.title} - UniProject Status`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@unipro_digital",
      creator: "@unipro_digital",
    },
  };
}

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const incidentId = (await params).id;
  const promise = fetch(
    `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://status.uniproject.jp"
    }/api/incidents/${incidentId}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch incident data");
      }
      return res.json();
    })
    .then((data: v2.IncidentResponse) => {
      if (!data.data?.attributes) {
        throw new Error("Invalid incident data");
      }

      const { attributes } = data.data;

      // フィールドの変換
      const convertedFields = convertFields(attributes.fields || {});

      return {
        data: {
          id: data.data.id,
          title: attributes.title || "",
          created: new Date(attributes.created || Date.now()),
          modified: new Date(attributes.modified || Date.now()),
          state: attributes.state || "unknown",
          severity: attributes.severity || "unknown",
          timeToDetect: attributes.timeToDetect || 0,
          timeToRepair: attributes.timeToRepair || 0,
          timeToResolve: attributes.timeToResolve || 0,
          timeToInternalResponse: attributes.timeToInternalResponse || 0,
          customerImpact: {
            customerImpacted: attributes.customerImpacted || false,
            customerImpactScope: attributes.customerImpactScope || "",
            customerImpactStart: attributes.customerImpactStart
              ? new Date(attributes.customerImpactStart)
              : null,
            customerImpactEnd: attributes.customerImpactEnd
              ? new Date(attributes.customerImpactEnd)
              : null,
            customerImpactDuration: attributes.customerImpactDuration || 0,
          },
          fields: convertedFields,
          relationships: Object.fromEntries(
            Object.entries(data.data.relationships || {}).map(
              ([key, rel]: [string, { data?: RelationshipData | RelationshipData[] }]) => [
                key,
                {
                  data: Array.isArray(rel.data)
                    ? rel.data.map((d) => ({
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
          incidentId: data.data.id,
          incidentUrl: `https://app.datadoghq.com/incidents/${data.data.id}`,
          createdAt: new Date(attributes.created || Date.now()),
          modifiedAt: new Date(attributes.modified || Date.now()),
          resolvedAt: attributes.resolved ? new Date(attributes.resolved) : null,
          visibility: attributes.visibility || "unknown",
        },
      } as { data: IncidentItem };
    }) as Promise<{ data: IncidentItem }>;
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500" />
          </div>
        </main>
      }
    >
      <SuspenseIncidentPage promise={promise} />
    </Suspense>
  );
}
