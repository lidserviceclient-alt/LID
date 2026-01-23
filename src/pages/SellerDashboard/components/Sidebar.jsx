import { motion } from "framer-motion";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Menu } from "lucide-react";
import { BRAND, cx } from "../utils/styles";

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const menuItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "products", label: "Mes Produits", icon: Package },
    { id: "orders", label: "Commandes", icon: ShoppingBag },
    { id: "customers", label: "Clients", icon: Users },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="bg-white border-r border-neutral-200 h-screen sticky top-0 hidden md:flex flex-col z-20"
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen ? (
           <span className="text-2xl font-black tracking-tighter text-neutral-900">LID<span style={{ color: BRAND }}>.</span>Seller</span>
        ) : (
           <span className="text-2xl font-black tracking-tighter text-neutral-900">L</span>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 transition">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cx(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm",
              activeTab === item.id 
                ? "bg-[#6aa200] text-white shadow-lg shadow-[#6aa200]/20" 
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <item.icon size={22} className={activeTab === item.id ? "text-white" : "text-neutral-400"} />
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-100">
         <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition font-bold text-sm">
           <LogOut size={22} />
           {isOpen && <span>Déconnexion</span>}
         </button>
      </div>
    </motion.aside>
  );
}
