import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Copy, Download, Edit2, Eye, EyeOff, KeyRound, Plus, Power, RefreshCw, Search, Upload } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import PhoneNumberField from "../components/ui/PhoneNumberField.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { isValidInternationalPhone } from "../utils/phone.js";

const PAGE_SIZE = 20;
const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const CSV_HEADERS = ["nom", "prenom", "email", "telephone", "agence"];
const CSV_TEMPLATE = `${CSV_HEADERS.join(",")}\nKouassi,Jean,jean.kouassi@exemple.com,+2250102030405,Abidjan Plateau\nTraore,Awa,awa.traore@exemple.com,+2250506070809,\n`;

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phoneNumber: "", agencyName: "" };

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "2-digit" }).format(date);
};

const fullName = (c) => `${c?.firstName || ""} ${c?.lastName || ""}`.trim() || "-";

// ---------- CSV ----------

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  return (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
}

// Parseur CSV minimal (guillemets, séparateur , ou ;, BOM).
function parseCsv(raw) {
  const text = `${raw || ""}`.replace(/^﻿/, "");
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => `${c}`.trim() !== ""));
}

const csvCell = (value) => {
  const s = `${value ?? ""}`;
  return /[",;\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function downloadTextFile(filename, content) {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function credentialsCsv(entries) {
  const lines = [["nom", "prenom", "email", "telephone", "agence", "code_de_connexion"].join(",")];
  entries.forEach(({ courier, generatedPassword }) => {
    lines.push(
      [courier?.lastName, courier?.firstName, courier?.email, courier?.phoneNumber, courier?.agencyName, generatedPassword]
        .map(csvCell)
        .join(",")
    );
  });
  return lines.join("\r\n");
}

// ---------- Petits composants ----------

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const tone = toast.type === "error"
    ? "border-destructive/30 bg-destructive text-destructive-foreground"
    : "border-emerald-600/30 bg-emerald-600 text-white";
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${tone}`}>
      {toast.message}
    </div>
  );
}

// Consultation à la demande du code de connexion : masqué par défaut, appel réseau au clic seulement,
// remasqué après 15 s. Le code n'est jamais gardé hors de cet état local.
const REVEAL_MS = 15000;

function LoginCodeCell({ courier }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const available = courier.loginCodeAvailable !== false;

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setCode("");
    setCopied(false);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { hide(); setError(""); }, [courier.id, courier.loginCodeAvailable, hide]);

  const reveal = async () => {
    if (code) { hide(); return; }
    setLoading(true);
    setError("");
    try {
      const res = await backofficeApi.courierLoginCode(courier.id);
      setCode(res?.loginCode || "");
      clearTimeout(timer.current);
      timer.current = setTimeout(hide, REVEAL_MS);
    } catch (err) {
      setError(err?.message || "Consultation impossible.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setError("Copie impossible.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost" size="sm" type="button"
          disabled={!available || loading}
          title={!available ? "Code non consultable : régénérez le code de connexion" : code ? "Masquer le code de connexion" : "Afficher le code de connexion"}
          aria-label={code ? "Masquer le code de connexion" : "Afficher le code de connexion"}
          onClick={reveal}
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : code
            ? <EyeOff className="h-4 w-4 text-slate-500 hover:text-primary" />
            : <Eye className={`h-4 w-4 ${available ? "text-slate-500 hover:text-primary" : "text-slate-300"}`} />}
        </Button>
        {code ? (
          <>
            <code className="rounded bg-muted px-2 py-1 font-mono text-sm select-all">{code}</code>
            <Button variant="ghost" size="sm" type="button" title="Copier" aria-label="Copier le code de connexion" onClick={copy}>
              <Copy className={`h-4 w-4 ${copied ? "text-emerald-600" : "text-slate-500 hover:text-primary"}`} />
            </Button>
          </>
        ) : (
          <span className="font-mono text-muted-foreground" aria-hidden="true">••••••••</span>
        )}
      </div>
      {error ? <span role="alert" className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 flex items-start gap-2">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Codes de connexion générés à la création / l'import / la régénération ; ensuite consultables à la demande (icône œil).
function CredentialsPanel({ entries, filename, onSaved, onToast }) {
  const copy = async () => {
    const text = entries
      .map(({ courier, generatedPassword }) => `${fullName(courier)} | ${courier?.email || "-"} | ${generatedPassword}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      onSaved();
      onToast({ type: "success", message: "Identifiants copiés dans le presse-papiers." });
    } catch {
      onToast({ type: "error", message: "Copie impossible, téléchargez le fichier CSV." });
    }
  };
  const download = () => {
    downloadTextFile(filename, credentialsCsv(entries));
    onSaved();
  };
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
        <strong>Ces codes de connexion sont affichés ici une seule fois.</strong> Copiez-les ou téléchargez-les maintenant et
        transmettez-les de façon sécurisée aux livreurs. Ils restent consultables ensuite via l’icône œil du tableau ; en cas d’indisponibilité, régénérez le code de connexion.
      </div>
      <div className="max-h-64 overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-2">Livreur</th><th className="p-2">Email</th><th className="p-2">Code de connexion</th></tr>
          </thead>
          <tbody>
            {entries.map(({ courier, generatedPassword }, i) => (
              <tr key={courier?.id || i} className="border-t border-border">
                <td className="p-2">{fullName(courier)}</td>
                <td className="p-2 text-muted-foreground">{courier?.email || "-"}</td>
                <td className="p-2 font-mono select-all">{generatedPassword}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={download}><Download className="mr-2 h-4 w-4" />Télécharger les identifiants (CSV)</Button>
        <Button type="button" variant="outline" onClick={copy}><Copy className="mr-2 h-4 w-4" />Copier</Button>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function Couriers() {
  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [agencyInput, setAgencyInput] = useState("");
  const [agency, setAgency] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  // formulaire création / édition
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // actions (confirmation)
  const [confirm, setConfirm] = useState(null); // { type: "status" | "reset", courier }
  const [confirmError, setConfirmError] = useState("");
  const [acting, setActing] = useState(false);

  // identifiants affichés une seule fois
  const [credentials, setCredentials] = useState(null); // { entries, filename, title }
  const credentialsSaved = useRef(false);

  // import
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null); // { headers, rows, error }
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setPage(0); setQuery(search.trim()); setAgency(agencyInput.trim()); }, 350);
    return () => clearTimeout(t);
  }, [search, agencyInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await backofficeApi.couriers(page, PAGE_SIZE, { q: query, status, agency });
      setRows(Array.isArray(data?.content) ? data.content : []);
      setPageInfo(data || null);
    } catch (err) {
      setError(err?.message || "Impossible de charger les livreurs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, query, status, agency]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Number(pageInfo?.totalPages) || 0;
  const totalElements = Number.isFinite(Number(pageInfo?.totalElements)) ? Number(pageInfo.totalElements) : rows.length;

  const showCredentials = (entries, title, filename) => {
    credentialsSaved.current = false;
    setCredentials({ entries, title, filename });
  };

  const closeCredentials = () => {
    if (!credentialsSaved.current &&
      !window.confirm("Les codes de connexion ne seront plus affichés ici. Fermer sans les avoir copiés ni téléchargés ?")) {
      return;
    }
    setCredentials(null);
  };

  // --- création / édition ---
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(""); setFormOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      firstName: c.firstName || "", lastName: c.lastName || "", email: c.email || "",
      phoneNumber: c.phoneNumber || "", agencyName: c.agencyName || ""
    });
    setFormError("");
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e?.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const agencyName = form.agencyName.trim();
    if (!firstName || !lastName) { setFormError("Le nom et le prénom sont obligatoires."); return; }
    if (!editing && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormError("Email invalide."); return; }
    if (!form.phoneNumber || !isValidInternationalPhone(form.phoneNumber)) { setFormError("Numéro de téléphone invalide."); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await backofficeApi.updateCourier(editing.id, { firstName, lastName, phoneNumber: form.phoneNumber, agencyName });
        setToast({ type: "success", message: "Livreur mis à jour." });
        setFormOpen(false);
      } else {
        const created = await backofficeApi.createCourier({
          firstName, lastName, email, phoneNumber: form.phoneNumber, ...(agencyName ? { agencyName } : {})
        });
        setFormOpen(false);
        setToast({ type: "success", message: "Livreur créé." });
        showCredentials(
          [{ courier: created?.courier, generatedPassword: created?.generatedPassword }],
          "Livreur créé",
          "identifiants-livreur.csv"
        );
      }
      await load();
    } catch (err) {
      setFormError(err?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  // --- activer/désactiver, régénérer ---
  const runConfirm = async () => {
    if (!confirm) return;
    const { type, courier } = confirm;
    setActing(true);
    setConfirmError("");
    try {
      if (type === "status") {
        await backofficeApi.setCourierStatus(courier.id, !courier.active);
        setToast({ type: "success", message: courier.active ? "Livreur désactivé." : "Livreur activé." });
        setConfirm(null);
      } else {
        const res = await backofficeApi.resetCourierPassword(courier.id);
        setConfirm(null);
        setToast({ type: "success", message: "Code de connexion régénéré." });
        showCredentials(
          [{ courier: res?.courier || courier, generatedPassword: res?.generatedPassword }],
          "Nouveau code de connexion",
          "identifiants-livreur.csv"
        );
      }
      await load();
    } catch (err) {
      setConfirmError(err?.message || "Action impossible.");
    } finally {
      setActing(false);
    }
  };

  // --- import ---
  const openImport = () => {
    setImportFile(null); setImportPreview(null); setImportError(""); setImportResult(null); setImportOpen(true);
  };

  const closeImport = () => {
    if (importing) return;
    if (importResult?.created?.length && credentialsSaved.current === false &&
      !window.confirm("Les codes de connexion générés ne seront plus affichés ici. Fermer sans les avoir copiés ni téléchargés ?")) {
      return;
    }
    setImportOpen(false);
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    setImportError(""); setImportPreview(null); setImportFile(null);
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) { setImportError("Fichier trop volumineux (2 Mo maximum)."); return; }
    try {
      const rowsParsed = parseCsv(await file.text());
      if (rowsParsed.length < 2) { setImportError("Le fichier ne contient aucune ligne de données."); return; }
      const headers = rowsParsed[0].map((h) => `${h}`.trim().toLowerCase());
      const missing = ["nom", "prenom", "email", "telephone"].filter((h) => !headers.includes(h));
      setImportFile(file);
      setImportPreview({
        headers,
        rows: rowsParsed.slice(1),
        error: missing.length ? `Colonnes manquantes : ${missing.join(", ")}. En-têtes attendus : ${CSV_HEADERS.join(",")}.` : ""
      });
    } catch {
      setImportError("Lecture du fichier impossible.");
    }
  };

  const submitImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError("");
    try {
      const res = await backofficeApi.importCouriers(importFile);
      credentialsSaved.current = false;
      setImportResult({
        created: Array.isArray(res?.created) ? res.created : [],
        skipped: Array.isArray(res?.skipped) ? res.skipped : [],
        totalLines: res?.totalLines ?? 0
      });
      setToast({ type: "success", message: `${res?.created?.length || 0} livreur(s) importé(s).` });
      await load();
    } catch (err) {
      setImportError(err?.message || "Import impossible.");
    } finally {
      setImporting(false);
    }
  };

  const hasFilters = Boolean(search || status || agencyInput);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toast toast={toast} onClose={closeToast} />

      <SectionHeader
        title="Livreurs"
        subtitle="Comptes d’accès à l’application Delivery. Les codes de connexion sont générés par le serveur."
        rightSlot={
          <>
            <Button type="button" variant="outline" onClick={openImport}>
              <Upload className="mr-2 h-4 w-4" />Importer (CSV)
            </Button>
            <Button type="button" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Nouveau livreur
            </Button>
          </>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (nom, email, téléphone)..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              className="bg-background"
              value={status}
              onChange={(e) => { setPage(0); setStatus(e.target.value); }}
              options={[
                { value: "", label: "Tous statuts" },
                { value: "ACTIVE", label: "Actifs" },
                { value: "INACTIVE", label: "Inactifs" }
              ]}
            />
          </div>
          <div className="w-full md:w-56">
            <Input
              placeholder="Filtrer par agence"
              className="bg-background"
              value={agencyInput}
              onChange={(e) => setAgencyInput(e.target.value)}
            />
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading} className="md:ml-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Actualiser
          </Button>
        </div>

        {error ? (
          <div className="p-4"><ErrorBox message={error} /></div>
        ) : null}

        <Table>
          <THead>
            <TRow>
              <TCell>Livreur</TCell>
              <TCell>Téléphone</TCell>
              <TCell>Agence</TCell>
              <TCell>Statut</TCell>
              <TCell>Code de connexion</TCell>
              <TCell>Créé le</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading && rows.length === 0 ? (
              <TRow><TCell colSpan={7} className="text-muted-foreground">Chargement…</TCell></TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell colSpan={7} className="text-muted-foreground">
                  {hasFilters ? "Aucun livreur ne correspond à ces filtres." : "Aucun livreur."}
                </TCell>
              </TRow>
            ) : (
              rows.map((c) => (
                <TRow key={c.id} className={loading ? "opacity-60" : ""}>
                  <TCell>
                    <div className="font-semibold text-foreground">{fullName(c)}</div>
                    <div className="text-xs text-muted-foreground">{c.email || "-"}</div>
                  </TCell>
                  <TCell>{c.phoneNumber || "-"}</TCell>
                  <TCell>{c.agencyName || "-"}</TCell>
                  <TCell>
                    <Badge label={c.active ? "Actif" : "Inactif"} variant={c.active ? "success" : "outline"} />
                  </TCell>
                  <TCell><LoginCodeCell courier={c} /></TCell>
                  <TCell>{formatDate(c.createdAt)}</TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" type="button" title="Modifier" aria-label="Modifier" onClick={() => openEdit(c)}>
                        <Edit2 className="h-4 w-4 text-slate-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" title="Régénérer le code de connexion" aria-label="Régénérer le code de connexion"
                        onClick={() => { setConfirmError(""); setConfirm({ type: "reset", courier: c }); }}>
                        <KeyRound className="h-4 w-4 text-slate-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" title={c.active ? "Désactiver" : "Activer"} aria-label={c.active ? "Désactiver" : "Activer"}
                        onClick={() => { setConfirmError(""); setConfirm({ type: "status", courier: c }); }}>
                        <Power className={`h-4 w-4 ${c.active ? "text-slate-500 hover:text-destructive" : "text-slate-500 hover:text-emerald-600"}`} />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>{totalElements} livreur{totalElements > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0 || loading}>
              Précédent
            </Button>
            <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={loading || page + 1 >= totalPages}>
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      {/* Création / édition */}
      <Modal
        isOpen={formOpen}
        onClose={() => (saving ? null : setFormOpen(false))}
        title={editing ? "Modifier le livreur" : "Nouveau livreur"}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="button" onClick={submitForm} disabled={saving}>
              {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer le livreur"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitForm} className="space-y-4">
          <ErrorBox message={formError} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courier-lastName">Nom</Label>
              <Input id="courier-lastName" value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-firstName">Prénom</Label>
              <Input id="courier-firstName" value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="courier-email">Email</Label>
            <Input id="courier-email" type="email" value={form.email} disabled={Boolean(editing)}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            {editing ? <p className="text-xs text-muted-foreground">L’email n’est pas modifiable.</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <PhoneNumberField value={form.phoneNumber} onChange={(v) => setForm((s) => ({ ...s, phoneNumber: v }))} placeholder="Téléphone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courier-agency">Agence (facultatif)</Label>
            <Input id="courier-agency" value={form.agencyName} onChange={(e) => setForm((s) => ({ ...s, agencyName: e.target.value }))} />
          </div>
          {!editing ? (
            <p className="text-xs text-muted-foreground">
              Le code de connexion est généré automatiquement et vous sera affiché une seule fois après la création.
            </p>
          ) : null}
        </form>
      </Modal>

      {/* Confirmation statut / reset */}
      <Modal
        isOpen={Boolean(confirm)}
        onClose={() => (acting ? null : setConfirm(null))}
        title={confirm?.type === "reset" ? "Régénérer le code de connexion" : confirm?.courier?.active ? "Désactiver le livreur" : "Activer le livreur"}
        size="sm"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setConfirm(null)} disabled={acting}>Annuler</Button>
            <Button
              type="button"
              variant={confirm?.type === "status" && confirm?.courier?.active ? "destructive" : "primary"}
              onClick={runConfirm}
              disabled={acting}
            >
              {acting ? "En cours…" : "Confirmer"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <ErrorBox message={confirmError} />
          {confirm?.type === "reset" ? (
            <p>
              Un nouveau code de connexion sera généré pour <strong className="text-foreground">{fullName(confirm?.courier)}</strong>.
              L’ancien ne fonctionnera plus. Le nouveau ne sera affiché qu’une seule fois.
            </p>
          ) : confirm?.courier?.active ? (
            <p><strong className="text-foreground">{fullName(confirm?.courier)}</strong> ne pourra plus se connecter à l’application Delivery.</p>
          ) : (
            <p><strong className="text-foreground">{fullName(confirm?.courier)}</strong> pourra de nouveau se connecter à l’application Delivery.</p>
          )}
        </div>
      </Modal>

      {/* Identifiants (création / reset) */}
      <Modal
        isOpen={Boolean(credentials)}
        onClose={closeCredentials}
        title={credentials?.title || "Identifiants"}
        size="lg"
        footer={<Button type="button" variant="outline" onClick={closeCredentials}>Fermer</Button>}
      >
        {credentials ? (
          <CredentialsPanel
            entries={credentials.entries}
            filename={credentials.filename}
            onSaved={() => { credentialsSaved.current = true; }}
            onToast={setToast}
          />
        ) : null}
      </Modal>

      {/* Import CSV */}
      <Modal
        isOpen={importOpen}
        onClose={closeImport}
        title="Importer des livreurs (CSV)"
        size="xl"
        footer={
          importResult ? (
            <Button type="button" onClick={closeImport}>Terminer</Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={closeImport} disabled={importing}>Annuler</Button>
              <Button type="button" onClick={submitImport} disabled={importing || !importFile || Boolean(importPreview?.error)}>
                {importing ? "Import en cours…" : `Importer${importPreview ? ` ${importPreview.rows.length} ligne(s)` : ""}`}
              </Button>
            </>
          )
        }
      >
        <div className="space-y-4">
          <ErrorBox message={importError} />
          {!importResult ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  Fichier CSV UTF-8, séparateur « , » ou « ; ». En-têtes : <code>{CSV_HEADERS.join(",")}</code> (agence facultative).
                  Les codes de connexion sont générés par le serveur.
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => downloadTextFile("modele-livreurs.csv", CSV_TEMPLATE)}>
                  <Download className="mr-2 h-4 w-4" />Télécharger le modèle
                </Button>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onPickFile}
                disabled={importing}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm"
              />
              {importPreview ? (
                <div className="space-y-2">
                  <ErrorBox message={importPreview.error} />
                  <p className="text-sm text-muted-foreground">
                    Aperçu : {Math.min(10, importPreview.rows.length)} première(s) ligne(s) sur {importPreview.rows.length}.
                  </p>
                  <div className="max-h-64 overflow-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-2">#</th>
                          {importPreview.headers.map((h, i) => <th key={i} className="p-2">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.rows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2 text-muted-foreground">{i + 2}</td>
                            {importPreview.headers.map((_, j) => <td key={j} className="p-2">{r[j] ?? ""}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge label={`${importResult.created.length} créé(s)`} variant="success" />
                <Badge label={`${importResult.skipped.length} ignoré(s)`} variant={importResult.skipped.length ? "warning" : "outline"} />
                <Badge label={`${importResult.totalLines} ligne(s) lue(s)`} variant="outline" />
              </div>
              {importResult.created.length > 0 ? (
                <CredentialsPanel
                  entries={importResult.created}
                  filename="identifiants-livreurs-import.csv"
                  onSaved={() => { credentialsSaved.current = true; }}
                  onToast={setToast}
                />
              ) : null}
              {importResult.skipped.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Lignes ignorées</p>
                  <div className="max-h-56 overflow-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr><th className="p-2">Ligne</th><th className="p-2">Email</th><th className="p-2">Raison</th></tr>
                      </thead>
                      <tbody>
                        {importResult.skipped.map((s, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2">{s.line}</td>
                            <td className="p-2 text-muted-foreground">{s.email || "-"}</td>
                            <td className="p-2">{s.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
