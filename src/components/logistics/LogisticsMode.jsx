import { useEffect, useState } from "react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Label from "../ui/Label.jsx";
import Select from "../ui/Select.jsx";
import { backofficeApi } from "../../services/api.js";

// Regle R4 : LID conserve les options A et B pour les articles des partenaires (A par defaut) et decide de l'option.
export const LOGISTICS_MODES = {
  DIRECT_FROM_PARTNER: {
    short: "A · Direct",
    label: "Option A — enlèvement direct",
    description:
      "Le livreur récupère le colis chez le partenaire et livre directement le client (une étape). Fonctionnement par défaut."
  },
  VIA_WAREHOUSE: {
    short: "B · Entrepôt",
    label: "Option B — via l'entrepôt LID",
    description:
      "Le livreur récupère chez le partenaire et dépose à l'entrepôt LID (collecte), puis un second trajet livre le client. " +
      "À utiliser lorsque les caractéristiques du produit, les exigences de contrôle ou l'organisation logistique le justifient. " +
      "Les frais de collecte sont distincts de la livraison au client et doivent être annoncés au partenaire avant la mise en vente."
  }
};

export function LogisticsModeBadge({ mode, override = false }) {
  if (!mode) return null;
  const ui = LOGISTICS_MODES[mode];
  const label = `${ui?.short || mode}${override ? " (imposé)" : ""}`;
  return <Badge label={label} variant={mode === "VIA_WAREHOUSE" ? "warning" : "neutral"} />;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("fr-FR");
}

function History({ entries }) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return <div className="text-xs text-muted-foreground">Aucun changement enregistré.</div>;
  }
  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {entries.map((entry, index) => (
        <li key={`${entry.at}-${index}`}>
          <span className="font-medium text-foreground">{formatDateTime(entry.at)}</span>
          {entry.userId ? ` · ${entry.userId}` : ""} · {entry.summary}
        </li>
      ))}
    </ul>
  );
}

/** Fiche partenaire : selecteur du mode logistique (A/B) avec explication, motif obligatoire et historique. */
export function PartnerLogisticsModeSection({ partnerId, onChanged }) {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState("DIRECT_FROM_PARTNER");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!partnerId) return;
    let active = true;
    setLoading(true);
    setError("");
    setSuccess("");
    backofficeApi
      .partnerLogisticsMode(partnerId)
      .then((res) => {
        if (!active) return;
        setData(res);
        setMode(res?.mode || "DIRECT_FROM_PARTNER");
      })
      .catch((err) => active && setError(err?.message || "Mode logistique indisponible"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [partnerId]);

  const changed = data && mode !== data.mode;

  const save = async () => {
    if (!changed) return;
    if (!reason.trim()) {
      setError("Indiquez le motif du changement (il est conservé dans l'historique).");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await backofficeApi.updatePartnerLogisticsMode(partnerId, { mode, reason: reason.trim() });
      setData(res);
      setMode(res?.mode || mode);
      setReason("");
      setSuccess("Mode logistique enregistré. Les colis déjà créés gardent leur mode.");
      onChanged?.(res);
    } catch (err) {
      setError(err?.message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">Mode logistique (règle R4)</div>
        {data ? <LogisticsModeBadge mode={data.mode} /> : null}
      </div>
      {loading ? <div className="text-xs text-muted-foreground">Chargement…</div> : null}
      {data ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="partnerLogisticsMode">Option applicable aux articles de ce partenaire</Label>
            <Select
              id="partnerLogisticsMode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={Object.entries(LOGISTICS_MODES).map(([value, ui]) => ({ value, label: ui.label }))}
            />
            <p className="text-xs text-muted-foreground">{LOGISTICS_MODES[mode]?.description}</p>
          </div>
          <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
            <div>
              Adresse de retrait :{" "}
              <span className="text-foreground">{data.pickup?.address || "non renseignée"}</span>
              {data.pickup?.zoneCode ? ` (${data.pickup.zoneCode})` : ""}
            </div>
            <div>
              Produits avec un mode imposé : <span className="text-foreground">{data.productsWithOverrideCount ?? 0}</span>
            </div>
          </div>
          {changed ? (
            <div className="space-y-2">
              <Label htmlFor="partnerLogisticsReason">Motif du changement (obligatoire)</Label>
              <Input
                id="partnerLogisticsReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : contrôle qualité requis, organisation logistique"
              />
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer le mode"}
              </Button>
            </div>
          ) : null}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">Historique</div>
            <History entries={data.history} />
          </div>
        </>
      ) : null}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      {success ? <div className="text-xs text-emerald-700">{success}</div> : null}
    </div>
  );
}

/** Fiche produit : surcharge optionnelle du mode logistique pour CE produit (article partenaire uniquement). */
export function ProductLogisticsModeSection({ articleId }) {
  const [data, setData] = useState(null);
  const [override, setOverride] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!articleId) return;
    let active = true;
    setLoading(true);
    setError("");
    backofficeApi
      .productLogisticsMode(articleId)
      .then((res) => {
        if (!active) return;
        setData(res);
        setOverride(res?.override || "");
      })
      .catch((err) => active && setError(err?.message || "Mode logistique indisponible"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [articleId]);

  if (!articleId) return null;
  if (data && !data.partnerId) {
    return (
      <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
        Article LID : il part toujours de l'entrepôt LID (pas de mode logistique à choisir).
      </div>
    );
  }

  const current = data?.override || "";
  const changed = data && override !== current;

  const save = async () => {
    if (!reason.trim()) {
      setError("Indiquez le motif (caractéristiques du produit, exigences de contrôle…).");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await backofficeApi.updateProductLogisticsMode(articleId, {
        mode: override || null,
        reason: reason.trim()
      });
      setData(res);
      setOverride(res?.override || "");
      setReason("");
      setSuccess("Mode du produit enregistré. Informez le partenaire des frais correspondants avant la mise en vente.");
    } catch (err) {
      setError(err?.message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">Mode logistique du produit</div>
        {data ? <LogisticsModeBadge mode={data.effectiveMode} override={Boolean(data.override)} /> : null}
      </div>
      {loading ? <div className="text-xs text-muted-foreground">Chargement…</div> : null}
      {data ? (
        <>
          <Select
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            options={[
              {
                value: "",
                label: `Mode du partenaire (${LOGISTICS_MODES[data.partnerMode]?.short || "A · Direct"})`
              },
              { value: "VIA_WAREHOUSE", label: "Imposer l'option B — via l'entrepôt LID" },
              { value: "DIRECT_FROM_PARTNER", label: "Imposer l'option A — enlèvement direct" }
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Une surcharge permet d'imposer l'option B à un produit précis (caractéristiques du produit, exigences de
            contrôle). Un colis passe par l'entrepôt dès qu'un de ses articles l'exige.
          </p>
          {changed ? (
            <div className="space-y-2">
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif (obligatoire)" />
              <Button size="sm" type="button" onClick={save} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          ) : null}
          <History entries={data.history} />
        </>
      ) : null}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      {success ? <div className="text-xs text-emerald-700">{success}</div> : null}
    </div>
  );
}
