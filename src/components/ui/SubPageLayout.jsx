import { useCallback, useEffect, useId, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";
import Select from "./Select.jsx";
import { cn } from "../../utils/cn.js";

/**
 * Mise en page « à sous-pages » partagée (Paramètres, Livraison, Retours, Contact…).
 *
 * <SubPageLayout
 *   title="Livraison" subtitle="…" actions={<Button/>}
 *   basePath="/logistics"                      // préfixe des chemins relatifs
 *   sections={[{ key, label, icon, path, badge?, description?, end? }]}
 *   storageKey="logistics"                     // mémorise l'état replié (défaut : basePath)
 *   navLabel="Sections de la livraison"
 *   collapsible                                // défaut true ; raccourci clavier « [ »
 * >
 *   {children optionnels — sinon <Outlet />}
 * </SubPageLayout>
 *
 * - `path` : relatif à `basePath` ("overview") ou absolu ("/couriers"). "" = index de basePath.
 * - `end` : correspondance exacte de l'URL pour l'état actif (défaut : false, sauf path "").
 * - ≥ lg : colonne de sections (repliable en icônes + infobulles) ; < lg : menu déroulant.
 */

const STORAGE_PREFIX = "lid.subpage.collapsed.";

export const resolveSectionPath = (basePath, path) => {
  const p = `${path ?? ""}`;
  if (p.startsWith("/")) return p;
  const base = `${basePath || ""}`.replace(/\/+$/, "");
  return p ? `${base}/${p}` : base || "/";
};

/** Section dont le chemin résolu correspond le mieux (le plus long préfixe) à `pathname`. */
export const findActiveSection = (sections, basePath, pathname) => {
  const current = `${pathname || ""}`.replace(/\/+$/, "") || "/";
  let best = null;
  let bestLength = -1;
  for (const section of sections || []) {
    const target = resolveSectionPath(basePath, section.path);
    const matches = current === target || (!section.end && section.path !== "" && current.startsWith(`${target}/`));
    if (matches && target.length > bestLength) {
      best = section;
      bestLength = target.length;
    }
  }
  return best;
};

const readCollapsed = (key) => {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key) === "1";
  } catch {
    return false;
  }
};

/** État replié de la colonne, mémorisé par page (localStorage protégé : fonctionne sans stockage). */
export function useSubPageCollapse(storageKey, defaultCollapsed = false) {
  const [collapsed, setCollapsedState] = useState(() => (storageKey ? readCollapsed(storageKey) : false) || defaultCollapsed);

  const setCollapsed = useCallback(
    (next) => {
      setCollapsedState((prev) => {
        const value = typeof next === "function" ? next(prev) : Boolean(next);
        try {
          if (storageKey) window.localStorage.setItem(STORAGE_PREFIX + storageKey, value ? "1" : "0");
        } catch {
          /* stockage indisponible : état en mémoire uniquement */
        }
        return value;
      });
    },
    [storageKey]
  );

  return [collapsed, setCollapsed];
}

const isTypingTarget = (el) => {
  if (!el) return false;
  const tag = `${el.tagName || ""}`.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
};

function SectionBadge({ badge, collapsed }) {
  if (badge === undefined || badge === null || badge === false || badge === "" || badge === 0) return null;
  if (collapsed) {
    return <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />;
  }
  return (
    <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
      {badge}
    </span>
  );
}

/**
 * Colonne de navigation seule (utilisable sans SubPageLayout).
 */
export function SubPageNav({ sections, basePath, navLabel = "Sections", collapsed = false, onToggle, collapsible = true, className }) {
  return (
    <nav aria-label={navLabel} className={cn("hidden lg:block", className)}>
      <div className="sticky top-20 space-y-2">
        {collapsible ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-keyshortcuts="["
            title={collapsed ? "Déplier la colonne ( [ )" : "Replier la colonne ( [ )"}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors",
              "hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span className={collapsed ? "sr-only" : ""}>{collapsed ? "Déplier les sections" : "Replier les sections"}</span>
          </button>
        ) : null}
        <ul className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const to = resolveSectionPath(basePath, section.path);
            return (
              <li key={section.key || section.path} className="group/subnav relative">
                <NavLink
                  to={to}
                  end={section.end ?? section.path === ""}
                  aria-label={collapsed ? section.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex gap-3 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed ? "items-center justify-center px-0 py-2.5" : "items-start px-3 py-2.5",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {Icon ? <Icon className={cn("h-4 w-4 shrink-0", !collapsed && "mt-0.5")} aria-hidden="true" /> : null}
                      {collapsed ? null : (
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className={cn("block font-medium", isActive && "font-semibold")}>{section.label}</span>
                            <SectionBadge badge={section.badge} />
                          </span>
                          {section.description ? (
                            <span className="block text-xs text-muted-foreground">{section.description}</span>
                          ) : null}
                        </span>
                      )}
                      {collapsed ? <SectionBadge badge={section.badge} collapsed /> : null}
                    </>
                  )}
                </NavLink>
                {collapsed ? (
                  <span
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-medium",
                      "opacity-0 transition-opacity duration-150 group-hover/subnav:opacity-100 group-focus-within/subnav:opacity-100"
                    )}
                  >
                    {section.label}
                    {section.badge ? <span className="ml-1.5 text-primary">({section.badge})</span> : null}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default function SubPageLayout({
  title,
  subtitle,
  actions,
  sections,
  basePath = "",
  storageKey,
  navLabel,
  collapsible = true,
  defaultCollapsed = false,
  expandedWidth = 240,
  collapsedWidth = 56,
  header,
  children,
  className
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const selectId = useId();
  const [collapsed, setCollapsed] = useSubPageCollapse(collapsible ? storageKey || basePath || "default" : null, defaultCollapsed);
  const isCollapsed = collapsible && collapsed;
  const current = findActiveSection(sections, basePath, location.pathname);
  const toggle = useCallback(() => setCollapsed((v) => !v), [setCollapsed]);

  // Raccourci « [ » (hors champs de saisie, sans modificateur) pour replier / déplier.
  useEffect(() => {
    if (!collapsible) return undefined;
    const onKey = (event) => {
      if (event.key !== "[" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target) || event.defaultPrevented) return;
      const openDialog = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).some(
        (el) => !el.closest('[aria-hidden="true"]')
      );
      if (openDialog) return;
      event.preventDefault();
      toggle();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [collapsible, toggle]);

  const label = navLabel || (title ? `Sections — ${title}` : "Sections");

  return (
    <div className={cn("space-y-6", className)}>
      {header !== undefined ? header : title ? <SectionHeader title={title} subtitle={subtitle} rightSlot={actions} /> : null}

      <div className="lg:hidden">
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
        <Select
          id={selectId}
          value={current ? resolveSectionPath(basePath, current.path) : ""}
          onChange={(e) => navigate(e.target.value)}
          options={[
            ...(current ? [] : [{ value: "", label: "Choisir une section…", disabled: true }]),
            ...sections.map((s) => ({
              value: resolveSectionPath(basePath, s.path),
              label: s.badge ? `${s.label} (${s.badge})` : s.label
            }))
          ]}
        />
      </div>

      <div
        className="grid gap-6 transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none lg:[grid-template-columns:var(--subpage-cols)]"
        style={{ "--subpage-cols": `${isCollapsed ? collapsedWidth : expandedWidth}px minmax(0,1fr)` }}
      >
        <SubPageNav
          sections={sections}
          basePath={basePath}
          navLabel={label}
          collapsed={isCollapsed}
          collapsible={collapsible}
          onToggle={toggle}
        />
        <div className="min-w-0 space-y-6">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
