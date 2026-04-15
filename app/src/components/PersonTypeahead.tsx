import type { Person } from '../models/Person';

type PersonTypeaheadProps = {
    persons: Person[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export default function PersonTypeahead({ persons, value, onChange, disabled }: PersonTypeaheadProps) {
    return (
        <>
            <input
                type="text"
                list="person-typeahead-list"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <datalist id="person-typeahead-list">
                {persons.map(p => (
                    <option key={p.id} value={p.name} />
                ))}
            </datalist>
        </>
    );
}
