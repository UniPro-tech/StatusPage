import { IncidentItem } from "@/lib/datadog";
import { v2 } from "@datadog/datadog-api-client";
import { use } from "react";

export default function CurrentEvents({
  incidentsPromise,
  downtimePromise,
}: {
  incidentsPromise: Promise<IncidentItem[]>;
  downtimePromise: Promise<v2.ListDowntimesResponse>;
}) {
  const incidents = use(incidentsPromise);
  const downtimes = use(downtimePromise);

  if ((!incidents || incidents.length === 0) && (!downtimes.data || downtimes.data?.length === 0)) {
    return <></>;
  }

  // 影響範囲の文字列を配列に分割する関数
  const parseImpactScope = (scope: unknown) => {
    if (!scope) return [];
    // [1], [2] などで始まる行にマッチする正規表現
    const regex = /\[\d+\].*?(?=\[\d+\]|$)/g;
    return String(scope).match(regex) || [String(scope)];
  };

  return (
    <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-slate-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500">🚨</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            現在発生中のインシデントおよびメンテナンス
          </h2>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className={`p-4 sm:p-6 rounded-xl border ${
              incident.state === "stable"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-full p-1.5 mt-0.5 ${
                  incident.state === "stable" ? "bg-yellow-100" : "bg-red-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    incident.state === "stable" ? "text-yellow-600" : "text-red-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                    {incident.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      incident.state === "stable"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {incident.state === "stable" ? "安定化" : "対応中"}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    発生時刻: {new Date(incident.createdAt).toLocaleString("ja-JP")}
                  </p>
                  {incident.customerImpact.customerImpacted && (
                    <div className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div className="flex-1">
                        <span className="font-medium">影響範囲:</span>
                        <ul className="mt-1 space-y-1">
                          {parseImpactScope(incident.customerImpact.customerImpactScope).map(
                            (scope, index) => (
                              <li
                                key={index}
                                className="pl-4"
                              >
                                {scope.trim()}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {downtimes.data?.map((downtime) => {
          const startValue =
            downtime.attributes?.schedule &&
            typeof downtime.attributes?.schedule === "object" &&
            "start" in downtime.attributes?.schedule
              ? downtime.attributes?.schedule.start
              : 0;
          const start = new Date(startValue ?? 0);
          const endValue =
            downtime.attributes?.schedule &&
            typeof downtime.attributes?.schedule === "object" &&
            "end" in downtime.attributes?.schedule
              ? downtime.attributes?.schedule.end
              : 0;
          const end = new Date(endValue ?? 0);
          const scope = downtime.attributes?.scope
            ? parseImpactScope(downtime.attributes.scope)
            : [];

          return (
            <article
              key={downtime.id}
              className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col gap-4">
                {/* ヘッダー部分 */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex-grow">
                    {downtime.attributes?.message || "タイトルなし"}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      downtime.attributes?.status === "scheduled"
                        ? "bg-yellow-100 text-yellow-800"
                        : downtime.attributes?.status === "active"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    } font-medium`}
                  >
                    {downtime.attributes?.status === "scheduled"
                      ? "予定"
                      : downtime.attributes?.status === "active"
                      ? "進行中"
                      : downtime.attributes?.status === "ended"
                      ? "終了"
                      : downtime.attributes?.status === "canceled"
                      ? "キャンセル"
                      : "不明"}
                  </span>
                </div>

                {/* 詳細情報 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-slate-600">
                      <span
                        role="img"
                        aria-label="start"
                      >
                        🕒
                      </span>
                      <span>開始: {start.toLocaleString("ja-JP")}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <span
                        role="img"
                        aria-label="end"
                      >
                        🏁
                      </span>
                      <span>終了: {end.toLocaleString("ja-JP")}</span>
                    </p>
                  </div>

                  {scope.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-600">
                        <span
                          role="img"
                          aria-label="scope"
                        >
                          🔍
                        </span>
                        <span>影響範囲: {scope.join(", ")}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
