import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { formatTimeAgo } from "../utils/time";
import Layout from "../components/Layout";
import PersonForm from "../components/PersonForm";
import { ArrowDownIcon, ArrowUpIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

type Person = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    meta?: [];
};

type SortKey = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function MyPeople() {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    useEffect(() => {
        fetchPeople();
    }, []);

    async function fetchPeople() {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch('/persons');
            setPeople(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load people');
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(name: string) {
        try {
            const newPerson = await apiFetch('/persons', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
            setPeople([...people, newPerson]);
        } catch (err: any) {
            setError(err.message || 'Failed to add person');
        }
    }

    async function handleUpdate(id: string, name: string) {
        try {
            await apiFetch(`/persons/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name }),
            });
            setPeople(people.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p));
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update person');
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Are you sure you want to delete this person?")) return;

        try {
            await apiFetch(`/persons/${id}`, { method: 'DELETE' });
            setPeople(people.filter(p => p.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete person');
        }
    }

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }

    const sortedPeople = [...people].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }
        return 0;
    });

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">My People</h1>

            {loading && <p>Loading people...</p>}
            {error && <p className="text-red-600 mb-2">{error}</p>}

            {/* Add New Person Form */}
            <div className="mb-4">
                <PersonForm onSave={handleAdd} />
            </div>

            {/* People List */}
            {people.length === 0 ? (
                <p>You haven't created any people yet.</p>
            ) : (
                <div className="mx-auto overflow-x-auto mt-6">
                    <table className="border border-gray-200 divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left w-3/4 cursor-pointer"
                                    onClick={() => toggleSort('name')}
                                >
                                    Name
                                    {sortKey === 'name' && (
                                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 inline m-2" /> : <ArrowDownIcon className="h-4 w-4 inline m-2" />
                                    )}
                                </th>
                                <th className="px-4 py-2 text-left w-1/4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-300">
                            {sortedPeople.map((person) => (
                                <tr key={person.id}>
                                    <td className="px-4 py-2 align-top">
                                        {editingId === person.id ? (
                                            <PersonForm
                                                initialName={person.name}
                                                onSave={(name) => handleUpdate(person.id, name)}
                                                onCancel={() => setEditingId(null)}
                                            />
                                        ) : (
                                            <div>
                                                <span className="font-medium">{person.name}</span>
                                                <div className="text-gray-400 text-xs">
                                                    updated {formatTimeAgo(person.updatedAt)}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 align-top">
                                        {editingId !== person.id && (
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => setEditingId(person.id)}
                                                    className="px-2 py-1 rounded"
                                                >
                                                    <PencilSquareIcon className="h-6 w-6 text-blue-500 hover:text-blue-700" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(person.id)}
                                                    className="px-2 py-1 rounded"
                                                >
                                                    <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
}