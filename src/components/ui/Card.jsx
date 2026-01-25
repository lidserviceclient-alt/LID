import { cn } from "../../utils/cn.js";

export default function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2 border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
