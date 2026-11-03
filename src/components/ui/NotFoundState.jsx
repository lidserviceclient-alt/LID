import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundState({ title, message, backTo, backLabel }) {
  return (
    <div className="space-y-4">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
        <Link
          to={backTo}
          className="mt-4 inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export const isNotFoundMessage = (message) => /not found|introuvable|\b404\b/i.test(`${message || ""}`);
