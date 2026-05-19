import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function UpcomingBirthdaysCard() {
  const [birthdays, setBirthdays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 10_000);
    apiFetch("/persons/upcoming-birthdays?limit=5&daysAhead=180")
      .then((data: string[]) => setBirthdays(data))
      .catch((err: any) => setError(err.message ?? "Failed to load birthdays"))
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-gray-300 bg-white shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        🎂 Upcoming Birthdays
      </h2>

      {loading && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
          {slow && (
            <p className="text-xs text-gray-400">
              This is taking a while. Try{" "}
              <button
                onClick={() => window.location.reload()}
                className="underline hover:text-gray-600"
              >
                refreshing the page
              </button>
              .
            </p>
          )}
        </div>
      )}

      {!loading && error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && birthdays.length === 0 && (
        <p className="text-sm text-gray-400">
          No upcoming birthdays. Add birthdates to your people to see them here.
        </p>
      )}

      {!loading && !error && birthdays.length > 0 && (
        <ul className="space-y-2">
          {birthdays.map((entry, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              {entry}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
