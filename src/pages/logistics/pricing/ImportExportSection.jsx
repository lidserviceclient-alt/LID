import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Download, FileSpreadsheet, RotateCcw, Upload } from "lucide-react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsStatus from "../../settings/components/SettingsStatus.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { QuickCsvCard } from "./QuickCsvCard.jsx";

const SECTION_LABELS = {
  reglages: "Réglages (hors Abidjan, collecte, dépôt)",
  tranches: "Tranches de poids",
  zones_et_communes: "Zones et communes",
  tarifs: "Tarifs de livraison",
  collecte: "Frais de collecte"
};
const KIND = {
  CREATED: { label: "Créé", variant: "success" },
  MODIFIED: { label: "Modifié", variant: "outline" },
  DELETED: { label: "Supprimé", variant: "destructive" }
};
const MAX_BYTES = 2 * 1024 * 1024;
const dateTime = (v) => (v ? new Date(v).toLocaleString("fr-FR") : "—");

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Cellule d'un tableau d'erreurs / avertissements : « ligne 12 · montant_fcfa ». */
const where = (i) => [i.line > 0 ? `Ligne ${i.line}` : "Fichier", i.column].filter(Boolean).join(" · ");

export function IssueTable({ title, items, tone }) {
  if (!items?.length) return null;
  const palette = tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-300 bg-amber-50 text-amber-900";
  return (
    <div className={`rounded-lg border p-3 ${palette}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {title} ({items.length})
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs opacity-80">
              <th className="py-1 pr-3">Où</th>
              <th className="pr-3">Section</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, n) => (
              <tr key={n} className="border-t border-current/20 align-top">
                <td className="whitespace-nowrap py-1 pr-3">{where(i)}</td>
                <td className="whitespace-nowrap pr-3">{i.section || "—"}</td>
                <td>{i.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExportCard({ onError, onSuccess }) {
  const [busy, setBusy] = useState("");
  async function run(kind) {
    try {
      setBusy(kind);
      const blob = await (kind === "export" ? backofficeApi.shippingGridExport() : backofficeApi.shippingGridTemplate());
      const stamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, kind === "export" ? `grille-livraison-${stamp}.csv` : "modele-grille-livraison.csv");
      onSuccess(kind === "export" ? "Grille actuelle téléchargée." : "Modèle à remplir téléchargé.");
    } catch (err) {
      onError(err?.message || "Téléchargement impossible.");
    } finally {
      setBusy("");
    }
  }
  return (
    <SettingsCard
      title="Télécharger la grille"
      description="Un seul fichier CSV (UTF-8, séparateur « ; ») qui s’ouvre dans Excel : réglages, tranches de poids, zones et communes, tarifs zone × tranche × mode, frais de collecte."
    >
      <div className="flex flex-wrap gap-2">
        <Button className="gap-2" onClick={() => run("export")} disabled={Boolean(busy)}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {busy === "export" ? "Préparation…" : "Télécharger la grille actuelle"}
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => run("template")} disabled={Boolean(busy)}>
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          {busy === "template" ? "Préparation…" : "Télécharger le modèle à remplir"}
        </Button>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        <li>Modifiez les montants dans Excel puis enregistrez au format « CSV UTF-8 (séparé par des virgules) » ; ne touchez pas aux lignes « #SECTION » ni aux en-têtes.</li>
        <li>Montants en FCFA entiers (1500) ; poids en kg (0,5). La colonne « statut » est informative.</li>
        <li>Une section sans ligne de données est ignorée. Rien n’est écrit avant que vous ayez vérifié l’aperçu et cliqué sur « Appliquer ».</li>
      </ul>
    </SettingsCard>
  );
}

function SummaryTable({ summary }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th className="py-1 pr-3">Section</th>
          <th className="pr-3">Créés</th>
          <th className="pr-3">Modifiés</th>
          <th className="pr-3">Inchangés</th>
          <th>Supprimés</th>
        </tr>
      </thead>
      <tbody>
        {summary.map((s) => (
          <tr key={s.section} className="border-t border-border">
            <td className="py-1 pr-3">{SECTION_LABELS[s.section] || s.section}</td>
            <td className="pr-3 text-emerald-700">{s.created}</td>
            <td className="pr-3">{s.modified}</td>
            <td className="pr-3 text-muted-foreground">{s.unchanged}</td>
            <td className={s.deleted ? "text-red-700" : ""}>{s.deleted}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DiffTable({ rows, truncated, total }) {
  const [filter, setFilter] = useState("ALL");
  const shown = filter === "ALL" ? rows : rows.filter((r) => r.kind === filter);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Changements ({total})</span>
        {["ALL", "CREATED", "MODIFIED", "DELETED"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${filter === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {k === "ALL" ? "Tous" : KIND[k].label}
          </button>
        ))}
      </div>
      <div className="max-h-96 overflow-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-2 py-1">Type</th>
              <th className="pr-3">Section</th>
              <th className="pr-3">Élément</th>
              <th className="pr-3">Avant</th>
              <th>Après</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={`${r.section}-${r.key}-${i}`} className="border-t border-border align-top">
                <td className="px-2 py-1"><Badge label={KIND[r.kind]?.label || r.kind} variant={KIND[r.kind]?.variant || "outline"} /></td>
                <td className="whitespace-nowrap pr-3">{SECTION_LABELS[r.section] || r.section}</td>
                <td className="pr-3">{r.label || r.key}</td>
                <td className="pr-3 text-muted-foreground whitespace-pre-wrap">{r.before || "—"}</td>
                <td className="whitespace-pre-wrap">{r.after || "—"}</td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr><td colSpan={5} className="px-2 py-3 text-center text-muted-foreground">Aucun changement de ce type.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {truncated ? <p className="text-xs text-muted-foreground">Seuls les premiers changements sont listés ; les totaux ci-dessus portent sur le fichier entier.</p> : null}
    </div>
  );
}

function ImportCard({ reload, onError, onSuccess, onApplied }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("MERGE");
  const [validated, setValidated] = useState(false);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);

  const runPreview = useCallback(
    async (f, m, v) => {
      if (!f) return;
      try {
        setBusy(true);
        setResult(null);
        setPreview(await backofficeApi.shippingGridImportPreview(f, { mode: m, validated: v }));
      } catch (err) {
        setPreview(null);
        onError(err?.message || "Aperçu impossible.");
      } finally {
        setBusy(false);
      }
    },
    [onError]
  );

  function pick(e) {
    const f = e.target.files?.[0] || null;
    setPreview(null);
    setResult(null);
    if (f && f.size > MAX_BYTES) {
      setFile(null);
      onError(`Fichier trop volumineux (${Math.round(f.size / 1024)} Ko) : maximum 2 Mo.`);
      return;
    }
    setFile(f);
    runPreview(f, mode, validated);
  }
  function changeMode(m) {
    setMode(m);
    runPreview(file, m, validated);
  }
  function changeValidated(v) {
    setValidated(v);
    runPreview(file, mode, v);
  }
  function reset() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function apply() {
    try {
      setApplying(true);
      const r = await backofficeApi.shippingGridImportApply(file, preview.token, { mode, validated });
      setResult(r);
      setConfirmOpen(false);
      reset();
      onSuccess(r.message);
      onApplied();
      await reload();
    } catch (err) {
      setConfirmOpen(false);
      onError(err?.message || "Application impossible.");
      // La grille a pu changer entre l'aperçu et l'application : on refait l'aperçu.
      runPreview(file, mode, validated);
    } finally {
      setApplying(false);
    }
  }
  async function undo() {
    if (!result?.backupId) return;
    if (!window.confirm(`Annuler cet import et rétablir la grille d’avant (sauvegarde #${result.backupId}) ?`)) return;
    try {
      const r = await backofficeApi.shippingGridRestore(result.backupId);
      setResult(null);
      onSuccess(r.message);
      onApplied();
      await reload();
    } catch (err) {
      onError(err?.message || "Annulation impossible.");
    }
  }
  async function downloadBackup() {
    try {
      saveBlob(await backofficeApi.shippingGridBackupDownload(result.backupId), `grille-livraison-sauvegarde-${result.backupId}.csv`);
    } catch (err) {
      onError(err?.message || "Téléchargement impossible.");
    }
  }

  const blocking = preview ? preview.errors?.length > 0 : false;
  const noChange = preview && !blocking && preview.totalChanges === 0;
  const canApply = Boolean(preview?.canApply) && !blocking && preview.totalChanges > 0 && !busy;

  return (
    <SettingsCard
      title="Importer un fichier"
      description="Déposez le fichier modifié : il est d’abord vérifié (aperçu, aucune écriture), puis appliqué en une seule opération tout-ou-rien. La grille précédente est sauvegardée automatiquement."
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/50">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Choisir un fichier CSV
          <input ref={inputRef} type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={pick} aria-label="Fichier de grille de livraison" />
        </label>
        <span className="text-sm text-muted-foreground">{file ? `${file.name} (${Math.round(file.size / 1024) || 1} Ko)` : "Aucun fichier (CSV, 2 Mo maximum)"}</span>
        {file ? <Button variant="outline" size="sm" onClick={reset}>Retirer</Button> : null}
      </div>

      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-medium">Mode d’import</legend>
        {[
          ["MERGE", "Fusionner", "Les lignes du fichier créent ou modifient ; ce qui n’y figure pas reste inchangé."],
          ["REPLACE", "Remplacer toute la grille", "Pour chaque section présente dans le fichier, ce qui n’y figure plus est supprimé."]
        ].map(([value, label, hint]) => (
          <label key={value} className={`flex cursor-pointer gap-2 rounded-md border p-3 text-sm ${mode === value ? "border-primary bg-primary/5" : "border-border"}`}>
            <input type="radio" name="grid-import-mode" value={value} checked={mode === value} onChange={() => changeMode(value)} className="mt-1" />
            <span>
              <span className="font-medium">{label}</span>
              <span className="block text-xs text-muted-foreground">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={validated} onChange={(e) => changeValidated(e.target.checked)} className="mt-1" />
        <span>
          Marquer les montants créés ou modifiés comme <strong>validés par le métier</strong>
          <span className="block text-xs text-muted-foreground">Décoché : ils sont marqués « indicatif » (à confirmer). Les montants inchangés gardent leur statut.</span>
        </span>
      </label>

      {busy ? <p className="text-sm text-muted-foreground">Vérification du fichier…</p> : null}

      {preview ? (
        <div className="space-y-4" data-testid="grid-import-preview">
          <div className={`rounded-lg border px-3 py-2 text-sm ${blocking ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {blocking
              ? `${preview.errors.length} erreur(s) bloquante(s) : corrigez le fichier et redéposez-le. Rien n’a été modifié.`
              : noChange
                ? "Fichier valide : la grille est déjà identique, rien à appliquer."
                : `Fichier valide : ${preview.totalChanges} changement(s) à appliquer${preview.warnings?.length ? `, ${preview.warnings.length} avertissement(s) à lire` : ""}.`}
          </div>
          <IssueTable title="Erreurs bloquantes" items={preview.errors} tone="error" />
          <IssueTable title="Avertissements" items={preview.warnings} tone="warning" />
          {preview.summary?.length ? <SummaryTable summary={preview.summary} /> : null}
          {preview.changes?.length ? <DiffTable rows={preview.changes} truncated={preview.changesTruncated} total={preview.totalChanges} /> : null}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {blocking ? <span className="text-xs text-red-700">« Appliquer » est désactivé tant que des erreurs bloquantes subsistent.</span> : null}
            <Button onClick={() => setConfirmOpen(true)} disabled={!canApply}>Appliquer l’import…</Button>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
          <div className="font-semibold">{result.replayed ? "Import déjà appliqué" : "Import appliqué"}</div>
          <p>{result.message}</p>
          {result.summary?.length ? <SummaryTable summary={result.summary} /> : null}
          {result.backupId ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadBackup}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger la sauvegarde #{result.backupId}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={undo}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Annuler l’import
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        isOpen={confirmOpen}
        onClose={() => !applying && setConfirmOpen(false)}
        title="Appliquer l’import de la grille ?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={applying}>Annuler</Button>
            <Button onClick={apply} disabled={applying}>{applying ? "Application…" : "Oui, appliquer"}</Button>
          </>
        }
      >
        {preview ? (
          <div className="space-y-3 text-sm">
            <p>
              Mode <strong>{mode === "REPLACE" ? "remplacer toute la grille" : "fusionner"}</strong>, montants marqués{" "}
              <strong>{validated ? "validés par le métier" : "indicatifs"}</strong>.
            </p>
            <SummaryTable summary={preview.summary || []} />
            <p className="text-muted-foreground">
              Les nouveaux devis et commandes utiliseront immédiatement cette grille ; les commandes déjà créées ne changent pas. La grille actuelle est
              sauvegardée avant l’application : vous pourrez annuler l’import.
            </p>
            {mode === "REPLACE" ? <p className="font-medium text-red-700">Les éléments absents du fichier seront supprimés.</p> : null}
          </div>
        ) : null}
      </Modal>
    </SettingsCard>
  );
}

function BackupsCard({ refreshKey, reload, onError, onSuccess, onApplied }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await backofficeApi.shippingGridBackups();
      setRows(Array.isArray(r) ? r : []);
    } catch (err) {
      onError(err?.message || "Sauvegardes indisponibles.");
    } finally {
      setLoading(false);
    }
  }, [onError]);
  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function download(b) {
    try {
      saveBlob(await backofficeApi.shippingGridBackupDownload(b.id), `grille-livraison-sauvegarde-${b.id}.csv`);
    } catch (err) {
      onError(err?.message || "Téléchargement impossible.");
    }
  }
  async function restore(b) {
    if (!window.confirm(`Rétablir la grille telle qu’elle était avant l’opération #${b.id} (${dateTime(b.createdAt)}) ?\n\nLa grille actuelle sera elle-même sauvegardée.`)) return;
    try {
      const r = await backofficeApi.shippingGridRestore(b.id);
      onSuccess(r.message);
      onApplied();
      await reload();
    } catch (err) {
      onError(err?.message || "Restauration impossible.");
    }
  }
  return (
    <SettingsCard
      title="Sauvegardes et annulation"
      description="Avant chaque import (ou restauration), la grille précédente est sauvegardée. Restaurer une sauvegarde = annuler les imports faits depuis."
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune sauvegarde : elles sont créées à chaque import appliqué.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {rows.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <div className="font-medium">#{b.id} · {dateTime(b.createdAt)} · {b.createdBy || "—"}</div>
                <div className="text-xs text-muted-foreground">{b.summary}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => download(b)}>Télécharger</Button>
                <Button variant="outline" size="sm" onClick={() => restore(b)}>Restaurer</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}

export default function ImportExportSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <PricingSection>
      {({ reload, notify, onError }) => (
        <>
          <ExportCard onError={onError} onSuccess={notify} />
          <ImportCard reload={reload} onError={onError} onSuccess={notify} onApplied={bump} />
          <BackupsCard refreshKey={refreshKey} reload={reload} onError={onError} onSuccess={notify} onApplied={bump} />
          <QuickCsvCard reload={reload} onError={onError} onSuccess={notify} />
        </>
      )}
    </PricingSection>
  );
}
