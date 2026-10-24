import { Layers } from "lucide-react";

/** Small uppercase "univers" subheader used above a group of root categories. */
export default function UniversGroupHeader({ label, className = "" }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 ${className}`}>
      <Layers size={12} className="text-[#6aa200]" />
      {label}
    </div>
  );
}
