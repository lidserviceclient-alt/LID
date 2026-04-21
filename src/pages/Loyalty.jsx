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
import { reloadLoyaltyResolver, useLoyaltyResolver } from "../resolvers/loyaltyResolver.js";

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

const parseNumberFr = (value) => {
  const raw = `${value ?? ""}`.trim();
  if (!raw) return NaN;
  return Number(raw.replace(/\s+/g, "").replace(",", "."));
};

const parseDiscountPercent = (text) => {
  const raw = `${text || ""}`;
  const matches = raw.match(/(-?\s*\d{1,2}(?:[.,]\d{1,2})?)\s*%/g) || [];
  let best = 0;
  for (const m of matches) {
    const cleaned = `${m}`.replace("%", "").replace(/\s+/g, "").replace(",", ".").replace("-", "");
    const v = Number(cleaned);
    if (Number.isFinite(v) && v > best) best = v;
  }
  if (best > 100) best = 100;
  return best;
};

export default function Loyalty() {
  const [overview, setOverview] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [tiersPage, setTiersPage] = useState(null);
  const [tiersPageIndex, setTiersPageIndex] = useState(0);
  const tiersPageSize = 20;
  const [customers, setCustomers] = useState([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customersPage, setCustomersPage] = useState(null);
  const [customersPageIndex, setCustomersPageIndex] = useState(0);
  const [customersPageSize, setCustomersPageSize] = useState(10);
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

  const [isCreateTierOpen, setIsCreateTierOpen] = useState(false);
  const [createTierSaving, setCreateTierSaving] = useState(false);
  const [createTierError, setCreateTierError] = useState("");
  const [createTierForm, setCreateTierForm] = useState({
    name: "",
    minPoints: "0",
    benefits: ""
  });

  const [isDeleteTierOpen, setIsDeleteTierOpen] = useState(false);
  const [deleteTierSaving, setDeleteTierSaving] = useState(false);
  const [deleteTierError, setDeleteTierError] = useState("");
  const [tierToDelete, setTierToDelete] = useState(null);

  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [txPage, setTxPage] = useState(null);
  const [txPageIndex, setTxPageIndex] = useState(0);
  const [txPageSize, setTxPageSize] = useState(20);
  const [adjustSaving, setAdjustSaving] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustForm, setAdjustForm] = useState({ deltaPoints: "", reason: "" });
  const loyaltyEntry = useLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);

  useEffect(() => {
    setLoading(loyaltyEntry.loading);
    setError(loyaltyEntry.error);
    const data = loyaltyEntry.data;
    setOverview(data?.overview || null);
    const nextTiersPage = data?.tiersPage || null;
    setTiersPage(nextTiersPage);
    setTiers(Array.isArray(nextTiersPage?.content) ? nextTiersPage.content : Array.isArray(data?.tiers) ? data.tiers : []);
    setCustomers(Array.isArray(data?.topCustomers) ? data.topCustomers : []);
    setConfig(data?.config || null);
    setCustomersPage(data?.customersPage || null);

    const pointsPerFcfa = Number(data?.config?.pointsPerFcfa ?? 0.001);
    const pointsPer1000 = pointsPerFcfa * 1000;
    setRulesForm({
      pointsPer1000: `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(pointsPer1000)}`.replaceAll(" ", ""),
      valuePerPointFcfa: `${data?.config?.valuePerPointFcfa ?? 0.1}`,
      retentionDays: `${data?.config?.retentionDays ?? 30}`
    });
  }, [loyaltyEntry.data, loyaltyEntry.error, loyaltyEntry.loading]);

  async function loadTiersPage(nextPage = 0) {
    try {
      setError("");
      const res = await backofficeApi.loyaltyTiers(nextPage, tiersPageSize);
      setTiersPage(res || null);
      setTiers(Array.isArray(res?.content) ? res.content : []);
      setTiersPageIndex(nextPage);
    } catch (err) {
      setError(err?.message || "Impossible de charger les niveaux.");
    }
  }

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
      await reloadLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);
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
    if (name.length > 30) {
      setTierError("Nom trop long (max 30).");
      return;
    }
    if (!Number.isFinite(minPoints) || minPoints < 0) {
      setTierError("Points requis invalides.");
      return;
    }
    if (`${tierForm.benefits || ""}`.length > 500) {
      setTierError("Avantages trop longs (max 500).");
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
      await reloadLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);
    } catch (err) {
      setTierError(err?.message || "Impossible de mettre à jour le niveau.");
    } finally {
      setTierSaving(false);
    }
  }

  function openCreateTier() {
    setCreateTierError("");
    setCreateTierForm({ name: "", minPoints: "0", benefits: "" });
    setIsCreateTierOpen(true);
  }

  async function saveCreateTier() {
    const name = createTierForm.name.trim();
    const minPoints = Number(`${createTierForm.minPoints}`.replace(",", "."));
    if (!name) {
      setCreateTierError("Nom obligatoire.");
      return;
    }
    if (name.length > 30) {
      setCreateTierError("Nom trop long (max 30).");
      return;
    }
    if (!Number.isFinite(minPoints) || minPoints < 0) {
      setCreateTierError("Points requis invalides.");
      return;
    }
    if (`${createTierForm.benefits || ""}`.length > 500) {
      setCreateTierError("Avantages trop longs (max 500).");
      return;
    }
    setCreateTierSaving(true);
    setCreateTierError("");
    try {
      await backofficeApi.createLoyaltyTier({ name, minPoints: Math.trunc(minPoints), benefits: createTierForm.benefits });
      setIsCreateTierOpen(false);
      await reloadLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);
    } catch (err) {
      setCreateTierError(err?.message || "Impossible de créer le niveau.");
    } finally {
      setCreateTierSaving(false);
    }
  }

  function openDeleteTier(tier) {
    setTierToDelete(tier || null);
    setDeleteTierError("");
    setIsDeleteTierOpen(true);
  }

  async function confirmDeleteTier() {
    if (!tierToDelete?.id) return;
    setDeleteTierSaving(true);
    setDeleteTierError("");
    try {
      await backofficeApi.deleteLoyaltyTier(tierToDelete.id);
      setIsDeleteTierOpen(false);
      setTierToDelete(null);
      await reloadLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);
    } catch (err) {
      setDeleteTierError(err?.message || "Impossible de supprimer le niveau.");
    } finally {
      setDeleteTierSaving(false);
    }
  }

  async function loadCustomersPage(nextPage = 0) {
    const q = `${customerQuery || ""}`.trim();
    try {
      const res = await backofficeApi.loyaltyCustomersPage(q, nextPage, customersPageSize);
      setCustomersPage(res || null);
      setCustomersPageIndex(nextPage);
    } catch (err) {
      setCustomersPage(null);
      setError(err?.message || "Impossible de charger les clients.");
    }
  }

  async function openCustomer(c) {
    if (!c?.userId) return;
    setIsCustomerOpen(true);
    setCustomerError("");
    setAdjustError("");
    setAdjustForm({ deltaPoints: "", reason: "" });
    setTxPage(null);
    setTxPageIndex(0);
    setCustomerLoading(true);
    try {
      const detail = await backofficeApi.loyaltyCustomer(c.userId);
      setSelectedCustomer(detail || null);
      const tx = await backofficeApi.loyaltyCustomerTransactions(c.userId, 0, txPageSize);
      setTxPage(tx || null);
    } catch (err) {
      setCustomerError(err?.message || "Impossible de charger le client.");
    } finally {
      setCustomerLoading(false);
    }
  }

  async function loadCustomerTransactions(nextPage) {
    if (!selectedCustomer?.userId) return;
    setCustomerLoading(true);
    setCustomerError("");
    try {
      const tx = await backofficeApi.loyaltyCustomerTransactions(selectedCustomer.userId, nextPage, txPageSize);
      setTxPage(tx || null);
      setTxPageIndex(nextPage);
    } catch (err) {
      setCustomerError(err?.message || "Impossible de charger l’historique.");
    } finally {
      setCustomerLoading(false);
    }
  }

  async function submitAdjust(e) {
    e.preventDefault();
    if (!selectedCustomer?.userId) return;
    const delta = Number(`${adjustForm.deltaPoints}`.replace(",", "."));
    if (!Number.isFinite(delta) || delta === 0) {
      setAdjustError("Delta invalide.");
      return;
    }
    setAdjustSaving(true);
    setAdjustError("");
    try {
      const updated = await backofficeApi.adjustLoyaltyPoints(selectedCustomer.userId, {
        deltaPoints: Math.trunc(delta),
        reason: adjustForm.reason
      });
      setSelectedCustomer(updated || null);
      setAdjustForm({ deltaPoints: "", reason: "" });
      await loadCustomerTransactions(0);
      await reloadLoyaltyResolver(`${customerQuery || ""}`.trim(), customersPageIndex, customersPageSize, 10);
    } catch (err) {
      setAdjustError(err?.message || "Impossible d’ajuster les points.");
    } finally {
      setAdjustSaving(false);
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
        <SectionHeader
          title="Niveaux de fidélité"
          subtitle="Structure actuelle"
          rightSlot={
            <Button size="sm" onClick={openCreateTier}>
              Ajouter un niveau
            </Button>
          }
        />
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
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openTier(tier)}>
                        Éditer
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => openDeleteTier(tier)}>
                        Supprimer
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{tiersPage?.totalElements ?? tiers.length} niveau{(tiersPage?.totalElements ?? tiers.length) > 1 ? "x" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadTiersPage(Math.max(0, tiersPageIndex - 1))} disabled={loading || tiersPageIndex <= 0}>
              Précédent
            </Button>
            <span>Page {tiersPageIndex + 1} / {Math.max(Number(tiersPage?.totalPages) || 0, 1)}</span>
            <Button variant="outline" size="sm" onClick={() => loadTiersPage(tiersPageIndex + 1)} disabled={loading || tiersPageIndex + 1 >= (Number(tiersPage?.totalPages) || 0)}>
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Top clients" subtitle="Points & statut VIP" />
        <Table>
          <THead>
            <TRow>
              <TCell>Client</TCell>
              <TCell>Niveau</TCell>
              <TCell>Points</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                <TCell />
                <TCell />
              </TRow>
            ) : customers.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucun client.</TCell>
                <TCell />
                <TCell />
              </TRow>
            ) : (
              customers.map((c) => (
                <TRow key={c.userId}>
                  <TCell className="text-sm">{c.email || "-"}</TCell>
                  <TCell>{c.tier ? <Badge label={c.tier} variant="outline" /> : "-"}</TCell>
                  <TCell className="font-mono">{formatInt(c.points ?? 0)} pts</TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Card>
        <SectionHeader
          title="Clients"
          subtitle="Recherche, historique des points, ajustements"
          rightSlot={
            <>
              <Input
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Rechercher email, téléphone, nom…"
                className="w-64"
              />
              <Button variant="outline" size="sm" onClick={() => loadCustomersPage(0)}>
                Rechercher
              </Button>
            </>
          }
        />
        <Table>
          <THead>
            <TRow>
              <TCell>Client</TCell>
              <TCell>Niveau</TCell>
              <TCell>Points</TCell>
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
              </TRow>
            ) : (customersPage?.content || []).length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucun client.</TCell>
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              (customersPage?.content || []).map((c) => (
                <TRow key={c.userId}>
                  <TCell className="text-sm">{c.email || "-"}</TCell>
                  <TCell>{c.tier ? <Badge label={c.tier} variant="outline" /> : "-"}</TCell>
                  <TCell className="font-mono">{formatInt(c.points ?? 0)} pts</TCell>
                  <TCell>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openCustomer(c)}>
                      Gérer
                    </Button>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
          <div>{customersPage ? `Page ${customersPageIndex + 1}` : ""}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadCustomersPage(Math.max(0, customersPageIndex - 1))} disabled={customersPageIndex === 0}>
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCustomersPage(customersPageIndex + 1)}
              disabled={!customersPage || Boolean(customersPage?.last)}
            >
              Suivant
            </Button>
          </div>
        </div>
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
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            Les points servent à calculer le niveau (Bronze/Silver/…) et les stats. Ils sont crédités quand la commande est marquée{" "}
            <span className="font-medium text-foreground">LIVRÉE</span>.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Gain de points (pour 1000 FCFA)</p>
            <Input
              value={rulesForm.pointsPer1000}
              placeholder="10"
              onChange={(e) => setRulesForm((p) => ({ ...p, pointsPer1000: e.target.value }))}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "1 / 1000", value: "1" },
                { label: "5 / 1000", value: "5" },
                { label: "10 / 1000", value: "10" },
                { label: "20 / 1000", value: "20" }
              ].map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setRulesForm((p) => ({ ...p, pointsPer1000: preset.value }))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Valeur indicative d’un point (FCFA)</p>
            <Input
              value={rulesForm.valuePerPointFcfa}
              placeholder="1"
              onChange={(e) => setRulesForm((p) => ({ ...p, valuePerPointFcfa: e.target.value }))}
            />
            <div className="text-xs text-muted-foreground">Ce champ sert à afficher la “valeur estimée” des points dans le tableau de bord.</div>
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
          </div>

          <div className="rounded-lg border border-border p-3 text-sm">
            {(() => {
              const pointsPer1000 = parseNumberFr(rulesForm.pointsPer1000);
              const valuePerPoint = parseNumberFr(rulesForm.valuePerPointFcfa);
              const valid = Number.isFinite(pointsPer1000) && pointsPer1000 >= 0 && Number.isFinite(valuePerPoint) && valuePerPoint >= 0;
              if (!valid) {
                return <div className="text-muted-foreground">Simulation: saisis des valeurs valides.</div>;
              }
              const pointsPerFcfa = pointsPer1000 / 1000;
              const examples = [10000, 25000, 100000];
              return (
                <div className="space-y-2">
                  <div className="font-medium">Simulation</div>
                  <div className="text-muted-foreground">
                    Formule: points = ⌊montant × {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 6 }).format(pointsPerFcfa)}⌋
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {examples.map((amount) => {
                      const pts = Math.floor(amount * pointsPerFcfa);
                      const approx = Math.round(pts * valuePerPoint);
                      return (
                        <div key={amount} className="rounded-lg border border-border bg-muted/10 p-2">
                          <div className="text-xs text-muted-foreground">Commande {formatCurrency(amount)}</div>
                          <div className="font-mono">{formatInt(pts)} pts</div>
                          <div className="text-xs text-muted-foreground">≈ {formatCurrency(approx)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
            <Input
              value={tierForm.benefits}
              placeholder="-5% sur tout, Livraison 24h"
              onChange={(e) => setTierForm((p) => ({ ...p, benefits: e.target.value }))}
            />
            <div className="text-xs text-muted-foreground">
              {parseDiscountPercent(tierForm.benefits) > 0
                ? `Remise détectée: ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(parseDiscountPercent(tierForm.benefits))}%`
                : "Pour activer une remise VIP, indique un % dans “Avantages” (ex: -5%)."}
            </div>
          </div>
          {tierError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {tierError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isCreateTierOpen}
        onClose={() => (createTierSaving ? null : setIsCreateTierOpen(false))}
        title="Ajouter un niveau"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateTierOpen(false)} disabled={createTierSaving}>
              Annuler
            </Button>
            <Button onClick={saveCreateTier} disabled={createTierSaving}>
              {createTierSaving ? "Enregistrement..." : "Créer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Nom</p>
            <Input value={createTierForm.name} onChange={(e) => setCreateTierForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Points requis</p>
            <Input
              type="number"
              min={0}
              value={createTierForm.minPoints}
              onChange={(e) => setCreateTierForm((p) => ({ ...p, minPoints: e.target.value }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Avantages</p>
            <Input
              value={createTierForm.benefits}
              placeholder="-5% sur tout, Livraison 24h"
              onChange={(e) => setCreateTierForm((p) => ({ ...p, benefits: e.target.value }))}
            />
            <div className="text-xs text-muted-foreground">
              {parseDiscountPercent(createTierForm.benefits) > 0
                ? `Remise détectée: ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(parseDiscountPercent(createTierForm.benefits))}%`
                : "Pour activer une remise VIP, indique un % dans “Avantages” (ex: -5%)."}
            </div>
          </div>
          {createTierError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {createTierError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteTierOpen}
        onClose={() => (deleteTierSaving ? null : setIsDeleteTierOpen(false))}
        title="Supprimer le niveau"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteTierOpen(false)} disabled={deleteTierSaving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTier} disabled={deleteTierSaving}>
              {deleteTierSaving ? "Suppression..." : "Supprimer"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            Confirmer la suppression du niveau <span className="font-semibold">{tierToDelete?.name || ""}</span> ?
          </div>
          {deleteTierError ? <div className="text-red-600">{deleteTierError}</div> : null}
        </div>
      </Modal>

      <Modal
        isOpen={isCustomerOpen}
        onClose={() => (customerLoading || adjustSaving ? null : setIsCustomerOpen(false))}
        title="Fiche client fidélité"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCustomerOpen(false)} disabled={customerLoading || adjustSaving}>
              Fermer
            </Button>
          </>
        }
      >
        {customerError ? <div className="mb-3 text-sm text-red-600">{customerError}</div> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Client</div>
            <div className="text-sm font-medium">{selectedCustomer?.email || "-"}</div>
          </Card>
          <Card className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Niveau</div>
            <div className="text-sm">{selectedCustomer?.tier ? <Badge label={selectedCustomer.tier} variant="outline" /> : "-"}</div>
          </Card>
          <Card className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Points</div>
            <div className="text-sm font-mono">{formatInt(selectedCustomer?.points ?? 0)} pts</div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="text-sm font-semibold">Ajuster les points</div>
            <form onSubmit={submitAdjust} className="grid gap-3">
              <Input
                type="number"
                placeholder="+100 ou -50"
                value={adjustForm.deltaPoints}
                onChange={(e) => setAdjustForm((p) => ({ ...p, deltaPoints: e.target.value }))}
              />
              <Input
                placeholder="Raison (optionnel)"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))}
              />
              {adjustError ? <div className="text-sm text-red-600">{adjustError}</div> : null}
              <Button type="submit" disabled={adjustSaving || customerLoading}>
                {adjustSaving ? "Enregistrement..." : "Appliquer"}
              </Button>
            </form>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Historique</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCustomerTransactions(Math.max(0, txPageIndex - 1))}
                  disabled={customerLoading || txPageIndex === 0}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCustomerTransactions(txPageIndex + 1)}
                  disabled={customerLoading || !txPage || Boolean(txPage?.last)}
                >
                  Suivant
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {(txPage?.content || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">{customerLoading ? "Chargement…" : "Aucune transaction."}</div>
              ) : (
                <div className="space-y-2">
                  {(txPage?.content || []).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border border-input px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-xs text-muted-foreground truncate">{tx.reason || tx.commandeId || "-"}</div>
                      </div>
                      <div className={`font-mono ${Number(tx.points) >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                        {Number(tx.points) >= 0 ? "+" : ""}
                        {formatInt(tx.points)} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
}
