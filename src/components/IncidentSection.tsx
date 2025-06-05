import { IncidentItem } from "@/lib/datadog";
import { use } from "react";

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
  else
    return (
      <section className="space-y-3 sm:space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                  {incident.title}
                </h3>
                <div className="space-y-1 text-xs sm:text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <span>📅</span>
                    {new Date(incident.createdAt).toLocaleString()}
                  </p>
                  {incident.state === "resolved" && (
                    <p className="flex items-center gap-2">
                      <span>✅</span>
                      <span className="text-emerald-600 font-medium">
                        {incident.resolvedAt?.toLocaleString()}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span>📊</span>
                    <span
                      className={
                        incident.state === "resolved"
                          ? "text-emerald-600"
                          : incident.state === "stable"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {incident.state === "resolved"
                        ? "解決済み"
                        : incident.state === "stable"
                        ? "安定"
                        : "対応中"}
                    </span>
                  </p>
                </div>
              </div>
              <div
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  incident.state === "resolved"
                    ? "bg-emerald-100 text-emerald-800"
                    : incident.state === "stable"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                } self-start`}
              >
                {incident.state === "resolved"
                  ? "RESOLVED"
                  : incident.state === "stable"
                  ? "STABLE"
                  : "ACTIVE"}
              </div>
            </div>
          </div>
        ))}
      </section>
    );
}
