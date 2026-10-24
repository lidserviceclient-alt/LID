import { useState } from "react";

const COLLAPSE_AT = 18;

export default function SpecsTable({ specs }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? specs : specs.slice(0, COLLAPSE_AT);

  return (
    <div>
      <div className="rounded-lg border border-pdp-line-2 overflow-hidden">
        {visible.map((spec, i) => (
          <div
            key={i}
            className={`h-[52px] flex items-center ${i % 2 === 0 ? "bg-pdp-surface" : "bg-white"}`}
          >
            <span className="w-[180px] flex-shrink-0 pl-4 text-[13px] text-pdp-ink">{spec.label}</span>
            <span className="text-[13px] text-pdp-ink">{spec.value}</span>
          </div>
        ))}
      </div>
      {specs.length > COLLAPSE_AT ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-sm font-medium text-pdp-ink underline"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      ) : null}
    </div>
  );
}
