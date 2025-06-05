import { Suspense } from "react";
import StatusBar, { DownTime } from "@/components/StatusBar";
import { v2 } from "@datadog/datadog-api-client";
import IncidentSection from "@/components/IncidentSection";

const monitors = [
  { title: "蔵雲 - NextCloud 1", id: "3742884" },
  { title: "UniProject 公式サイト", id: "3741499" },
];

export default function StatusPage() {
  const incidentPromise = fetch("http://localhost:3000/api/incidents").then(
    (res) => res.json()
  );

  const promises = monitors.map(
    (monitor) =>
      new Promise<DownTime[]>(async (resolve) => {
        fetch(
          `http://localhost:3000/api/monitor-statuses?monitor_id=${monitor.id}`
        )
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

            resolve(parsedDowntime);
          });
      })
  );

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

        {/* ダウンタイムセクション */}
        <div className="bg-slate-50 p-6 rounded-xl">
          {promises.map((promise, idx) => (
            <Suspense
              key={idx}
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                </div>
              }
            >
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {monitors[idx].title}
                </h3>
                <StatusBar promise={promise} />
              </div>
            </Suspense>
          ))}
          <div className="text-xs text-slate-500 mt-4">
            ※ 各バーにカーソルを合わせると詳細が表示されます
          </div>
        </div>
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

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          }
        >
          <IncidentSection promise={incidentPromise} />
        </Suspense>
      </section>

      {/* フッター */}
      <footer className="max-w-5xl mx-auto text-center text-sm text-slate-500 pt-8">
        <p>リアルタイムモニタリング powered by Datadog</p>
      </footer>
    </div>
  );
}
