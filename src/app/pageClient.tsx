"use client";
import { v2 } from "@datadog/datadog-api-client";
import { useEffect, useState } from "react";

type Incident = {
  id: string;
  attributes: {
    title: string;
    created: string;
    status: string;
  };
};

type DownTime = {
  name: string;
  start: Date;
  end: Date;
  status: "error" | "warning" | "degraded" | "success";
};

export default function StatusPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [downtime, setDowntime] = useState<DownTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/incidents")
        .then((res) => res.json())
        .then((data) => setIncidents(data.data || [])),
      fetch("/api/monitor-statuses?monitor_id=3742884")
        .then((res) => res.json())
        .then((data) => {
          if (!data || !Array.isArray(data.data)) {
            throw new Error("Invalid data format");
          }

          // イベントを古い順にソート
          const parsedEvents = (
            (data as v2.EventsListResponse).data?.map((e) => ({
              name: e.attributes?.attributes?.title || "Unknown Event",
              time: new Date(e.attributes?.attributes?.timestamp || 0),
              status: e.attributes?.attributes?.status || "success",
            })) || []
          ).sort((a, b) => a.time.getTime() - b.time.getTime());

          const parsedDowntime = new Array<DownTime>();
          let currentDowntime: DownTime | null = null;

          parsedEvents.forEach((event) => {
            if (event.status === "error" && !currentDowntime) {
              // エラー状態の開始
              currentDowntime = {
                name: event.name,
                start: event.time,
                end: new Date(), // 仮の終了時刻
                status: "error",
              };
            } else if (event.status === "success" && currentDowntime) {
              // エラー状態の終了
              currentDowntime.end = event.time;
              parsedDowntime.push(currentDowntime);
              currentDowntime = null;
            }
          });

          // 最後のダウンタイムがまだ終了していない場合
          if (currentDowntime) {
            parsedDowntime.push(currentDowntime);
          }

          console.log("Parsed Events:", parsedEvents);
          console.log("Parsed Downtime:", parsedDowntime);
          setDowntime(parsedDowntime);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 space-y-8">
      {/* ヘッダーセクション */}
      <header className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-slate-800 mb-2">
          システムステータス
        </h1>
        <p className="text-slate-600">
          過去90日間のシステム稼働状況をリアルタイムで確認できます
        </p>
      </header>

      {/* ステータス履歴セクション */}
      <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">稼働状況</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              正常稼働
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              障害発生
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              パフォーマンス低下
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-90 gap-1">
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
                    downtime.forEach((dt) => {
                      // その日に関係するダウンタイムかチェック
                      if (dt.end >= dayStart && dt.start <= dayEnd) {
                        // 日付範囲内の開始時刻と終了時刻を計算
                        const start = new Date(
                          Math.max(dt.start.getTime(), dayStart.getTime())
                        );
                        const end = new Date(
                          Math.min(dt.end.getTime(), dayEnd.getTime())
                        );

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
                  const totalIssues =
                    statusCount.error +
                    statusCount.warning +
                    statusCount.degraded;

                  return (
                    <div
                      key={i}
                      className="relative h-8 w-full group"
                      title={`${day.toLocaleDateString()} - ${
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
                                height: `${Math.max(
                                  10,
                                  normalizedDurations.error
                                )}%`,
                              }}
                            />
                          )}
                          {statusCount.degraded > 0 && (
                            <div
                              className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-sm"
                              style={{
                                height: `${Math.max(
                                  8,
                                  normalizedDurations.degraded
                                )}%`,
                              }}
                            />
                          )}
                          {statusCount.warning > 0 && (
                            <div
                              className="w-full bg-gradient-to-b from-orange-400 to-orange-500 rounded-sm"
                              style={{
                                height: `${Math.max(
                                  6,
                                  normalizedDurations.warning
                                )}%`,
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* ホバー時のツールチップ */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {day.toLocaleDateString()}
                        {totalIssues > 0 && (
                          <div className="text-xs">
                            {statusCount.error > 0 && (
                              <div>🔴 障害: {statusCount.error}件</div>
                            )}
                            {statusCount.degraded > 0 && (
                              <div>🟡 低下: {statusCount.degraded}件</div>
                            )}
                            {statusCount.warning > 0 && (
                              <div>🟠 警告: {statusCount.warning}件</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-4">
              ※ 各バーにカーソルを合わせると詳細が表示されます
            </div>
          </div>
        )}
      </section>

      {/* インシデントセクション */}
      <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-red-500">🚨</span> インシデント履歴
          </h2>
          <div className="text-sm text-slate-500">
            直近のインシデントおよび解決状況
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-800 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <p className="font-medium">
              現在、報告されているインシデントはありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-6 rounded-xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {incident.attributes.title}
                    </h3>
                    <div className="space-y-1 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        {new Date(incident.attributes.created).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📊</span>
                        <span
                          className={
                            incident.attributes.status === "resolved"
                              ? "text-emerald-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {incident.attributes.status === "resolved"
                            ? "解決済み"
                            : "対応中"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      incident.attributes.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {incident.attributes.status === "resolved"
                      ? "RESOLVED"
                      : "ACTIVE"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* フッター */}
      <footer className="max-w-5xl mx-auto text-center text-sm text-slate-500 pt-8">
        <p>リアルタイムモニタリング powered by Datadog</p>
      </footer>
    </div>
  );
}
