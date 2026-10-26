import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

export function useNotificationPreferences() {
  const [notificationPrefs, setNotificationPrefs] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState("");

  useSettingsSeed("notificationPreferences", {
    apply: (list) => setNotificationPrefs(Array.isArray(list) ? list : []),
    setLoading: setNotificationLoading,
    setError: setNotificationError
  });

  async function loadNotificationPreferences() {
    try {
      setNotificationLoading(true);
      setNotificationError("");
      const list = await backofficeApi.notificationPreferences();
      const next = Array.isArray(list) ? list : [];
      setNotificationPrefs(next);
      patchSettingsResolver({ notificationPreferences: next });
    } catch (err) {
      setNotificationPrefs([]);
      setNotificationError(err?.message || "Impossible de charger les notifications.");
    } finally {
      setNotificationLoading(false);
    }
  }

  const toggleNotificationPref = (key) => {
    setNotificationPrefs((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map((p) => (p?.key === key ? { ...p, enabled: !Boolean(p.enabled) } : p));
    });
  };

  const saveNotificationPreferences = async () => {
    if (notificationSaving) return;
    setNotificationSaving(true);
    setNotificationError("");
    setNotificationSuccess("");
    try {
      const items = (notificationPrefs || [])
        .filter((p) => p?.key)
        .map((p) => ({ key: p.key, label: p.label, enabled: Boolean(p.enabled) }));
      const updated = await backofficeApi.updateNotificationPreferences({ items });
      if (Array.isArray(updated)) {
        setNotificationPrefs(updated);
        patchSettingsResolver({ notificationPreferences: updated });
      } else {
        await loadNotificationPreferences();
      }
      setNotificationSuccess("Notifications sauvegardées.");
    } catch (err) {
      setNotificationError(err?.message || "Impossible de sauvegarder les notifications.");
    } finally {
      setNotificationSaving(false);
    }
  };

  return {
    notificationPrefs,
    notificationLoading,
    notificationSaving,
    notificationError,
    notificationSuccess,
    loadNotificationPreferences,
    toggleNotificationPref,
    saveNotificationPreferences
  };
}
