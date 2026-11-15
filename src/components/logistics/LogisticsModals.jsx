import { useState } from "react";
import { Truck } from "lucide-react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import { backofficeApi } from "../../services/api.js";
import { useLogistics } from "../../pages/logistics/LogisticsContext.jsx";
import { STATUS_OPTIONS, buildQrUrl } from "../../pages/logistics/logisticsUtils.js";

/** QR code de remise (ouvert depuis la liste ou le panneau du colis). */
export function QrCodeModal() {
  const { qrModal, closeQrModal } = useLogistics();
  const [copyState, setCopyState] = useState("");
  const value = qrModal.value;

  const close = () => {
    setCopyState("");
    closeQrModal();
  };

  async function copyToClipboard(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("Copié");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        setCopyState("Copié");
      } catch {
        setCopyState("Impossible");
      }
    }
  }

  return (
    <Modal
      isOpen={qrModal.open}
      onClose={close}
      title={qrModal.title ? `QR - ${qrModal.title}` : "QR"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Fermer
          </Button>
          <Button onClick={() => copyToClipboard(value)} disabled={!value}>
            {copyState ? copyState : "Copier le code"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          {value ? (
            <img src={buildQrUrl(value, 260)} alt="QR" className="h-64 w-64 rounded-xl border border-border bg-white" referrerPolicy="no-referrer" />
          ) : null}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Saisie manuelle</p>
          <Input value={value} readOnly />
        </div>
      </div>
    </Modal>
  );
}

/** Liste des transporteurs (stockée localement sur ce navigateur). */
export function CarriersModal({ isOpen, onClose }) {
  const { carriers, persistCarriers } = useLogistics();
  const [newCarrier, setNewCarrier] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transporteurs"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            onClick={() => {
              persistCarriers(carriers);
              onClose();
            }}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Liste des transporteurs</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Cette liste est utilisée dans les filtres et lors de la création d’une expédition (stockée localement sur ce navigateur).
          </p>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Ajouter un transporteur..." value={newCarrier} onChange={(e) => setNewCarrier(e.target.value)} />
          <Button
            variant="outline"
            onClick={() => {
              const name = newCarrier.trim();
              if (!name) return;
              persistCarriers([...carriers, name]);
              setNewCarrier("");
            }}
          >
            Ajouter
          </Button>
        </div>

        <div className="grid gap-2">
          {carriers.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun transporteur.</div>
          ) : (
            carriers.map((c) => (
              <div key={c} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="text-sm font-medium">{c}</div>
                <Button variant="destructive" size="sm" onClick={() => persistCarriers(carriers.filter((x) => x !== c))}>
                  Supprimer
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

const emptyShipmentForm = (carrier) => ({ orderId: "", carrier: carrier || "", trackingId: "", status: "EN_PREPARATION", eta: "", cost: "" });

/** Création manuelle d'une expédition (même appel API qu'avant : upsertShipment). */
export function NewShipmentModal({ isOpen, onClose }) {
  const { carriers, carrier, refresh } = useLogistics();
  const [form, setForm] = useState(() => emptyShipmentForm(carrier));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [wasOpen, setWasOpen] = useState(false);

  // Formulaire réinitialisé à chaque ouverture (transporteur pré-rempli avec le filtre courant)
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setForm(emptyShipmentForm(carrier));
    setError("");
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  function close() {
    if (saving) return;
    onClose();
    setError("");
  }

  async function save() {
    if (!form.orderId.trim()) {
      setError("ID de commande requis.");
      return;
    }
    const payload = {
      orderId: form.orderId.trim(),
      carrier: form.carrier || null,
      trackingId: form.trackingId || null,
      status: form.status,
      eta: form.eta ? form.eta : null,
      cost: form.cost !== "" ? Number(form.cost) : null
    };
    if (payload.cost !== null && (!Number.isFinite(payload.cost) || payload.cost < 0)) {
      setError("Coût invalide.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await backofficeApi.upsertShipment(payload);
      refresh();
      onClose();
    } catch (err) {
      setError(err?.message || "Impossible d’enregistrer l’expédition.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Nouvelle expédition"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium">Commande</p>
          <Input placeholder="ID de commande (ex: cmd-xxx ou UUID)" value={form.orderId} onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))} />
          <p className="text-xs text-muted-foreground">Astuce: copie l’ID depuis la page Commandes.</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Transporteur</p>
          <Select value={form.carrier} onChange={(e) => setForm((p) => ({ ...p, carrier: e.target.value }))}>
            <option value="">Sélectionner…</option>
            {carriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Statut</p>
          <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Tracking ID</p>
          <Input value={form.trackingId} onChange={(e) => setForm((p) => ({ ...p, trackingId: e.target.value }))} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">ETA</p>
          <Input type="datetime-local" value={form.eta} onChange={(e) => setForm((p) => ({ ...p, eta: e.target.value }))} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium">Coût</p>
          <Input type="number" min={0} placeholder="Ex: 2500" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200 md:col-span-2">
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
