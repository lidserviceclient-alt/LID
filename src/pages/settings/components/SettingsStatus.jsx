import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Messages d'erreur / de succès d'une section, annoncés aux lecteurs d'écran.
 */
export default function SettingsStatus({ error, success }) {
  if (!error && !success) return null;
  return (
    <div className="space-y-2">
      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {success ? (
        <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      ) : null}
    </div>
  );
}
