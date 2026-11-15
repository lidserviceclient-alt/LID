import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Label from "../../components/ui/Label.jsx";
import RecipientPicker from "../../components/contact/RecipientPicker.jsx";
import { backofficeApi } from "../../services/api.js";
import { EMAIL_RE } from "./contactUtils.js";

const CONFIRM_ABOVE = 20;

/** Envoi d'un message sortant (modèle d'e-mail LID). Préremplissable : /contact/envoyer?to=a@b.c&subject=… */
export default function ContactCompose() {
  const [params] = useSearchParams();
  const [recipients, setRecipients] = useState(() => (params.get("to") || "").split(",").map((x) => x.trim()).filter((x) => EMAIL_RE.test(x)));
  const [subject, setSubject] = useState(params.get("subject") || "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canSend = useMemo(() => recipients.length > 0 && subject.trim() && body.trim(), [recipients, subject, body]);

  const send = async (e) => {
    e.preventDefault();
    if (recipients.length > CONFIRM_ABOVE && !window.confirm(`Envoyer ce message à ${recipients.length} destinataires ?`)) return;
    setSending(true);
    setError("");
    setResult(null);
    try {
      const sent = await backofficeApi.createMessage({ subject: subject.trim(), body: body.trim(), recipients });
      setResult(sent);
      if (sent?.status !== "FAILED") {
        setSubject("");
        setBody("");
        setRecipients([]);
      }
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-4 p-4">
        <RecipientPicker value={recipients} onChange={setRecipients} disabled={sending} />
      </Card>

      <Card className="space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="compose-subject">Sujet</Label>
          <Input id="compose-subject" value={subject} maxLength={255} onChange={(e) => setSubject(e.target.value)} disabled={sending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compose-body">Message</Label>
          <textarea
            id="compose-body"
            value={body}
            maxLength={9000}
            onChange={(e) => setBody(e.target.value)}
            disabled={sending}
            className="min-h-56 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Écrivez votre message…"
          />
          <p className="text-xs text-muted-foreground">Texte brut : le message est habillé avec le modèle d'e-mail LID (logo, pied de page) à l'envoi.</p>
        </div>

        {error ? (
          <p role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        ) : null}
        {result ? (
          result.status === "FAILED" ? (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>L'envoi a échoué{result.lastError ? ` : ${result.lastError}` : ""}. Le message est conservé dans l'historique, où vous pouvez le relancer.</span>
            </p>
          ) : (
            <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Message envoyé.
            </p>
          )
        ) : null}

        <Button type="submit" disabled={sending || !canSend} className="gap-2">
          <Send className="h-4 w-4" /> {sending ? "Envoi…" : `Envoyer${recipients.length > 1 ? ` à ${recipients.length} destinataires` : ""}`}
        </Button>
      </Card>
    </form>
  );
}
