import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../api/client";
import type { FullExchange } from "../models/Exchanges";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { formatTimeAgo } from "../utils/time";

export default function GiftExchanges() {
  const [exchanges, setExchanges] = useState<FullExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const data: FullExchange[] = await apiFetch("/exchanges");
      setExchanges(data);
    } catch (err: any) {
      setError(err.message || "Failed to load exchanges");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = addName.trim();
    if (!trimmed) return;
    setAddSaving(true);
    try {
      const newExchange = await apiFetch("/exchanges", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setExchanges((prev) => [
        ...prev,
        {
          exchange: newExchange,
          participants: [],
          assignments: [],
          exclusions: [],
        },
      ]);
      setAddName("");
    } catch (err: any) {
      setError(err.message || "Failed to add exchange");
    } finally {
      setAddSaving(false);
    }
  }

  function startEditing(fe: FullExchange) {
    setEditingId(fe.exchange.id);
    setEditName(fe.exchange.name);
    setRowError(null);
  }

  function exitEditing() {
    setEditingId(null);
    setEditName("");
    setRowError(null);
  }

  async function handleSave(exchangeId: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setSaving(true);
    setRowError(null);
    try {
      await apiFetch(`/exchanges/${exchangeId}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmed }),
      });
      setExchanges((prev) =>
        prev.map((fe) =>
          fe.exchange.id === exchangeId
            ? { ...fe, exchange: { ...fe.exchange, name: trimmed } }
            : fe,
        ),
      );
      exitEditing();
    } catch (err: any) {
      setRowError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exchangeId: string) {
    if (!window.confirm("Are you sure you want to delete this exchange?"))
      return;
    try {
      await apiFetch(`/exchanges/${exchangeId}`, { method: "DELETE" });
      setExchanges((prev) =>
        prev.filter((fe) => fe.exchange.id !== exchangeId),
      );
    } catch (err: any) {
      setError(err.message || "Failed to delete exchange");
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Gift Exchanges</h1>

      {loading && <p>Loading exchanges...</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Add New Exchange Form */}
      <form
        onSubmit={handleAdd}
        className="mb-4 inline-flex items-center space-x-2"
      >
        <input
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          disabled={addSaving}
          placeholder="New exchange name"
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={addSaving || !addName.trim()}
          className={`px-3 py-1 rounded-md text-white ${
            addSaving || !addName.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          Add
        </button>
      </form>

      {/* Exchanges Table */}
      {!loading && exchanges.length === 0 ? (
        <p>No exchanges found.</p>
      ) : (
        <div className="max-w-4xl mx-auto overflow-x-auto mt-6">
          <table className="table-fixed w-full border border-gray-200 divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left w-[72%]">Exchange Name</th>
                <th className="px-4 py-2 text-center w-[28%]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {exchanges.map((fe) => {
                const isEditing = editingId === fe.exchange.id;
                return (
                  <tr
                    key={fe.exchange.id}
                    className={
                      !isEditing ? "cursor-pointer hover:bg-gray-50" : undefined
                    }
                    onClick={() => {
                      if (!isEditing) {
                        navigate(`/gift-exchanges/${fe.exchange.id}`, {
                          state: { exchange: fe },
                        });
                      }
                    }}
                  >
                    <td
                      className="px-4 py-2 align-middle"
                      onClick={
                        isEditing ? (e) => e.stopPropagation() : undefined
                      }
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(fe.exchange.id);
                            if (e.key === "Escape") exitEditing();
                          }}
                          disabled={saving}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      ) : (
                        <div className="flex flex-col justify-center">
                          <span className="font-medium">
                            {fe.exchange.name}
                          </span>
                          <div className="text-gray-400 text-tiny">
                            updated {formatTimeAgo(fe.exchange.updatedAt)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isEditing ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(fe.exchange.id)}
                              disabled={saving || !editName.trim()}
                              className={`px-3 py-1 rounded-md text-white ${
                                saving || !editName.trim()
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 hover:bg-blue-700"
                              }`}
                            >
                              Save
                            </button>
                            <button
                              onClick={exitEditing}
                              disabled={saving}
                              className={`px-3 py-1 rounded-md text-white ${
                                saving
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-gray-400 hover:bg-gray-500"
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                          {rowError && (
                            <p className="text-red-600 text-sm">{rowError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditing(fe)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(fe.exchange.id)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
