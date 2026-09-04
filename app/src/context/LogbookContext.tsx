import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext";
import type { Logbook } from "../models/Logbook";

const STORAGE_KEY = "activeLogbookId";

type LogbookContextType = {
  logbooks: Logbook[];
  activeLogbookId: string | null;
  activeLogbook: Logbook | null;
  setActiveLogbookId: (id: string) => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const LogbookContext = createContext<LogbookContextType | null>(null);

export function LogbookProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [activeLogbookId, setActiveLogbookIdState] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    if (!isAuthenticated) {
      setLogbooks([]);
      setActiveLogbookIdState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data: Logbook[] = await apiFetch("/logbooks");
      setLogbooks(data);
      setActiveLogbookIdState((current) => {
        if (current && data.some((l) => l.id === current)) return current;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && data.some((l) => l.id === stored)) return stored;
        return data[0]?.id ?? null;
      });
    } catch {
      setLogbooks([]);
      setActiveLogbookIdState(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    // One-time load of the user's logbooks once auth resolves, mirroring
    // AuthContext's own getMe() effect. refresh isn't memoized, so it's
    // deliberately left out of the deps array to avoid re-running on every
    // render — hence the exhaustive-deps suppression below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  function setActiveLogbookId(id: string) {
    setActiveLogbookIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // best-effort — private browsing / storage disabled
    }
  }

  const activeLogbook = logbooks.find((l) => l.id === activeLogbookId) ?? null;

  return (
    <LogbookContext.Provider
      value={{
        logbooks,
        activeLogbookId,
        activeLogbook,
        setActiveLogbookId,
        isLoading,
        refresh,
      }}
    >
      {children}
    </LogbookContext.Provider>
  );
}

export function useLogbook(): LogbookContextType {
  const ctx = useContext(LogbookContext);
  if (!ctx) {
    throw new Error("useLogbook must be used within a LogbookProvider");
  }
  return ctx;
}
