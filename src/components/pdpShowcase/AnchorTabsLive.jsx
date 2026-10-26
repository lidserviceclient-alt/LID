import { useEffect, useState } from "react";
import { FOCUS_RING, scrollToId } from "./liveUtils";

const NAV_HEIGHT = 52;

// Navigation d'ancres collante + sections de contenu de la fiche produit réelle.
// `sections` : [{ id, label, title, content }] ; les sections sont toujours dépliées (lecture continue).
export default function AnchorTabsLive({ sections, stickyTop = 0 }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const offset = stickyTop + NAV_HEIGHT + 12;
  const idsKey = sections.map((s) => s.id).join("|");

  useEffect(() => {
    const ids = idsKey.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 1) current = id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [idsKey, offset]);

  return (
    <div className="font-barlow">
      <nav
        aria-label="Sections de la fiche produit"
        className="sticky z-20 -mx-4 px-4 sm:mx-0 sm:px-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-pdp-line-2 dark:border-neutral-800"
        style={{ top: stickyTop, height: NAV_HEIGHT }}
      >
        <ul className="flex h-full gap-6 overflow-x-auto scrollbar-hide">
          {sections.map((s) => {
            const isActive = activeId === s.id;
            return (
              <li key={s.id} className="h-full flex-shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveId(s.id);
                    scrollToId(s.id, offset);
                  }}
                  aria-current={isActive ? "location" : undefined}
                  className={`h-full inline-flex items-center border-b-2 -mb-px text-[15px] whitespace-nowrap transition-colors ${FOCUS_RING} focus-visible:ring-inset ${
                    isActive
                      ? "border-pdp-ink dark:border-white text-pdp-ink dark:text-white font-semibold"
                      : "border-transparent text-pdp-gray-700 dark:text-neutral-400 hover:text-pdp-ink dark:hover:text-white font-medium"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {sections.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          aria-labelledby={`${s.id}-title`}
          className={`py-8 sm:py-10 ${i > 0 ? "border-t border-pdp-line-2 dark:border-neutral-800" : ""}`}
          style={{ scrollMarginTop: offset }}
        >
          <h2 id={`${s.id}-title`} className="text-xl sm:text-2xl font-bold text-pdp-ink dark:text-white mb-5">
            {s.title || s.label}
          </h2>
          {s.content}
        </section>
      ))}
    </div>
  );
}
