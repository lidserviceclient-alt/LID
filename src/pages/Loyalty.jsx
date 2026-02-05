import { useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return `${value ?? 0}`;
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
};

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;
};

export default function Loyalty() {
  const [overview, setOverview] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rulesError, setRulesError] = useState("");
  const [rulesForm, setRulesForm] = useState({
    pointsPer1000: "1",
    valuePerPointFcfa: "0.10",
    retentionDays: "30"
  });

  const [isTierOpen, setIsTierOpen] = useState(false);
  const [tierSaving, setTierSaving] = useState(false);
  const [tierError, setTierError] = useState("");
  const [currentTier, setCurrentTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    name: "",
    minPoints: "0",
    benefits: ""
  });

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [ov, list, cfg] = await Promise.all([
        backofficeApi.loyaltyOverview(),
        backofficeApi.loyaltyTiers(),
        backofficeApi.loyaltyConfig()
      ]);
      setOverview(ov || null);
      setTiers(Array.isArray(list) ? list : []);
      setConfig(cfg || null);

      const pointsPerFcfa = Number(cfg?.pointsPerFcfa ?? 0.001);
      const pointsPer1000 = pointsPerFcfa * 1000;
      setRulesForm({
        pointsPer1000: `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(pointsPer1000)}`.replaceAll(" ", ""),
        valuePerPointFcfa: `${cfg?.valuePerPointFcfa ?? 0.1}`,
        retentionDays: `${cfg?.retentionDays ?? 30}`
      });
    } catch (err) {
      setError(err?.message || "Impossible de charger la fidélité.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const retentionLabel = useMemo(() => {
    const v = Number(overview?.retentionRate ?? 0);
    if (!Number.isFinite(v)) return "-";
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)}%`;
  }, [overview]);

  const pointsValueLabel = useMemo(() => formatCurrency(overview?.pointsValueFcfa ?? 0), [overview]);

  async function saveRules() {
    const pointsPer1000 = Number(`${rulesForm.pointsPer1000}`.replace(",", "."));
    const valuePerPoint = Number(`${rulesForm.valuePerPointFcfa}`.replace(",", "."));
    const retentionDays = Number(`${rulesForm.retentionDays}`.replace(",", "."));

    if (!Number.isFinite(pointsPer1000) || pointsPer1000 < 0) {
      setRulesError("Points/1000 FCFA invalide.");
      return;
    }
    if (!Number.isFinite(valuePerPoint) || valuePerPoint < 0) {
      setRulesError("Valeur du point invalide.");
      return;
    }
    if (!Number.isFinite(retentionDays) || retentionDays < 1 || retentionDays > 365) {
      setRulesError("Retention days invalide (1-365).");
      return;
    }

    setRulesSaving(true);
    setRulesError("");
    try {
      await backofficeApi.updateLoyaltyConfig({
        pointsPerFcfa: pointsPer1000 / 1000,
        valuePerPointFcfa: valuePerPoint,
        retentionDays: Math.trunc(retentionDays)
      });
      setIsRulesOpen(false);
      await reload();
    } catch (err) {
      setRulesError(err?.message || "Impossible d'enregistrer les règles.");
    } finally {
      setRulesSaving(false);
    }
  }

  function openTier(tier) {
    setCurrentTier(tier);
    setTierError("");
    setTierForm({
      name: tier?.name || "",
      minPoints: `${tier?.minPoints ?? 0}`,
      benefits: tier?.benefits || ""
    });
    setIsTierOpen(true);
  }

  async function saveTier() {
    if (!currentTier?.id) return;
    const name = tierForm.name.trim();
    const minPoints = Number(`${tierForm.minPoints}`.replace(",", "."));
    if (!name) {
      setTierError("Nom obligatoire.");
      return;
    }
    if (!Number.isFinite(minPoints) || minPoints < 0) {
      setTierError("Points requis invalides.");
      return;
    }
    setTierSaving(true);
    setTierError("");
    try {
      await backofficeApi.updateLoyaltyTier(currentTier.id, {
        name,
        minPoints: Math.trunc(minPoints),
        benefits: tierForm.benefits
      });
      setIsTierOpen(false);
      await reload();
    } catch (err) {
      setTierError(err?.message || "Impossible de mettre à jour le niveau.");
    } finally {
      setTierSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fidélité & Récompenses"
        subtitle="Gérez les niveaux VIP et l'engagement client."
        rightSlot={
          <Button className="gap-2" onClick={() => setIsRulesOpen(true)}>
            <Settings2 className="h-4 w-4" />
            Configurer règles
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Membres VIP</p>
          <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatInt(overview?.vipMembers ?? 0)}</p>
          <p className="text-xs text-muted-foreground">VIP = Silver et plus</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Points distribués</p>
          <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatInt(overview?.pointsDistributed ?? 0)}</p>
          <p className="text-xs text-muted-foreground">Valeur ~ {loading ? "…" : pointsValueLabel}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Taux de rétention</p>
          <p className="text-2xl font-bold text-foreground">{loading ? "…" : retentionLabel}</p>
          <p className="text-xs text-muted-foreground">{config ? `Sur ${config.retentionDays} jours` : ""}</p>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Niveaux de fidélité" subtitle="Structure actuelle" />
        {error ? <div className="px-4 pb-2 text-sm text-red-600">{error}</div> : null}
        <Table>
          <THead>
            <TRow>
              <TCell>Niveau</TCell>
              <TCell>Points requis</TCell>
              <TCell>Membres actifs</TCell>
              <TCell>Avantages</TCell>
              <TCell>Action</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : tiers.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucun niveau.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              tiers.map((tier) => (
                <TRow key={tier.id}>
                  <TCell>
                    <Badge
                      label={tier.name}
                      variant={tier.name === "Platinum" ? "neutral" : tier.name === "Gold" ? "warning" : "neutral"}
                      className={tier.name === "Platinum" ? "bg-slate-800 text-white" : tier.name === "Gold" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                    />
                  </TCell>
                  <TCell className="font-mono">{formatInt(tier.minPoints)} pts</TCell>
                  <TCell>{formatInt(tier.members)}</TCell>
                  <TCell className="text-sm">{tier.benefits || "-"}</TCell>
                  <TCell>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openTier(tier)}>
                      Éditer
                    </Button>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={isRulesOpen}
        onClose={() => (rulesSaving ? null : setIsRulesOpen(false))}
        title="Règles de fidélité"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRulesOpen(false)} disabled={rulesSaving}>
              Annuler
            </Button>
            <Button onClick={saveRules} disabled={rulesSaving}>
              {rulesSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Points / 1000 FCFA</p>
            <Input value={rulesForm.pointsPer1000} onChange={(e) => setRulesForm((p) => ({ ...p, pointsPer1000: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Valeur d’un point (FCFA)</p>
            <Input value={rulesForm.valuePerPointFcfa} onChange={(e) => setRulesForm((p) => ({ ...p, valuePerPointFcfa: e.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Fenêtre rétention (jours)</p>
            <Input
              type="number"
              min={1}
              max={365}
              value={rulesForm.retentionDays}
              onChange={(e) => setRulesForm((p) => ({ ...p, retentionDays: e.target.value }))}
            />
          </div>
          {rulesError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {rulesError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isTierOpen}
        onClose={() => (tierSaving ? null : setIsTierOpen(false))}
        title="Modifier niveau"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTierOpen(false)} disabled={tierSaving}>
              Annuler
            </Button>
            <Button onClick={saveTier} disabled={tierSaving}>
              {tierSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Nom</p>
            <Input value={tierForm.name} onChange={(e) => setTierForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Points requis</p>
            <Input
              type="number"
              min={0}
              value={tierForm.minPoints}
              onChange={(e) => setTierForm((p) => ({ ...p, minPoints: e.target.value }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Avantages</p>
            <Input value={tierForm.benefits} onChange={(e) => setTierForm((p) => ({ ...p, benefits: e.target.value }))} />
          </div>
          {tierError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {tierError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
