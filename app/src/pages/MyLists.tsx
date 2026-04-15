import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { List } from "../models/List";
import type { Person } from "../models/Person";
import { apiFetch } from "../api/client";
import Layout from "../components/Layout";
import PersonTypeahead from "../components/PersonTypeahead";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

type EditDraft = { name: string; personName: string };

export default function MyLists() {
    const [lists, setLists] = useState<List[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
    const [saving, setSaving] = useState(false);
    const [rowError, setRowError] = useState<string | null>(null);
    const [addName, setAddName] = useState('');
    const [addSaving, setAddSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            const [listsData, personsData]: [List[], Person[]] = await Promise.all([
                apiFetch('/lists'),
                apiFetch('/persons'),
            ]);
            setLists(listsData);
            setPersons(personsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
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
            const newList: List = await apiFetch('/lists', {
                method: 'POST',
                body: JSON.stringify({ name: trimmed }),
            });
            setLists((prev) => [...prev, newList]);
            setAddName('');
        } catch (err: any) {
            setError(err.message || 'Failed to add list');
        } finally {
            setAddSaving(false);
        }
    }

    function startEditing(list: List) {
        const personName = list.personId
            ? (persons.find(p => p.id === list.personId)?.name ?? '')
            : '';
        setEditingId(list.id);
        setEditDraft({ name: list.name, personName });
        setRowError(null);
    }

    function exitEditing() {
        setEditingId(null);
        setEditDraft(null);
        setRowError(null);
    }

    async function handleSave(listId: string) {
        const draft = editDraft!;
        if (!draft.name.trim()) return;
        const list = lists.find(l => l.id === listId)!;

        setSaving(true);
        setRowError(null);
        try {
            // Resolve person
            let personId: string | null = null;
            const trimmedPerson = draft.personName.trim();
            if (trimmedPerson) {
                const match = persons.find(p => p.name.toLowerCase() === trimmedPerson.toLowerCase());
                if (match) {
                    personId = match.id;
                } else {
                    const newPerson: Person = await apiFetch('/persons', {
                        method: 'POST',
                        body: JSON.stringify({ name: trimmedPerson }),
                    });
                    personId = newPerson.id;
                    setPersons(prev => [...prev, newPerson]);
                }
            }

            const name = draft.name.trim();
            await apiFetch(`/lists/${listId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, personId, items: list.items }),
            });
            setLists(prev => prev.map(l =>
                l.id === listId ? { ...l, name, personId: personId ?? undefined } : l
            ));
            exitEditing();
        } catch (err: any) {
            setRowError(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(listId: string) {
        if (!window.confirm('Are you sure you want to delete this list?')) return;
        try {
            await apiFetch(`/lists/${listId}`, { method: 'DELETE' });
            setLists(prev => prev.filter(l => l.id !== listId));
        } catch (err: any) {
            setError(err.message || 'Failed to delete list');
        }
    }

    const personMap = Object.fromEntries(persons.map(p => [p.id, p.name]));

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">My Lists</h1>

            {loading && <p>Loading lists...</p>}
            {error && <p className="text-red-500 mb-2">{error}</p>}

            {/* Add New List Form */}
            <form onSubmit={handleAdd} className="mb-4 inline-flex items-center space-x-2">
                <input
                    type="text"
                    value={addName}
                    onChange={e => setAddName(e.target.value)}
                    disabled={addSaving}
                    placeholder="New list name"
                    className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={addSaving || !addName.trim()}
                    className={`px-3 py-1 rounded-md text-white ${
                        addSaving || !addName.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
                    }`}
                >
                    Add
                </button>
            </form>

            {/* Lists Table */}
            {!loading && lists.length === 0 ? (
                <p>No lists found.</p>
            ) : (
                <div className="max-w-4xl mx-auto overflow-x-auto mt-6">
                    <table className="table-fixed w-full border border-gray-200 divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left w-[32%]">List Name</th>
                                <th className="px-4 py-2 text-center w-[8%]">Items</th>
                                <th className="px-4 py-2 text-left w-[32%]">Person</th>
                                <th className="px-4 py-2 text-center w-[28%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-300">
                            {lists.map((list) => {
                                const isEditing = editingId === list.id;
                                return (
                                    <tr
                                        key={list.id}
                                        className={!isEditing ? 'cursor-pointer hover:bg-gray-50' : undefined}
                                        onClick={() => {
                                            if (!isEditing) {
                                                navigate(`/lists/${list.id}`, { state: { list } });
                                            }
                                        }}
                                    >
                                        <td
                                            className="px-4 py-2 align-middle"
                                            onClick={isEditing ? e => e.stopPropagation() : undefined}
                                        >
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editDraft!.name}
                                                    onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)}
                                                    disabled={saving}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                                />
                                            ) : (
                                                <span className="font-medium">{list.name}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center align-middle">{list.items.length}</td>
                                        <td
                                            className="px-4 py-2 align-middle"
                                            onClick={isEditing ? e => e.stopPropagation() : undefined}
                                        >
                                            {isEditing ? (
                                                <PersonTypeahead
                                                    persons={persons}
                                                    value={editDraft!.personName}
                                                    onChange={personName => setEditDraft(d => d ? { ...d, personName } : d)}
                                                    disabled={saving}
                                                />
                                            ) : (
                                                <span>{list.personId ? (personMap[list.personId] ?? '—') : '—'}</span>
                                            )}
                                        </td>
                                        <td
                                            className="px-4 py-2 align-middle"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {isEditing ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSave(list.id)}
                                                            disabled={saving || !editDraft?.name.trim()}
                                                            className={`px-3 py-1 rounded-md text-white ${
                                                                saving || !editDraft?.name.trim()
                                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                                    : 'bg-blue-500 hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={exitEditing}
                                                            disabled={saving}
                                                            className={`px-3 py-1 rounded-md text-white ${
                                                                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-500'
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
                                                        className="p-1 rounded hover:bg-gray-100"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(list.id)}
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