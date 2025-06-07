import { v2 } from "@datadog/datadog-api-client";
import { use } from "react";

function StatusBadge({ status }: { status: string }) {
  const { color, label } =
    status === "active"
      ? { color: "bg-red-100 text-red-800", label: "実行中" }
      : status === "scheduled"
      ? { color: "bg-yellow-100 text-yellow-800", label: "予定" }
      : status === "canceled"
      ? { color: "bg-gray-100 text-gray-800", label: "キャンセル" }
      : status === "ended"
      ? { color: "bg-blue-100 text-blue-800", label: "終了" }
      : { color: "bg-gray-100 text-gray-800", label: "不明" };

  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full ${color} font-medium`}>
      {label}
    </span>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "未定";
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseScheduleDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
}

export default function DowntimesSection({
  promise,
}: {
  promise: Promise<v2.ListDowntimesResponse>;
}) {
  const downtimes = use(promise);

  if (!downtimes.data || downtimes.data.length === 0) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-slate-200">
        <span className="text-xl sm:text-2xl">✨</span>
        <p className="text-sm sm:text-base font-medium">
          現在、予定されているダウンタイムはありません
        </p>
      </div>
    );
  }

  return (
    <>
      {downtimes.data
        ?.sort((a, b) => {
          const startA = new Date(a.attributes?.created ?? 0).getTime();
          const startB = new Date(b.attributes?.created ?? 0).getTime();
          return startB - startA; // 新しい順に並び替え
        })
        .map((downtime) => {
          const schedule = downtime.attributes?.schedule;
          const start =
            schedule && typeof schedule === "object" && "start" in schedule
              ? parseScheduleDate(schedule.start)
              : null;
          const end =
            schedule && typeof schedule === "object" && "end" in schedule
              ? parseScheduleDate(schedule.end)
              : null;

          const scope = Array.isArray(downtime.attributes?.scope)
            ? downtime.attributes.scope
            : [downtime.attributes?.scope].filter(Boolean);

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
                  <StatusBadge status={(downtime.attributes?.status as string) || "unknown"} />
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
                      <span>開始: {formatDate(start)}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <span
                        role="img"
                        aria-label="end"
                      >
                        🏁
                      </span>
                      <span>終了: {formatDate(end)}</span>
                    </p>
                  </div>

                  {scope.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-600">
                        <span
                          role="img"
                          aria-label="target"
                        >
                          🎯
                        </span>
                        <span className="line-clamp-2">対象: {scope.join(", ")}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* 補足情報として、messageを表示 */}
                {downtime.attributes?.message && (
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                    {downtime.attributes.message}
                  </p>
                )}
              </div>
            </article>
          );
        })}
    </>
  );
}
