import { useState } from 'react';

type PersonFormProps = {
    initialName?: string;
    onSave: (name: string) => Promise<void>;
    onCancel?: () => void;
};

export default function PersonForm({ initialName = '', onSave, onCancel }: PersonFormProps) {
    const [name, setName] = useState(initialName);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!name.trim()) return; // Don't allow empty names

        setSaving(true);
        try {
            await onSave(name.trim());
            setName('');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="inline-flex items-center space-x-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button 
                type="submit" 
                disabled={saving || !name.trim()}
                className={`px-3 py-1 rounded-md text-white ${
                    saving || !name.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                Save
            </button>
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className={`px-3 py-1 rounded-md text-white ${
                        saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                >
                    Cancel
                </button>
            )}
        </form>
    );
}