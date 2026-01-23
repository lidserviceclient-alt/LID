import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Package, Clock } from "lucide-react";

export default function Overview() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ventes Totales", value: "2.5M FCFA", icon: DollarSign, change: "+12%" },
          { label: "Commandes", value: "154", icon: ShoppingBag, change: "+8%" },
          { label: "Clients", value: "1,203", icon: Users, change: "+24%" },
          { label: "Produits", value: "45", icon: Package, change: "+2%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-neutral-50 group-hover:bg-[#6aa200]/10 transition-colors">
                <stat.icon className="text-neutral-500 group-hover:text-[#6aa200] transition-colors" size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Aperçu des revenus</h3>
            <select className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm font-bold outline-none">
              <option>Cette semaine</option>
              <option>Ce mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
             {/* Simple Bar Chart Placeholder */}
             {[40, 65, 30, 85, 50, 95, 60].map((h, i) => (
               <div key={i} className="w-full bg-neutral-100 rounded-t-xl relative group overflow-hidden">
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full rounded-t-xl bg-[#6aa200] opacity-80 group-hover:opacity-100 transition-opacity"
                 />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold text-neutral-400 uppercase">
            <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
          </div>
        </div>

        <div className="bg-neutral-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-xl font-bold mb-6">Activité Récente</h3>
             <div className="space-y-6">
               {[1,2,3].map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                     <Clock size={18} />
                   </div>
                   <div>
                     <div className="font-bold text-sm">Nouvelle commande #452</div>
                     <div className="text-xs text-white/40">Il y a 2 minutes</div>
                   </div>
                 </div>
               ))}
             </div>
             <button className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition">
               Voir tout
             </button>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#6aa200] rounded-full blur-[100px] opacity-20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
