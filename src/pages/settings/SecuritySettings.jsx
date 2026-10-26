import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Toggle from "../../components/ui/Toggle.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import { useSecuritySettings } from "./hooks/useSecuritySettings.js";
import { useServerLogs } from "./hooks/useServerLogs.js";

const LOG_LEVEL_OPTIONS = [
  { value: "IMPORTANT", label: "Erreurs + alertes" },
  { value: "ERROR", label: "ERROR" },
  { value: "WARN", label: "WARN" },
  { value: "INFO", label: "INFO" },
  { value: "DEBUG", label: "DEBUG" },
  { value: "", label: "Tous niveaux" }
];

const formatLastExport = (value) => {
  if (!value) return "Aucun export";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Aucun export";
  return `Dernier export ${new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d)}`;
};

const formatLogTimestamp = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" });
};

const logEntryKey = (entry, index) => `${entry?.timestamp || "log"}-${entry?.level || "level"}-${index}`;

const logLevelVariant = (level) =>
  level === "ERROR" ? "destructive" : level === "WARN" ? "warning" : level === "INFO" ? "success" : "outline";

const copyLogEntry = async (entry) => {
  const text = entry?.raw || entry?.message || "";
  if (!text) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    // The copy action is best-effort and must not block log inspection.
  }
};

export default function SecuritySettings() {
  return (
    <>
      <AccessSecurityCard />
      <ServerLogsCard />
    </>
  );
}

function AccessSecurityCard() {
  const {
    securitySettings,
    admin2faDraft,
    setAdmin2faDraft,
    admin2faDirty,
    securityLoading,
    securitySaving,
    securityExporting,
    securityError,
    securitySuccess,
    securityLastExportAt,
    saveSecuritySettings,
    exportSecurityActivity
  } = useSecuritySettings();

  return (
    <SettingsCard title="Accès et activité" description="Double authentification des administrateurs et journal d’activité.">
      <SettingsStatus error={securityError} success={securitySuccess} />

      <form
        onSubmit={saveSecuritySettings}
        className="flex flex-col gap-3 rounded-lg border border-input bg-background/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <Toggle
            label="Authentification double facteur (2FA admin)"
            checked={Boolean(admin2faDraft)}
            onChange={setAdmin2faDraft}
            disabled={securityLoading || securitySaving}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Code envoyé par email à la connexion des comptes ADMIN / SUPER_ADMIN.{" "}
            {securityLoading
              ? "Chargement…"
              : securitySettings?.admin2faEnabled
                ? "Actuellement activée pour les admins."
                : "Actuellement désactivée."}
          </p>
        </div>
        <Button type="submit" disabled={securityLoading || securitySaving || !admin2faDirty}>
          {securitySaving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>

      <div className="flex flex-col gap-3 rounded-lg border border-input bg-background/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Logs d’activité (CSV)</p>
          <p className="text-xs text-muted-foreground">{formatLastExport(securityLastExportAt)} · 500 entrées max.</p>
        </div>
        <Button variant="outline" onClick={exportSecurityActivity} disabled={securityExporting}>
          {securityExporting ? "Export…" : "Exporter"}
        </Button>
      </div>
    </SettingsCard>
  );
}

function ServerLogsCard() {
  const {
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
  } = useServerLogs();

  const onSearch = (e) => {
    e.preventDefault();
    loadLogs({ page: 0 });
  };

  return (
    <SettingsCard title="Monitoring serveur" description="Logs applicatifs de l’API (/api/v1/backoffice/logs).">
      <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label htmlFor="logs-query" className="sr-only">
          Rechercher dans les logs
        </label>
        <Input
          id="logs-query"
          value={logQuery}
          onChange={(e) => setLogQuery(e.target.value)}
          placeholder="Rechercher un message ou logger"
          className="sm:w-[240px]"
        />
        <label htmlFor="logs-level" className="sr-only">
          Niveau de log
        </label>
        <div className="sm:w-[180px]">
          <Select id="logs-level" value={logLevel} onChange={(e) => setLogLevel(e.target.value)} options={LOG_LEVEL_OPTIONS} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={logLoading}>
            {logLoading ? "Chargement…" : "Actualiser"}
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={purgeLogs} disabled={logPurging}>
            {logPurging ? "Purge…" : "Purger"}
          </Button>
        </div>
      </form>

      <SettingsStatus error={logError} />

      <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
        {logPage.items.length === 0 && !logLoading ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            Aucun log disponible.
          </div>
        ) : (
          logPage.items.map((entry, index) => {
            const key = logEntryKey(entry, index);
            const expanded = expandedLogKeys.has(key);
            const raw = entry?.raw || "";
            const hasDetails = Boolean(raw && raw !== entry?.message);
            return (
              <div key={key} className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge label={entry?.level || "LOG"} variant={logLevelVariant(entry?.level)} />
                    <span className="truncate text-xs font-medium text-muted-foreground">{entry?.logger || "-"}</span>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatLogTimestamp(entry?.timestamp)}</span>
                </div>
                <div className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
                  {entry?.message || entry?.raw || "-"}
                </div>
                {hasDetails ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleLogDetails(key)} aria-expanded={expanded}>
                      {expanded ? "Masquer le détail" : "Voir l'erreur complète"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyLogEntry(entry)}>
                      Copier
                    </Button>
                  </div>
                ) : null}
                {expanded ? (
                  <pre className="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                    {raw || entry?.message || "-"}
                  </pre>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {logPage.total} entrée{logPage.total > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs({ page: Math.max(0, (logPage.page || 0) - 1) })}
            disabled={logLoading || (logPage.page || 0) <= 0}
          >
            Précédent
          </Button>
          <span>
            Page {(logPage.page || 0) + 1} / {Math.max(logPage.totalPages || 0, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs({ page: (logPage.page || 0) + 1 })}
            disabled={logLoading || !logPage.hasMore}
          >
            Suivant
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}
