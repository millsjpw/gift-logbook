import { Fragment, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import PersonTypeahead from "../components/PersonTypeahead";
import DatePickerInput from "../components/DatePickerInput";
import TagInput from "../components/TagInput";
import TagBadge from "../components/TagBadge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { GiftRecord } from "../models/GiftRecord";
import type { Person } from "../models/Person";
import type { CalendarDate } from "@internationalized/date";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

type SortKey = "date" | "itemText" | "amount" | "updatedAt";
type SortOrder = "asc" | "desc";
type EditDraft = {
  itemText: string;
  amount: string;
  date: CalendarDate | null;
  tags: string[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function calendarDateToISO(date: CalendarDate): string {
  const m = String(date.month).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  return `${date.year}-${m}-${d}T12:00:00.000Z`;
}

function isoToCalendarDate(iso: string): CalendarDate | null {
  try {
    return parseDate(iso.slice(0, 10));
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: string | null): string {
  if (!amount) return "—";
  return `$${parseFloat(amount).toFixed(2)}`;
}

export default function Logbook() {
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [addItemText, setAddItemText] = useState("");
  const [addPersonName, setAddPersonName] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDate, setAddDate] = useState<CalendarDate | null>(
    today(getLocalTimeZone()),
  );
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addTags, setAddTags] = useState<string[]>([]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    itemText: "",
    amount: "",
    date: null,
    tags: [],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const personMap = useMemo(
    () => new Map(persons.map((p) => [p.id, p.name])),
    [persons],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [recordsData, personsData] = await Promise.all([
          apiFetch("/records"),
          apiFetch("/persons"),
        ]);
        setRecords(recordsData);
        setPersons(personsData);
      } catch (err: any) {
        setError(err.message || "Failed to load logbook");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedText = addItemText.trim();
    const trimmedPerson = addPersonName.trim();
    if (!trimmedText || !trimmedPerson) return;
    setAddSaving(true);
    setAddError(null);
    try {
      let personId: string;
      const match = persons.find(
        (p) => p.name.toLowerCase() === trimmedPerson.toLowerCase(),
      );
      if (match) {
        personId = match.id;
      } else {
        const newPerson: Person = await apiFetch("/persons", {
          method: "POST",
          body: JSON.stringify({ name: trimmedPerson }),
        });
        setPersons((prev) => [...prev, newPerson]);
        personId = newPerson.id;
      }

      const newRecord: GiftRecord = await apiFetch("/records", {
        method: "POST",
        body: JSON.stringify({
          personId,
          itemText: trimmedText,
          amount: addAmount ? parseFloat(addAmount) : undefined,
          date: addDate ? calendarDateToISO(addDate) : new Date().toISOString(),
          tags: addTags,
        }),
      });
      setRecords((prev) => [newRecord, ...prev]);
      setAddItemText("");
      setAddPersonName("");
      setAddAmount("");
      setAddDate(today(getLocalTimeZone()));
      setAddTags([]);
    } catch (err: any) {
      setAddError(err.message || "Failed to add record");
    } finally {
      setAddSaving(false);
    }
  }

  function startEditing(record: GiftRecord) {
    setEditingId(record.id);
    setEditDraft({
      itemText: record.itemText,
      amount: record.amount ?? "",
      date: isoToCalendarDate(record.date),
      tags: record.tags.map((t) => t.name),
    });
    setRowError(null);
  }

  function exitEditing() {
    setEditingId(null);
    setEditDraft({ itemText: "", amount: "", date: null, tags: [] });
    setRowError(null);
  }

  async function handleSave(id: string) {
    const trimmed = editDraft.itemText.trim();
    if (!trimmed) return;
    setEditSaving(true);
    setRowError(null);
    try {
      const body: Record<string, unknown> = {
        itemText: trimmed,
        amount: editDraft.amount !== "" ? parseFloat(editDraft.amount) : null,
        tags: editDraft.tags,
      };
      if (editDraft.date) {
        body.date = calendarDateToISO(editDraft.date);
      }
      const updated: GiftRecord = await apiFetch(`/records/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      exitEditing();
    } catch (err: any) {
      setRowError(err.message || "Failed to update record");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await apiFetch(`/records/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  }

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const mult = sortOrder === "asc" ? 1 : -1;
      switch (sortKey) {
        case "date":
        case "updatedAt":
          return (
            mult *
            (a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0)
          );
        case "itemText":
          return mult * a.itemText.localeCompare(b.itemText);
        case "amount": {
          const aAmt = parseFloat(a.amount ?? "0");
          const bAmt = parseFloat(b.amount ?? "0");
          return mult * (aAmt - bAmt);
        }
        default:
          return 0;
      }
    });
  }, [records, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageRecords = sortedRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function SortIcon({ colKey }: { colKey: SortKey }) {
    if (sortKey !== colKey)
      return <ArrowDownIcon className="h-3 w-3 text-gray-300 inline ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUpIcon className="h-3 w-3 text-blue-500 inline ml-1" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-blue-500 inline ml-1" />
    );
  }

  return (
    <Layout>
      <PageLoader loading={loading} error={error}>
        {/* Add Record Form */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">Item *</label>
                <input
                  type="text"
                  value={addItemText}
                  onChange={(e) => setAddItemText(e.target.value)}
                  disabled={addSaving}
                  placeholder="What did you give?"
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700 w-48"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">For *</label>
                <PersonTypeahead
                  persons={persons}
                  value={addPersonName}
                  onChange={setAddPersonName}
                  disabled={addSaving}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  disabled={addSaving}
                  placeholder="0.00"
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700 w-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">Date</label>
                <DatePickerInput
                  value={addDate}
                  onChange={setAddDate}
                  isDisabled={addSaving}
                />
              </div>
              <button
                type="submit"
                disabled={
                  addSaving || !addItemText.trim() || !addPersonName.trim()
                }
                className={`px-3 py-1.5 rounded-md text-white self-end ${
                  addSaving || !addItemText.trim() || !addPersonName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                Add Record
              </button>
            </div>
            <TagInput
              tags={addTags}
              onChange={setAddTags}
              disabled={addSaving}
            />
          </div>
          {addError && <p className="text-red-600 text-sm mt-1">{addError}</p>}
        </form>

        {/* Table */}
        {records.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No records yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="text-left">
                    <th
                      className="px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap dark:text-gray-200"
                      onClick={() => toggleSort("date")}
                    >
                      Date <SortIcon colKey="date" />
                    </th>
                    <th
                      className="px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap dark:text-gray-200"
                      onClick={() => toggleSort("itemText")}
                    >
                      Item <SortIcon colKey="itemText" />
                    </th>
                    <th className="px-4 py-2 font-semibold whitespace-nowrap dark:text-gray-200">
                      For
                    </th>
                    <th
                      className="px-4 py-2 font-semibold cursor-pointer select-none whitespace-nowrap dark:text-gray-200"
                      onClick={() => toggleSort("amount")}
                    >
                      Amount <SortIcon colKey="amount" />
                    </th>
                    <th className="px-4 py-2 font-semibold text-center whitespace-nowrap dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                  {pageRecords.map((record) => {
                    const isEditing = editingId === record.id;
                    const personName =
                      personMap.get(record.personId ?? "") ?? "—";
                    return (
                      <Fragment key={record.id}>
                        <tr
                          className={
                            isEditing ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-600"
                          }
                        >
                          <td className="px-4 py-2 align-middle">
                            {isEditing ? (
                              <DatePickerInput
                                value={editDraft.date}
                                onChange={(d) =>
                                  setEditDraft((prev) => ({ ...prev, date: d }))
                                }
                                isDisabled={editSaving}
                              />
                            ) : (
                              <span className="whitespace-nowrap dark:text-gray-200">
                                {formatDate(record.date)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDraft.itemText}
                                onChange={(e) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    itemText: e.target.value,
                                  }))
                                }
                                disabled={editSaving}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600 w-full min-w-36"
                              />
                            ) : (
                              <div>
                                <span className="font-medium dark:text-gray-100">
                                  {record.itemText}
                                </span>
                                {record.tags.length > 0 && (
                                  <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                                    {record.tags.slice(0, 3).map((t) => (
                                      <TagBadge
                                        key={t.id}
                                        name={t.name}
                                        color={t.color}
                                        className="shrink-0 max-w-[6rem] truncate"
                                      />
                                    ))}
                                    {record.tags.length > 3 && (
                                      <span className="shrink-0 text-gray-400 text-xs">
                                        +{record.tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle dark:text-gray-200">
                            {personName}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editDraft.amount}
                                onChange={(e) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    amount: e.target.value,
                                  }))
                                }
                                disabled={editSaving}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600 w-28"
                              />
                            ) : (
                              <span className="dark:text-gray-200">{formatAmount(record.amount)}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            {isEditing ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleSave(record.id)}
                                    disabled={
                                      editSaving || !editDraft.itemText.trim()
                                    }
                                    className={`px-3 py-1 rounded-md text-white ${
                                      editSaving || !editDraft.itemText.trim()
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-700"
                                    }`}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={exitEditing}
                                    disabled={editSaving}
                                    className={`px-3 py-1 rounded-md text-white ${
                                      editSaving
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gray-400 hover:bg-gray-500"
                                    }`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {rowError && (
                                  <p className="text-red-600 text-sm">
                                    {rowError}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => startEditing(record)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(record.id)}
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {isEditing && (
                          <tr className="bg-blue-50 dark:bg-blue-900/30">
                            <td colSpan={5} className="px-4 pb-3">
                              <TagInput
                                tags={editDraft.tags}
                                onChange={(t) =>
                                  setEditDraft((prev) => ({ ...prev, tags: t }))
                                }
                                disabled={editSaving}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:hover:bg-white dark:disabled:hover:bg-transparent"
                >
                  Previous
                </button>
                <span>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:hover:bg-white dark:disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
              <span className="text-gray-400 dark:text-gray-500">
                {sortedRecords.length} record
                {sortedRecords.length !== 1 ? "s" : ""} total
              </span>
            </div>
          </>
        )}
      </PageLoader>
    </Layout>
  );
}
