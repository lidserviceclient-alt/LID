export default function DescriptionSection({ product }) {
  const hasBanners = Boolean(product.descriptionBlocks?.length);

  if (hasBanners) {
    return (
      <div>
        <div className="space-y-0">
          {product.descriptionBlocks.map((block, i) => (
            <div
              key={i}
              className={`bg-pdp-ink text-white px-8 py-14 text-center ${i === 0 ? "rounded-t-lg" : ""} ${
                i === product.descriptionBlocks.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              {block.stat ? <div className="text-5xl font-extrabold mb-2">{block.stat}</div> : null}
              <h3 className="text-xl font-bold mb-1">{block.title}</h3>
              <p className="text-sm text-white/70">{block.subtitle}</p>
            </div>
          ))}
        </div>
        <button type="button" className="mt-4 text-sm text-pdp-gray-700 underline float-right">
          Signaler
        </button>
        <div className="clear-both" />
      </div>
    );
  }

  return (
    <div>
      {product.descriptionHighlights?.length ? (
        <>
          <h3 className="text-sm font-bold text-pdp-ink mb-2">Points forts du produit</h3>
          <ul className="space-y-2 mb-6">
            {product.descriptionHighlights.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-5 text-pdp-ink pl-5 relative">
                <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-pdp-ink" />
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {product.descriptionSpecsTable?.length ? (
        <>
          <h3 className="text-sm font-bold text-pdp-ink mb-2">Détails techniques</h3>
          <div className="max-w-[970px] rounded border border-pdp-line-2 overflow-hidden">
            <div className="grid grid-cols-2 bg-pdp-surface text-sm font-semibold text-pdp-ink">
              <span className="px-2 py-1.5">Spécifications</span>
              <span className="px-2 py-1.5">Détails</span>
            </div>
            {product.descriptionSpecsTable.map((row, i) => (
              <div key={i} className="grid grid-cols-2 border-t border-pdp-line-2 text-sm text-pdp-ink">
                <span className="px-2 py-1.5">{row.spec}</span>
                <span className="px-2 py-1.5">{row.detail}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <button type="button" className="mt-4 text-sm text-pdp-gray-700 underline float-right">
        Signaler
      </button>
      <div className="clear-both" />
    </div>
  );
}
