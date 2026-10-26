import Button from "../../../components/ui/Button.jsx";

/**
 * Barre d'actions d'un formulaire de paramètres : « Enregistrer » (submit) + « Actualiser » optionnel.
 */
export default function SaveBar({ saving, loading, onRefresh, saveLabel = "Enregistrer", disabled = false }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
      {onRefresh ? (
        <Button type="button" variant="outline" onClick={onRefresh} disabled={loading || saving}>
          {loading ? "Chargement…" : "Actualiser"}
        </Button>
      ) : null}
      <Button type="submit" disabled={disabled || loading || saving}>
        {saving ? "Enregistrement…" : saveLabel}
      </Button>
    </div>
  );
}
