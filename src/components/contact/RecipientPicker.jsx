import { useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Label from "../ui/Label.jsx";
import Select from "../ui/Select.jsx";
import { backofficeApi } from "../../services/api.js";
import { EMAIL_RE } from "../../pages/contact/contactUtils.js";

const TEAM_ROLES = ["ADMIN", "SUPER_ADMIN", "IT", "LIVREUR", "PARTENAIRE"];

/** Sélecteur de destinataires : adresses saisies à la main ou ajoutées par segment (visiteurs, clients, équipe). */
export default function RecipientPicker({ value, onChange, disabled }) {
  const [segment, setSegment] = useState("CLIENT");
  const [roles, setRoles] = useState(TEAM_ROLES);
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const add = (emails) => {
    const merged = new Map(value.map((e) => [e.toLowerCase(), e]));
    let added = 0;
    for (const raw of emails) {
      const v = `${raw || ""}`.trim();
      if (v && !merged.has(v.toLowerCase())) {
        merged.set(v.toLowerCase(), v);
        added += 1;
      }
    }
    onChange(Array.from(merged.values()));
    return added;
  };

  const addManual = () => {
    const parts = manual.split(/[,;\s]+/).filter(Boolean);
    const invalid = parts.filter((p) => !EMAIL_RE.test(p));
    if (invalid.length) {
      setError(`Adresse invalide : ${invalid.join(", ")}`);
      return;
    }
    setError("");
    add(parts);
    setManual("");
  };

  const addSegment = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const list = await backofficeApi.recipients({ segment, roles: segment === "TEAM" ? roles : [], q: query.trim(), limit: 500 });
      const emails = Array.isArray(list) ? list : [];
      const added = add(emails);
      setInfo(emails.length ? `${added} adresse${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""} (${emails.length} trouvée${emails.length > 1 ? "s" : ""}).` : "Aucune adresse trouvée pour ce filtre.");
    } catch (e) {
      setError(e?.message || "Impossible de charger les destinataires.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (r) => setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">Destinataires</legend>

      <div className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3">
        <Label htmlFor="rp-segment">Ajouter un groupe</Label>
        <Select
          id="rp-segment"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          options={[
            { value: "VISITOR", label: "Visiteurs (newsletter)" },
            { value: "CLIENT", label: "Clients" },
            { value: "TEAM", label: "Équipe" }
          ]}
        />
        {segment === "TEAM" ? (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {TEAM_ROLES.map((r) => (
              <label key={r} className="flex cursor-pointer select-none items-center gap-2">
                <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                {r}
              </label>
            ))}
          </div>
        ) : null}
        <Input aria-label="Filtrer le groupe (email, nom, prénom)" placeholder="Filtrer (email, nom, prénom)…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="button" variant="outline" size="sm" onClick={addSegment} disabled={loading}>
          {loading ? "Ajout…" : "Ajouter ce groupe"}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rp-manual">Ajouter une adresse</Label>
        <div className="flex gap-2">
          <Input
            id="rp-manual"
            type="email"
            inputMode="email"
            placeholder="client@exemple.com"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addManual();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addManual} disabled={!manual.trim()}>
            Ajouter
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {info ? (
        <p role="status" className="text-xs text-muted-foreground">
          {info}
        </p>
      ) : null}

      <div aria-live="polite">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {value.length} destinataire{value.length > 1 ? "s" : ""}
          </span>
          {value.length ? (
            <button type="button" className="underline-offset-2 hover:underline" onClick={() => onChange([])}>
              Tout retirer
            </button>
          ) : null}
        </div>
        {value.length ? (
          <ul className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {value.map((email) => (
              <li key={email} className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
                <span className="truncate">{email}</span>
                <button type="button" aria-label={`Retirer ${email}`} onClick={() => onChange(value.filter((x) => x !== email))} className="rounded-full p-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Aucun destinataire : ajoutez une adresse ou un groupe.</p>
        )}
      </div>
    </fieldset>
  );
}
