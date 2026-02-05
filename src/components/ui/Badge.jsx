import { cn } from "../../utils/cn.js";

const statusStyles = {
  "Nouvelle": "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
  "En preparation": "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
  "Expediee": "border-transparent bg-teal-500/15 text-teal-700 hover:bg-teal-500/25",
  "Livree": "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  "Retournee": "border-transparent bg-rose-500/15 text-rose-700 hover:bg-rose-500/25",
  "En préparation": "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
  "Payée": "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
  "Expédiée": "border-transparent bg-teal-500/15 text-teal-700 hover:bg-teal-500/25",
  "Livrée": "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  "Annulée": "border-transparent bg-rose-500/15 text-rose-700 hover:bg-rose-500/25",
  "Remboursée": "border-transparent bg-rose-500/15 text-rose-700 hover:bg-rose-500/25",
  "En transit": "border-transparent bg-teal-500/15 text-teal-700 hover:bg-teal-500/25",
  "En cours": "border-transparent bg-teal-500/15 text-teal-700 hover:bg-teal-500/25",
  "Échec": "border-transparent bg-rose-500/15 text-rose-700 hover:bg-rose-500/25",
  "Active": "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  "Planifiée": "border-transparent bg-slate-500/15 text-slate-700 hover:bg-slate-500/25",
  "Terminée": "border-transparent bg-slate-500/15 text-slate-700 hover:bg-slate-500/25",
  "Actif": "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  "Faible": "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
  "Gold": "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
  "Silver": "border-transparent bg-slate-500/15 text-slate-700 hover:bg-slate-500/25",
  "Bronze": "border-transparent bg-orange-500/15 text-orange-700 hover:bg-orange-500/25",
  "Platinum": "border-transparent bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/25"
};

const variantStyles = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  success: "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25",
  warning: "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25",
  neutral: "border-transparent bg-slate-500/15 text-slate-700 hover:bg-slate-500/25",
  outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
};

export default function Badge({ label, className, variant = "default" }) {
  const style = statusStyles[label] || variantStyles[variant] || variantStyles.default;
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
