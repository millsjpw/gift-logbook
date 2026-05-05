import { useState } from 'react';
import { TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { ListItem } from '../models/ListItem';

type ListItemCardProps = {
    item: ListItem;
    onDelete: (itemId: string) => void;
    onEdit: (itemId: string, title: string, url: string) => Promise<void>;
};

export default function ListItemCard({ item, onDelete, onEdit }: ListItemCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [titleDraft, setTitleDraft] = useState('');
    const [urlDraft, setUrlDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    function startEdit() {
        setTitleDraft(item.title);
        setUrlDraft(item.url ?? '');
        setEditError(null);
        setIsEditing(true);
    }

    function cancelEdit() {
        setIsEditing(false);
        setEditError(null);
    }

    async function saveEdit() {
        const trimmedTitle = titleDraft.trim();
        if (!trimmedTitle) return;
        setSaving(true);
        setEditError(null);
        try {
            await onEdit(item.id, trimmedTitle, urlDraft.trim());
            setIsEditing(false);
        } catch (err: any) {
            setEditError(err.message || 'Failed to save item');
        } finally {
            setSaving(false);
        }
    }

    if (isEditing) {
        return (
            <div className="px-4 py-3 border border-blue-300 rounded-md bg-white">
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        disabled={saving}
                        placeholder="Item title"
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <input
                        type="url"
                        value={urlDraft}
                        onChange={e => setUrlDraft(e.target.value)}
                        disabled={saving}
                        placeholder="URL (optional)"
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {editError && <p className="text-red-600 text-sm">{editError}</p>}
                    <div className="flex gap-2">
                        <button
                            onClick={saveEdit}
                            disabled={saving || !titleDraft.trim()}
                            className="p-1 rounded hover:bg-gray-100 disabled:text-gray-300"
                            aria-label="Save item"
                        >
                            <CheckIcon className="h-5 w-5 text-blue-500" />
                        </button>
                        <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1 rounded hover:bg-gray-100"
                            aria-label="Cancel edit"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative px-4 py-3 border border-gray-200 rounded-md bg-white">
            <div className="absolute top-3 right-2 flex gap-1">
                <button
                    onClick={startEdit}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Edit item"
                >
                    <PencilSquareIcon className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Delete item"
                >
                    <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                </button>
            </div>

            <div className="pr-16">
                {item.url ? (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {item.title}
                    </a>
                ) : (
                    <span className="font-medium">{item.title}</span>
                )}

                {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map(tag => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
