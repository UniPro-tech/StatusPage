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
  status: v2.EventStatusType;
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
      fetch("/api/monitor-statuses")
        .then((res) => res.json())
        .then((data) => {
          if (!data || !Array.isArray(data.data)) {
            throw new Error("Invalid data format");
          }
          const parsedEvents =
            (data as v2.EventsListResponse).data?.map((e) => ({
              name: e.attributes?.attributes?.title || "Unknown Event",
              time: new Date(e.attributes?.attributes?.timestamp || 0),
              status: e.attributes?.attributes?.status || "success",
            })) || [];
          const parsedDowntime = new Array<DownTime>();
          for (let i = 0; i < parsedEvents.length; i++) {
            const nextEvent = parsedEvents[i];
            const preventEvent = parsedEvents[i + 1];
            if (i == 0 && nextEvent.status === "error") {
              parsedDowntime.push({
                name: preventEvent.name,
                start: nextEvent.time,
                end: preventEvent.time,
                status: nextEvent.status,
              });
            }
            if (
              nextEvent.status === "error" &&
              preventEvent &&
              preventEvent.status === "success"
            ) {
              parsedDowntime.push({
                name: nextEvent.name,
                start: preventEvent.time,
                end: nextEvent.time,
                status: nextEvent.status,
              });
              console.log(
                `Downtime detected: ${
                  nextEvent.name
                } from ${preventEvent.time.toLocaleString()} to ${nextEvent.time.toLocaleString()}`
              );
            }
          }
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
                    const dayStart = new Date(date);
                    const dayEnd = new Date(date);
                    dayEnd.setHours(23, 59, 59, 999);

                    let total = 0;
                    const statusCount = {
                      error: 0,
                      warning: 0,
                      degraded: 0,
                    };

                    downtime.forEach((dt) => {
                      if (dt.end >= dayStart && dt.start <= dayEnd) {
                        const start = dt.start < dayStart ? dayStart : dt.start;
                        const end = dt.end > dayEnd ? dayEnd : dt.end;
                        total += Math.max(0, end.getTime() - start.getTime());

                        // ステータスごとのカウントを追加
                        if (dt.status === "error") statusCount.error++;
                        else if (dt.status === "warning") statusCount.warning++;
                      }
                    });

                    return {
                      total: total / 1000,
                      statusCount,
                    };
                  };

                  const day = days[i];
                  const { total: downtimeSec, statusCount } =
                    getDowntimeSecondsForDay(day);
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
                                  Math.min(100, (downtimeSec / 86400) * 100)
                                )}%`,
                              }}
                            />
                          )}
                          {statusCount.degraded > 0 && (
                            <div
                              className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-sm"
                              style={{ height: "25%" }}
                            />
                          )}
                          {statusCount.warning > 0 && (
                            <div
                              className="w-full bg-gradient-to-b from-orange-400 to-orange-500 rounded-sm"
                              style={{ height: "15%" }}
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
