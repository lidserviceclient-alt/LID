import { cn } from "../../utils/cn.js";

export default function SectionHeader({ title, subtitle, rightSlot, className }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div>
        <h2 className="section-title text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
