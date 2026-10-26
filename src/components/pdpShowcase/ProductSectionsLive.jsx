import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Clock, PackageCheck, RotateCcw, Truck, Wallet } from "lucide-react";
import { FOCUS_RING, formatFcfa, parseDescription } from "./liveUtils";

// Contenus des sections de la fiche produit réelle (Description, Caractéristiques, Livraison et retours).

const COLLAPSE_CHARS = 900;

export function DescriptionContent({ description }) {
  const blocks = useMemo(() => parseDescription(description), [description]);
  const isLong = `${description || ""}`.length > COLLAPSE_CHARS;
  const [expanded, setExpanded] = useState(false);

  if (!blocks.length) {
    return (
      <p className="text-[15px] leading-relaxed text-pdp-gray-700 dark:text-neutral-400">
        Le vendeur n'a pas encore fourni de description détaillée pour ce produit. Consultez les caractéristiques
        ci-dessous ou contactez notre service client pour toute question.
      </p>
    );
  }

  const collapsed = isLong && !expanded;
  return (
    <div>
      <div className={`relative ${collapsed ? "max-h-[320px] overflow-hidden" : ""}`}>
        <div className="max-w-[72ch] space-y-4 text-[15px] sm:text-base leading-relaxed text-pdp-ink dark:text-neutral-200">
          {blocks.map((block, i) =>
            block.type === "ul" ? (
              <ul key={i} className="space-y-2 pl-5 list-disc marker:text-pdp-gray-500">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>
                {block.lines.map((line, j) => (
                  <span key={j}>
                    {j > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
            )
          )}
        </div>
        {collapsed ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent" />
        ) : null}
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`mt-4 inline-flex items-center gap-1 rounded text-sm font-semibold text-pdp-ink dark:text-white underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}
        >
          {expanded ? "Réduire la description" : "Lire toute la description"}
          <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/** `specs` : [{ label, value, to? }] — les lignes sans valeur sont masquées. */
export function SpecsContent({ specs }) {
  const rows = specs.filter((s) => s.value !== null && s.value !== undefined && `${s.value}`.trim() !== "");
  if (!rows.length) {
    return <p className="text-sm text-pdp-gray-700 dark:text-neutral-400">Aucune caractéristique renseignée.</p>;
  }
  return (
    <dl className="rounded-xl border border-pdp-line-2 dark:border-neutral-800 overflow-hidden divide-y divide-pdp-line-2 dark:divide-neutral-800">
      {rows.map((spec) => (
        <div key={spec.label} className="grid grid-cols-[minmax(120px,38%)_1fr] text-sm">
          <dt className="bg-pdp-surface dark:bg-neutral-900 px-4 py-3 font-medium text-pdp-gray-700 dark:text-neutral-400">{spec.label}</dt>
          <dd className="px-4 py-3 text-pdp-ink dark:text-white break-words">
            {spec.to ? (
              <Link to={spec.to} className={`rounded underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}>
                {spec.value}
              </Link>
            ) : (
              spec.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-pdp-line-2 dark:border-neutral-800 p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-pdp-ink dark:text-white">
        <Icon size={18} aria-hidden="true" /> {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-pdp-gray-700 dark:text-neutral-400 space-y-2">{children}</div>
    </div>
  );
}

/**
 * Livraison (modes, délais et coûts du back-office, note de politique) et retours
 * (fenêtre, texte de politique, mode de remboursement, coût de retour estimé).
 */
export function ShippingReturnsContent({
  shippingMethods,
  freeShippingThreshold,
  shippingPolicyNote,
  returnWindowLabel,
  returnPolicyText,
  refundPolicyLabel,
  returnShippingCostLabel,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoCard icon={Truck} title="Livraison">
        {shippingMethods.length ? (
          <ul className="divide-y divide-pdp-line-2 dark:divide-neutral-800 -my-1">
            {shippingMethods.map((m) => (
              <li key={m.code} className="flex items-start justify-between gap-4 py-2">
                <span>
                  <span className="block font-semibold text-pdp-ink dark:text-white">{m.label}</span>
                  {m.leadTime ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Clock size={12} aria-hidden="true" /> {m.leadTime}
                    </span>
                  ) : null}
                </span>
                <span className="font-semibold text-pdp-ink dark:text-white tabular-nums whitespace-nowrap">
                  {Number(m.costAmount) > 0 ? formatFcfa(m.costAmount) : "Offerte"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {freeShippingThreshold ? (
          <p className="inline-flex items-start gap-2">
            <PackageCheck size={16} className="mt-0.5 flex-shrink-0 text-pdp-green" aria-hidden="true" />
            <span>Livraison standard offerte dès {formatFcfa(freeShippingThreshold)} d'achat.</span>
          </p>
        ) : null}
        {shippingPolicyNote ? <p>{shippingPolicyNote}</p> : null}
        <p>
          <Link to="/delivery" className={`rounded font-semibold text-pdp-ink dark:text-white underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}>
            Toutes les informations de livraison
          </Link>
        </p>
      </InfoCard>

      <InfoCard icon={RotateCcw} title={`Retours sous ${returnWindowLabel}`}>
        <p>{returnPolicyText}</p>
        <p className="inline-flex items-start gap-2">
          <Wallet size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>
            {refundPolicyLabel}.
            {returnShippingCostLabel ? ` Coût de retour estimé : ${returnShippingCostLabel}.` : ""}
          </span>
        </p>
        <p>Les frais de retour sont à la charge de l'acheteur, sauf produit non conforme ou défectueux (CGV, article 7).</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/returns" className={`rounded font-semibold text-pdp-ink dark:text-white underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}>
            Faire une demande de retour
          </Link>
          <Link to="/terms" className={`rounded font-semibold text-pdp-ink dark:text-white underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}>
            Conditions générales de vente
          </Link>
        </p>
      </InfoCard>
    </div>
  );
}
