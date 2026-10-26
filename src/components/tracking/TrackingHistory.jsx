import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/orderStatus";

/** Historique detaille, replie par defaut (le plus recent en premier). */
export default function TrackingHistory({ events }) {
  if (!events.length) return null;
  return (
    <details className="group rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-[#6aa200]/40 sm:p-5 dark:text-white [&::-webkit-details-marker]:hidden">
        <span>
          Historique détaillé
          <span className="ml-2 font-normal text-neutral-500 dark:text-neutral-400">{events.length} étape{events.length > 1 ? "s" : ""}</span>
        </span>
        <ChevronDown size={18} className="text-neutral-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ol className="border-t border-neutral-100 px-4 py-4 sm:px-5 dark:border-neutral-800">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < events.length - 1 && (
              <span aria-hidden="true" className="absolute left-[5px] top-4 h-[calc(100%-0.75rem)] w-px bg-neutral-200 dark:bg-neutral-800" />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2",
                index === 0 ? "border-[#6aa200] bg-[#6aa200]" : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900",
                event.issue && "border-red-500 bg-red-500"
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {event.title}
                {event.scope && <span className="ml-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">· {event.scope}</span>}
              </p>
              {event.date && <p className="text-xs text-neutral-500 dark:text-neutral-400"><time dateTime={event.dateValue}>{formatDateTime(event.date)}</time></p>}
              {event.comment && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{event.comment}</p>}
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
