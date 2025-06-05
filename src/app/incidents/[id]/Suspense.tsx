import { IncidentItem } from "@/lib/datadog";
import { use } from "react";

function formatDate(dateStr: string | Date) {
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    <span className={`inline-block px-2 py-1 text-xs rounded ${color} text-white`}>{severity}</span>
  );
}

function StateBadge({ state }: { state: string }) {
  const color =
    state === "open" ? "bg-blue-500" : state === "resolved" ? "bg-green-500" : "bg-gray-400";
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded ${color} text-white`}>{state}</span>
  );
}

export default function SuspenseIncidentPage({
  promise,
}: {
  promise: Promise<{ data: IncidentItem }>;
}) {
  const incident: IncidentItem = use(promise).data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
              <div className="flex gap-3">
                <SeverityBadge severity={incident.severity} />
                <StateBadge state={incident.state} />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>作成日時: {formatDate(incident.created)}</span>
                </div>
                {incident.resolvedAt && (
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>解決日時: {formatDate(incident.resolvedAt)}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>最終更新: {formatDate(incident.modified)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細セクション */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">インシデント詳細</h2>
          <div className="space-y-6">
            {incident.fields.summary?.value && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">概要</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{incident.fields.summary.value}</p>
              </div>
            )}

            {incident.fields.root_cause?.value && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">原因</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {incident.fields.root_cause.value}
                </p>
              </div>
            )}

            {incident.fields.services?.value && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">影響サービス</h3>
                <p className="text-gray-700">{incident.fields.services.value}</p>
              </div>
            )}

            {incident.fields.detection_method?.value && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">検出方法</h3>
                <p className="text-gray-700">{incident.fields.detection_method.value}</p>
              </div>
            )}

            {incident.customerImpact.customerImpacted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-medium text-yellow-700">顧客影響あり</span>
                    <span className="text-sm text-yellow-600">
                      {incident.customerImpact.customerImpactScope}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div
                className={`bg-blue-50 rounded-lg p-4 ${
                  incident.resolvedAt ? "col-span-1" : "col-span-2"
                }`}
              >
                <h4 className="text-sm font-medium text-blue-900 mb-1">検知時間</h4>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round(incident.timeToDetect / 60)} 分
                </p>
              </div>
              {incident.resolvedAt && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-1">解決時間</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {(() => {
                      const minutes = Math.round(incident.timeToResolve / 60);
                      if (minutes >= 1440) {
                        const days = Math.floor(minutes / 1440);
                        const hours = Math.floor((minutes % 1440) / 60);
                        const mins = minutes % 60;
                        return `${days}日${hours > 0 ? `${hours}時間` : ""}${
                          mins > 0 ? `${mins}分` : ""
                        }`;
                      } else if (minutes >= 60) {
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        return `${hours}時間${mins > 0 ? `${mins}分` : ""}`;
                      } else {
                        return `${minutes}分`;
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
