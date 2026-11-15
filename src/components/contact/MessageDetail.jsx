import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Archive, ArrowLeft, CheckCircle2, MailOpen, RotateCcw, Trash2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import Label from "../ui/Label.jsx";
import { backofficeApi } from "../../services/api.js";
import { formatDateTime, senderLabel } from "../../pages/contact/contactUtils.js";
import { DeliveryBadge, HandlingBadge } from "./StatusBadges.jsx";
import MessageBody from "./MessageBody.jsx";
import ReplyForm from "./ReplyForm.jsx";

function Field({ label, children }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="break-words font-semibold text-foreground">{children || "-"}</div>
    </div>
  );
}

/**
 * Détail complet d'un message reçu : expéditeur, message intégral, statut de traitement, note interne, réponses.
 * Ouvrir un message non lu le marque comme lu (une seule fois, côté serveur via PATCH explicite).
 */
export default function MessageDetail({ id, onBack, onChanged, onDeleted }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const apply = useCallback((m) => {
    setMessage(m);
    setNote(m?.internalNote || "");
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setMessage(null);
    (async () => {
      try {
        let m = await backofficeApi.message(id);
        if (!alive) return;
        if (m?.direction === "INBOUND" && m.handlingStatus === "NEW") {
          try {
            m = await backofficeApi.updateMessageHandling(id, { status: "READ" });
            onChanged?.();
          } catch {
            /* marquer comme lu est accessoire : le message reste affiché */
          }
        }
        if (alive) apply(m);
      } catch (e) {
        if (alive) setError(e?.message || "Impossible d'ouvrir le message.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = async (fn, fallback) => {
    setBusy(true);
    setError("");
    try {
      const result = await fn();
      if (result) apply(result);
      onChanged?.();
    } catch (e) {
      setError(e?.message || fallback);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status) => run(() => backofficeApi.updateMessageHandling(id, { status }), "Changement de statut impossible.");
  const saveNote = () => run(() => backofficeApi.updateMessageHandling(id, { internalNote: note }), "Enregistrement de la note impossible.");
  const retry = () => run(() => backofficeApi.retryMessage(id).then(() => backofficeApi.message(id)), "Nouvel envoi impossible.");
  const remove = async () => {
    if (!window.confirm("Supprimer définitivement ce message et son historique ?")) return;
    setBusy(true);
    try {
      await backofficeApi.deleteMessage(id);
      onDeleted?.(id);
    } catch (e) {
      setError(e?.message || "Suppression impossible.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
        <span className="sr-only">Chargement du message…</span>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="space-y-3" role="alert">
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error || "Message introuvable."}
        </p>
        {onBack ? (
          <Button variant="outline" size="sm" onClick={onBack}>
            Retour à la liste
          </Button>
        ) : null}
      </div>
    );
  }

  const inbound = message.direction === "INBOUND";
  const status = message.handlingStatus;
  const replies = Array.isArray(message.replies) ? message.replies : [];

  return (
    <article className="space-y-4" aria-label={`Message : ${message.subject}`}>
      {onBack ? (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </Button>
      ) : null}

      {error ? (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      ) : null}

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {inbound ? <HandlingBadge status={status} /> : null}
          <DeliveryBadge status={message.status} />
        </div>
        <h3 className="break-words text-lg font-semibold text-foreground">{message.subject}</h3>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {inbound ? (
          <>
            <Field label="Expéditeur">{senderLabel(message)}</Field>
            <Field label="Email">
              {message.senderEmail ? (
                <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${message.senderEmail}`}>
                  {message.senderEmail}
                </a>
              ) : null}
            </Field>
            <Field label="Téléphone">{message.senderPhone}</Field>
          </>
        ) : (
          <Field label="Destinataires">{(message.recipients || []).join(", ")}</Field>
        )}
        <Field label="Reçu le">{formatDateTime(message.createdAt)}</Field>
        {message.repliedAt ? <Field label="Réponse envoyée le">{formatDateTime(message.repliedAt)}</Field> : null}
        {message.handledAt ? (
          <Field label="Traité le">
            {formatDateTime(message.handledAt)}
            {message.handledBy ? ` par ${message.handledBy}` : ""}
          </Field>
        ) : null}
      </div>

      <section aria-label="Message complet" className="space-y-1.5">
        <h4 className="text-sm font-semibold text-foreground">Message</h4>
        <MessageBody text={message.messageText || message.body} />
      </section>

      {message.status === "FAILED" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <span className="min-w-0 break-words">
            {inbound ? "La notification e-mail à l'équipe a échoué" : "L'envoi a échoué"} ({message.attemptCount || 0} tentative
            {(message.attemptCount || 0) > 1 ? "s" : ""}){message.lastError ? ` : ${message.lastError}` : ""}. Le message reste conservé ici.
          </span>
          <Button variant="outline" size="sm" onClick={retry} disabled={busy} className="gap-1">
            <RotateCcw className="h-3.5 w-3.5" /> Relancer
          </Button>
        </div>
      ) : null}

      {inbound ? (
        <>
          <section aria-label="Statut de traitement" className="flex flex-wrap gap-2">
            {status !== "PROCESSED" ? (
              <Button size="sm" onClick={() => setStatus("PROCESSED")} disabled={busy} className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Marquer traité
              </Button>
            ) : null}
            {status !== "ARCHIVED" ? (
              <Button variant="outline" size="sm" onClick={() => setStatus("ARCHIVED")} disabled={busy} className="gap-1">
                <Archive className="h-4 w-4" /> Archiver
              </Button>
            ) : null}
            {status !== "NEW" ? (
              <Button variant="outline" size="sm" onClick={() => setStatus("NEW")} disabled={busy} className="gap-1">
                <MailOpen className="h-4 w-4" /> Marquer non lu
              </Button>
            ) : null}
            {status === "ARCHIVED" || status === "PROCESSED" ? (
              <Button variant="outline" size="sm" onClick={() => setStatus("READ")} disabled={busy}>
                Rouvrir
              </Button>
            ) : null}
          </section>

          <section aria-label="Note interne" className="space-y-1.5">
            <Label htmlFor={`note-${id}`}>Note interne (jamais envoyée à l'expéditeur)</Label>
            <textarea
              id={`note-${id}`}
              value={note}
              maxLength={4000}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Suivi, décision, personne à rappeler…"
            />
            <Button variant="outline" size="sm" onClick={saveNote} disabled={busy || note.trim() === (message.internalNote || "")}>
              Enregistrer la note
            </Button>
          </section>

          {replies.length ? (
            <section aria-label="Réponses envoyées" className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Réponses ({replies.length})</h4>
              <ul className="space-y-2">
                {replies.map((r) => (
                  <li key={r.id} className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDateTime(r.createdAt)} · {r.createdBy || "équipe"}
                      </span>
                      <DeliveryBadge status={r.status} />
                    </div>
                    <MessageBody text={r.messageText || r.body} className="border-0 bg-transparent p-0" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {message.senderEmail ? (
            <ReplyForm
              key={`reply-${id}`}
              message={message}
              onSent={(updated) => {
                apply(updated);
                onChanged?.();
              }}
            />
          ) : null}
        </>
      ) : null}

      <div className="flex justify-end border-t border-border pt-3">
        <Button variant="ghost" size="sm" onClick={remove} disabled={busy} className="gap-1 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Supprimer
        </Button>
      </div>
    </article>
  );
}
