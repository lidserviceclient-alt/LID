import { cn } from "../../utils/cn.js";

export default function BarChart({ data = [], className, barClassName }) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex items-end gap-2 h-32", className)}>
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col justify-end group">
          <div
            className={cn("bg-primary rounded-t-sm transition-all hover:bg-primary/80", barClassName)}
            style={{ height: `${(value / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}
