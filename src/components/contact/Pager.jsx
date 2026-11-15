import Button from "../ui/Button.jsx";

/** Pagination côté serveur : `page` est indexée à partir de 0. */
export default function Pager({ page, totalPages, totalElements, loading, onPage, noun = "message" }) {
  const pages = Math.max(Number(totalPages) || 0, 1);
  const total = Number(totalElements) || 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span aria-live="polite">
        {total} {noun}
        {total > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPage(Math.max(0, page - 1))} disabled={page <= 0 || loading}>
          Précédent
        </Button>
        <span>
          Page {page + 1} / {pages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={loading || page + 1 >= pages}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
