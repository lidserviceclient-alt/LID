import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Send, Trash2, RotateCcw } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Label from "../components/ui/Label.jsx";
import Badge from "../components/ui/Badge.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("ahobautfrederick@gmail.com, eeeeee@lid.local");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const page = await backofficeApi.messages(0, 50);
      setItems(Array.isArray(page?.content) ? page.content : []);
    } catch (e) {
      setError(e?.message || "Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const recipientsList = useMemo(() => {
    return `${recipients || ""}`
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [recipients]);

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
      await load();
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
      await load();
    } catch (e) {
      setError(e?.message || "Retry impossible.");
    }
  }

  async function remove(id) {
    setError("");
    try {
      await backofficeApi.deleteMessage(id);
      await load();
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
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
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
        </Card>
      </div>
    </div>
  );
}

