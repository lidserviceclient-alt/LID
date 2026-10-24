import { MENU_VARIANTS, setMenuVariant } from "@/features/catalog/menuVariantStore";
import { useMenuVariant } from "@/features/catalog/useMenuVariant";

const LABELS = {
  "list-grid": "1a · Liste + grille",
  "columns": "1b · Colonnes",
  "tabs": "1c · Onglets",
  "grouped": "2a · Univers",
};

/**
 * Floating buttons to live-switch the "Nos Catégories" menu design variant,
 * for comparing 1a/1b/1c/2a on staging. Staging-only by design — never
 * rendered in production.
 */
export default function MenuVariantSwitcher() {
  if (import.meta.env.MODE !== "staging") return null;
  return <MenuVariantSwitcherInner />;
}

function MenuVariantSwitcherInner() {
  const variant = useMenuVariant();

  return (
    <div className="fixed bottom-4 left-4 z-[200] flex flex-col gap-1 p-2 rounded-2xl bg-white/95 dark:bg-neutral-900/95 shadow-2xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 pb-0.5">
        Design menu (staging)
      </span>
      {MENU_VARIANTS.map((v) => (
        <button
          key={v}
          onClick={() => setMenuVariant(v)}
          className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            variant === v
              ? "bg-[#6aa200] text-white"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          {LABELS[v]}
        </button>
      ))}
    </div>
  );
}
