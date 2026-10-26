import Button from "../../../components/ui/Button.jsx";

/**
 * Ligne d'une liste de paramètres (réseau social, modalité, membre…) : contenu + actions,
 * empilés sur mobile, alignés sur une ligne à partir de sm.
 */
export function SettingsListItem({ title, badges, subtitle, actions }) {
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-input bg-background/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-foreground">{title}</span>
          {badges}
        </div>
        {subtitle ? <div className="truncate text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </li>
  );
}

/**
 * Liste avec états vide / chargement.
 */
export function SettingsList({ items, loading, emptyLabel, renderItem }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {loading ? "Chargement…" : emptyLabel}
      </div>
    );
  }
  return <ul className="space-y-2">{items.map(renderItem)}</ul>;
}

/**
 * Boutons « Actualiser » + action principale (souvent « Ajouter ») en tête de carte.
 */
export function ListActions({ onRefresh, loading, onAdd, addLabel = "Ajouter", disabled = false }) {
  return (
    <>
      {onRefresh ? (
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading || disabled}>
          {loading ? "Chargement…" : "Actualiser"}
        </Button>
      ) : null}
      {onAdd ? (
        <Button type="button" size="sm" onClick={onAdd} disabled={disabled}>
          {addLabel}
        </Button>
      ) : null}
    </>
  );
}
