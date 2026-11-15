import { describeShippingQuote } from '@/services/shippingZoneService';

const money = (v) => `${Math.round(Number(v) || 0).toLocaleString('fr-FR')} FCFA`;

/** Selecteur de commune de livraison (obligatoire pour Abidjan ; hors Abidjan = livraison estimee). */
export function ShippingZoneSelect({ id = 'shipping-zone', groups, value, onChange, required = false, className = '', disabled = false }) {
  return (
    <select
      id={id}
      name="shippingZoneCode"
      required={required}
      disabled={disabled}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      className={className}
    >
      <option value="">Choisissez votre commune…</option>
      {(groups || []).map((group) => (
        <optgroup key={group.code} label={group.label}>
          {group.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/**
 * Detail de la livraison d'un devis : zone, un tarif par colis (un colis par vendeur), livraison offerte,
 * message « hors Abidjan : estimation » ou livraison indisponible.
 */
export function ShippingBreakdown({ quote, compact = false }) {
  const info = describeShippingQuote(quote);
  if (!info) return null;
  if (!info.available) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
        {info.unavailableReason || "Livraison non disponible pour cette adresse."}
      </p>
    );
  }
  return (
    <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
      {info.zoneName ? <p>Zone de livraison : <span className="font-semibold text-neutral-700 dark:text-neutral-200">{info.zoneName}</span></p> : null}
      {info.outside ? (
        <p className="text-amber-700 dark:text-amber-400">
          {info.estimate
            ? "Livraison hors Abidjan : estimation calculée selon la distance."
            : "Livraison hors Abidjan : tarif forfaitaire."}
        </p>
      ) : null}
      {!compact && info.parcels.length > 1 ? (
        <ul className="space-y-0.5">
          {info.parcels.map((p, i) => (
            <li key={p.key} className="flex justify-between gap-2">
              <span>Colis {i + 1} · {p.label}{p.weightKg ? ` · ${p.weightKg.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kg` : ''}</span>
              <span>{money(p.cost)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {!compact && info.parcels.length > 1 ? <p>Un tarif par colis : vos articles viennent de {info.parcels.length} vendeurs.</p> : null}
      {info.freeApplied && Number.isFinite(info.gross) && info.gross > info.cost ? (
        <p className="text-green-600">Livraison offerte : −{money(info.gross - info.cost)}</p>
      ) : null}
    </div>
  );
}
