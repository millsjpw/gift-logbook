import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../api/client";
import type { FullExchange } from "../models/Exchanges";

export default function GiftExchangeView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [exchange, setExchange] = useState<FullExchange | null>(
    location.state?.exchange ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.exchange);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exchange) {
      fetchExchange();
    }
  }, [id]);

  async function fetchExchange() {
    setLoading(true);
    setError(null);
    try {
      const data: FullExchange = await apiFetch(`/exchanges/${id}`);
      setExchange(data);
    } catch (err: any) {
      setError(err.message || "Failed to load exchange");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {exchange && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">{exchange.exchange.name}</h1>
          <p className="text-gray-500">Exchange view coming soon.</p>
        </div>
      )}
    </Layout>
  );
}
