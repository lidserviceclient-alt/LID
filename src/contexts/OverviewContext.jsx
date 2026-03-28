import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { backofficeApi } from "../services/api.js";

const OverviewContext = createContext(null);

function getOverviewKey(days) {
  if (days === null || days === undefined || `${days}`.trim() === "") {
    return "default";
  }
  return `${days}`;
}

export function OverviewProvider({ children }) {
  const [entries, setEntries] = useState({});
  const entriesRef = useRef({});
  const inflightRef = useRef(new Map());

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const loadOverview = useCallback(async (days, { force = false } = {}) => {
    const key = getOverviewKey(days);
    const existing = entriesRef.current[key];

    if (!force && existing?.data) {
      return existing.data;
    }

    if (!force && inflightRef.current.has(key)) {
      return inflightRef.current.get(key);
    }

    setEntries((prev) => ({
      ...prev,
      [key]: {
        data: prev[key]?.data || null,
        error: "",
        loading: true,
        lastUpdatedAt: prev[key]?.lastUpdatedAt || null
      }
    }));

    const pending = backofficeApi
      .overview(days)
      .then((data) => {
        setEntries((prev) => ({
          ...prev,
          [key]: {
            data: data || null,
            error: "",
            loading: false,
            lastUpdatedAt: new Date().toISOString()
          }
        }));
        return data;
      })
      .catch((err) => {
        setEntries((prev) => ({
          ...prev,
          [key]: {
            data: prev[key]?.data || null,
            error: err?.message || "Impossible de charger l'overview.",
            loading: false,
            lastUpdatedAt: prev[key]?.lastUpdatedAt || null
          }
        }));
        throw err;
      })
      .finally(() => {
        inflightRef.current.delete(key);
      });

    inflightRef.current.set(key, pending);
    return pending;
  }, []);

  const getOverviewEntry = useCallback(
    (days) => {
      const key = getOverviewKey(days);
      return entries[key] || { data: null, error: "", loading: false, lastUpdatedAt: null };
    },
    [entries]
  );

  const value = useMemo(
    () => ({
      loadOverview,
      getOverviewEntry
    }),
    [getOverviewEntry, loadOverview]
  );

  return <OverviewContext.Provider value={value}>{children}</OverviewContext.Provider>;
}

export function useOverviewContext() {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error("useOverviewContext must be used within an OverviewProvider.");
  }
  return context;
}
