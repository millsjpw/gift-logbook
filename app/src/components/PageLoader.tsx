import { useEffect, useState } from "react";

type PageLoaderProps = {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  /** Seconds before the "try refreshing" hint appears. Defaults to 10. */
  slowHintAfter?: number;
};

export default function PageLoader({
  loading,
  error,
  children,
  slowHintAfter = 10,
}: PageLoaderProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), slowHintAfter * 1000);
    return () => clearTimeout(t);
  }, [loading, slowHintAfter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
        <p className="animate-pulse text-base">Loading…</p>
        {slow && (
          <p className="text-sm text-gray-400">
            This is taking a while. Try{" "}
            <button
              onClick={() => window.location.reload()}
              className="underline hover:text-gray-600"
            >
              refreshing the page
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-600">
        <p className="text-base font-medium">Failed to load</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}
