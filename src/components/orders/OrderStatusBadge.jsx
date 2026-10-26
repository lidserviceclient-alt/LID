import { cn } from "@/utils/cn";
import { TONE_BADGE, TONE_DOT } from "@/utils/orderStatus";

/** Badge de statut lisible (libelle + pastille de couleur), partage par le suivi et « Mes commandes ». */
export default function OrderStatusBadge({ label, tone = "neutral", size = "sm", className }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset",
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        TONE_BADGE[tone] || TONE_BADGE.neutral,
        className
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone] || TONE_DOT.neutral)} />
      {label}
    </span>
  );
}
