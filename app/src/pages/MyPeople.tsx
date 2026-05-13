import { Fragment, useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { formatTimeAgo } from "../utils/time";
import PageLoader from "../components/PageLoader";
import {
  calendarDateToFields,
  fieldsToCalendarDate,
  formatBirthday,
} from "../utils/birthdate";
import Layout from "../components/Layout";
import BirthdayPicker from "../components/BirthdayPicker";
import TagInput from "../components/TagInput";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { type Person } from "../models/Person";
import type { CalendarDate } from "@internationalized/date";

type SortKey = "name" | "updatedAt";
type SortOrder = "asc" | "desc";
type EditDraft = {
  name: string;
  birthday: CalendarDate | null;
  tags: string[];
};

export default function MyPeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addBirthday, setAddBirthday] = useState<CalendarDate | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [addTags, setAddTags] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    name: "",
    birthday: null,
    tags: [],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    setLoading(true);
    setError(null);
    try {
      const data: Person[] = await apiFetch("/persons");
      setPeople(data);
    } catch (err: any) {
      setError(err.message || "Failed to load people");
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
      const { birthMonth, birthDay, birthYear } =
        calendarDateToFields(addBirthday);
      const newPerson: Person = await apiFetch("/persons", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          birthMonth,
          birthDay,
          birthYear,
          tags: addTags,
        }),
      });
      setPeople((prev) => [...prev, newPerson]);
      setAddName("");
      setAddBirthday(null);
      setAddTags([]);
    } catch (err: any) {
      setError(err.message || "Failed to add person");
    } finally {
      setAddSaving(false);
    }
  }

  function startEditing(person: Person) {
    setEditingId(person.id);
    setEditDraft({
      name: person.name,
      birthday: fieldsToCalendarDate({
        birthMonth: person.birthMonth,
        birthDay: person.birthDay,
        birthYear: person.birthYear,
      }),
      tags: person.tags.map((t) => t.name),
    });
    setRowError(null);
  }

  function exitEditing() {
    setEditingId(null);
    setEditDraft({ name: "", birthday: null, tags: [] });
    setRowError(null);
  }

  async function handleSave(id: string) {
    const trimmed = editDraft.name.trim();
    if (!trimmed) return;
    setEditSaving(true);
    setRowError(null);
    try {
      const { birthMonth, birthDay, birthYear } = calendarDateToFields(
        editDraft.birthday,
      );
      const updated: Person = await apiFetch(`/persons/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: trimmed,
          birthMonth,
          birthDay,
          birthYear,
          tags: editDraft.tags,
        }),
      });
      setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)));
      exitEditing();
    } catch (err: any) {
      setRowError(err.message || "Failed to update person");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this person?")) return;

    try {
      await apiFetch(`/persons/${id}`, { method: "DELETE" });
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete person");
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  const sortedPeople = [...people].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  return (
    <Layout>
      <PageLoader loading={loading} error={error}>
        {/* Add New Person Form */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  disabled={addSaving}
                  placeholder="New person name"
                  className="w-48 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <BirthdayPicker
                  value={addBirthday}
                  onChange={setAddBirthday}
                  isDisabled={addSaving}
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
              </div>
              <TagInput
                tags={addTags}
                onChange={setAddTags}
                disabled={addSaving}
              />
            </div>
          </div>
        </form>

        {/* People List */}
        {people.length === 0 ? (
          <p>You haven't created any people yet.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="table-fixed w-full border border-gray-200 divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-2 text-left w-[45%] cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    {sortKey === "name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 inline m-2" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 inline m-2" />
                      ))}
                  </th>
                  <th className="px-4 py-2 text-left w-[30%]">Birthday</th>
                  <th className="px-4 py-2 text-center w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {sortedPeople.map((person) => {
                  const isEditing = editingId === person.id;
                  return (
                    <Fragment key={person.id}>
                      <tr className={isEditing ? "bg-blue-50" : ""}>
                        <td className="px-4 py-2 align-middle">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  name: e.target.value,
                                }))
                              }
                              disabled={editSaving}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          ) : (
                            <div className="flex flex-col justify-center">
                              <span className="font-medium">{person.name}</span>
                              <div className="text-gray-400 text-tiny">
                                updated {formatTimeAgo(person.updatedAt)}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 align-middle">
                          {isEditing ? (
                            <BirthdayPicker
                              value={editDraft.birthday}
                              onChange={(d) =>
                                setEditDraft((draft) => ({
                                  ...draft,
                                  birthday: d,
                                }))
                              }
                              isDisabled={editSaving}
                            />
                          ) : (
                            <span>
                              {formatBirthday({
                                birthMonth: person.birthMonth,
                                birthDay: person.birthDay,
                                birthYear: person.birthYear,
                              })}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 align-middle">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleSave(person.id)}
                                  disabled={
                                    editSaving || !editDraft.name.trim()
                                  }
                                  className={`px-3 py-1 rounded-md text-white ${
                                    editSaving || !editDraft.name.trim()
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
                            <div className="justify-center gap-2 flex">
                              <button
                                onClick={() => startEditing(person)}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                              </button>
                              <button
                                onClick={() => handleDelete(person.id)}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="bg-blue-50">
                          <td colSpan={3} className="px-4 pb-3">
                            <TagInput
                              tags={editDraft.tags}
                              onChange={(t) =>
                                setEditDraft((d) => ({ ...d, tags: t }))
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
        )}
      </PageLoader>
    </Layout>
  );
}
