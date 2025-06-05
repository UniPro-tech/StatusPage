import { IncidentItem } from "@/lib/datadog";
import { use } from "react";

export default function CurrentIncident({ promise }: { promise: Promise<IncidentItem[]> }) {
  const incidents = use(promise);

  if (!incidents || incidents.length === 0) {
    return <></>;
  }

  return (
    <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-slate-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500">🚨</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">現在発生中のインシデント</h2>
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
              <div>
                <div className="flex items-center gap-2">
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
                    {incident.state === "stable" ? "監視中" : "対応中"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  発生時刻: {new Date(incident.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
