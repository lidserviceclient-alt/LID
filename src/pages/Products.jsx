import { useState, useMemo } from "react";
import { Plus, Search, Filter, Edit2, Trash2, MoreHorizontal, AlertCircle, Check, X } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { products as initialProducts } from "../data/mockData.js";

export default function Products() {
  // --- State Management ---
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes catégories");
  const [statusFilter, setStatusFilter] = useState("Tous statuts");
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null = create mode, object = edit mode
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "Chaussures",
    price: "",
    stock: 0,
    status: "Actif"
  });

  // --- Derived State (Filtering) ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "Toutes catégories" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "Tous statuts" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setCurrentProduct(null);
    setFormData({
      id: `PRD-${Math.floor(Math.random() * 1000)}`, // Auto-generate ID for demo
      name: "",
      category: "Chaussures",
      price: "",
      stock: 0,
      status: "Actif"
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFormData({ ...product });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product) => {
    setCurrentProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentProduct) {
      // Edit Mode
      setProducts(products.map(p => p.id === currentProduct.id ? { ...formData } : p));
    } else {
      // Create Mode
      setProducts([formData, ...products]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    setProducts(products.filter(p => p.id !== currentProduct.id));
    setIsDeleteOpen(false);
    setCurrentProduct(null);
  };

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalSKU = products.length;
    const lowStock = products.filter(p => p.stock < 20).length;
    const activeProducts = products.filter(p => p.status === "Actif").length;
    return { totalSKU, lowStock, activeProducts };
  }, [products]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader
        title="Catalogue produits"
        subtitle="Gérez votre inventaire, vos prix et vos stocks en temps réel."
        rightSlot={
          <div className="flex gap-2">
             <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres avancés
            </Button>
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
          <p className="text-2xl font-bold text-foreground">12.5 M FCFA</p>
          <p className="text-xs text-muted-foreground">+2.4% vs mois dernier</p>
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
            >
              <option>Toutes catégories</option>
              <option>Chaussures</option>
              <option>Streetwear</option>
              <option>Accessoires</option>
            </Select>
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background w-full md:w-40"
            >
              <option>Tous statuts</option>
              <option>Actif</option>
              <option>Faible</option>
              <option>Inactif</option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <THead>
            <TRow>
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
                  <TCell className="font-mono text-xs font-medium text-muted-foreground">{product.id}</TCell>
                  <TCell className="font-medium text-foreground">{product.name}</TCell>
                  <TCell>{product.category}</TCell>
                  <TCell>{product.price}</TCell>
                  <TCell>
                    <span className={product.stock < 10 ? "text-red-600 font-bold" : ""}>
                      {product.stock}
                    </span>
                  </TCell>
                  <TCell><Badge label={product.status} /></TCell>
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
                <TCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>Aucun produit trouvé</p>
                    <Button variant="link" onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("Toutes catégories");
                      setStatusFilter("Tous statuts");
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
                value={formData.id} 
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                disabled={!!currentProduct} // Disable ID edit
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Chaussures</option>
                <option>Streetwear</option>
                <option>Accessoires</option>
              </Select>
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
            >
              <option>Actif</option>
              <option>Faible</option>
              <option>Inactif</option>
            </Select>
          </div>
        </form>
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Supprimer le produit"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer définitivement</Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">Êtes-vous sûr de vouloir supprimer ce produit ?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cette action est irréversible. Le produit <strong>{currentProduct?.name}</strong> sera retiré du catalogue.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}