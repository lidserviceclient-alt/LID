import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Eye, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import { Table, THead, TRow, TCell } from "../../components/ui/Table.jsx";
import MessageViewerModal from "../../components/contact/MessageViewerModal.jsx";
import Pager from "../../components/contact/Pager.jsx";
import { DeliveryBadge, DirectionBadge } from "../../components/contact/StatusBadges.jsx";
import { backofficeApi } from "../../services/api.js";
import { reloadContactSummary } from "../../resolvers/contactSummaryStore.js";
import { formatDateTime, recipientsLabel, senderLabel } from "./contactUtils.js";
import { useMessagePage } from "./useMessagePage.js";

const PAGE_SIZE = 20;

/** Historique de tous les messages (reçus et envoyés) : filtres serveur, pagination, lecture du message intégral. */
export default function ContactHistory() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const direction = params.get("sens") || "";
  const status = params.get("envoi") || "";
  const urlQuery = params.get("q") || "";
  const [search, setSearch] = useState(urlQuery);
  const [viewId, setViewId] = useState(null);
  const [actionError, setActionError] = useState("");

  const list = useMessagePage({ page, size: PAGE_SIZE, filters: { direction, status, q: urlQuery } });

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

  useEffect(() => {
    if (search === urlQuery) return undefined;
    const t = window.setTimeout(() => updateParams({ q: search.trim(), page: 0 }), 350);
    return () => window.clearTimeout(t);
  }, [search, urlQuery, updateParams]);

  const retry = async (m) => {
    setActionError("");
    try {
      await backofficeApi.retryMessage(m.id);
      await list.reload();
    } catch (e) {
      setActionError(e?.message || "Nouvel envoi impossible.");
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Supprimer « ${m.subject} » ?`)) return;
    setActionError("");
    try {
      await backofficeApi.deleteMessage(m.id);
      await list.reload();
      reloadContactSummary();
    } catch (e) {
      setActionError(e?.message || "Suppression impossible.");
    }
  };

  const error = actionError || list.error;

  return (
    <div className="space-y-4">
      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </span>
          {list.error ? (
            <Button variant="outline" size="sm" onClick={list.reload}>
              Réessayer
            </Button>
          ) : null}
        </div>
      ) : null}

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-40">
            <Select aria-label="Sens" value={direction} onChange={(e) => updateParams({ sens: e.target.value, page: 0 })} options={[{ value: "", label: "Reçus et envoyés" }, { value: "INBOUND", label: "Reçus" }, { value: "OUTBOUND", label: "Envoyés" }]} />
          </div>
          <div className="w-full sm:w-44">
            <Select aria-label="Statut d'envoi" value={status} onChange={(e) => updateParams({ envoi: e.target.value, page: 0 })} options={[{ value: "", label: "Tous les envois" }, { value: "SENT", label: "Envoyés" }, { value: "FAILED", label: "En échec" }, { value: "PENDING", label: "En attente" }]} />
          </div>
          <div className="relative w-full sm:ml-auto sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Rechercher dans l'historique" placeholder="Sujet, contenu, expéditeur…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={list.reload} disabled={list.loading} aria-label="Actualiser" className="gap-1">
            <RefreshCw className={`h-4 w-4 ${list.loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Sujet</TCell>
              <TCell>Sens</TCell>
              <TCell>Contact</TCell>
              <TCell>Envoi</TCell>
              <TCell>Date</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {list.loading && list.items.length === 0 ? (
              <TRow>
                <TCell colSpan={6} className="text-muted-foreground" role="status">
                  Chargement…
                </TCell>
              </TRow>
            ) : list.items.length === 0 ? (
              <TRow>
                <TCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {urlQuery || direction || status ? "Aucun message ne correspond à ces filtres." : "Aucun message pour le moment."}
                </TCell>
              </TRow>
            ) : (
              list.items.map((m) => (
                <TRow key={m.id}>
                  <TCell className="max-w-[18rem]">
                    <div className="truncate font-semibold text-foreground">{m.subject}</div>
                    {m.preview ? <div className="line-clamp-1 text-xs text-muted-foreground">{m.preview}</div> : null}
                    {m.lastError ? <div className="line-clamp-1 text-xs text-destructive">{m.lastError}</div> : null}
                  </TCell>
                  <TCell>
                    <DirectionBadge direction={m.direction} />
                  </TCell>
                  <TCell className="max-w-[14rem] truncate text-xs text-muted-foreground">{m.direction === "INBOUND" ? senderLabel(m) : recipientsLabel(m)}</TCell>
                  <TCell>
                    <DeliveryBadge status={m.status} />
                  </TCell>
                  <TCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => setViewId(m.id)} className="gap-1 whitespace-nowrap" aria-label={`Voir le message : ${m.subject}`}>
                        <Eye className="h-4 w-4" /> Voir le message
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => retry(m)} disabled={m.status === "SENT"} aria-label={`Relancer l'envoi : ${m.subject}`} title="Relancer l'envoi">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(m)} aria-label={`Supprimer : ${m.subject}`} title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>

        <Pager page={page} totalPages={list.totalPages} totalElements={list.totalElements} loading={list.loading} onPage={(p) => updateParams({ page: p })} />
      </Card>

      <MessageViewerModal id={viewId} onClose={() => setViewId(null)} />
    </div>
  );
}
