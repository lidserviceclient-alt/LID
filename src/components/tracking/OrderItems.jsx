import { Store } from "lucide-react";
import { formatMoney } from "@/utils/orderStatus";

const FALLBACK_IMAGE = "/imgs/logo.png";

export function groupItemsBySeller(items = []) {
  const groups = new Map();
  items.forEach((item) => {
    // Ancienne API sans vendeur : groupe anonyme, sans libelle.
    const seller = item.sellerName || "";
    if (!groups.has(seller)) groups.set(seller, []);
    groups.get(seller).push(item);
  });
  return [...groups.entries()].map(([seller, list]) => ({ seller, items: list }));
}

export function SellerLabel({ seller }) {
  if (!seller) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
      <Store size={13} aria-hidden="true" />
      {seller === "LID" ? <>Vendu par <span className="font-semibold text-neutral-700 dark:text-neutral-200">LID</span></> : <>Vendu par <span className="font-semibold text-neutral-700 dark:text-neutral-200">{seller}</span></>}
    </p>
  );
}

export function OrderItemRow({ item, currency }) {
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
        <img
          src={item.imageUrl || FALLBACK_IMAGE}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-neutral-900 dark:text-white">{item.name}</p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Qté {item.quantity}
          {item.quantity > 1 && <> · {formatMoney(item.unitPrice, currency)} l'unité</>}
        </p>
      </div>
      <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-white">
        {formatMoney(item.subtotal, currency)}
      </p>
    </li>
  );
}

/** Articles groupes par vendeur (un contrat de vente par vendeur, CGV art. 3). */
export default function OrderItems({ items, currency }) {
  if (!items.length) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Le détail des articles n'est pas disponible pour cette commande.</p>;
  }
  const groups = groupItemsBySeller(items);
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.seller}>
          {group.seller && (groups.length > 1 || group.seller !== "LID") ? <div className="mb-2"><SellerLabel seller={group.seller} /></div> : null}
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {group.items.map((item) => <OrderItemRow key={item.key} item={item} currency={currency} />)}
          </ul>
        </div>
      ))}
    </div>
  );
}
