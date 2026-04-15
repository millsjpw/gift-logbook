import { TrashIcon } from '@heroicons/react/24/solid';
import type { ListItem } from '../models/ListItem';

type ListItemCardProps = {
    item: ListItem;
    onDelete: (itemId: string) => void;
};

export default function ListItemCard({ item, onDelete }: ListItemCardProps) {
    return (
        <div className="relative px-4 py-3 border border-gray-200 rounded-md bg-white">
            <button
                onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                aria-label="Delete item"
            >
                <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
            </button>

            <div className="pr-8">
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
