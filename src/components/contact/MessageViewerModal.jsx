import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { backofficeApi } from "../../services/api.js";
import { formatDateTime, senderLabel } from "../../pages/contact/contactUtils.js";
import { DeliveryBadge, DirectionBadge, HandlingBadge } from "./StatusBadges.jsx";
import MessageBody from "./MessageBody.jsx";

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words text-foreground">{children || "-"}</dd>
    </div>
  );
}

/** Lecture seule du message intégral (historique) : métadonnées, statut d'envoi, erreur éventuelle, contenu complet. */
export default function MessageViewerModal({ id, onClose }) {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return undefined;
    let alive = true;
    setMessage(null);
    setError("");
    backofficeApi
      .message(id)
      .then((m) => alive && setMessage(m))
      .catch((e) => alive && setError(e?.message || "Impossible d'ouvrir le message."));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [id, onClose]);

  const inbound = message?.direction === "INBOUND";

  return (
    <Modal
      isOpen={Boolean(id)}
      onClose={onClose}
      size="lg"
      title={message?.subject || "Message"}
      footer={
        <>
          {inbound ? (
            <Link to={`/contact/inbox/${message.id}`} onClick={onClose}>
              <Button variant="outline">Ouvrir dans la boîte de réception</Button>
            </Link>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </>
      }
    >
      <div role="dialog" aria-modal="true" aria-label="Contenu du message" className="space-y-4">
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : !message ? (
          <p role="status" className="text-sm text-muted-foreground">
            Chargement du message…
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <DirectionBadge direction={message.direction} />
              {inbound ? <HandlingBadge status={message.handlingStatus} /> : null}
              <DeliveryBadge status={message.status} />
            </div>
            <dl className="space-y-1.5">
              {inbound ? <Row label="Expéditeur">{`${senderLabel(message)}${message.senderEmail && message.senderName ? ` <${message.senderEmail}>` : ""}`}</Row> : null}
              {inbound && message.senderPhone ? <Row label="Téléphone">{message.senderPhone}</Row> : null}
              <Row label={inbound ? "Notifié à" : "Destinataires"}>{(message.recipients || []).join(", ")}</Row>
              <Row label="Créé le">{formatDateTime(message.createdAt)}</Row>
              <Row label="Envoyé le">{formatDateTime(message.sentAt)}</Row>
              <Row label="Tentatives">{`${message.attemptCount ?? 0}`}</Row>
              {message.lastError ? <Row label="Dernière erreur">{message.lastError}</Row> : null}
              {message.createdBy ? <Row label="Auteur">{message.createdBy}</Row> : null}
            </dl>
            <MessageBody text={message.messageText || message.body} />
          </>
        )}
      </div>
    </Modal>
  );
}
