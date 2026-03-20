import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, MoreVertical, Package, Image as ImageIcon, DollarSign, Tag, Archive, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { createMyProduct, deleteMyProduct, listMyProducts, updateMyProduct } from '@/services/partnerBackofficeProductService';

const STATIC_CATEGORIES = [
  { id: "1", label: "Mode & Accessoires" },
  { id: "2", label: "Beauté & Santé" },
  { id: "3", label: "Maison & Déco" },
  { id: "4", label: "High-Tech" },
  { id: "5", label: "Alimentation" }
];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map();
    STATIC_CATEGORIES.forEach((c) => map.set(`${c.id}`, c.label));
    return map;
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const page = await listMyProducts({ page: 0, size: 200 });
      const content = Array.isArray(page?.content) ? page.content : [];
      const normalized = content.map((p) => ({
        id: p.id,
        sku: p.sku || "",
        name: p.name || "",
        price: Number(p.price || 0),
        stock: Number(p.stock || 0),
        categoryId: `${p.categoryId || ""}`.trim(),
        category: `${p.category || categoryById.get(`${p.categoryId || ""}`) || ""}`.trim(),
        image: p.imageUrl || p.img || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80"
      }));
      setProducts(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      await deleteMyProduct(id);
      await refresh();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryId = `${formData.get('categoryId') || ""}`.trim();
    const newProduct = {
      id: currentProduct ? currentProduct.id : Date.now(),
      sku: `${formData.get('sku') || ""}`.trim(),
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      categoryId,
      category: categoryById.get(categoryId) || "",
      image: currentProduct?.image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80" // Placeholder
    };

    const payload = {
      sku: newProduct.sku,
      name: newProduct.name,
      price: Number.isFinite(newProduct.price) ? newProduct.price : 0,
      stock: Number.isFinite(newProduct.stock) ? newProduct.stock : 0,
      categoryId: newProduct.categoryId,
      img: currentProduct?.image || null,
      imageUrl: currentProduct?.image || null,
      status: "ACTIF"
    };

    if (currentProduct?.id) {
      await updateMyProduct(currentProduct.id, payload);
    } else {
      await createMyProduct(payload);
    }
    await refresh();
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newProducts = results.data.map(item => ({
            id: Date.now() + Math.random(),
            name: item.name || item.nom,
            price: parseFloat(item.price || item.prix || 0),
            stock: parseInt(item.stock || 0),
            category: item.category || item.categorie || 'Uncategorized',
            image: item.image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80"
          })).filter(p => p.name); // Filter out empty entries
          
          setImportPreview(newProducts);
          setIsImportModalOpen(true);
        },
        error: (error) => {
          console.error("Erreur d'importation:", error);
          alert("Erreur lors de l'importation du fichier CSV.");
        }
      });
    }
  };

  const confirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    setIsImportModalOpen(false);
    for (const p of importPreview) {
      const categoryId = `${p.categoryId || ""}`.trim() || "1";
      const payload = {
        sku: `${p.sku || p.reference || p.id}`.toString().trim(),
        name: `${p.name || ""}`.trim(),
        price: Number(p.price || 0),
        stock: Number(p.stock || 0),
        categoryId,
        img: p.image || null,
        imageUrl: p.image || null,
        status: "ACTIF"
      };
      if (!payload.sku || !payload.name) continue;
      await createMyProduct(payload);
    }
    setImportPreview(null);
    await refresh();
    alert(`Produits importés avec succès !`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Rupture', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
    if (stock <= 5) return { label: 'Critique', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' };
    if (stock <= 10) return { label: 'Faible', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
    return { label: 'En stock', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre catalogue</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <Upload size={18} />
            <span className="hidden sm:inline">Import CSV</span>
            <input 
              type="file" 
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button 
            onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau Produit</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
        />
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5">Produit</div>
          <div className="col-span-2">Prix</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex flex-col md:grid md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
              >
                {/* Mobile: Header with Image & Name */}
                <div className="col-span-5 flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 md:hidden">{product.category} • {product.stock} en stock</p>
                  </div>
                </div>

                {/* Desktop Columns */}
                <div className="col-span-2 hidden md:block text-sm font-medium text-gray-900">
                  {product.price.toFixed(2)} FCFA
                </div>
                <div className="col-span-2 hidden md:block">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStockStatus(product.stock).dot}`} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.stock).color}`}>
                      {product.stock} {getStockStatus(product.stock).label}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 hidden md:block text-sm text-gray-500">
                  {product.category}
                </div>

                {/* Mobile: Footer with Price & Actions */}
                <div className="col-span-1 flex items-center justify-between md:justify-end w-full gap-2">
                  <span className="md:hidden font-medium text-gray-900">{product.price.toFixed(2)} FCFA</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chargement...</p>
            </div>
          ) : filteredProducts.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {currentProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      name="sku"
                      defaultValue={currentProduct?.sku}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="Ex: SKU-0001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      name="name" 
                      defaultValue={currentProduct?.name} 
                      required 
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="Ex: Nike Air Max"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        defaultValue={currentProduct?.price} 
                        required 
                        className="w-full bg-gray-50 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <div className="relative">
                      <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        name="stock" 
                        type="number" 
                        defaultValue={currentProduct?.stock} 
                        required 
                        className="bg-gray-50 w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select 
                    name="categoryId" 
                    defaultValue={currentProduct?.categoryId || "1"} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
                  >
                    {STATIC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Image Upload Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs text-gray-500">Cliquez pour ajouter une image</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-black/20"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Import Preview Modal */}
      <AnimatePresence>
        {isImportModalOpen && importPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Confirmer l'importation
                  </h2>
                  <p className="text-sm text-gray-500">
                    Veuillez vérifier les {importPreview.length} produits avant de confirmer.
                  </p>
                </div>
                <button 
                  onClick={() => { setIsImportModalOpen(false); setImportPreview(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Produit</th>
                      <th className="px-4 py-3">Prix</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3 rounded-tr-lg">Catégorie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importPreview.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 text-gray-600">{product.price.toFixed(2)} FCFA</td>
                        <td className="px-4 py-3">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.stock).color}`}>
                             {product.stock}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => { setIsImportModalOpen(false); setImportPreview(null); }}
                  className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmImport}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-black/20"
                >
                  Confirmer l'import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
