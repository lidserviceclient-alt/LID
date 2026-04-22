import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Trash2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Drawer from "../components/ui/Drawer.jsx";
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

function extractContactFields(body) {
  const text = `${body || ""}`;
  const lines = text.split("\n");
  const take = (prefix) => {
    const line = lines.find((l) => `${l}`.trim().toLowerCase().startsWith(prefix.toLowerCase()));
    if (!line) return "";
    return `${line}`.slice(prefix.length).trim();
  };
  const email = take("Email:");
  const firstName = take("Prénom:");
  const lastName = take("Nom:");
  const phone = take("Téléphone:");
  const message = text.replace(/^Nom:.*\n?/m, "")
    .replace(/^Prénom:.*\n?/m, "")
    .replace(/^Email:.*\n?/m, "")
    .replace(/^Téléphone:.*\n?/m, "")
    .trim();
  return { email, firstName, lastName, phone, message };
}

export default function ContactRequests() {
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const messagesEntry = useMessagesResolver(page, pageSize);
  const loading = messagesEntry.loading;
  const items = Array.isArray(messagesEntry.data?.content) ? messagesEntry.data.content : [];
  const totalPages = Number.isFinite(Number(messagesEntry.data?.totalPages)) ? Number(messagesEntry.data.totalPages) : 0;
  const totalElements = Number.isFinite(Number(messagesEntry.data?.totalElements)) ? Number(messagesEntry.data.totalElements) : items.length;

  useEffect(() => {
    setError(messagesEntry.error);
  }, [messagesEntry.error]);

  const contacts = useMemo(() => {
    return items.filter((m) => `${m?.subject || ""}`.startsWith("Contact - "));
  }, [items]);

  const open = async (m) => {
    setError("");
    try {
      const full = await backofficeApi.message(m.id);
      setSelected(full);
      setDrawerOpen(true);
    } catch (e) {
      setError(e?.message || "Impossible d'ouvrir le message.");
    }
  };

  const remove = async (m) => {
    if (!m?.id) return;
    const confirm = window.confirm("Supprimer ce message ?");
    if (!confirm) return;
    setError("");
    try {
      await backofficeApi.deleteMessage(m.id);
      if (selected?.id === m.id) {
        setDrawerOpen(false);
        setSelected(null);
      }
      await reloadMessagesResolver(page, pageSize);
    } catch (e) {
      setError(e?.message || "Suppression impossible.");
    }
  };

  const fields = useMemo(() => extractContactFields(selected?.body), [selected?.body]);

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

      <SectionHeader title="Contacts" subtitle="Demandes reçues depuis le formulaire de contact." />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">{contacts.length} message(s)</div>
          <Button variant="outline" size="sm" onClick={() => messagesEntry.reload().catch(() => {})} disabled={loading}>
            Rafraîchir
          </Button>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Expéditeur</TCell>
              <TCell>Statut</TCell>
              <TCell>Créé</TCell>
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
              </TRow>
            ) : contacts.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground">Aucune demande.</TCell>
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              contacts.map((m) => {
                const { email, firstName, lastName } = extractContactFields(m.body);
                const sender = `${firstName} ${lastName}`.trim() || email || "-";
                return (
                  <TRow
                    key={m.id}
                    className="group hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => open(m)}
                  >
                    <TCell>
                      <div className="font-semibold text-foreground">{sender}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{m.subject}</div>
                    </TCell>
                    <TCell>
                      <Badge label={m.status} variant={statusVariant(m.status)} />
                    </TCell>
                    <TCell className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</TCell>
                    <TCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" type="button" onClick={() => open(m)}>
                          <Eye className="h-4 w-4 text-slate-500 hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" type="button" onClick={() => remove(m)}>
                          <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                        </Button>
                      </div>
                    </TCell>
                  </TRow>
                );
              })
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

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.subject || "Détail"}
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Nom</div>
              <div className="font-semibold text-foreground">{`${fields.firstName} ${fields.lastName}`.trim() || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-semibold text-foreground">{fields.email || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Téléphone</div>
              <div className="font-semibold text-foreground">{fields.phone || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Date</div>
              <div className="font-semibold text-foreground">{formatDateTime(selected?.createdAt)}</div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 whitespace-pre-wrap">
            {fields.message || selected?.body || "-"}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Fermer
            </Button>
            {selected?.id ? (
              <Button variant="destructive" onClick={() => remove(selected)}>
                Supprimer
              </Button>
            ) : null}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
