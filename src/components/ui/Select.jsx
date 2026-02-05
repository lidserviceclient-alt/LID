import React from "react";
import { cn } from "../../utils/cn.js";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(({ className, children, options, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 pr-8",
          className
        )}
        ref={ref}
        {...props}
      >
        {Array.isArray(options)
          ? options.map((opt) => {
              if (opt && typeof opt === "object") {
                const value = opt.value ?? opt.label ?? "";
                const label = opt.label ?? opt.value ?? "";
                return (
                  <option key={`${value}`} value={value} disabled={Boolean(opt.disabled)}>
                    {label}
                  </option>
                );
              }
              return (
                <option key={`${opt}`} value={opt}>
                  {opt}
                </option>
              );
            })
          : children}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
});
Select.displayName = "Select";

export default Select;
