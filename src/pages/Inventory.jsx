import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, Plus, Search } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatMoney(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function toTypeLabel(type) {
  if (type === "ENTREE") return "Entrée";
  if (type === "SORTIE") return "Sortie";
  if (type === "AJUSTEMENT") return "Ajustement";
  return type || "-";
}

function toTypeBadgeVariant(type) {
  if (type === "ENTREE") return "secondary";
  if (type === "SORTIE") return "outline";
  if (type === "AJUSTEMENT") return "default";
  return "default";
}

function getSku(product) {
  return product?.sku || product?.id || "-";
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inventory");

  const [threshold, setThreshold] = useState(5);
  const [productQuery, setProductQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const [skuQuery, setSkuQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [movementPage, setMovementPage] = useState(0);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  const [movementsPage, setMovementsPage] = useState(null);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [movementsError, setMovementsError] = useState("");

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementForm, setMovementForm] = useState({
    productId: "",
    sku: "",
    type: "ENTREE",
    quantity: "",
    newStock: "",
    reference: ""
  });
  const [movementSaving, setMovementSaving] = useState(false);
  const [movementSubmitError, setMovementSubmitError] = useState("");

  const selectedProduct = useMemo(() => {
    const productId = movementForm.productId;
    if (!productId) return null;
    return (products || []).find((p) => p?.id === productId) || null;
  }, [movementForm.productId, products]);

  const selectedProductStock = useMemo(() => {
    if (!selectedProduct) return 0;
    return Number.isFinite(selectedProduct?.stock) ? selectedProduct.stock : 0;
  }, [selectedProduct]);

  const projectedStock = useMemo(() => {
    const type = movementForm.type;
    const qty = Number(movementForm.quantity);
    const newStock = Number(movementForm.newStock);
    const before = selectedProductStock;

    if (type === "ENTREE") {
      return Number.isFinite(qty) && qty > 0 ? before + Math.abs(qty) : before;
    }
    if (type === "SORTIE") {
      return Number.isFinite(qty) && qty > 0 ? before - Math.abs(qty) : before;
    }
    if (type === "AJUSTEMENT") {
      return Number.isFinite(newStock) && newStock >= 0 ? newStock : before;
    }
    return before;
  }, [movementForm.quantity, movementForm.newStock, movementForm.type, selectedProductStock]);

  const projectedDelta = useMemo(() => {
    return projectedStock - selectedProductStock;
  }, [projectedStock, selectedProductStock]);

  function openMovementModal({ product, type } = {}) {
    const resolvedProduct = product || null;
    setMovementSubmitError("");
    setIsMovementModalOpen(true);
    setMovementForm((prev) => ({
      ...prev,
      productId: resolvedProduct?.id || "",
      sku: resolvedProduct ? getSku(resolvedProduct) : prev.sku,
      type: type || prev.type,
      quantity: "",
      newStock: "",
      reference: ""
    }));
  }

  function closeMovementModal() {
    if (movementSaving) return;
    setIsMovementModalOpen(false);
    setMovementSubmitError("");
  }

  async function refreshProducts() {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await backofficeApi.products(0, 500);
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setProducts(list);
    } catch (err) {
      setProductsError(err?.message || "Impossible de charger les produits.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function refreshCategories() {
    setCategoriesError("");
    try {
      const res = await backofficeApi.categories();
      setCategories(Array.isArray(res) ? res : []);
    } catch (err) {
      setCategoriesError(err?.message || "Impossible de charger les catégories.");
    }
  }

  useEffect(() => {
    refreshProducts();
    refreshCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMovementsLoading(true);
    setMovementsError("");

    const timer = setTimeout(() => {
      backofficeApi
        .stockMovements(movementPage, 20, skuQuery.trim(), typeFilter)
        .then((res) => {
          if (cancelled) return;
          setMovementsPage(res);
        })
        .catch((err) => {
          if (cancelled) return;
          setMovementsError(err?.message || "Impossible de charger les mouvements.");
        })
        .finally(() => {
          if (cancelled) return;
          setMovementsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [skuQuery, typeFilter, movementPage]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const sorted = [...list].sort((a, b) => (a?.nom || "").localeCompare(b?.nom || ""));
    return sorted;
  }, [categories]);

  const inventoryRows = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const thresholdValue = Number.isFinite(threshold) ? threshold : 10;

    return (products || [])
      .map((p) => {
        const stock = Number.isFinite(p?.stock) ? p.stock : 0;
        const price = typeof p?.price === "number" ? p.price : Number(p?.price);
        const stockValue = (Number.isFinite(price) ? price : 0) * stock;

        let stockStatus = "OK";
        if (stock <= 0) stockStatus = "RUPTURE";
        else if (stock <= thresholdValue) stockStatus = "FAIBLE";

        return {
          id: p?.id,
          sku: getSku(p),
          name: p?.name || "-",
          categoryId: p?.categoryId || "",
          category: p?.category || "-",
          price: Number.isFinite(price) ? price : 0,
          stock,
          status: p?.status || "-",
          stockStatus,
          stockValue
        };
      })
      .filter((p) => {
        if (q) {
          const hay = `${p.sku} ${p.name}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (categoryFilter && p.categoryId !== categoryFilter) return false;
        if (stockFilter === "LOW" && p.stockStatus !== "FAIBLE") return false;
        if (stockFilter === "OUT" && p.stockStatus !== "RUPTURE") return false;
        return true;
      })
      .sort((a, b) => {
        if (a.stockStatus !== b.stockStatus) {
          const w = (s) => (s === "RUPTURE" ? 0 : s === "FAIBLE" ? 1 : 2);
          return w(a.stockStatus) - w(b.stockStatus);
        }
        return a.name.localeCompare(b.name);
      });
  }, [products, productQuery, categoryFilter, stockFilter, threshold]);

  const inventoryKpis = useMemo(() => {
    const thresholdValue = Number.isFinite(threshold) ? threshold : 10;
    const totalSkus = (products || []).length;
    const totalUnits = (products || []).reduce((sum, p) => sum + (Number.isFinite(p?.stock) ? p.stock : 0), 0);
    const lowCount = (products || []).reduce((sum, p) => sum + ((Number.isFinite(p?.stock) ? p.stock : 0) <= thresholdValue ? 1 : 0), 0);
    const value = (products || []).reduce((sum, p) => {
      const stock = Number.isFinite(p?.stock) ? p.stock : 0;
      const price = typeof p?.price === "number" ? p.price : Number(p?.price);
      return sum + (Number.isFinite(price) ? price : 0) * stock;
    }, 0);
    return { totalSkus, totalUnits, lowCount, value };
  }, [products, threshold]);

  const lowStockItems = useMemo(() => {
    const thresholdValue = Number.isFinite(threshold) ? threshold : 10;
    return (products || [])
      .map((p) => ({
        id: p?.id,
        sku: getSku(p),
        name: p?.name || "-",
        stock: Number.isFinite(p?.stock) ? p.stock : 0,
        threshold: thresholdValue
      }))
      .filter((p) => p.stock <= p.threshold)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);
  }, [products, threshold]);

  const movements = useMemo(() => {
    return Array.isArray(movementsPage?.content) ? movementsPage.content : [];
  }, [movementsPage]);

  const movementsMeta = useMemo(() => {
    const totalPages = Number.isFinite(movementsPage?.totalPages) ? movementsPage.totalPages : 1;
    const totalElements = Number.isFinite(movementsPage?.totalElements) ? movementsPage.totalElements : 0;
    return { totalPages, totalElements };
  }, [movementsPage]);

  async function submitMovement() {
    if (!movementForm.productId) {
      setMovementSubmitError("Sélectionne un produit.");
      return;
    }
    const type = movementForm.type;
    const quantity = Number(movementForm.quantity);
    const newStock = Number(movementForm.newStock);

    const payload = {
      productId: movementForm.productId,
      type,
      reference: movementForm.reference || undefined
    };

    if (type === "AJUSTEMENT") {
      if (!Number.isFinite(newStock) || newStock < 0) {
        setMovementSubmitError("Nouveau stock invalide.");
        return;
      }
      payload.newStock = Math.trunc(newStock);
      payload.quantity = 1;
    } else {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setMovementSubmitError("Quantité invalide.");
        return;
      }
      payload.quantity = Math.trunc(Math.abs(quantity));
    }

    if (type === "SORTIE" && projectedStock < 0) {
      setMovementSubmitError("Stock insuffisant pour cette sortie.");
      return;
    }

    setMovementSaving(true);
    setMovementSubmitError("");
    try {
      await backofficeApi.createStockMovement(payload);
      await refreshProducts();
      await backofficeApi
        .stockMovements(movementPage, 20, skuQuery.trim(), typeFilter)
        .then((res) => setMovementsPage(res))
        .catch(() => null);
      closeMovementModal();
    } catch (err) {
      setMovementSubmitError(err?.message || "Impossible de créer le mouvement.");
    } finally {
      setMovementSaving(false);
    }
  }

  const rightSlot = (
    <div className="flex flex-wrap gap-2">
      <Button variant={activeTab === "inventory" ? "primary" : "outline"} onClick={() => setActiveTab("inventory")}>
        Inventaire
      </Button>
      <Button variant={activeTab === "movements" ? "primary" : "outline"} onClick={() => setActiveTab("movements")}>
        Mouvement de stock
      </Button>
      <Button
        variant="outline"
        onClick={() => openMovementModal()}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Nouveau mouvement
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Stocks" subtitle="Pilotage fin du stock, suivi des mouvements et alertes." rightSlot={rightSlot} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Références</p>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{formatMoney(inventoryKpis.totalSkus)}</div>
          <p className="text-xs text-muted-foreground">Produits disponibles dans le catalogue backoffice</p>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Unités en stock</p>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{formatMoney(inventoryKpis.totalUnits)}</div>
          <p className="text-xs text-muted-foreground">Somme des quantités disponibles</p>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sous seuil</p>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{formatMoney(inventoryKpis.lowCount)}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Seuil</span>
            <div className="w-20">
              <Input
                type="number"
                min={0}
                value={`${threshold}`}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v) || v < 0) setThreshold(0);
                  else setThreshold(Math.trunc(v));
                }}
              />
            </div>
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Valeur de stock</p>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{formatMoney(inventoryKpis.value)} FCFA</div>
          <p className="text-xs text-muted-foreground">Prix × stock (arrondi, sans décimales)</p>
        </Card>
      </div>

      {activeTab === "inventory" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-4 space-y-4">
            <SectionHeader title="Inventaire" subtitle="Recherche, filtres et actions rapides sur le stock" />

            <div className="flex flex-wrap gap-3 items-end">
              <div className="w-full sm:w-72 space-y-1">
                <p className="text-xs text-muted-foreground">Recherche</p>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="SKU ou nom produit..." value={productQuery} onChange={(e) => setProductQuery(e.target.value)} />
                </div>
              </div>
              <div className="w-full sm:w-56 space-y-1">
                <p className="text-xs text-muted-foreground">Catégorie</p>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">Toutes</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </Select>
                {categoriesError ? <p className="text-xs text-red-600">{categoriesError}</p> : null}
              </div>
              <div className="w-full sm:w-44 space-y-1">
                <p className="text-xs text-muted-foreground">État stock</p>
                <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="LOW">Faible</option>
                  <option value="OUT">Rupture</option>
                </Select>
              </div>
              <div className="flex-1" />
              <Button variant="outline" onClick={refreshProducts} disabled={productsLoading}>
                Rafraîchir
              </Button>
            </div>

            {productsError ? <div className="text-sm text-red-600">{productsError}</div> : null}

            <Table>
              <THead>
                <TRow>
                  <TCell>SKU</TCell>
                  <TCell>Produit</TCell>
                  <TCell>Catégorie</TCell>
                  <TCell>Stock</TCell>
                  <TCell>Valeur</TCell>
                  <TCell>Statut</TCell>
                  <TCell>Actions</TCell>
                </TRow>
              </THead>
              <tbody>
                {productsLoading ? (
                  <TRow>
                    <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : inventoryRows.length === 0 ? (
                  <TRow>
                    <TCell className="text-muted-foreground text-sm">Aucun produit.</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : (
                  inventoryRows.map((row) => {
                    const stockBadge =
                      row.stockStatus === "RUPTURE"
                        ? { label: "Rupture", variant: "destructive" }
                        : row.stockStatus === "FAIBLE"
                          ? { label: "Faible", variant: "secondary" }
                          : { label: "OK", variant: "outline" };
                    const product = (products || []).find((p) => p?.id === row.id) || null;
                    return (
                      <TRow key={row.id}>
                        <TCell className="font-mono text-xs">{row.sku}</TCell>
                        <TCell className="space-y-1">
                          <div className="font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {row.id}</div>
                        </TCell>
                        <TCell className="text-sm">{row.category}</TCell>
                        <TCell className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge label={stockBadge.label} variant={stockBadge.variant} />
                            <span className="font-semibold">{row.stock}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Seuil: {threshold}</div>
                        </TCell>
                        <TCell className="text-sm">{formatMoney(row.stockValue)} FCFA</TCell>
                        <TCell>
                          <Badge label={row.status === "ACTIF" ? "Actif" : row.status} variant="outline" />
                        </TCell>
                        <TCell className="text-right">
                          <div className="inline-flex items-center justify-end rounded-md border border-input bg-background/60 overflow-hidden">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs rounded-none first:rounded-l-md"
                              onClick={() => openMovementModal({ product, type: "ENTREE" })}
                            >
                              Entrée
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs rounded-none"
                              onClick={() => openMovementModal({ product, type: "SORTIE" })}
                            >
                              Sortie
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs rounded-none last:rounded-r-md"
                              onClick={() => openMovementModal({ product, type: "AJUSTEMENT" })}
                            >
                              Ajuster
                            </Button>
                          </div>
                        </TCell>
                      </TRow>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Card>

          <Card className="p-4 space-y-4">
            <SectionHeader title="Alertes stock" subtitle="Produits à risque de rupture" />
            {productsLoading ? (
              <div className="text-muted-foreground text-sm">Chargement…</div>
            ) : productsError ? (
              <div className="text-red-600 text-sm">{productsError}</div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-muted-foreground text-sm">Aucune alerte.</div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => {
                  const product = (products || []).find((p) => p?.id === item.id) || null;
                  const missing = Math.max(0, item.threshold - item.stock);
                  return (
                    <div
                      key={item.sku}
                      className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{item.sku}</p>
                        </div>
                        <Badge label="Critique" variant="destructive" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Stock: <strong className="text-foreground">{item.stock}</strong>
                        </span>
                        <span className="text-muted-foreground text-right">
                          Seuil: <strong className="text-foreground">{item.threshold}</strong>
                        </span>
                        <span className="text-muted-foreground col-span-2">
                          Suggestion réappro: <strong className="text-foreground">{missing}</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 text-xs"
                          onClick={() => {
                            openMovementModal({ product, type: "ENTREE" });
                            setMovementForm((prev) => ({ ...prev, quantity: missing ? `${missing}` : "" }));
                          }}
                        >
                          Réappro rapide
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => openMovementModal({ product, type: "AJUSTEMENT" })}>
                          Ajuster
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-4 space-y-4">
            <SectionHeader title="Mouvements de stock" subtitle="Traçabilité, recherches et contrôle" />

            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-60 space-y-1">
                <p className="text-xs text-muted-foreground">SKU</p>
                <Input placeholder="Rechercher..." value={skuQuery} onChange={(e) => { setMovementPage(0); setSkuQuery(e.target.value); }} />
              </div>
              <div className="w-full sm:w-44 space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <Select value={typeFilter} onChange={(e) => { setMovementPage(0); setTypeFilter(e.target.value); }}>
                  <option value="">Tous</option>
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                  <option value="AJUSTEMENT">Ajustement</option>
                </Select>
              </div>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => openMovementModal()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau
              </Button>
            </div>

            <Table>
              <THead>
                <TRow>
                  <TCell>SKU</TCell>
                  <TCell>Produit</TCell>
                  <TCell>Type</TCell>
                  <TCell>Qté</TCell>
                  <TCell>Avant</TCell>
                  <TCell>Après</TCell>
                  <TCell>Référence</TCell>
                  <TCell>Date</TCell>
                </TRow>
              </THead>
              <tbody>
                {movementsLoading ? (
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
                ) : movementsError ? (
                  <TRow>
                    <TCell className="text-red-600 text-sm">{movementsError}</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : movements.length === 0 ? (
                  <TRow>
                    <TCell className="text-muted-foreground text-sm">Aucun mouvement.</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : (
                  movements.map((mvt) => {
                    const type = mvt?.type || "";
                    const qty = Number.isFinite(mvt?.quantity) ? mvt.quantity : 0;
                    const qtyClass = qty > 0 ? "text-green-600" : qty < 0 ? "text-red-600" : "";
                    return (
                      <TRow key={mvt?.id || `${mvt?.sku}-${mvt?.createdAt}`}>
                        <TCell className="font-mono text-xs">{mvt?.sku || "-"}</TCell>
                        <TCell className="font-medium">{mvt?.productName || "-"}</TCell>
                        <TCell>
                          <Badge label={toTypeLabel(type)} variant={toTypeBadgeVariant(type)} />
                        </TCell>
                        <TCell className={qtyClass}>
                          {qty > 0 ? "+" : ""}
                          {qty}
                        </TCell>
                        <TCell className="text-sm">{Number.isFinite(mvt?.stockBefore) ? mvt.stockBefore : "-"}</TCell>
                        <TCell className="text-sm">{Number.isFinite(mvt?.stockAfter) ? mvt.stockAfter : "-"}</TCell>
                        <TCell className="text-xs text-muted-foreground">{mvt?.reference || "-"}</TCell>
                        <TCell className="text-muted-foreground text-xs">{formatDate(mvt?.createdAt)}</TCell>
                      </TRow>
                    );
                  })
                )}
              </tbody>
            </Table>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatMoney(movementsMeta.totalElements)} mouvements • page {movementPage + 1}/{movementsMeta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={movementPage <= 0 || movementsLoading}
                  onClick={() => setMovementPage((p) => Math.max(0, p - 1))}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={movementPage + 1 >= movementsMeta.totalPages || movementsLoading}
                  onClick={() => setMovementPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <SectionHeader title="Contrôle" subtitle="Sécurité et cohérence du stock" />
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prévention</span>
                  <Badge label="Actif" variant="secondary" />
                </div>
                <p className="text-muted-foreground text-xs">
                  Les sorties bloquent si le stock devient négatif. Les ajustements recalculent l’écart et tracent avant/après.
                </p>
              </div>
              <Button className="w-full gap-2" onClick={() => openMovementModal()}>
                <Plus className="h-4 w-4" />
                Créer un mouvement
              </Button>
              <Button className="w-full" variant="outline" onClick={() => { setSkuQuery(""); setTypeFilter(""); setMovementPage(0); }}>
                Réinitialiser filtres
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={isMovementModalOpen}
        onClose={closeMovementModal}
        title="Mouvement de stock"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeMovementModal} disabled={movementSaving}>
              Annuler
            </Button>
            <Button onClick={submitMovement} disabled={movementSaving}>
              {movementSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Produit</p>
              <Select
                value={movementForm.productId}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = (products || []).find((x) => x?.id === id) || null;
                  setMovementForm((prev) => ({ ...prev, productId: id, sku: p ? getSku(p) : prev.sku }));
                }}
              >
                <option value="">Sélectionner…</option>
                {(products || [])
                  .slice()
                  .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} • {getSku(p)}
                    </option>
                  ))}
              </Select>
              {productsLoading ? <p className="text-xs text-muted-foreground">Chargement produits…</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <Select value={movementForm.type} onChange={(e) => setMovementForm((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                  <option value="AJUSTEMENT">Ajustement</option>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{movementForm.type === "AJUSTEMENT" ? "Nouveau stock" : "Quantité"}</p>
                {movementForm.type === "AJUSTEMENT" ? (
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ex: 120"
                    value={movementForm.newStock}
                    onChange={(e) => setMovementForm((prev) => ({ ...prev, newStock: e.target.value }))}
                  />
                ) : (
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ex: 10"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Référence (optionnel)</p>
              <Input
                placeholder="Ex: Bon livraison #BL-1022, commande #89421, inventaire..."
                value={movementForm.reference}
                onChange={(e) => setMovementForm((prev) => ({ ...prev, reference: e.target.value }))}
              />
            </div>

            {movementSubmitError ? (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
                {movementSubmitError}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Impact</p>
                <Badge label={toTypeLabel(movementForm.type)} variant={toTypeBadgeVariant(movementForm.type)} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-mono text-xs">{selectedProduct ? getSku(selectedProduct) : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stock actuel</span>
                  <span className="font-semibold">{selectedProduct ? selectedProductStock : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stock projeté</span>
                  <span className={`font-semibold ${projectedStock < 0 ? "text-red-600" : ""}`}>
                    {selectedProduct ? projectedStock : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Variation</span>
                  <span className={`${projectedDelta > 0 ? "text-green-600" : projectedDelta < 0 ? "text-red-600" : ""}`}>
                    {selectedProduct ? `${projectedDelta > 0 ? "+" : ""}${projectedDelta}` : "-"}
                  </span>
                </div>
              </div>
              {selectedProduct && projectedStock < 0 ? (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-xs text-red-700 dark:text-red-200">
                  Sortie impossible: le stock deviendrait négatif.
                </div>
              ) : null}
              {selectedProduct && projectedStock === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200">
                  Attention: tu mets le produit en rupture (stock = 0).
                </div>
              ) : null}
            </Card>

            <Card className="p-4 space-y-2">
              <p className="text-sm font-semibold">Règles</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Entrée: ajoute la quantité au stock.</li>
                <li>Sortie: retire la quantité (bloquée si stock insuffisant).</li>
                <li>Ajustement: fixe un nouveau stock et trace avant/après.</li>
              </ul>
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  );
}
