import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, FileText, Loader2, MessageCircle, MoreHorizontal, Package, Undo2, XCircle } from "lucide-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/orderStatus";

const MAX_THUMBNAILS = 3;

function Thumbnails({ thumbnails, itemCount }) {
  const shown = thumbnails.slice(0, MAX_THUMBNAILS);
  const extra = itemCount - shown.length;
  if (!shown.length) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
        <Package size={20} aria-hidden="true" />
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((thumb) => (
        <span key={thumb.key} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
          {thumb.imageUrl ? (
            <img
              src={thumb.imageUrl}
              alt={thumb.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/imgs/logo.png";
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-neutral-300"><Package size={18} aria-hidden="true" /></span>
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          +{extra}
        </span>
      )}
    </div>
  );
}

/** Menu « Plus » : actions secondaires, clavier (Echap) et clic exterieur gérés. */
function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items.length) return null;

  const itemClass = (danger) => cn(
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition focus:outline-none",
    danger
      ? "text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
      : "text-neutral-700 hover:bg-neutral-50 focus:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
  );

  return (
    <div ref={rootRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Plus d'actions"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa200]/40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
        <span>Plus</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg shadow-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {item.busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                <span className="min-w-0">
                  <span className="block">{item.label}</span>
                  {item.hint && <span className="block text-xs text-neutral-500 dark:text-neutral-400">{item.hint}</span>}
                </span>
              </>
            );
            return item.to ? (
              <Link key={item.key} role="menuitem" to={item.to} className={itemClass(item.danger)} onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                role="menuitem"
                type="button"
                disabled={item.busy}
                className={itemClass(item.danger)}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Carte « Mes commandes ». Toute la carte mene au suivi ; le bouton « Suivre » et le menu « Plus » sont des
 * controles independants (ils ne declenchent pas la navigation de la carte).
 * compact : version de la vue d'ensemble (sans actions secondaires).
 */
export default function OrderCard({ order, compact = false, onCancel, onReceipt, busyAction = "" }) {
  const navigate = useNavigate();
  const trackingHref = order.orderNumber ? `/tracking?order=${encodeURIComponent(order.orderNumber)}` : "/tracking";

  const menuItems = [];
  if (!compact) {
    if (order.returnable) {
      menuItems.push({ key: "return", label: "Retourner un article", hint: `Possible jusqu'au ${formatDate(order.returnDeadline)}`, icon: Undo2, to: order.returnsHref });
    }
    if (onReceipt && order.receiptAvailable) {
      menuItems.push({ key: "receipt", label: "Télécharger le justificatif", icon: FileText, onClick: () => onReceipt(order), busy: busyAction === `receipt-${order.id}` });
    }
    menuItems.push({ key: "contact", label: "Contacter le support", icon: MessageCircle, to: "/contact" });
    if (onCancel && order.cancellable) {
      menuItems.push({ key: "cancel", label: "Annuler la commande", icon: XCircle, onClick: () => onCancel(order), danger: true, busy: busyAction === `cancel-${order.id}` });
    }
  }

  const delivery = [order.shippingMethod, order.shippingAddress].filter(Boolean).join(" · ");

  return (
    <article
      onClick={() => navigate(trackingHref)}
      className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-[#6aa200]/40 hover:shadow-md hover:shadow-neutral-900/5 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">{order.orderNumber}</h3>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Passée le {order.date}</p>
        </div>
        <OrderStatusBadge label={order.statusLabel} tone={order.statusTone} />
      </header>

      <div className="mt-4 flex items-center justify-between gap-4">
        <Thumbnails thumbnails={order.thumbnails} itemCount={order.itemCount} />
        <div className="text-right">
          <p className="text-base font-bold text-neutral-900 dark:text-white">{order.total}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.itemCount} article{order.itemCount > 1 ? "s" : ""}</p>
        </div>
      </div>

      {!compact && (order.statusHint || delivery) && (
        <div className="mt-3 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {order.statusHint && <p className="font-medium text-neutral-700 dark:text-neutral-300">{order.statusHint}</p>}
          {delivery && <p className="truncate">{delivery}</p>}
        </div>
      )}

      {compact ? null : (
        <footer className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <MoreMenu items={menuItems} />
          <Link
            to={trackingHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-[#6aa200] px-4 text-sm font-semibold text-white transition hover:bg-[#5a8a00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6aa200]/30"
          >
            Suivre la commande <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </footer>
      )}
      {compact && (
        <Link to={trackingHref} onClick={(e) => e.stopPropagation()} className="sr-only focus:not-sr-only focus:mt-3 focus:inline-block focus:text-sm focus:font-semibold focus:text-[#4f7d00]">
          Suivre la commande {order.orderNumber}
        </Link>
      )}
    </article>
  );
}
