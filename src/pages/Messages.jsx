import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Send, Trash2, RotateCcw } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Badge from "../components/ui/Badge.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { reloadMessagesResolver, useMessagesResolver } from "../resolvers/messagesResolver.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
};

const statusVariant = (status) => {
  if (status === "SENT") return "success";
  if (status === "FAILED") return "destructive";
  if (status === "PENDING") return "warning";
  return "neutral";
};

export default function Messages() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const messagesEntry = useMessagesResolver(page, pageSize);
  const loading = messagesEntry.loading;
  const items = Array.isArray(messagesEntry.data?.content) ? messagesEntry.data.content : [];
  const totalPages = Number.isFinite(Number(messagesEntry.data?.totalPages)) ? Number(messagesEntry.data.totalPages) : 0;
  const totalElements = Number.isFinite(Number(messagesEntry.data?.totalElements)) ? Number(messagesEntry.data.totalElements) : items.length;

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("ahobautfrederick@gmail.com, eeeeee@lid.local");
  const [segment, setSegment] = useState("CLIENT");
  const [segmentQuery, setSegmentQuery] = useState("");
  const [segmentRoles, setSegmentRoles] = useState(["ADMIN", "SUPER_ADMIN", "IT", "LIVREUR", "PARTENAIRE"]);
  const [segmentLoading, setSegmentLoading] = useState(false);

  useEffect(() => {
    setError(messagesEntry.error);
  }, [messagesEntry.error]);

  const recipientsList = useMemo(() => {
    return `${recipients || ""}`
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [recipients]);

  const toggleRole = (role) => {
    setSegmentRoles((prev) => {
      const set = new Set(prev || []);
      if (set.has(role)) set.delete(role);
      else set.add(role);
      return Array.from(set);
    });
  };

  async function addRecipientsFromSegment() {
    setSegmentLoading(true);
    setError("");
    try {
      const roles = segment === "TEAM" ? segmentRoles : [];
      const list = await backofficeApi.recipients({
        segment,
        roles,
        q: segmentQuery.trim(),
        limit: 500
      });
      const toAdd = Array.isArray(list) ? list : [];
      const merged = new Set(recipientsList.map((x) => x.toLowerCase()));
      for (const e of toAdd) {
        const v = `${e || ""}`.trim().toLowerCase();
        if (!v) continue;
        merged.add(v);
      }
      setRecipients(Array.from(merged).join(", "));
    } catch (e) {
      setError(e?.message || "Impossible de charger les destinataires.");
    } finally {
      setSegmentLoading(false);
    }
  }

  async function send() {
    setSending(true);
    setError("");
    try {
      await backofficeApi.createMessage({
        subject: subject.trim(),
        body: body.trim(),
        recipients: recipientsList.length ? recipientsList : undefined
      });
      setSubject("");
      setBody("");
      await reloadMessagesResolver(page, pageSize);
    } catch (e) {
      setError(e?.message || "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  async function retry(id) {
    setError("");
    try {
      await backofficeApi.retryMessage(id);
      await reloadMessagesResolver(page, pageSize);
    } catch (e) {
      setError(e?.message || "Retry impossible.");
    }
  }

  async function remove(id) {
    setError("");
    try {
      await backofficeApi.deleteMessage(id);
      await reloadMessagesResolver(page, pageSize);
    } catch (e) {
      setError(e?.message || "Suppression impossible.");
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      ) : null}

      <SectionHeader title="Messages" subtitle="Envoi d'emails et historique d'exécution." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Destinataires</Label>
              <Button variant="outline" size="sm" type="button" onClick={addRecipientsFromSegment} disabled={segmentLoading}>
                {segmentLoading ? "Ajout…" : "Ajouter"}
              </Button>
            </div>

            <div className="grid gap-2">
              <Select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                options={[
                  { value: "VISITOR", label: "Visiteurs (newsletter)" },
                  { value: "CLIENT", label: "Clients" },
                  { value: "TEAM", label: "Équipe" }
                ]}
              />

              {segment === "TEAM" ? (
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-input bg-background px-3 py-2 text-xs text-muted-foreground">
                  {["ADMIN", "SUPER_ADMIN", "IT", "LIVREUR", "PARTENAIRE"].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={(segmentRoles || []).includes(r)}
                        onChange={() => toggleRole(r)}
                        className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              <Input
                placeholder="Filtrer (email, nom, prénom)…"
                value={segmentQuery}
                onChange={(e) => setSegmentQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Destinataires (CSV)</Label>
            <Input id="recipients" value={recipients} onChange={(e) => setRecipients(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-44 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
              placeholder="Tape ton message…"
            />
          </div>
          <Button onClick={send} disabled={sending || !subject.trim() || !body.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? "Envoi..." : "Envoyer"}
          </Button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">Historique</div>
            <Button variant="outline" size="sm" onClick={() => messagesEntry.reload().catch(() => {})} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
          <Table>
            <THead>
              <TRow>
                <TCell>Sujet</TCell>
                <TCell>Statut</TCell>
                <TCell>Destinataires</TCell>
                <TCell>Créé</TCell>
                <TCell>Envoyé</TCell>
                <TCell className="text-right">Actions</TCell>
              </TRow>
            </THead>
            <tbody>
              {loading ? (
                <TRow>
                  <TCell className="text-muted-foreground">Chargement…</TCell>
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                </TRow>
              ) : items.length === 0 ? (
                <TRow>
                  <TCell className="text-muted-foreground">Aucun message.</TCell>
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                </TRow>
              ) : (
                items.map((m) => (
                  <TRow key={m.id} className="group hover:bg-muted/50 transition-colors">
                    <TCell>
                      <div className="font-semibold text-foreground">{m.subject}</div>
                      {m.lastError ? <div className="text-xs text-destructive line-clamp-1">{m.lastError}</div> : null}
                    </TCell>
                    <TCell>
                      <Badge label={m.status} variant={statusVariant(m.status)} />
                    </TCell>
                    <TCell className="text-xs text-muted-foreground">
                      {(m.recipients || []).join(", ")}
                    </TCell>
                    <TCell className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</TCell>
                    <TCell className="text-xs text-muted-foreground">{formatDateTime(m.sentAt)}</TCell>
                    <TCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          disabled={m.status === "SENT"}
                          onClick={() => retry(m.id)}
                        >
                          <RotateCcw className="h-4 w-4 text-slate-500 hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" type="button" onClick={() => remove(m.id)}>
                          <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                        </Button>
                      </div>
                    </TCell>
                  </TRow>
                ))
              )}
            </tbody>
          </Table>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{totalElements} message{totalElements > 1 ? "s" : ""}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0 || loading}>
                Précédent
              </Button>
              <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={loading || page + 1 >= totalPages}>
                Suivant
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
