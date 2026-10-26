import { useEffect, useState } from "react";
import { backofficeApi } from "../../../services/api.js";

const EMPTY_LOG_PAGE = { items: [], page: 0, size: 50, total: 0, totalPages: 0, hasMore: false };

/**
 * Monitoring serveur : logs applicatifs paginés (`/api/v1/backoffice/logs`), filtre, purge.
 */
export function useServerLogs() {
  const [logPage, setLogPage] = useState(EMPTY_LOG_PAGE);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");
  const [logQuery, setLogQuery] = useState("");
  const [logLevel, setLogLevel] = useState("IMPORTANT");
  const [logPurging, setLogPurging] = useState(false);
  const [expandedLogKeys, setExpandedLogKeys] = useState(() => new Set());

  const loadLogs = async ({ page = 0 } = {}) => {
    try {
      setLogLoading(true);
      setLogError("");
      const data = await backofficeApi.logs({
        page,
        size: 50,
        level: logLevel,
        q: logQuery
      });
      const items = Array.isArray(data?.content) ? data.content : [];
      setLogPage({
        items,
        page: Number(data?.number) || page,
        size: Number(data?.size) || 50,
        total: Number(data?.totalElements) || 0,
        totalPages: Number(data?.totalPages) || 0,
        hasMore: !Boolean(data?.last)
      });
    } catch (err) {
      setLogError(err?.message || "Impossible de charger les logs.");
      setLogPage(EMPTY_LOG_PAGE);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    loadLogs({ page: 0 });
    // Rechargement automatique uniquement au changement de niveau (comme avant) ;
    // la recherche texte s'applique via « Actualiser » ou Entrée.
  }, [logLevel]);

  const purgeLogs = async () => {
    if (logPurging) return;
    const confirm = window.confirm("Purger tous les logs applicatifs ?");
    if (!confirm) return;
    try {
      setLogPurging(true);
      setLogError("");
      await backofficeApi.purgeLogs();
      await loadLogs({ page: 0 });
    } catch (err) {
      setLogError(err?.message || "Impossible de purger les logs.");
    } finally {
      setLogPurging(false);
    }
  };

  const toggleLogDetails = (key) => {
    setExpandedLogKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return {
    logPage,
    logLoading,
    logError,
    logQuery,
    setLogQuery,
    logLevel,
    setLogLevel,
    logPurging,
    expandedLogKeys,
    loadLogs,
    purgeLogs,
    toggleLogDetails
  };
}
