import { useEffect, useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const LAST_EXPORT_STORAGE_KEY = "lid_backoffice_security_last_export_at";

/**
 * 2FA administrateurs + export CSV de l'activité de sécurité.
 */
export function useSecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({ admin2faEnabled: true });
  const [admin2faDraft, setAdmin2faDraft] = useState(true);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityExporting, setSecurityExporting] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityLastExportAt, setSecurityLastExportAt] = useState(() => {
    try {
      const raw = localStorage.getItem(LAST_EXPORT_STORAGE_KEY);
      return raw ? raw : "";
    } catch {
      return "";
    }
  });

  useSettingsSeed("security", {
    apply: (value) => setSecuritySettings(value || { admin2faEnabled: true }),
    setLoading: setSecurityLoading,
    setError: setSecurityError
  });

  // Le brouillon (interrupteur) repart de la valeur enregistrée à chaque mise à jour serveur.
  useEffect(() => {
    setAdmin2faDraft(Boolean(securitySettings?.admin2faEnabled));
  }, [securitySettings]);

  const saveSecuritySettings = async (e) => {
    e?.preventDefault?.();
    if (securitySaving) return;
    setSecuritySaving(true);
    setSecurityError("");
    setSecuritySuccess("");
    try {
      const updated = await backofficeApi.updateSecuritySettings({
        admin2faEnabled: Boolean(admin2faDraft)
      });
      const next = { admin2faEnabled: Boolean(updated?.admin2faEnabled) };
      setSecuritySettings(next);
      patchSettingsResolver({ security: next });
      setSecuritySuccess("Sécurité enregistrée.");
    } catch (err) {
      setSecurityError(err?.message || "Impossible d’enregistrer la sécurité.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const exportSecurityActivity = async () => {
    if (securityExporting) return;
    setSecurityExporting(true);
    setSecurityError("");
    try {
      const blob = await backofficeApi.securityActivityExportCsv(500);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "security-activity.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const now = new Date().toISOString();
      setSecurityLastExportAt(now);
      try {
        localStorage.setItem(LAST_EXPORT_STORAGE_KEY, now);
      } catch {}
    } catch (err) {
      setSecurityError(err?.message || "Impossible d'exporter les logs.");
    } finally {
      setSecurityExporting(false);
    }
  };

  return {
    securitySettings,
    admin2faDraft,
    setAdmin2faDraft,
    admin2faDirty: Boolean(admin2faDraft) !== Boolean(securitySettings?.admin2faEnabled),
    securityLoading,
    securitySaving,
    securityExporting,
    securityError,
    securitySuccess,
    securityLastExportAt,
    saveSecuritySettings,
    exportSecurityActivity
  };
}
