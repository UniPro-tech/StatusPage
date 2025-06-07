import { use } from "react";

export type DownTime = {
  name: string;
  start: Date;
  end: Date;
  status: "error" | "warning" | "degraded" | "success";
};

export default function StatusBar({
  promise,
  title,
}: {
  promise: Promise<DownTime[]>;
  title: string;
}) {
  const incidentialDowntime = use(promise);

  // 現在のステータスを判定する関数
  const getCurrentStatus = () => {
    if (incidentialDowntime.length === 0) return "online";

    const now = new Date();
    const latestDowntime = incidentialDowntime
      .filter((dt) => dt.end >= now) // まだ終わってないものだけ
      .sort((a, b) => b.start.getTime() - a.start.getTime())[0];

    if (!latestDowntime) return "online";

    switch (latestDowntime.status) {
      case "error":
        return "offline";
      case "warning":
      case "degraded":
        return "degraded";
      default:
        return "online";
    }
  };

  const status = getCurrentStatus();

  const statusStyles = {
    online: "bg-emerald-100 text-emerald-800",
    offline: "bg-red-100 text-red-800",
    degraded: "bg-yellow-100 text-yellow-800",
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">{title}</h3>
        <span
          className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusStyles[status]} self-start sm:self-auto`}
        >
          {status === "online" && "オンライン"}
          {status === "offline" && "オフライン"}
          {status === "degraded" && "パフォーマンス低下"}
        </span>
      </div>
      <div className="grid grid-cols-45 sm:grid-cols-90 gap-1 sm:gap-1.5">
        {[...Array(90)].map((_, i) => {
          const days = Array.from({ length: 90 }, (_, idx) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (89 - idx));
            return d;
          });

          const getDowntimeSecondsForDay = (date: Date) => {
            // その日の開始時刻と終了時刻を設定
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            // ステータスごとの集計を初期化
            const statusDurations = {
              error: 0,
              warning: 0,
              degraded: 0,
            };

            const statusCount = {
              error: 0,
              warning: 0,
              degraded: 0,
            };

            // その日のダウンタイムを集計
            incidentialDowntime.forEach((dt) => {
              // その日に関係するダウンタイムかチェック
              if (dt.end >= dayStart && dt.start <= dayEnd) {
                // 日付範囲内の開始時刻と終了時刻を計算
                const start = new Date(Math.max(dt.start.getTime(), dayStart.getTime()));
                const end = new Date(Math.min(dt.end.getTime(), dayEnd.getTime()));

                // ミリ秒単位での期間を計算
                const duration = end.getTime() - start.getTime();

                // ステータスに応じて集計
                if (dt.status === "error") {
                  statusDurations.error += duration;
                  statusCount.error++;
                } else if (dt.status === "warning") {
                  statusDurations.warning += duration;
                  statusCount.warning++;
                } else if (dt.status === "degraded") {
                  statusDurations.degraded += duration;
                  statusCount.degraded++;
                }
              }
            });

            // 1日の秒数で正規化（0-100%の範囲に）
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const normalizedDurations = {
              error: (statusDurations.error / ONE_DAY_MS) * 100,
              warning: (statusDurations.warning / ONE_DAY_MS) * 100,
              degraded: (statusDurations.degraded / ONE_DAY_MS) * 100,
            };

            return {
              total: Math.max(...Object.values(statusDurations)) / 1000,
              statusCount,
              normalizedDurations,
            };
          };

          const day = days[i];
          const {
            total: downtimeSec,
            statusCount,
            normalizedDurations,
          } = getDowntimeSecondsForDay(day);
          const totalIssues = statusCount.error + statusCount.warning + statusCount.degraded;

          return (
            <div
              key={i}
              className="relative h-6 sm:h-8 w-full group"
              title={`${day.toLocaleDateString("ja-JP")} - ${
                totalIssues > 0 ? `${totalIssues}件の問題` : "OK"
              }`}
            >
              {/* ベースの成功状態 */}
              <div className="absolute inset-0 bg-emerald-400 rounded-sm"></div>

              {/* 問題発生時のオーバーレイ */}
              {downtimeSec > 0 && (
                <div className="absolute inset-0 flex flex-col justify-end">
                  {statusCount.error > 0 && (
                    <div
                      className="w-full bg-gradient-to-b from-red-500 to-red-600 rounded-sm"
                      style={{
                        height: `${Math.max(10, normalizedDurations.error)}%`,
                      }}
                    />
                  )}
                  {statusCount.degraded > 0 && (
                    <div
                      className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-sm"
                      style={{
                        height: `${Math.max(8, normalizedDurations.degraded)}%`,
                      }}
                    />
                  )}
                  {statusCount.warning > 0 && (
                    <div
                      className="w-full bg-gradient-to-b from-orange-400 to-orange-500 rounded-sm"
                      style={{
                        height: `${Math.max(6, normalizedDurations.warning)}%`,
                      }}
                    />
                  )}
                </div>
              )}

              {/* ホバー時のツールチップ */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 sm:mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap z-10">
                {day.toLocaleDateString("ja-JP")}
                {totalIssues > 0 && (
                  <div className="text-[10px] sm:text-xs">
                    {statusCount.error > 0 && <div>🔴 障害: {statusCount.error}件</div>}
                    {statusCount.degraded > 0 && <div>🟡 低下: {statusCount.degraded}件</div>}
                    {statusCount.warning > 0 && <div>🟠 警告: {statusCount.warning}件</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
