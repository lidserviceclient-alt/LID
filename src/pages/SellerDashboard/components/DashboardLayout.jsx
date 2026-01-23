import { useState } from "react";
import { Menu } from "lucide-react";
import { BRAND } from "../utils/styles";
import Sidebar from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 font-sans selection:bg-[#6aa200] selection:text-white flex">
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-30 px-4 h-16 flex items-center justify-between">
         <span className="text-xl font-black tracking-tighter text-neutral-900">LID<span style={{ color: BRAND }}>.</span></span>
         <button className="p-2"><Menu size={24} /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-16">
        <header className="px-8 py-6 flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-neutral-900 capitalize">{activeTab.replace('-', ' ')}</h1>
             <p className="text-sm text-neutral-500 font-medium">Bienvenue dans votre espace vendeur</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100" alt="Profile" className="w-full h-full object-cover" />
              </div>
           </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
