import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle, Upload } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import BulkProductImportModal from "../components/products/BulkProductImportModal.jsx";
import { backofficeApi } from "../services/api.js";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

const mapStatus = (status) => {
  if (!status) return "Actif";
  switch (status) {
    case "ACTIF":
      return "Actif";
    case "ARCHIVE":
      return "Archivé";
    case "BROUILLON":
      return "Brouillon";
    default:
      return status;
  }
};

export default function Products() {
  const navigate = useNavigate();
  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null = create mode, object = edit mode
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    name: "",
    categoryId: "",
    price: 0,
    stock: 0,
    status: "ACTIF"
  });

  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteError, setBulkDeleteError] = useState("");
  const [bulkDeleteSaving, setBulkDeleteSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsPage, cats] = await Promise.all([backofficeApi.products(0, 200), backofficeApi.categories()]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(productsPage?.content) ? productsPage.content : []);
    } catch (e) {
      setError(e?.message || "Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // --- Derived State (Filtering) ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = `${product?.name || ""}`.toLowerCase();
      const sku = `${product?.sku || ""}`.toLowerCase();
      const id = `${product?.id || ""}`.toLowerCase();

      const matchesSearch = 
        name.includes(searchQuery.toLowerCase()) ||
        sku.includes(searchQuery.toLowerCase()) ||
        id.includes(searchQuery.toLowerCase());
      
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
      const matchesStatus = !statusFilter || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const visibleIds = useMemo(() => filteredProducts.map((p) => p.id), [filteredProducts]);
  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    for (const id of visibleIds) {
      if (!selectedIds.has(id)) return false;
    }
    return true;
  }, [visibleIds, selectedIds]);

  // --- Handlers ---

  const handleOpenCreate = () => {
    navigate("/products/create");
  };

  const openBulk = () => {
    setBulkResult(null);
    setIsBulkOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      id: product.id,
      sku: product.sku || "",
      name: product.name || "",
      categoryId: product.categoryId || "",
      price: product.price ?? 0,
      stock: Number.isFinite(product.stock) ? product.stock : 0,
      status: product.status || "ACTIF"
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product) => {
    setCurrentProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentProduct) return;

    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: formData.categoryId
      };

      await backofficeApi.updateProduct(currentProduct.id, payload);
      await reload();
      setIsFormOpen(false);
    } catch (e2) {
      setError(e2?.message || "Impossible de mettre à jour le produit.");
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    try {
      await backofficeApi.deleteProduct(currentProduct.id);
      await reload();
      setIsDeleteOpen(false);
      setCurrentProduct(null);
    } catch (e) {
      setError(e?.message || "Impossible de supprimer le produit.");
    }
  };

  const submitBulk = async (toCreate) => {
    setBulkSaving(true);
    setBulkResult(null);
    try {
      const res = await backofficeApi.bulkCreateProducts(toCreate);
      setBulkResult(res || null);
      await reload();
    } catch (e) {
      setError(e?.message || "Impossible d'ajouter en masse.");
    } finally {
      setBulkSaving(false);
    }
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
      await backofficeApi.bulkDeleteProducts(ids);
      await reload();
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
    } catch (e) {
      setBulkDeleteError(e?.message || "Suppression en masse impossible.");
    } finally {
      setBulkDeleteSaving(false);
    }
  };

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalSKU = products.length;
    const lowStock = products.filter(p => Number(p?.stock || 0) < 10).length;
    const activeProducts = products.filter(p => p?.status === "ACTIF").length;
    const stockValue = products.reduce((acc, p) => {
      const price = Number(p?.price || 0);
      const qty = Number(p?.stock || 0);
      if (!Number.isFinite(price) || !Number.isFinite(qty)) return acc;
      return acc + Math.round(price) * qty;
    }, 0);
    return { totalSKU, lowStock, activeProducts, stockValue };
  }, [products]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}
      <SectionHeader
        title="Catalogue produits"
        subtitle="Gérez votre inventaire, vos prix et vos stocks en temps réel."
        rightSlot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={reload} disabled={loading}>
              {loading ? "Chargement..." : "Rafraîchir"}
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres avancés
            </Button>
            <Button variant="outline" onClick={openBulk} className="gap-2">
              <Upload className="h-4 w-4" />
              Ajout en masse
            </Button>
            {selectedIds.size > 0 ? (
              <Button variant="destructive" onClick={confirmBulkDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer ({selectedIds.size})
              </Button>
            ) : null}
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2 border-l-4 border-l-primary">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">SKU actifs</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{stats.activeProducts}</p>
            <span className="text-xs text-muted-foreground">/ {stats.totalSKU} total</span>
          </div>
        </Card>
        <Card className="space-y-2 border-l-4 border-l-amber-500">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Stock Faible</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
            <span className="text-xs text-muted-foreground">produits à réapprovisionner</span>
          </div>
        </Card>
        <Card className="space-y-2 border-l-4 border-l-emerald-500">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Valeur Stock</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.stockValue)}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou SKU..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-background w-full md:w-40"
              options={[
                { value: "", label: "Toutes catégories" },
                ...categories.map((c) => ({ value: c.id, label: c.nom }))
              ]}
            />
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background w-full md:w-40"
              options={[
                { value: "", label: "Tous statuts" },
                { value: "ACTIF", label: "Actif" },
                { value: "BROUILLON", label: "Brouillon" },
                { value: "ARCHIVE", label: "Archivé" }
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <THead>
            <TRow>
              <TCell>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Sélectionner tous les produits visibles"
                />
              </TCell>
              <TCell>SKU</TCell>
              <TCell>Nom</TCell>
              <TCell>Catégorie</TCell>
              <TCell>Prix</TCell>
              <TCell>Stock</TCell>
              <TCell>Statut</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                  <TCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelectOne(product.id)}
                      aria-label={`Sélectionner ${product.name}`}
                    />
                  </TCell>
                  <TCell className="font-mono text-xs font-medium text-muted-foreground">{product.sku || product.id}</TCell>
                  <TCell className="font-medium text-foreground">{product.name}</TCell>
                  <TCell>{product.category || "-"}</TCell>
                  <TCell>{formatCurrency(product.price)}</TCell>
                  <TCell>
                    <span className={Number(product.stock) < 10 ? "text-red-600 font-bold" : ""}>
                      {Number.isFinite(product.stock) ? product.stock : 0}
                    </span>
                  </TCell>
                  <TCell><Badge label={mapStatus(product.status)} /></TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(product)}>
                        <Edit2 className="h-4 w-4 text-slate-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(product)}>
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            ) : (
              <TRow>
                <TCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>Aucun produit trouvé</p>
                    <Button variant="link" onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("");
                      setStatusFilter("");
                      setSelectedIds(new Set());
                    }}>
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </TCell>
              </TRow>
            )}
          </tbody>
        </Table>
        
        {/* Pagination (Mock) */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <p>Affichage de {filteredProducts.length} sur {products.length} produits</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Précédent</Button>
            <Button variant="outline" size="sm" disabled>Suivant</Button>
          </div>
        </div>
      </Card>

      {/* --- Create / Edit Modal --- */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentProduct ? "Modifier le produit" : "Ajouter un produit"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit}>{currentProduct ? "Enregistrer" : "Créer"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">SKU (ID)</Label>
              <Input 
                id="id" 
                value={formData.sku || formData.id} 
                disabled
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                options={categories.map((c) => ({ value: c.id, label: c.nom }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix</Label>
              <Input 
                id="price" 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input 
                id="stock" 
                type="number"
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select 
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              options={[
                { value: "ACTIF", label: "Actif" },
                { value: "BROUILLON", label: "Brouillon" },
                { value: "ARCHIVE", label: "Archivé" }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Archiver le produit"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Archiver</Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">Êtes-vous sûr de vouloir archiver ce produit ?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Le produit <strong>{currentProduct?.name}</strong> sera retiré du catalogue et conservé dans l'historique.
            </p>
          </div>
        </div>
      </Modal>

      <BulkProductImportModal
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
        title="Suppression en masse"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)} disabled={bulkDeleteSaving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={runBulkDelete} disabled={bulkDeleteSaving}>
              {bulkDeleteSaving ? "Suppression..." : `Archiver (${selectedIds.size})`}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} produit(s) seront archivés et retirés du catalogue.
          </p>
          {bulkDeleteError ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-sm text-red-700">
              {bulkDeleteError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
