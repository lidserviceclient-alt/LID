import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../../../utils/cn.js";

/**
 * Champ de formulaire avec libellé visible (relié au contrôle via `id`) et texte d'aide optionnel,
 * relié au contrôle par aria-describedby. Sans `id` (contrôle composite comme PhoneNumberField),
 * le libellé est un simple intitulé de groupe.
 */
export default function SettingsField({ id, label, hint, children, className }) {
  const hintId = hint && id ? `${id}-hint` : undefined;
  const control =
    hintId && isValidElement(children) ? cloneElement(children, { "aria-describedby": hintId }) : children;
  const labelClassName = "block text-xs font-medium text-muted-foreground";
  return (
    <div className={cn("space-y-1.5", className)} role={id ? undefined : "group"} aria-label={id ? undefined : label}>
      {id ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : (
        <div className={labelClassName}>{label}</div>
      )}
      {control}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground/80">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const SettingsTextarea = forwardRef(function SettingsTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[96px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
