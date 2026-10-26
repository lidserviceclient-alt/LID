import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import SectionHeader from "../../components/ui/SectionHeader.jsx";
import Select from "../../components/ui/Select.jsx";
import { cn } from "../../utils/cn.js";
import { SETTINGS_SECTIONS, findSettingsSection } from "./sections.js";

/**
 * Coquille de /settings : titre, navigation entre sections (liste latérale ≥ lg,
 * menu déroulant sur mobile) et contenu de la section active via <Outlet />.
 */
export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = findSettingsSection(location.pathname);

  return (
    <div className="space-y-6">
      <SectionHeader title="Paramètres" subtitle="Configuration de la boutique, de la livraison, de l’équipe et de la sécurité." />

      <div className="lg:hidden">
        <label htmlFor="settings-section-select" className="sr-only">
          Section des paramètres
        </label>
        <Select
          id="settings-section-select"
          value={current?.path || ""}
          onChange={(e) => navigate(`/settings/${e.target.value}`)}
          options={SETTINGS_SECTIONS.map((s) => ({ value: s.path, label: s.label }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px,minmax(0,1fr)]">
        <nav aria-label="Sections des paramètres" className="hidden lg:block">
          <ul className="sticky top-20 space-y-1">
            {SETTINGS_SECTIONS.map((section) => (
              <li key={section.path}>
                <NavLink
                  to={`/settings/${section.path}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <section.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className={cn("block font-medium", isActive && "font-semibold")}>{section.label}</span>
                        <span className="block text-xs text-muted-foreground">{section.description}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
