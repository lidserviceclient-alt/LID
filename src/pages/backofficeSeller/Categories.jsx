import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Layers, Folder, ChevronRight, ChevronDown, Shirt, Smartphone, Home, Sparkles, Dumbbell, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

const GLOBAL_CATEGORIES = [
  { id: 'mode', name: "Mode & Vêtements", icon: Shirt, color: "text-blue-600 bg-blue-50" },
  { id: 'electronics', name: "Électronique & High-Tech", icon: Smartphone, color: "text-purple-600 bg-purple-50" },
  { id: 'home', name: "Maison & Déco", icon: Home, color: "text-orange-600 bg-orange-50" },
  { id: 'beauty', name: "Beauté & Santé", icon: Sparkles, color: "text-pink-600 bg-pink-50" },
  { id: 'sports', name: "Sports & Loisirs", icon: Dumbbell, color: "text-green-600 bg-green-50" },
];

const MOCK_PARTNER_SUBCATEGORIES = [
  { id: 1, parentId: 'mode', name: "Chaussures Homme", count: 12, description: "Baskets et chaussures de ville" },
  { id: 2, parentId: 'mode', name: "Robes d'été", count: 45, description: "Collection été 2024" },
  { id: 3, parentId: 'electronics', name: "Accessoires Mobiles", count: 8, description: "Coques et chargeurs" },
  { id: 4, parentId: 'beauty', name: "Soins Visage", count: 15, description: "Crèmes et sérums" },
];

export default function Categories() {
  const [subCategories, setSubCategories] = useState(MOCK_PARTNER_SUBCATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(GLOBAL_CATEGORIES.map(c => c.id));
  const [selectedParentId, setSelectedParentId] = useState(GLOBAL_CATEGORIES[0].id);
  const [importPreview, setImportPreview] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const toggleCategory = (id) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setSelectedParentId(category.parentId);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?")) {
      setSubCategories(subCategories.filter(c => c.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCategory = {
      id: currentCategory ? currentCategory.id : Date.now(),
      parentId: selectedParentId,
      name: formData.get('name'),
      description: formData.get('description'),
      count: currentCategory ? currentCategory.count : 0
    };

    if (currentCategory) {
      setSubCategories(subCategories.map(c => c.id === currentCategory.id ? newCategory : c));
    } else {
      setSubCategories([...subCategories, newCategory]);
      // Auto expand the parent category to show the new item
      if (!expandedCategories.includes(selectedParentId)) {
        setExpandedCategories([...expandedCategories, selectedParentId]);
      }
    }
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newCategories = results.data.map(item => {
            // Find parent ID based on provided parent name or code, or default to first one
            let parentId = item.parentId || item.parent_id || item.parent;
            // Validate parentId exists
            if (!GLOBAL_CATEGORIES.find(c => c.id === parentId)) {
              parentId = GLOBAL_CATEGORIES[0].id;
            }
            
            return {
              id: Date.now() + Math.random(),
              parentId: parentId,
              name: item.name || item.nom,
              description: item.description || "",
              count: 0
            };
          }).filter(c => c.name); // Filter out empty entries
          
          setImportPreview(newCategories);
          setIsImportModalOpen(true);
        },
        error: (error) => {
          console.error("Erreur d'importation:", error);
          alert("Erreur lors de l'importation du fichier CSV.");
        }
      });
    }
  };

  const confirmImport = () => {
    if (importPreview) {
      setSubCategories(prev => [...prev, ...importPreview]);
      setImportPreview(null);
      setIsImportModalOpen(false);
      alert(`${importPreview.length} sous-catégories importées avec succès !`);
    }
  };

  const filteredSubCategories = subCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos sous-catégories par univers</p>
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
            onClick={() => { setCurrentCategory(null); setSelectedParentId(GLOBAL_CATEGORIES[0].id); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouvelle Sous-catégorie</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher une sous-catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
        />
      </div>

      {/* Global Categories List */}
      <div className="space-y-4">
        {GLOBAL_CATEGORIES.map((globalCat) => {
          const catSubCategories = filteredSubCategories.filter(sc => sc.parentId === globalCat.id);
          const isExpanded = expandedCategories.includes(globalCat.id);
          
          // Hide global category if filtering and no matches found inside
          if (searchTerm && catSubCategories.length === 0) return null;

          return (
            <div key={globalCat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => toggleCategory(globalCat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${globalCat.color}`}>
                    <globalCat.icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">{globalCat.name}</h3>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {catSubCategories.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/30"
                  >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catSubCategories.length > 0 ? (
                        catSubCategories.map((subCat) => (
                          <div 
                            key={subCat.id}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900">{subCat.name}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleEdit(subCat)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(subCat.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{subCat.description}</p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              <Layers size={12} />
                              {subCat.count} produits
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center text-gray-400 text-sm italic">
                          Aucune sous-catégorie dans cette section.
                          <button 
                            onClick={() => { setCurrentCategory(null); setSelectedParentId(globalCat.id); setIsModalOpen(true); }}
                            className="ml-2 text-blue-600 hover:underline not-italic font-medium"
                          >
                            En ajouter une
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
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
                  {currentCategory ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie Parente</label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                    >
                      {GLOBAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la sous-catégorie</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      name="name" 
                      defaultValue={currentCategory?.name} 
                      required 
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="Ex: Chaussures de sport"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={currentCategory?.description} 
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="Description..."
                  />
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
                    Veuillez vérifier les {importPreview.length} sous-catégories avant de confirmer.
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
                      <th className="px-4 py-3 rounded-tl-lg">Nom</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 rounded-tr-lg">Catégorie Parente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importPreview.map((category, index) => {
                      const parentCat = GLOBAL_CATEGORIES.find(c => c.id === category.parentId);
                      return (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{category.description || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${parentCat?.color || 'bg-gray-100 text-gray-600'}`}>
                               {parentCat?.name || category.parentId}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
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
