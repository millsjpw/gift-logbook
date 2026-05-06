import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { List } from "../models/List";

export default function RecentListsCard() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 10_000);
    apiFetch("/lists/recent?limit=5")
      .then((data: List[]) => setLists(data))
      .catch((err: any) => setError(err.message ?? "Failed to load lists"))
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        📋 Recent Lists
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

      {!loading && !error && lists.length === 0 && (
        <p className="text-sm text-gray-400">
          No lists yet.{" "}
          <Link to="/lists" className="underline hover:text-gray-600">
            Create one
          </Link>{" "}
          to get started.
        </p>
      )}

      {!loading && !error && lists.length > 0 && (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <Link
                to={`/lists/${list.id}`}
                className="text-blue-600 hover:underline"
              >
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
