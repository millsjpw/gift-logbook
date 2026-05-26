import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { List } from "../models/List";
import PageLoader from "../components/PageLoader";
import { apiFetch } from "../api/client";
import Layout from "../components/Layout";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { formatTimeAgo } from "../utils/time";

type EditDraft = { name: string };

export default function MyLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const listsData: List[] = await apiFetch("/lists");
      setLists(listsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
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
      const newList: List = await apiFetch("/lists", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setLists((prev) => [...prev, newList]);
      setAddName("");
    } catch (err: any) {
      setError(err.message || "Failed to add list");
    } finally {
      setAddSaving(false);
    }
  }

  function startEditing(list: List) {
    setEditingId(list.id);
    setEditDraft({ name: list.name });
    setRowError(null);
  }

  function exitEditing() {
    setEditingId(null);
    setEditDraft(null);
    setRowError(null);
  }

  async function handleSave(listId: string) {
    const draft = editDraft!;
    const name = draft.name.trim();
    if (!name) return;
    const list = lists.find((l) => l.id === listId)!;

    setSaving(true);
    setRowError(null);
    try {
      await apiFetch(`/lists/${listId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          personId: list.personId ?? null,
          items: list.items,
        }),
      });
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, name } : l)),
      );
      exitEditing();
    } catch (err: any) {
      setRowError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(listId: string) {
    if (!window.confirm("Are you sure you want to delete this list?")) return;
    try {
      await apiFetch(`/lists/${listId}`, { method: "DELETE" });
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (err: any) {
      setError(err.message || "Failed to delete list");
    }
  }

  function handleSort() {
    if (sortKey === "name") {
      setSortOrder((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey("name");
      setSortOrder("asc");
    }
  }

  const sortedLists = [...lists].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    return sortOrder === "asc" ? cmp : -cmp;
  });

  return (
    <Layout>
      <PageLoader loading={loading} error={error}>
        {/* Add New List Form */}
        <form
          onSubmit={handleAdd}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            disabled={addSaving}
            placeholder="New list name"
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
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

        {/* Lists Table */}
        {lists.length === 0 ? (
          <p className="dark:text-gray-400">No lists found.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="table-fixed w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    className="px-4 py-2 text-left w-[72%] cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
                    onClick={handleSort}
                  >
                    List Name
                    {sortKey === "name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 inline m-2" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 inline m-2" />
                      ))}{" "}
                  </th>
                  <th className="px-4 py-2 text-center w-[28%] dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                {sortedLists.map((list) => {
                  const isEditing = editingId === list.id;
                  return (
                    <tr
                      key={list.id}
                      className={
                        !isEditing
                          ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                          : undefined
                      }
                      onClick={() => {
                        if (!isEditing) {
                          navigate(`/lists/${list.id}`, { state: { list } });
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
                            value={editDraft!.name}
                            onChange={(e) =>
                              setEditDraft((d) =>
                                d ? { ...d, name: e.target.value } : d,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(list.id);
                              if (e.key === "Escape") exitEditing();
                            }}
                            disabled={saving}
                            autoFocus
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600"
                          />
                        ) : (
                          <div className="flex flex-col justify-center">
                            <span className="font-medium dark:text-gray-100">
                              {list.name}
                            </span>
                            <div className="text-gray-400 dark:text-gray-500 text-tiny">
                              updated {formatTimeAgo(list.updatedAt)}
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
                                onClick={() => handleSave(list.id)}
                                disabled={saving || !editDraft?.name.trim()}
                                className={`px-3 py-1 rounded-md text-white ${
                                  saving || !editDraft?.name.trim()
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
                              onClick={() => startEditing(list)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                            </button>
                            <button
                              onClick={() => handleDelete(list.id)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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
      </PageLoader>
    </Layout>
  );
}
