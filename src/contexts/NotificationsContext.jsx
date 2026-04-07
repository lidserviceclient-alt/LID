import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { backofficeApi } from "../services/api.js";
import { subscribeBackofficeRealtime } from "../services/realtime.js";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const realtimeRefreshTimerRef = useRef(null);

  const refreshNotificationsCount = useCallback(async () => {
    try {
      const count = await backofficeApi.notificationsCount();
      const next = Number(count) || 0;
      setUnreadNotificationsCount(next);
      setHasUnreadNotifications(next > 0);
    } catch {
      setHasUnreadNotifications(false);
      setUnreadNotificationsCount(0);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const data = await backofficeApi.notifications(0, 20);
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setNotifications(list);
      await backofficeApi.readAllNotifications();
      setHasUnreadNotifications(false);
      setUnreadNotificationsCount(0);
      return list;
    } catch (err) {
      setNotificationsError(err?.message || "Impossible de charger les notifications.");
      throw err;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotificationsCount();
  }, [refreshNotificationsCount]);

  useEffect(() => {
    const unsubscribe = subscribeBackofficeRealtime((event) => {
      if (event?.topic !== "backoffice.notifications.count.updated") {
        return;
      }
      if (realtimeRefreshTimerRef.current) {
        return;
      }
      realtimeRefreshTimerRef.current = window.setTimeout(() => {
        realtimeRefreshTimerRef.current = null;
        refreshNotificationsCount().catch(() => {});
      }, 500);
    }, ["backoffice.notifications.count.updated"]);

    return () => {
      if (realtimeRefreshTimerRef.current) {
        window.clearTimeout(realtimeRefreshTimerRef.current);
        realtimeRefreshTimerRef.current = null;
      }
      unsubscribe();
    };
  }, [refreshNotificationsCount]);

  const value = useMemo(
    () => ({
      notifications,
      notificationsLoading,
      notificationsError,
      hasUnreadNotifications,
      unreadNotificationsCount,
      loadNotifications,
      refreshNotificationsCount
    }),
    [
      hasUnreadNotifications,
      loadNotifications,
      notifications,
      notificationsError,
      notificationsLoading,
      refreshNotificationsCount,
      unreadNotificationsCount
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsContext must be used within a NotificationsProvider.");
  }
  return context;
}
