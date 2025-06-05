import { use } from "react";

type Incident = {
  id: string;
  attributes: {
    title: string;
    created: string;
    status: string;
  };
};

export default function IncidentSection({
  promise,
}: {
  promise: Promise<{ data: Incident[] }>;
}) {
  const incidents = use(promise).data as Incident[];
  if (incidents.length === 0)
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-800 flex items-center gap-3">
        <span className="text-2xl">✨</span>
        <p className="font-medium">
          現在、報告されているインシデントはありません
        </p>
      </div>
    );
  else
    return (
      <section className="space-y-4">
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
      </section>
    );
}
