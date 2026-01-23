import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Vos Produits</h2>
        <button className="px-5 py-2.5 bg-[#6aa200] hover:bg-[#5a8a00] text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
          <Plus size={18} />
          Ajouter un produit
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-neutral-100 p-4 shadow-sm">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 rounded-xl outline-none focus:ring-2 focus:ring-[#6aa200]/20 transition"
            />
          </div>
          <button className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition text-neutral-600">
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3, 4, 5].map((item) => (
             <div key={item} className="group border border-neutral-100 rounded-2xl p-3 hover:border-[#6aa200]/30 hover:shadow-lg transition-all duration-300 bg-white">
               <div className="aspect-square rounded-xl bg-neutral-100 mb-3 overflow-hidden relative">
                 <img 
                   src={`https://images.pexels.com/photos/${200000 + item}/pexels-photo-${200000 + item}.jpeg?auto=compress&cs=tinysrgb&w=400`} 
                   alt="Product" 
                   className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                 />
                 <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider">
                   En Stock
                 </div>
               </div>
               <div className="px-2 pb-2">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-neutral-900 line-clamp-1">Super Produit {item}</h3>
                   <button className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal size={18} /></button>
                 </div>
                 <div className="text-sm text-neutral-500 mb-3">Catégorie Tech</div>
                 <div className="flex items-center justify-between">
                   <span className="font-bold text-lg">25.000 FCFA</span>
                   <div className="text-xs font-bold text-neutral-400">24 ventes</div>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
