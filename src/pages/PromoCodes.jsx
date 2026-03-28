import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Modal from "../components/ui/Modal.jsx";
import LineChart from "../components/charts/LineChart.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { reloadPromoCodesResolver, usePromoCodesResolver } from "../resolvers/promoCodesResolver.js";

const ranges = [
  { value: "week", label: "7 jours", days: 7 },
  { value: "month", label: "30 jours", days: 30 },
  { value: "quarter", label: "90 jours", days: 90 },
  { value: "year", label: "365 jours", days: 365 }
];

const cibles = [
  { value: "GLOBAL", label: "Global" },
  { value: "BOUTIQUE", label: "Boutique" },
  { value: "UTILISATEUR", label: "Utilisateur" }
];

const formatDateTime = (value) => {
  if (!value) return "-";
  const s = `${value}`.trim();
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("fr-FR");
};

const toDateTimeLocalValue = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return "";
  return s.length >= 16 ? s.slice(0, 16) : s;
};

const normalizeDateTimeForApi = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return null;
  if (s.length === 16) return `${s}:00`;
  return s;
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}%`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(num)}%`;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR").format(num)} FCFA`;
};

export default function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [boutiques, setBoutiques] = useState([]);
  const [statsRange, setStatsRange] = useState("month");
  const [stats, setStats] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [cibleFilter, setCibleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    pourcentage: "10",
    cible: "GLOBAL",
    boutiqueId: "",
    utilisateurId: "",
    montantMinCommande: "",
    dateDebut: "",
    dateFin: "",
    usageMax: "",
    usageMaxParUtilisateur: "1",
    estActif: true
  });

  const mountedRef = useRef(true);

  const selectedRange = useMemo(
    () => ranges.find((item) => item.value === statsRange) || ranges[1],
    [statsRange]
  );
  const promoEntry = usePromoCodesResolver(selectedRange.days);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    setIsStatsLoading(promoEntry.loading);
    setIsLoading(promoEntry.loading);
    setError(promoEntry.error);
    setPromoCodes(Array.isArray(promoEntry.data?.promoCodes) ? promoEntry.data.promoCodes : []);
    setBoutiques(Array.isArray(promoEntry.data?.boutiques) ? promoEntry.data.boutiques : []);
    setStats(promoEntry.data?.stats || null);
  }, [promoEntry.data, promoEntry.error, promoEntry.loading]);

  const boutiqueOptions = useMemo(() => {
    const list = Array.isArray(boutiques) ? boutiques : [];
    return list
      .slice()
      .sort((a, b) => `${a?.nom || ""}`.localeCompare(`${b?.nom || ""}`, "fr"))
      .map((b) => ({ value: b.id, label: b.nom || b.id }));
  }, [boutiques]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promoCodes
      .slice()
      .sort((a, b) => `${b?.dateCreation || ""}`.localeCompare(`${a?.dateCreation || ""}`))
      .filter((p) => {
        const matchesQuery =
          !q ||
          `${p.code || ""}`.toLowerCase().includes(q) ||
          `${p.description || ""}`.toLowerCase().includes(q);

        const matchesCible = cibleFilter === "ALL" || p.cible === cibleFilter;

        const active = Boolean(p.estActif);
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && active) ||
          (statusFilter === "INACTIVE" && !active);

        return matchesQuery && matchesCible && matchesStatus;
      });
  }, [promoCodes, query, cibleFilter, statusFilter]);

  const openCreate = () => {
    setCurrentPromo(null);
    setFormData({
      code: "",
      description: "",
      pourcentage: "10",
      cible: "GLOBAL",
      boutiqueId: "",
      utilisateurId: "",
      montantMinCommande: "",
      dateDebut: "",
      dateFin: "",
      usageMax: "",
      usageMaxParUtilisateur: "1",
      estActif: true
    });
    setIsFormOpen(true);
  };

  const openEdit = (promo) => {
    setCurrentPromo(promo);
    setFormData({
      code: promo.code || "",
      description: promo.description || "",
      pourcentage: promo.pourcentage !== null && promo.pourcentage !== undefined ? `${promo.pourcentage}` : "0",
      cible: promo.cible || "GLOBAL",
      boutiqueId: promo.boutiqueId || "",
      utilisateurId: promo.utilisateurId || "",
      montantMinCommande:
        promo.montantMinCommande !== null && promo.montantMinCommande !== undefined ? `${promo.montantMinCommande}` : "",
      dateDebut: toDateTimeLocalValue(promo.dateDebut),
      dateFin: toDateTimeLocalValue(promo.dateFin),
      usageMax: promo.usageMax !== null && promo.usageMax !== undefined ? `${promo.usageMax}` : "",
      usageMaxParUtilisateur:
        promo.usageMaxParUtilisateur !== null && promo.usageMaxParUtilisateur !== undefined
          ? `${promo.usageMaxParUtilisateur}`
          : "1",
      estActif: Boolean(promo.estActif)
    });
    setIsFormOpen(true);
  };

  const openDelete = (promo) => {
    setCurrentPromo(promo);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedCode = (formData.code || "").trim();
    if (!trimmedCode) {
      setError("Le code est obligatoire.");
      return;
    }

    const pourcentageValue = Number(formData.pourcentage);
    if (formData.pourcentage === "" || Number.isNaN(pourcentageValue)) {
      setError("Le pourcentage est obligatoire.");
      return;
    }

    if (formData.cible === "BOUTIQUE" && !formData.boutiqueId?.trim()) {
      setError("Sélectionnez une boutique.");
      return;
    }

    if (formData.cible === "UTILISATEUR" && !formData.utilisateurId?.trim()) {
      setError("L'identifiant utilisateur est obligatoire.");
      return;
    }

    const usageMaxParUtilisateurValue = Number(formData.usageMaxParUtilisateur);
    if (Number.isNaN(usageMaxParUtilisateurValue) || usageMaxParUtilisateurValue < 1) {
      setError("Le nombre d'usages max par utilisateur doit être >= 1.");
      return;
    }

    const cible = formData.cible;
    const payload = {
      code: trimmedCode.toUpperCase(),
      description: formData.description?.trim() || null,
      pourcentage: pourcentageValue,
      cible,
      boutiqueId: cible === "BOUTIQUE" ? formData.boutiqueId?.trim() || null : null,
      utilisateurId: cible === "UTILISATEUR" ? formData.utilisateurId?.trim() || null : null,
      montantMinCommande: formData.montantMinCommande !== "" ? Number(formData.montantMinCommande) : null,
      dateDebut: normalizeDateTimeForApi(formData.dateDebut),
      dateFin: normalizeDateTimeForApi(formData.dateFin),
      usageMax: formData.usageMax !== "" ? Number(formData.usageMax) : null,
      usageMaxParUtilisateur:
        formData.usageMaxParUtilisateur !== "" ? usageMaxParUtilisateurValue : 1,
      estActif: Boolean(formData.estActif)
    };

    try {
      if (currentPromo?.id) {
        await backofficeApi.updatePromoCode(currentPromo.id, payload);
      } else {
        await backofficeApi.createPromoCode(payload);
      }
      setIsFormOpen(false);
      await reloadPromoCodesResolver(selectedRange.days);
    } catch (err) {
      setError(err?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!currentPromo?.id) return;
    setError("");
    try {
      await backofficeApi.deletePromoCode(currentPromo.id);
      setIsDeleteOpen(false);
      setCurrentPromo(null);
      await reloadPromoCodesResolver(selectedRange.days);
    } catch (err) {
      setError(err?.message || "Erreur lors de la suppression.");
    }
  };

  const statsSubtitle = useMemo(() => {
    switch (selectedRange.value) {
      case "week":
        return "Utilisations quotidiennes (7 jours)";
      case "month":
        return "Utilisations quotidiennes (30 jours)";
      case "quarter":
        return "Utilisations quotidiennes (90 jours)";
      case "year":
        return "Utilisations quotidiennes (365 jours)";
      default:
        return "Utilisations";
    }
  }, [selectedRange.value]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Codes promo"
        subtitle="Créez, activez et suivez les utilisations."
        rightSlot={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau code promo
          </Button>
        }
      />

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-40">
              <Select value={statsRange} onChange={(e) => setStatsRange(e.target.value)}>
                {ranges.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {statsSubtitle}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Usages</p>
              <p className="font-semibold text-foreground">{new Intl.NumberFormat("fr-FR").format(stats?.totalUsages || 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Réduction</p>
              <p className="font-semibold text-foreground">{formatCurrency(stats?.totalReduction || 0)}</p>
            </div>
          </div>
        </div>

        <LineChart
          data={Array.isArray(stats?.usageSeries) ? stats.usageSeries : []}
          className={`h-40 ${isStatsLoading ? "opacity-60 animate-pulse" : ""}`}
          stroke="hsl(var(--foreground))"
        />
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher (code, description)"
                />
              </div>
            </div>

            <div className="w-44">
              <Select value={cibleFilter} onChange={(e) => setCibleFilter(e.target.value)}>
                <option value="ALL">Toutes cibles</option>
                {cibles.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tous statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </Select>
            </div>
          </div>

          <Button variant="outline" onClick={() => promoEntry.reload().catch(() => {})} disabled={isLoading}>
            {isLoading ? "Chargement..." : "Rafraîchir"}
          </Button>
        </div>

        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

        <Table>
          <THead>
            <TRow>
              <TCell>Code</TCell>
              <TCell>Pourcentage</TCell>
              <TCell>Cible</TCell>
              <TCell>Boutique / Utilisateur</TCell>
              <TCell>Période</TCell>
              <TCell>Usage</TCell>
              <TCell>Réduction</TCell>
              <TCell>Statut</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {filtered.map((promo) => {
              const cibleLabel = cibles.find((c) => c.value === promo.cible)?.label || promo.cible;
              const ctx =
                promo.cible === "BOUTIQUE"
                  ? promo.boutiqueNom || promo.boutiqueId || "-"
                  : promo.cible === "UTILISATEUR"
                    ? promo.utilisateurEmail || promo.utilisateurId || "-"
                    : "-";
              const period =
                promo.dateDebut || promo.dateFin
                  ? `${promo.dateDebut ? formatDateTime(promo.dateDebut) : "..."} → ${promo.dateFin ? formatDateTime(promo.dateFin) : "..."}`
                  : "-";
              const usageMax = promo.usageMax !== null && promo.usageMax !== undefined ? promo.usageMax : null;
              const usage = usageMax ? `${promo.usageCount || 0} / ${usageMax}` : `${promo.usageCount || 0}`;

              return (
                <TRow key={promo.id}>
                  <TCell>
                    <div>
                      <p className="font-semibold text-foreground">{promo.code}</p>
                      <p className="text-xs text-muted-foreground">{promo.description || "-"}</p>
                    </div>
                  </TCell>
                  <TCell>{formatPercent(promo.pourcentage)}</TCell>
                  <TCell>{cibleLabel}</TCell>
                  <TCell className="text-sm">{ctx}</TCell>
                  <TCell className="text-xs text-muted-foreground">{period}</TCell>
                  <TCell>{usage}</TCell>
                  <TCell>{formatCurrency(promo.totalReduction || 0)}</TCell>
                  <TCell>
                    <Badge label={promo.estActif ? "Actif" : "Inactif"} variant={promo.estActif ? "default" : "outline"} />
                  </TCell>
                  <TCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(promo)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDelete(promo)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              );
            })}

            {filtered.length === 0 && (
              <TRow>
                <TCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                  {isLoading ? "Chargement..." : "Aucun code promo trouvé."}
                </TCell>
              </TRow>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentPromo ? "Modifier le code promo" : "Créer un code promo"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {currentPromo ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME10"
                maxLength={12}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pourcentage">Pourcentage</Label>
              <Input
                id="pourcentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.pourcentage}
                onChange={(e) => setFormData((prev) => ({ ...prev, pourcentage: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Promo de bienvenue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cible">Cible</Label>
              <Select
                id="cible"
                value={formData.cible}
                onChange={(e) => {
                  const cible = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    cible,
                    boutiqueId: cible === "BOUTIQUE" ? prev.boutiqueId : "",
                    utilisateurId: cible === "UTILISATEUR" ? prev.utilisateurId : ""
                  }));
                }}
              >
                {cibles.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              {formData.cible === "BOUTIQUE" ? (
                <>
                  <Label htmlFor="boutiqueId">Boutique</Label>
                  <Select
                    id="boutiqueId"
                    value={formData.boutiqueId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, boutiqueId: e.target.value }))}
                    options={[{ value: "", label: "(Choisir)" }, ...boutiqueOptions]}
                  />
                </>
              ) : formData.cible === "UTILISATEUR" ? (
                <>
                  <Label htmlFor="utilisateurId">Utilisateur ID</Label>
                  <Input
                    id="utilisateurId"
                    value={formData.utilisateurId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, utilisateurId: e.target.value }))}
                    placeholder="UUID utilisateur"
                  />
                </>
              ) : (
                <>
                  <Label>Contexte</Label>
                  <div className="h-10 rounded-lg border border-border bg-muted/20 px-3 flex items-center text-sm text-muted-foreground">
                    Global (aucune boutique / utilisateur)
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montantMinCommande">Montant min. commande</Label>
              <Input
                id="montantMinCommande"
                type="number"
                min="0"
                step="0.01"
                value={formData.montantMinCommande}
                onChange={(e) => setFormData((prev) => ({ ...prev, montantMinCommande: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageMax">Usage max (optionnel)</Label>
              <Input
                id="usageMax"
                type="number"
                min="1"
                step="1"
                value={formData.usageMax}
                onChange={(e) => setFormData((prev) => ({ ...prev, usageMax: e.target.value }))}
                placeholder="Ex: 100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usageMaxParUtilisateur">Usage max / utilisateur</Label>
              <Input
                id="usageMaxParUtilisateur"
                type="number"
                min="1"
                step="1"
                value={formData.usageMaxParUtilisateur}
                onChange={(e) => setFormData((prev) => ({ ...prev, usageMaxParUtilisateur: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estActif">Statut</Label>
              <Select
                id="estActif"
                value={formData.estActif ? "true" : "false"}
                onChange={(e) => setFormData((prev) => ({ ...prev, estActif: e.target.value === "true" }))}
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date début (optionnel)</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                value={formData.dateDebut}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateDebut: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date fin (optionnel)</Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateFin: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Rappel</p>
                <p>
                  Pour <strong>BOUTIQUE</strong> ou <strong>UTILISATEUR</strong>, renseignez le champ correspondant.
                  La période (début/fin) est optionnelle.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Supprimer le code promo"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">Confirmer la suppression</p>
            <p className="text-sm text-muted-foreground mt-2">
              Le code promo <strong>{currentPromo?.code}</strong> sera supprimé. Les utilisations associées seront aussi supprimées.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
