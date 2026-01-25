import { cn } from "../../utils/cn.js";

export default function Progress({ value, className, barClass }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-secondary", className)}>
      <div
        className={cn("h-2 rounded-full bg-primary transition-all", barClass)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
