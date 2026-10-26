import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import OrderCard from "@/components/orders/OrderCard";
import { cn } from "@/utils/cn";
import { ORDER_FILTERS, matchesOrderFilter } from "@/utils/orderStatus";

const PAGE_SIZE = 10;

export function OrderCardSkeleton() {
  const bar = "animate-pulse rounded-lg bg-neutral-200/80 dark:bg-neutral-800";
  return (
    <div aria-hidden="true" className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex justify-between gap-3">
        <div className="space-y-2">
          <div className={cn(bar, "h-4 w-32")} />
          <div className={cn(bar, "h-3 w-24")} />
        </div>
        <div className={cn(bar, "h-6 w-24 rounded-full")} />
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => <div key={i} className={cn(bar, "h-12 w-12 rounded-xl")} />)}
        </div>
        <div className={cn(bar, "h-5 w-24")} />
      </div>
    </div>
  );
}

export function OrdersEmptyState({ title = "Vous n'avez pas encore passé de commande", text = "Vos commandes et leur suivi apparaîtront ici.", action }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6aa200]/10 text-[#4f7d00]">
        <ShoppingBag size={22} aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-neutral-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      <div className="mt-5">
        {action || (
          <Link to="/shop" className="inline-flex h-10 items-center rounded-xl bg-[#6aa200] px-5 text-sm font-semibold text-white hover:bg-[#5a8a00]">
            Découvrir la boutique
          </Link>
        )}
      </div>
    </div>
  );
}

/** « Mes commandes » : filtres avec compteurs, cartes, « Voir plus ». */
export default function OrderList({ orders, loading, onCancel, onReceipt, busyAction }) {
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const result = {};
    ORDER_FILTERS.forEach((f) => {
      result[f.key] = orders.filter((o) => matchesOrderFilter(o.statusCode, f.key)).length;
    });
    return result;
  }, [orders]);

  const filtered = useMemo(() => orders.filter((o) => matchesOrderFilter(o.statusCode, filter)), [orders, filter]);
  const shown = filtered.slice(0, visible);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Mes commandes</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Suivez vos livraisons, téléchargez vos justificatifs et gérez vos retours.</p>
        </div>
      </div>

      <div role="group" aria-label="Filtrer les commandes" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {ORDER_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.key);
                setVisible(PAGE_SIZE);
              }}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa200]/40",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              )}
            >
              {f.label}
              {!loading && (
                <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/20" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300")}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3" aria-busy={loading}>
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : orders.length === 0 ? (
          <OrdersEmptyState />
        ) : filtered.length === 0 ? (
          <OrdersEmptyState
            title="Aucune commande dans cette catégorie"
            text="Essayez un autre filtre pour retrouver vos commandes."
            action={
              <button type="button" onClick={() => setFilter("all")} className="inline-flex h-10 items-center rounded-xl border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200">
                Voir toutes les commandes
              </button>
            }
          />
        ) : (
          shown.map((order) => (
            <OrderCard key={order.id ?? order.orderNumber} order={order} onCancel={onCancel} onReceipt={onReceipt} busyAction={busyAction} />
          ))
        )}
      </div>

      {!loading && filtered.length > shown.length && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            Voir plus ({filtered.length - shown.length} restante{filtered.length - shown.length > 1 ? "s" : ""})
          </button>
        </div>
      )}
    </div>
  );
}
