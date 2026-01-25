import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  Truck,
  BadgeCheck,
  Boxes,
  Wallet,
  Megaphone,
  X
} from "lucide-react";
import { cn } from "../../utils/cn.js";

const navSections = [
  {
    title: "Pilotage",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Analytics", to: "/analytics", icon: LineChart }
    ]
  },
  {
    title: "Opérations",
    items: [
      { label: "Commandes", to: "/orders", icon: ShoppingCart },
      { label: "Produits", to: "/products", icon: Package },
      { label: "Stocks", to: "/inventory", icon: Boxes },
      { label: "Livraison", to: "/logistics", icon: Truck }
    ]
  },
  {
    title: "Relation Client",
    items: [
      { label: "Clients", to: "/customers", icon: Users },
      { label: "Fidélité", to: "/loyalty", icon: BadgeCheck },
      { label: "Marketing", to: "/marketing", icon: Megaphone }
    ]
  },
  {
    title: "Finance",
    items: [
      { label: "Paiements", to: "/finance", icon: Wallet }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col",
        "transition-transform duration-300 ease-in-out shadow-soft",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="px-6 h-16 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <img src="/imgs/lid-green.png" alt="LID" className="h-8 w-auto object-contain" />
          <h1 className="font-display font-bold text-lg tracking-tight text-foreground">
            Backoffice
          </h1>
        </div>
        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Boutique</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">LID Prime Store</h2>
          <p className="text-xs text-muted-foreground">Abidjan - Plateau</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 font-display">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                      <item.icon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={cn(
                          "transition-all duration-200",
                          isActive ? "text-primary scale-110" : "text-muted-foreground/70 group-hover:text-foreground"
                        )}
                      />
                      <span className={cn(isActive ? "font-bold" : "")}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border/40">
         <NavLink
            to="/settings"
            className={({ isActive }) =>
            cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                ? "bg-muted text-foreground font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
            }
        >
            <Settings size={20} strokeWidth={2} />
            Paramètres
        </NavLink>
      </div>
    </aside>
  );
}
