import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, Inbox, RefreshCw, Search } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import { cn } from "../../utils/cn.js";
import MessageDetail from "../../components/contact/MessageDetail.jsx";
import Pager from "../../components/contact/Pager.jsx";
import { HandlingBadge } from "../../components/contact/StatusBadges.jsx";
import { reloadContactSummary, useContactSummary } from "../../resolvers/contactSummaryStore.js";
import { formatDateTime, senderLabel } from "./contactUtils.js";
import { useMessagePage } from "./useMessagePage.js";

const TABS = [
  { key: "", label: "Tous", count: "total" },
  { key: "NEW", label: "Non lus", count: "unread" },
  { key: "READ", label: "Lus", count: "read" },
  { key: "PROCESSED", label: "Traités", count: "processed" },
  { key: "ARCHIVED", label: "Archivés", count: "archived" }
];

const PAGE_SIZE = 15;

/** Boîte de réception : liste paginée/filtrée à gauche, message complet à droite (page seule sur mobile). */
export default function ContactInbox() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const handling = TABS.some((t) => t.key === params.get("statut")) ? params.get("statut") || "" : "";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const urlQuery = params.get("q") || "";
  const [search, setSearch] = useState(urlQuery);
  const { data: summary } = useContactSummary();

  const list = useMessagePage({ page, size: PAGE_SIZE, filters: { direction: "INBOUND", handling, q: urlQuery } });

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v === "" || v === 0 || v == null) next.delete(k);
        else next.set(k, `${v}`);
      }
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  // Recherche différée : on ne relance pas une requête à chaque frappe.
  useEffect(() => {
    if (search === urlQuery) return undefined;
    const t = window.setTimeout(() => updateParams({ q: search.trim(), page: 0 }), 350);
    return () => window.clearTimeout(t);
  }, [search, urlQuery, updateParams]);

  const refreshAll = useCallback(() => {
    list.reload();
    reloadContactSummary();
  }, [list]);

  const open = (messageId) => navigate({ pathname: `/contact/inbox/${messageId}`, search: params.toString() });
  const close = () => navigate({ pathname: "/contact/inbox", search: params.toString() });

  return (
    <div className="space-y-4">
      {list.error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {list.error}
          </span>
          <Button variant="outline" size="sm" onClick={list.reload}>
            Réessayer
          </Button>
        </div>
      ) : null}

      <div className={cn("flex flex-wrap items-center gap-2", id && "hidden lg:flex")}>
        <div role="tablist" aria-label="Filtrer par statut" className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active = handling === t.key;
            const count = summary?.[t.count];
            return (
              <button
                key={t.key || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => updateParams({ statut: t.key, page: 0 })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {t.label}
                {count != null ? <span className="ml-1.5 text-xs opacity-80">{count}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Rechercher un message" placeholder="Nom, email, sujet, texte…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll} disabled={list.loading} aria-label="Actualiser" className="gap-1">
          <RefreshCw className={cn("h-4 w-4", list.loading && "animate-spin")} /> <span className="hidden sm:inline">Actualiser</span>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className={cn("space-y-3 p-3", id && "hidden lg:block")}>
          {list.loading && list.items.length === 0 ? (
            <ul className="space-y-2" aria-busy="true" aria-label="Chargement des messages">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </ul>
          ) : list.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8" aria-hidden="true" />
              {urlQuery || handling ? "Aucun message ne correspond à ces filtres." : "Aucun message reçu pour le moment."}
            </div>
          ) : (
            <ul className={cn("space-y-1.5", list.loading && "opacity-60")} aria-label="Messages reçus">
              {list.items.map((m) => {
                const selected = String(m.id) === String(id);
                const unread = m.handlingStatus === "NEW";
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => open(m.id)}
                      aria-current={selected ? "true" : undefined}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Non lu" /> : null}
                          <span className={cn("truncate text-sm", unread ? "font-bold" : "font-medium")}>{senderLabel(m)}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-foreground">{`${m.subject || ""}`.replace(/^Contact - /, "")}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{m.preview}</div>
                      {m.handlingStatus !== "NEW" ? (
                        <div className="mt-1.5">
                          <HandlingBadge status={m.handlingStatus} />
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Pager page={page} totalPages={list.totalPages} totalElements={list.totalElements} loading={list.loading} onPage={(p) => updateParams({ page: p })} />
        </Card>

        <Card className={cn("p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto", !id && "hidden lg:block")}>
          {id ? (
            <MessageDetail
              id={id}
              onBack={close}
              onChanged={refreshAll}
              onDeleted={() => {
                close();
                refreshAll();
              }}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">Sélectionnez un message pour le lire en entier, le traiter ou y répondre.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
