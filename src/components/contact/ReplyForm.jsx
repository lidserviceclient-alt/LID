import { useState } from "react";
import { Send } from "lucide-react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Label from "../ui/Label.jsx";
import { backofficeApi } from "../../services/api.js";

/** Réponse e-mail à l'expéditeur d'un message reçu (modèle d'e-mail LID, texte brut échappé côté serveur). */
export default function ReplyForm({ message, onSent }) {
  const defaultSubject = `Re: ${`${message.subject || ""}`.replace(/^Contact - /, "")}`;
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setNotice("");
    try {
      const updated = await backofficeApi.replyToMessage(message.id, { subject: subject.trim() || undefined, body: body.trim() });
      const reply = (updated?.replies || []).slice(-1)[0];
      if (reply?.status === "FAILED") {
        setError("La réponse n'a pas pu être envoyée (elle est conservée dans la liste ci-dessus, vous pouvez la relancer depuis l'historique).");
      } else {
        setNotice(`Réponse envoyée à ${message.senderEmail}.`);
        setBody("");
      }
      onSent?.(updated);
    } catch (err) {
      setError(err?.message || "Envoi de la réponse impossible.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-border p-3" aria-label="Répondre">
      <h4 className="text-sm font-semibold text-foreground">Répondre à {message.senderEmail}</h4>
      <div className="space-y-1.5">
        <Label htmlFor={`reply-subject-${message.id}`}>Sujet</Label>
        <Input id={`reply-subject-${message.id}`} value={subject} maxLength={255} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`reply-body-${message.id}`}>Votre réponse</Label>
        <textarea
          id={`reply-body-${message.id}`}
          value={body}
          maxLength={9000}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Écrivez votre réponse…"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={sending || !body.trim()} className="gap-2">
        <Send className="h-4 w-4" /> {sending ? "Envoi…" : "Envoyer la réponse"}
      </Button>
      <p className="text-xs text-muted-foreground">Envoyer la réponse marque automatiquement le message comme traité.</p>
    </form>
  );
}
