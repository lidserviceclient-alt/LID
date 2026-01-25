import { cn } from "../../utils/cn.js";

export function Table({ children, className }) {
  return (
    <div className={cn("relative w-full overflow-auto rounded-lg border border-border", className)}>
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="[&_tr]:border-b border-border bg-muted/50">
      {children}
    </thead>
  );
}

export function TRow({ children, className }) {
  return (
    <tr 
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", 
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TCell({ children, className }) {
  return <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>{children}</td>;
}
