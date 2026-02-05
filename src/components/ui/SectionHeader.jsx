import { cn } from "../../utils/cn.js";

export default function SectionHeader({
  title,
  subtitle,
  rightSlot,
  className,
  titleClassName,
  subtitleClassName,
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div>
        <h2
          className={cn(
            "section-title text-2xl font-bold tracking-tight text-foreground",
            titleClassName
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("text-sm text-muted-foreground mt-1", subtitleClassName)}>
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
