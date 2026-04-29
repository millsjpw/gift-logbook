import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import type { List } from "../models/List";
import type { Person } from "../models/Person";
import { apiFetch } from "../api/client";
import Layout from "../components/Layout";
import PersonTypeahead from "../components/PersonTypeahead";
import ListItemCard from "../components/ListItemCard";
import { PencilSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

type EditField = 'name' | 'person' | null;

export default function ListView() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [list, setList] = useState<List | null>(location.state?.list ?? null);
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(!location.state?.list);
    const [error, setError] = useState<string | null>(null);

    // Header edit state
    const [editField, setEditField] = useState<EditField>(null);
    const [nameDraft, setNameDraft] = useState('');
    const [personDraft, setPersonDraft] = useState('');
    const [headerSaving, setHeaderSaving] = useState(false);
    const [headerError, setHeaderError] = useState<string | null>(null);

    // Add item state
    const [addTitle, setAddTitle] = useState('');
    const [addUrl, setAddUrl] = useState('');
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const fetches: Promise<any>[] = [apiFetch('/persons')];
            if (!list) fetches.unshift(apiFetch(`/lists/${id}`));

            try {
                if (!list) {
                    setLoading(true);
                    const [listData, personsData] = await Promise.all(fetches);
                    setList(listData);
                    setPersons(personsData);
                } else {
                    const personsData = await apiFetch('/persons');
                    setPersons(personsData);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    function startEditName() {
        setNameDraft(list!.name);
        setHeaderError(null);
        setEditField('name');
    }

    function startEditPerson() {
        const current = list!.personId
            ? (persons.find(p => p.id === list!.personId)?.name ?? '')
            : '';
        setPersonDraft(current);
        setHeaderError(null);
        setEditField('person');
    }

    function cancelEdit() {
        setEditField(null);
        setHeaderError(null);
    }

    async function saveName() {
        const trimmed = nameDraft.trim();
        if (!trimmed || !list) return;
        setHeaderSaving(true);
        setHeaderError(null);
        try {
            await apiFetch(`/lists/${list.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: trimmed, personId: list.personId ?? null, items: list.items }),
            });
            setList(l => l ? { ...l, name: trimmed } : l);
            setEditField(null);
        } catch (err: any) {
            setHeaderError(err.message || 'Failed to update name');
        } finally {
            setHeaderSaving(false);
        }
    }

    async function savePerson() {
        if (!list) return;
        setHeaderSaving(true);
        setHeaderError(null);
        try {
            let personId: string | null = null;
            const trimmed = personDraft.trim();
            if (trimmed) {
                const match = persons.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
                if (match) {
                    personId = match.id;
                } else {
                    const newPerson: Person = await apiFetch('/persons', {
                        method: 'POST',
                        body: JSON.stringify({ name: trimmed }),
                    });
                    personId = newPerson.id;
                    setPersons(prev => [...prev, newPerson]);
                }
            }
            await apiFetch(`/lists/${list.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: list.name, personId, items: list.items }),
            });
            setList(l => l ? { ...l, personId: personId ?? undefined } : l);
            setEditField(null);
        } catch (err: any) {
            setHeaderError(err.message || 'Failed to update person');
        } finally {
            setHeaderSaving(false);
        }
    }

    async function handleAddItem(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmedTitle = addTitle.trim();
        if (!trimmedTitle || !list) return;
        setAddSaving(true);
        setAddError(null);
        try {
            const updatedList: List = await apiFetch(`/lists/${list.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: list.name,
                    personId: list.personId ?? null,
                    items: [...list.items, { title: trimmedTitle, url: addUrl.trim() || undefined }],
                }),
            });
            setList(updatedList);
            setAddTitle('');
            setAddUrl('');
        } catch (err: any) {
            setAddError(err.message || 'Failed to add item');
        } finally {
            setAddSaving(false);
        }
    }

    async function handleDeleteItem(itemId: string) {
        if (!list) return;
        try {
            await apiFetch(`/lists/${list.id}/items/${itemId}`, { method: 'DELETE' });
            setList(l => l ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l);
        } catch (err: any) {
            setError(err.message || 'Failed to delete item');
        }
    }

    const personName = list?.personId
        ? (persons.find(p => p.id === list.personId)?.name ?? null)
        : null;

    return (
        <Layout>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500 mb-2">{error}</p>}

            {list && (
                <div className="max-w-2xl mx-auto">
                    {/* List name */}
                    <div className="flex items-center gap-2 mb-1">
                        {editField === 'name' ? (
                            <>
                                <input
                                    type="text"
                                    value={nameDraft}
                                    onChange={e => setNameDraft(e.target.value)}
                                    disabled={headerSaving}
                                    className="text-2xl font-bold px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <button onClick={saveName} disabled={headerSaving || !nameDraft.trim()} className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300">
                                    <CheckIcon className="h-5 w-5 text-blue-500" />
                                </button>
                                <button onClick={cancelEdit} disabled={headerSaving} className="p-1 rounded hover:bg-gray-100">
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold">{list.name}</h1>
                                <button onClick={startEditName} className="p-1 rounded hover:bg-gray-100">
                                    <PencilSquareIcon className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Person */}
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                        {editField === 'person' ? (
                            <>
                                <span className="text-sm">For:</span>
                                <PersonTypeahead
                                    persons={persons}
                                    value={personDraft}
                                    onChange={setPersonDraft}
                                    disabled={headerSaving}
                                />
                                <button onClick={savePerson} disabled={headerSaving} className="p-1 rounded hover:bg-gray-100">
                                    <CheckIcon className="h-5 w-5 text-blue-500" />
                                </button>
                                <button onClick={cancelEdit} disabled={headerSaving} className="p-1 rounded hover:bg-gray-100">
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm">For: <span className="font-medium">{personName ?? '—'}</span></span>
                                <button onClick={startEditPerson} className="p-1 rounded hover:bg-gray-100">
                                    <PencilSquareIcon className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                                </button>
                            </>
                        )}
                    </div>

                    {headerError && <p className="text-red-600 text-sm mb-3">{headerError}</p>}

                    {/* Add item form */}
                    <form onSubmit={handleAddItem} className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="flex flex-col gap-1 flex-1">
                            <input
                                type="text"
                                placeholder="Item title"
                                value={addTitle}
                                onChange={e => setAddTitle(e.target.value)}
                                disabled={addSaving}
                                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <input
                                type="url"
                                placeholder="URL (optional)"
                                value={addUrl}
                                onChange={e => setAddUrl(e.target.value)}
                                disabled={addSaving}
                                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            {addError && <p className="text-red-600 text-sm">{addError}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={addSaving || !addTitle.trim()}
                            className={`px-3 py-1 rounded-md text-white self-start ${
                                addSaving || !addTitle.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
                            }`}
                        >
                            Add Item
                        </button>
                    </form>

                    {/* Items */}
                    {list.items.length === 0 ? (
                        <p className="text-gray-500">No items in this list yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {list.items.map(item => (
                                <ListItemCard
                                    key={item.id}
                                    item={item}
                                    onDelete={handleDeleteItem}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
