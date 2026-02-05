import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return `${value}%`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(num)}%`;
};

const mapStatus = (value) => {
  if (value === "ACTIVE") return "Active";
  if (value === "SCHEDULED") return "Planifiée";
  if (value === "FINISHED") return "Terminée";
  return value || "-";
};

const mapType = (value) => {
  if (value === "EMAIL") return "Email";
  if (value === "SMS") return "SMS";
  if (value === "SOCIAL") return "Réseaux sociaux";
  return value || "-";
};

export default function Marketing() {
  const [overview, setOverview] = useState(null);
  const [campaignsPage, setCampaignsPage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "EMAIL",
    status: "ACTIVE",
    sent: "0",
    openRate: "0",
    clickRate: "0",
    revenue: "",
    budgetSpent: ""
  });

  const rows = useMemo(() => {
    const list = Array.isArray(campaignsPage?.content) ? campaignsPage.content : [];
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      typeRaw: c.type,
      type: mapType(c.type),
      statusRaw: c.status,
      status: mapStatus(c.status),
      sent: c.sent ?? 0,
      openRateRaw: c.openRate,
      openRate: formatPercent(c.openRate),
      clickRateRaw: c.clickRate,
      clickRate: formatPercent(c.clickRate),
      revenueRaw: c.revenue,
      revenue: formatCurrency(c.revenue),
      budgetSpentRaw: c.budgetSpent
    }));
  }, [campaignsPage]);

  const roiLabel = useMemo(() => {
    const v = Number(overview?.roiGlobal ?? 0);
    if (!Number.isFinite(v)) return "x0.0";
    return `x${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)}`;
  }, [overview]);

  const channelBars = useMemo(() => {
    const channels = Array.isArray(overview?.channels) ? overview.channels : [];
    const normalized = channels
      .map((c) => ({
        channel: mapType(c.channel),
        share: Number(c.sharePercent ?? 0)
      }))
      .filter((c) => Number.isFinite(c.share) && c.share >= 0)
      .sort((a, b) => b.share - a.share);

    if (normalized.length > 0) return normalized;
    return [
      { channel: "Email", share: 0 },
      { channel: "SMS", share: 0 },
      { channel: "Social", share: 0 }
    ];
  }, [overview]);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [ov, page] = await Promise.all([
        backofficeApi.marketingOverview(30),
        backofficeApi.marketingCampaigns(0, 50, statusFilter)
      ]);
      setOverview(ov || null);
      setCampaignsPage(page || null);
    } catch (err) {
      setError(err?.message || "Impossible de charger le marketing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [statusFilter]);

  function openCreate() {
    setCurrent(null);
    setFormError("");
    setForm({
      name: "",
      type: "EMAIL",
      status: "ACTIVE",
      sent: "0",
      openRate: "0",
      clickRate: "0",
      revenue: "",
      budgetSpent: ""
    });
    setIsFormOpen(true);
  }

  function openEdit(row) {
    setCurrent(row);
    setFormError("");
    setForm({
      name: row?.name || "",
      type: row?.typeRaw || "EMAIL",
      status: row?.statusRaw || "ACTIVE",
      sent: `${row?.sent ?? 0}`,
      openRate: row?.openRateRaw === null || row?.openRateRaw === undefined ? "" : `${row.openRateRaw}`,
      clickRate: row?.clickRateRaw === null || row?.clickRateRaw === undefined ? "" : `${row.clickRateRaw}`,
      revenue: row?.revenueRaw === null || row?.revenueRaw === undefined ? "" : `${row.revenueRaw}`,
      budgetSpent: row?.budgetSpentRaw === null || row?.budgetSpentRaw === undefined ? "" : `${row.budgetSpentRaw}`
    });
    setIsFormOpen(true);
  }

  async function save() {
    const name = form.name.trim();
    if (!name) {
      setFormError("Nom obligatoire.");
      return;
    }
    const payload = {
      name,
      type: form.type,
      status: form.status,
      sent: Number(form.sent || 0),
      openRate: form.openRate === "" ? null : Number(form.openRate),
      clickRate: form.clickRate === "" ? null : Number(form.clickRate),
      revenue: form.revenue === "" ? null : Number(form.revenue),
      budgetSpent: form.budgetSpent === "" ? null : Number(form.budgetSpent)
    };
    if (!Number.isFinite(payload.sent) || payload.sent < 0) payload.sent = 0;
    if (payload.openRate !== null && (!Number.isFinite(payload.openRate) || payload.openRate < 0 || payload.openRate > 100)) {
      setFormError("Ouverture invalide (0-100).");
      return;
    }
    if (payload.clickRate !== null && (!Number.isFinite(payload.clickRate) || payload.clickRate < 0 || payload.clickRate > 100)) {
      setFormError("Clics invalides (0-100).");
      return;
    }
    if (payload.revenue !== null && (!Number.isFinite(payload.revenue) || payload.revenue < 0)) {
      setFormError("Revenus invalides.");
      return;
    }
    if (payload.budgetSpent !== null && (!Number.isFinite(payload.budgetSpent) || payload.budgetSpent < 0)) {
      setFormError("Budget invalide.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (current?.id) {
        await backofficeApi.updateMarketingCampaign(current.id, payload);
      } else {
        await backofficeApi.createMarketingCampaign(payload);
      }
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err?.message || "Impossible d'enregistrer la campagne.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!current?.id) return;
    setSaving(true);
    setFormError("");
    try {
      await backofficeApi.deleteMarketingCampaign(current.id);
      setIsDeleteOpen(false);
      setCurrent(null);
      await reload();
    } catch (err) {
      setFormError(err?.message || "Impossible de supprimer la campagne.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marketing"
        subtitle="Gérez vos campagnes, promotions et automation."
        rightSlot={<Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />Nouvelle campagne</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
            <SectionHeader title="Vue d'ensemble" subtitle="Performance globale" />
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">ROI Global</p>
                    <p className="text-2xl font-bold text-primary">{loading ? "…" : roiLabel}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                    <p className="text-sm text-muted-foreground">Budget dépensé</p>
                    <p className="text-2xl font-bold text-foreground">{loading ? "…" : formatCurrency(overview?.budgetSpent ?? 0)}</p>
                </div>
            </div>
        </Card>
        <Card className="space-y-4">
             <SectionHeader title="Canaux performants" subtitle="Par revenus générés" />
             <div className="space-y-3">
                {channelBars.map((c) => (
                  <div key={c.channel} className="flex justify-between items-center">
                    <span className="text-sm">{c.channel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, c.share))}%` }} />
                      </div>
                      <span className="text-xs font-medium">{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(c.share)}%</span>
                    </div>
                  </div>
                ))}
             </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <SectionHeader title="Campagnes" subtitle="Suivi en temps réel" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48 space-y-1">
              <p className="text-xs text-muted-foreground">Filtre statut</p>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Toutes</option>
                <option value="ACTIVE">Actives</option>
                <option value="SCHEDULED">Planifiées</option>
                <option value="FINISHED">Terminées</option>
              </Select>
            </div>
            <div className="flex-1" />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        </div>
        <Table>
          <THead>
            <TRow>
              <TCell>Nom</TCell>
              <TCell>Type</TCell>
              <TCell>Statut</TCell>
              <TCell>Envoyés</TCell>
              <TCell>Ouverture</TCell>
              <TCell>Clics</TCell>
              <TCell>Revenus</TCell>
              <TCell className="text-right">Actions</TCell>
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
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucune campagne.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              rows.map((campaign) => (
                <TRow key={campaign.id}>
                  <TCell className="font-medium">{campaign.name}</TCell>
                  <TCell>{campaign.type}</TCell>
                  <TCell><Badge label={campaign.status} /></TCell>
                  <TCell>{new Intl.NumberFormat("fr-FR").format(campaign.sent)}</TCell>
                  <TCell>{campaign.openRate}</TCell>
                  <TCell>{campaign.clickRate}</TCell>
                  <TCell className="font-semibold">{campaign.revenue}</TCell>
                  <TCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-2"
                        onClick={() => openEdit(campaign)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Éditer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs gap-2"
                        onClick={() => {
                          setCurrent(campaign);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => (saving ? null : setIsFormOpen(false))}
        title={current?.id ? "Modifier campagne" : "Nouvelle campagne"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Nom</p>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Type</p>
            <Select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="SOCIAL">Réseaux sociaux</option>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Statut</p>
            <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Planifiée</option>
              <option value="FINISHED">Terminée</option>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Envoyés</p>
            <Input type="number" min={0} value={form.sent} onChange={(e) => setForm((p) => ({ ...p, sent: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Revenus (FCFA)</p>
            <Input type="number" min={0} value={form.revenue} onChange={(e) => setForm((p) => ({ ...p, revenue: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Ouverture (%)</p>
            <Input type="number" min={0} max={100} value={form.openRate} onChange={(e) => setForm((p) => ({ ...p, openRate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Clics (%)</p>
            <Input type="number" min={0} max={100} value={form.clickRate} onChange={(e) => setForm((p) => ({ ...p, clickRate: e.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Budget dépensé (FCFA)</p>
            <Input type="number" min={0} value={form.budgetSpent} onChange={(e) => setForm((p) => ({ ...p, budgetSpent: e.target.value }))} />
          </div>
          {formError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {formError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => (saving ? null : setIsDeleteOpen(false))}
        title="Supprimer campagne"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={remove} disabled={saving}>
              {saving ? "Suppression..." : "Supprimer"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirmer la suppression de <span className="font-semibold text-foreground">{current?.name || "cette campagne"}</span> ?
        </p>
        {formError ? <div className="mt-3 text-sm text-red-600">{formError}</div> : null}
      </Modal>
    </div>
  );
}
