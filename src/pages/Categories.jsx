import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertCircle, Upload, Star } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import BulkCategoryImportModal from "../components/categories/BulkCategoryImportModal.jsx";
import CategoryImageUpload from "../components/categories/CategoryImageUpload.jsx";
import { backofficeApi } from "../services/api.js";

const levels = [
  { value: "PRINCIPALE", label: "Principale" },
  { value: "SOUS_CATEGORIE", label: "Sous-catégorie" },
  { value: "SOUS_SOUS_CATEGORIE", label: "Sous-sous-catégorie" }
];

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return d.toLocaleString("fr-FR");
};

const slugify = (value) =>
  `${value || ""}`
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .replace(/-+/g, "-");

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDisableAllOpen, setIsDisableAllOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkDeleteSaving, setBulkDeleteSaving] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState("");
  const [disableAllSaving, setDisableAllSaving] = useState(false);
  const [disableAllError, setDisableAllError] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    slug: "",
    imageUrl: "",
    niveau: "PRINCIPALE",
    parentId: "",
    ordre: 0,
    estActive: true
  });

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await backofficeApi.categories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Impossible de charger les catégories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .filter((c) => (currentCategory ? c.id !== currentCategory.id : true))
      .slice()
      .sort((a, b) => {
        const ao = Number(a.ordre) || 0;
        const bo = Number(b.ordre) || 0;
        if (ao !== bo) return ao - bo;
        return `${a.nom || ""}`.localeCompare(`${b.nom || ""}`, "fr");
      });
  }, [categories, currentCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .slice()
      .sort((a, b) => {
        const ao = Number(a.ordre) || 0;
        const bo = Number(b.ordre) || 0;
        if (ao !== bo) return ao - bo;
        return `${a.nom || ""}`.localeCompare(`${b.nom || ""}`, "fr");
      })
      .filter((c) => {
        const matchesQuery =
          !q ||
          `${c.nom || ""}`.toLowerCase().includes(q) ||
          `${c.slug || ""}`.toLowerCase().includes(q);

        const matchesLevel = levelFilter === "ALL" || c.niveau === levelFilter;

        const active = Boolean(c.estActive);
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && active) ||
          (statusFilter === "INACTIVE" && !active);

        return matchesQuery && matchesLevel && matchesStatus;
      });
  }, [categories, query, levelFilter, statusFilter]);

  const visibleIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    for (const id of visibleIds) {
      if (!selectedIds.has(id)) return false;
    }
    return true;
  }, [visibleIds, selectedIds]);

  const openCreate = () => {
    setCurrentCategory(null);
    setFormData({
      nom: "",
      slug: "",
      imageUrl: "",
      niveau: "PRINCIPALE",
      parentId: "",
      ordre: 0,
      estActive: true
    });
    setIsFormOpen(true);
  };

  const openEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      nom: category.nom || "",
      slug: category.slug || "",
      imageUrl: category.imageUrl || "",
      niveau: category.niveau || "PRINCIPALE",
      parentId: category.parentId || "",
      ordre: Number(category.ordre) || 0,
      estActive: Boolean(category.estActive)
    });
    setIsFormOpen(true);
  };

  const openDelete = (category) => {
    setCurrentCategory(category);
    setIsDeleteOpen(true);
  };

  const handleToggleFeatured = async (category) => {
    if (!category?.id) return;
    const next = !Boolean(category?.isFeatured);
    try {
      const payload = {
        nom: category.nom || "",
        slug: category.slug || "",
        imageUrl: category.imageUrl || null,
        niveau: category.niveau || "PRINCIPALE",
        parentId: category.parentId || null,
        ordre: Number.isFinite(Number(category.ordre)) ? Number(category.ordre) : 0,
        estActive: Boolean(category.estActive),
        isFeatured: next
      };
      await backofficeApi.updateCategory(category.id, payload);
      setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, isFeatured: next } : c)));
    } catch (err) {
      setError(err?.message || "Impossible de mettre à jour l’état en phare.");
    }
  };

  const openBulk = () => {
    setBulkResult(null);
    setIsBulkOpen(true);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedParentId = `${formData.parentId || ""}`.trim();
    if (formData.niveau !== "PRINCIPALE" && !trimmedParentId) {
      setError("Parent obligatoire pour une sous-catÃ©gorie.");
      return;
    }

    const isParentCategory = formData.niveau === "PRINCIPALE" && !trimmedParentId;
    const payload = {
      nom: formData.nom,
      slug: formData.slug?.trim() ? formData.slug.trim() : slugify(formData.nom),
      imageUrl: isParentCategory ? formData.imageUrl?.trim() || null : null,
      niveau: formData.niveau,
      parentId: trimmedParentId || null,
      ordre: Number.isFinite(Number(formData.ordre)) ? Number(formData.ordre) : 0,
      estActive: Boolean(formData.estActive)
    };

    try {
      if (currentCategory?.id) {
        await backofficeApi.updateCategory(currentCategory.id, payload);
      } else {
        await backofficeApi.createCategory(payload);
      }
      setIsFormOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!currentCategory?.id) return;
    setError("");
    try {
      await backofficeApi.deleteCategory(currentCategory.id);
      setIsDeleteOpen(false);
      setCurrentCategory(null);
      await loadCategories();
    } catch (err) {
      setError(err?.message || "Erreur lors de la suppression.");
    }
  };

  const submitBulk = async (items) => {
    setBulkSaving(true);
    setBulkResult(null);
    setError("");
    try {
      const res = await backofficeApi.bulkCreateCategories(items);
      setBulkResult(res || null);
      await loadCategories();
    } catch (err) {
      setError(err?.message || "Impossible d'ajouter en masse.");
    } finally {
      setBulkSaving(false);
    }
  };

  const confirmBulkDelete = () => {
    setBulkDeleteError("");
    setIsBulkDeleteOpen(true);
  };

  const runBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkDeleteSaving(true);
    setBulkDeleteError("");
    try {
      await backofficeApi.bulkDeleteCategories(ids);
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      await loadCategories();
    } catch (err) {
      setBulkDeleteError(err?.message || "Suppression en masse impossible.");
    } finally {
      setBulkDeleteSaving(false);
    }
  };

  const totalCategories = useMemo(() => (categories || []).length, [categories]);

  const confirmDisableAll = () => {
    setDisableAllError("");
    setIsDisableAllOpen(true);
  };

  const runDisableAll = async (withProducts) => {
    if (totalCategories === 0) return;
    setDisableAllSaving(true);
    setDisableAllError("");
    try {
      await backofficeApi.purgeCategories(Boolean(withProducts));
      setSelectedIds(new Set());
      setIsDisableAllOpen(false);
      await loadCategories();
    } catch (err) {
      setDisableAllError(err?.message || "Suppression globale impossible.");
    } finally {
      setDisableAllSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Catégories"
        subtitle="Gérez les catégories (hiérarchie, slug, ordre et activation)."
        rightSlot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={openBulk} className="gap-2">
              <Upload className="h-4 w-4" />
              Ajout en masse
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisableAll}
              disabled={totalCategories === 0}
            >
              Supprimer toutes
            </Button>
            {selectedIds.size > 0 ? (
              <Button variant="destructive" onClick={confirmBulkDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Désactiver ({selectedIds.size})
              </Button>
            ) : null}
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </div>
        }
      />

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
                  placeholder="Rechercher (nom, slug)"
                />
              </div>
            </div>
            <div className="w-52">
              <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                <option value="ALL">Tous niveaux</option>
                {levels.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">Tous statuts</option>
                <option value="ACTIVE">Actives</option>
                <option value="INACTIVE">Inactives</option>
              </Select>
            </div>
          </div>

          <Button variant="outline" onClick={loadCategories} disabled={isLoading}>
            {isLoading ? "Chargement..." : "Rafraîchir"}
          </Button>
        </div>

        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

        <Table>
          <THead>
            <TRow>
              <TCell>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Sélectionner toutes les catégories visibles"
                />
              </TCell>
              <TCell>Nom</TCell>
              <TCell>Niveau</TCell>
              <TCell>Parent</TCell>
              <TCell>Slug</TCell>
              <TCell>Ordre</TCell>
              <TCell>Phare</TCell>
              <TCell>Statut</TCell>
              <TCell>Mise à jour</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {filtered.map((category) => {
              const levelLabel = levels.find((l) => l.value === category.niveau)?.label || category.niveau;
              const statusLabel = category.estActive ? "Actif" : "Inactif";
              return (
                <TRow key={category.id}>
                  <TCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(category.id)}
                      onChange={() => toggleSelectOne(category.id)}
                      aria-label={`Sélectionner ${category.nom}`}
                    />
                  </TCell>
                  <TCell>
                    <div>
                      <p className="font-semibold text-foreground">{category.nom}</p>
                      <p className="text-xs text-muted-foreground">{category.id}</p>
                    </div>
                  </TCell>
                  <TCell>{levelLabel}</TCell>
                  <TCell>{category.parentName || "-"}</TCell>
                  <TCell className="font-mono text-xs">{category.slug}</TCell>
                  <TCell>{Number(category.ordre) || 0}</TCell>
                  <TCell>
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(category)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
                        category.isFeatured
                          ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                          : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                      }`}
                      title={category.isFeatured ? "Retirer des catégories en phare" : "Mettre en catégorie en phare"}
                    >
                      <Star className={category.isFeatured ? "fill-current" : ""} size={16} />
                    </button>
                  </TCell>
                  <TCell>
                    <Badge label={statusLabel} variant={category.estActive ? "default" : "outline"} />
                  </TCell>
                  <TCell>{formatDateTime(category.dateMiseAJour || category.dateCreation)}</TCell>
                  <TCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(category)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDelete(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              );
            })}

            {filtered.length === 0 && (
              <TRow>
                <TCell colSpan={10} className="text-center text-sm text-muted-foreground py-10">
                  {isLoading ? "Chargement..." : "Aucune catégorie trouvée."}
                </TCell>
              </TRow>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentCategory ? "Modifier la catégorie" : "Créer une catégorie"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {currentCategory ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => {
                const nom = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  nom,
                  slug: prev.slug ? prev.slug : slugify(nom)
                }));
              }}
              placeholder="Ex: Électronique"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="electronique"
              />
              <p className="text-xs text-muted-foreground">URL-friendly (unique).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordre">Ordre</Label>
              <Input
                id="ordre"
                type="number"
                min="0"
                value={formData.ordre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ordre: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {formData.niveau === "PRINCIPALE" ? (
              <CategoryImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Image autorisée uniquement pour les catégories parent.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau</Label>
              <Select
                id="niveau"
                value={formData.niveau}
                onChange={(e) => {
                  const niveau = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    niveau,
                    parentId: niveau === "PRINCIPALE" ? "" : prev.parentId,
                    imageUrl: niveau === "PRINCIPALE" ? prev.imageUrl : ""
                  }));
                }}
              >
                {levels.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent</Label>
              <Select
                id="parentId"
                value={formData.parentId}
                onChange={(e) => {
                  const parentId = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    parentId,
                    niveau: parentId && prev.niveau === "PRINCIPALE" ? "SOUS_CATEGORIE" : prev.niveau,
                    imageUrl: parentId ? "" : prev.imageUrl
                  }));
                }}
                disabled={formData.niveau === "PRINCIPALE"}
              >
                <option value="">(Aucun)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </Select>
              {formData.niveau === "PRINCIPALE" && (
                <p className="text-xs text-muted-foreground">Les catégories principales n'ont pas de parent.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estActive">Statut</Label>
            <Select
              id="estActive"
              value={formData.estActive ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, estActive: e.target.value === "true" }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Hiérarchie</p>
                <p>
                  Supprimer une catégorie parent peut supprimer ses sous-catégories (selon la configuration
                  DB).
                </p>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Désactiver la catégorie"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!currentCategory?.id}>
              Désactiver
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">Confirmer la désactivation</p>
            <p className="text-sm text-muted-foreground mt-2">
              La catégorie <strong>{currentCategory?.nom}</strong> sera marquée inactive et conservée.
            </p>
          </div>
        </div>
      </Modal>

      <BulkCategoryImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        categories={categories}
        onSubmit={submitBulk}
        isSubmitting={bulkSaving}
        result={bulkResult}
      />

      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => (bulkDeleteSaving ? null : setIsBulkDeleteOpen(false))}
        title="Désactivation en masse"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)} disabled={bulkDeleteSaving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={runBulkDelete} disabled={bulkDeleteSaving}>
              {bulkDeleteSaving ? "Désactivation..." : `Désactiver (${selectedIds.size})`}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{selectedIds.size} catégorie(s) seront désactivées.</p>
          {bulkDeleteError ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-sm text-red-700">
              {bulkDeleteError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isDisableAllOpen}
        onClose={() => (disableAllSaving ? null : setIsDisableAllOpen(false))}
        title="Supprimer toutes les catégories"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDisableAllOpen(false)} disabled={disableAllSaving}>
              Annuler
            </Button>
            <Button variant="outline" onClick={() => runDisableAll(false)} disabled={disableAllSaving}>
              Supprimer catégories
            </Button>
            <Button variant="destructive" onClick={() => runDisableAll(true)} disabled={disableAllSaving}>
              {disableAllSaving ? "Suppression..." : "Supprimer + produits"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{totalCategories} catégorie(s) seront supprimées définitivement.</p>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Supprimer catégories échoue si des produits existent. Supprimer + produits nettoie aussi le catalogue (les lignes de commande gardent l'historique).
          </div>
          {disableAllError ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-sm text-red-700">
              {disableAllError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
