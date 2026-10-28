import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import { ORDER_STEPS, formatDate } from "@/utils/orderStatus";

/**
 * Frise d'avancement : verticale sur mobile, horizontale a partir de sm.
 * currentStep = index de l'etape en cours (les precedentes sont faites ; >= longueur : tout est fait).
 * currentHint = precision affichee sous l'etape en cours (ex. « En attente du livreur »), sinon « En cours ».
 */
export default function OrderProgress({ currentStep, currentHint, issue = false, dates = {} }) {
  return (
    <ol className="relative grid gap-0 sm:grid-cols-5 sm:gap-2" aria-label="Avancement de la commande">
      {ORDER_STEPS.map((step, index) => {
        const done = index < currentStep;
        const current = index === currentStep;
        const isIssue = current && issue;
        const date = dates[step.key];
        const last = index === ORDER_STEPS.length - 1;
        return (
          <li
            key={step.key}
            aria-current={current ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center"
          >
            {/* Connecteur : vertical (mobile) / horizontal (sm+) */}
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 sm:left-[calc(50%+20px)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-40px+0.5rem)]",
                  done ? "bg-[#6aa200]" : "bg-neutral-200 dark:bg-neutral-800"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                done && "border-[#6aa200] bg-[#6aa200] text-white",
                current && !isIssue && "border-[#6aa200] bg-white text-[#4f7d00] ring-4 ring-[#6aa200]/15 dark:bg-neutral-900 dark:text-[#9fd63a]",
                isIssue && "border-red-500 bg-red-50 text-red-600 ring-4 ring-red-500/15 dark:bg-red-500/10",
                !done && !current && "border-neutral-200 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
              )}
            >
              {done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : isIssue ? <AlertTriangle size={14} aria-hidden="true" /> : index + 1}
            </span>
            <span className="min-w-0 pt-1 sm:pt-0">
              <span
                className={cn(
                  "block text-sm font-semibold leading-tight",
                  done || current ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500",
                  isIssue && "text-red-700 dark:text-red-300"
                )}
              >
                {isIssue ? "Livraison à reprogrammer" : step.label}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                {done && date ? formatDate(date) : current ? (isIssue ? "Action requise" : currentHint || "En cours") : done ? "Terminé" : "À venir"}
              </span>
              <span className="sr-only">{done ? "(terminée)" : current ? "(étape en cours)" : "(à venir)"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
