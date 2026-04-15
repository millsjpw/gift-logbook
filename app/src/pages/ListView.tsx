import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import type { List } from "../models/List";
import { apiFetch } from "../api/client";
import Layout from "../components/Layout";

export default function ListView() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [list, setList] = useState<List | null>(location.state?.list ?? null);
    const [loading, setLoading] = useState(!location.state?.list);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!list) {
            fetchList();
        }
    }, [id]);

    async function fetchList() {
        setLoading(true);
        setError(null);
        try {
            const data: List = await apiFetch(`/lists/${id}`);
            setList(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load list');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Layout>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {list && (
                <>
                    <h1 className="text-2xl font-bold mb-4">{list.name}</h1>
                    {list.items.length === 0 ? (
                        <p>No items in this list yet.</p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {list.items.map((item) => (
                                <li key={item.id} className="px-4 py-2 border border-gray-200 rounded-md">
                                    {item.url ? (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {item.title}
                                        </a>
                                    ) : (
                                        <span>{item.title}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </Layout>
    );
}