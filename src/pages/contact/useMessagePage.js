import { useCallback, useEffect, useRef, useState } from "react";
import { backofficeApi } from "../../services/api.js";

/**
 * Page de messages filtrée côté serveur. Les réponses obsolètes (filtre changé entre-temps) sont ignorées.
 * `filters` : { direction, handling, status, q }.
 */
export function useMessagePage({ page, size = 20, filters }) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const seq = useRef(0);
  const key = JSON.stringify({ page, size, filters });

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const { page: p, size: sz, filters: f } = JSON.parse(key);
      const data = await backofficeApi.messages(p, sz, f);
      if (mine === seq.current) setState({ data, loading: false, error: "" });
    } catch (e) {
      if (mine === seq.current) setState((s) => ({ ...s, loading: false, error: e?.message || "Impossible de charger les messages." }));
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const items = Array.isArray(state.data?.content) ? state.data.content : [];
  return {
    items,
    totalPages: Number(state.data?.totalPages) || 0,
    totalElements: Number(state.data?.totalElements) || 0,
    loading: state.loading,
    error: state.error,
    reload: load
  };
}
