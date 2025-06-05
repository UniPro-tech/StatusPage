import { IncidentItem } from "@/lib/datadog";
import { use } from "react";
import Link from "next/link";

function formatDate(date: Date) {
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

export default function IncidentsSuspention({
  incidentsPromise,
}: {
  incidentsPromise: Promise<IncidentItem[]>;
}) {
  const incidents = use(incidentsPromise);
  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Link
          href={`/incidents/${incident.id}`}
          key={incident.id}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{incident.title}</h2>
              <div className="flex gap-2 flex-shrink-0">
                <SeverityBadge severity={incident.severity} />
                <StateBadge state={incident.state} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
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
                <span>{formatDate(incident.created)}</span>
              </div>

              {incident.fields.services?.value && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="line-clamp-1">{incident.fields.services.value}</span>
                </div>
              )}
            </div>

            {incident.fields.summary?.value && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {incident.fields.summary.value}
              </p>
            )}

            {incident.customerImpact.customerImpacted && (
              <div className="mt-2 flex items-center text-yellow-600 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
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
                <span className="line-clamp-1">
                  顧客影響: {incident.customerImpact.customerImpactScope}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
