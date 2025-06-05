import { IncidentItem } from "@/lib/datadog";
import Link from "next/link";
import { use } from "react";

function SeverityBadge({ severity }: { severity: string }) {
  const color =
    severity === "SEV-1"
      ? "bg-red-600"
      : severity === "SEV-2"
      ? "bg-orange-500"
      : severity === "SEV-3"
      ? "bg-yellow-500"
      : severity === "SEV-4"
      ? "bg-blue-500"
      : severity === "SEV-5"
      ? "bg-green-500"
      : "bg-gray-400";
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded-full ${color} text-white font-medium`}>
      {severity}
    </span>
  );
}

function StateBadge({ state }: { state: string }) {
  const { color, label } =
    state === "resolved"
      ? { color: "bg-emerald-100 text-emerald-800", label: "解決済み" }
      : state === "stable"
      ? { color: "bg-yellow-100 text-yellow-800", label: "安定" }
      : { color: "bg-red-100 text-red-800", label: "対応中" };

  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full ${color} font-medium`}>
      {label}
    </span>
  );
}

function formatDate(date: Date) {
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IncidentSection({ promise }: { promise: Promise<IncidentItem[]> }) {
  const incidents = use(promise);

  if (incidents.length === 0)
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 text-emerald-800 flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl">✨</span>
        <p className="text-sm sm:text-base font-medium">
          現在、報告されているインシデントはありません
        </p>
      </div>
    );

  return (
    <section className="space-y-4">
      {incidents.map((incident) => (
        <Link
          href={`/incidents/${incident.id}`}
          key={incident.id}
          className="block w-full"
        >
          <article className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col gap-4">
              {/* ヘッダー部分 */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex-grow">
                  {incident.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <SeverityBadge severity={incident.severity} />
                  <StateBadge state={incident.state} />
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-slate-600">
                    <span
                      role="img"
                      aria-label="calendar"
                    >
                      📅
                    </span>
                    <span>作成: {formatDate(incident.created)}</span>
                  </p>
                  {incident.resolvedAt && (
                    <p className="flex items-center gap-2 text-emerald-600">
                      <span
                        role="img"
                        aria-label="check"
                      >
                        ✅
                      </span>
                      <span>解決: {formatDate(incident.resolvedAt)}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {incident.fields.services?.value && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <span
                        role="img"
                        aria-label="server"
                      >
                        🖥️
                      </span>
                      <span className="line-clamp-1">{incident.fields.services.value}</span>
                    </p>
                  )}
                  {incident.customerImpact.customerImpacted && (
                    <p className="flex items-center gap-2 text-yellow-600">
                      <span
                        role="img"
                        aria-label="warning"
                      >
                        ⚠️
                      </span>
                      <span className="line-clamp-1">
                        {incident.customerImpact.customerImpactScope}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* 概要（あれば表示） */}
              {incident.fields.summary?.value && (
                <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                  {incident.fields.summary.value}
                </p>
              )}
            </div>
          </article>
        </Link>
      ))}
    </section>
  );
}
