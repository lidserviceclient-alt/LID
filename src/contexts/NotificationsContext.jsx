import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { backofficeApi } from "../services/api.js";
import { subscribeBackofficeRealtime } from "../services/realtime.js";

const NotificationsContext = createContext(null);
const NOTIFICATIONS_LAST_SEEN_KEY = "lid_backoffice_notifications_last_seen";

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const realtimeRefreshTimerRef = useRef(null);

  const markNotificationsSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    const now = new Date().toISOString();
    window.localStorage.setItem(NOTIFICATIONS_LAST_SEEN_KEY, now);
    setHasUnreadNotifications(false);
    setUnreadNotificationsCount(0);
  }, []);

  const refreshNotificationsCount = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const since = window.localStorage.getItem(NOTIFICATIONS_LAST_SEEN_KEY) || "";
      const count = await backofficeApi.notificationsCount(since);
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
      markNotificationsSeen();
      return list;
    } catch (err) {
      setNotificationsError(err?.message || "Impossible de charger les notifications.");
      throw err;
    } finally {
      setNotificationsLoading(false);
    }
  }, [markNotificationsSeen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(NOTIFICATIONS_LAST_SEEN_KEY);
    if (!existing) {
      window.localStorage.setItem(NOTIFICATIONS_LAST_SEEN_KEY, new Date().toISOString());
    }
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
      refreshNotificationsCount,
      markNotificationsSeen
    }),
    [
      hasUnreadNotifications,
      loadNotifications,
      markNotificationsSeen,
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
