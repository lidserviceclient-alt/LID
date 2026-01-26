import { useState } from "react";
import { Bell, Search, Plus, Command, ChevronDown, Menu } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function Topbar({ onMenuClick }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/60 backdrop-blur-xl border-b border-border/40 px-6 py-4">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Breadcrumb Placeholder - could be dynamic later */}
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Dashboard</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Vue d'ensemble</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`hidden overflow-hidden  md:flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 ${focused ? "border-primary/50 ring-4 ring-primary/10 bg-background w-64" : "border-border/50 bg-muted/30 hover:bg-muted/50 w-48"}`}>
          <Search size={16} className={focused ? "text-primary" : "text-muted-foreground"} />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70"
            placeholder="Rechercher..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <div className="flex items-center gap-1">
             <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden lg:inline-flex h-9 rounded-full border-dashed">
             Feedback
            </Button>
            <Button size="sm" className="h-9 gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
             <Plus size={16} /> <span className="hidden sm:inline">Créer</span>
            </Button>
        </div>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block"></div>

        <button className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold shadow-md ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            AB
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Awa Brou</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Admin</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors hidden md:block" />
        </div>
      </div>
    </header>
  );
}
