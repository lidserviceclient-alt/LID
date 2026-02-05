import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Info, Layers, DollarSign, Package, Image as ImageIcon, BarChart } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import FileUpload from "../components/ui/FileUpload";
import { backofficeApi } from "../services/api";

export default function ProductCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    referenceProduitPartenaire: "",
    ean: "",
    description: "",
    img: "",
    brand: "",
    price: "",
    vat: 20,
    status: "ACTIVE", // ACTIVE, DRAFT, ARCHIVED
    category: "",
    stock: 0
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);
      try {
        const data = await backofficeApi.categories();
        if (cancelled) return;
        const items = Array.isArray(data) ? data : [];
        setCategories(items);
        setFormData((prev) => {
          if (prev.category) return prev;
          const firstId = items[0]?.id || "";
          return { ...prev, category: firstId };
        });
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Impossible de charger les catégories.");
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setFormData((prev) => ({ ...prev, img: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.category) {
        throw new Error("Veuillez sélectionner une catégorie.");
      }

      const price = Number(formData.price);
      if (!Number.isFinite(price)) {
        throw new Error("Veuillez renseigner un prix valide.");
      }

      const vat = formData.vat === "" || formData.vat === null || formData.vat === undefined ? null : Number(formData.vat);
      if (vat !== null && !Number.isFinite(vat)) {
        throw new Error("Veuillez renseigner une TVA valide.");
      }

      const stock = formData.stock === "" || formData.stock === null || formData.stock === undefined ? null : Number(formData.stock);
      if (stock !== null && !Number.isFinite(stock)) {
        throw new Error("Veuillez renseigner un stock valide.");
      }

      const payload = {
        name: formData.name,
        referenceProduitPartenaire: formData.referenceProduitPartenaire,
        ean: formData.ean || null,
        description: formData.description || null,
        img: formData.img || null,
        brand: formData.brand || null,
        price,
        vat,
        status: formData.status,
        category: formData.category,
        stock
      };

      await backofficeApi.createProduct(payload);
      
      navigate("/products");
    } catch (err) {
      setError(err?.message || "Une erreur est survenue lors de la création du produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[1600px] space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/products")}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Nouveau produit</h1>
            <p className="text-muted-foreground">Créez un nouveau produit et configurez ses options.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Enregistrer le produit
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <p className="flex items-center gap-2">
            <Info size={16} />
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content (Left Column) */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* General Info */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Info className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">Informations générales</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" required>Nom du produit</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Ex: Chaussures de sport Nike" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input 
                    id="brand" 
                    name="brand" 
                    placeholder="Ex: Nike, Adidas..." 
                    value={formData.brand} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Décrivez votre produit en détail..."
                  value={formData.description}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Une bonne description aide vos clients à mieux comprendre le produit.
                </p>
              </div>
            </div>
          </Card>

          {/* Media */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <ImageIcon className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">Médias</h2>
            </div>
            
            <div className="space-y-4">
              <Label>Image principale</Label>
              <FileUpload 
                value={formData.img} 
                onChange={handleImageChange}
                label="Glissez une image ici ou cliquez pour uploader"
              />
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <DollarSign className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">Prix & Taxes</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" required>Prix de vente (TTC)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    className="pl-8"
                    placeholder="0.00" 
                    value={formData.price} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat">TVA (%)</Label>
                <div className="relative">
                  <Input 
                    id="vat" 
                    name="vat" 
                    type="number" 
                    placeholder="20" 
                    value={formData.vat} 
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Package className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">Inventaire & Codes</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="referenceProduitPartenaire" required>Référence (SKU)</Label>
                <Input 
                  id="referenceProduitPartenaire" 
                  name="referenceProduitPartenaire" 
                  placeholder="REF-001" 
                  value={formData.referenceProduitPartenaire} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ean">Code-barres (EAN)</Label>
                <Input 
                  id="ean" 
                  name="ean" 
                  placeholder="1234567890123" 
                  value={formData.ean} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock initial</Label>
                <Input 
                  id="stock" 
                  name="stock" 
                  type="number" 
                  min="0"
                  placeholder="0" 
                  value={formData.stock} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Status */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <BarChart className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">État</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Statut du produit</Label>
                <Select 
                  value={formData.status} 
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  options={[
                    { value: "ACTIVE", label: "Actif (Publié)" },
                    { value: "DRAFT", label: "Brouillon" },
                    { value: "ARCHIVED", label: "Archivé" }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Organization */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Layers className="text-primary" size={20} />
              <h2 className="text-lg font-semibold">Organisation</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select 
                  value={formData.category} 
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  options={[
                    { value: "", label: categoriesLoading ? "Chargement..." : "Sélectionner une catégorie", disabled: true },
                    ...categories.map((c) => ({ value: c.id, label: c.nom }))
                  ]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  La catégorie détermine les filtres disponibles.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Étiquettes (Tags)</Label>
                <Input placeholder="Ajouter des tags..." disabled />
                <p className="text-xs text-muted-foreground">Fonctionnalité à venir</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </form>
  );
}
