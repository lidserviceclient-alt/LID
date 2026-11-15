import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { backofficeApi } from "../../services/api.js";

const money = (v) => (v === null || v === undefined || v === "" ? "—" : `${Number(v).toLocaleString("fr-FR")} FCFA`);

/**
 * Fiche colis (page Livraison) : zone de livraison du client, livraison facturée au client pour ce colis (grille par zone)
 * et saisie du coût réel payé au livreur pour ce trajet (alimente le rapport « facturé vs coût réel »).
 */
export default function ShipmentShippingCost({ shipmentId, cost, onSaved }) {
  const [detail, setDetail] = useState(null);
  const [value, setValue] = useState(cost ?? "");
  const [state, setState] = useState({ busy: false, error: "", saved: "" });

  useEffect(() => {
    setValue(cost ?? "");
  }, [cost, shipmentId]);
  useEffect(() => {
    let active = true;
    if (!shipmentId) return undefined;
    backofficeApi
      .shipment(shipmentId)
      .then((d) => active && setDetail(d || null))
      .catch(() => active && setDetail(null));
    return () => {
      active = false;
    };
  }, [shipmentId]);

  async function save() {
    const raw = `${value ?? ""}`.trim();
    const amount = raw === "" ? null : Number(raw.replace(/\s/g, "").replace(",", "."));
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      setState({ busy: false, error: "Montant invalide.", saved: "" });
      return;
    }
    try {
      setState({ busy: true, error: "", saved: "" });
      const res = await backofficeApi.shippingPricingSaveShipmentCost(shipmentId, amount);
      setState({ busy: false, error: "", saved: res?.cost == null ? "Coût réel effacé." : `Coût réel enregistré : ${money(res.cost)}.` });
      onSaved?.(res?.cost ?? null);
    } catch (err) {
      setState({ busy: false, error: err?.message || "Enregistrement impossible.", saved: "" });
    }
  }

  const billed = detail?.billedShippingAmount;
  const real = `${value}`.trim() === "" ? null : Number(value);
  return (
    <div className="space-y-2 rounded-md border border-border p-3 text-sm">
      <p className="font-semibold">Livraison facturée et coût réel</p>
      <dl className="grid grid-cols-3 gap-y-1">
        <dt className="text-muted-foreground">Zone du client</dt>
        <dd className="col-span-2">{detail?.shippingZoneName || "—"}</dd>
        <dt className="text-muted-foreground">Facturé au client</dt>
        <dd className="col-span-2">{money(billed)} <span className="text-xs text-muted-foreground">(avant livraison offerte)</span></dd>
        {billed != null && real != null && Number.isFinite(real) ? (
          <>
            <dt className="text-muted-foreground">Écart</dt>
            <dd className={`col-span-2 ${Number(billed) - real < 0 ? "text-rose-700" : ""}`}>{money(Number(billed) - real)}</dd>
          </>
        ) : null}
      </dl>
      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-muted-foreground">Coût réel payé au livreur pour ce trajet (FCFA)</span>
          <Input inputMode="decimal" value={value} placeholder="Non saisi" onChange={(e) => setValue(e.target.value)} />
        </label>
        <Button size="sm" variant="outline" onClick={save} disabled={state.busy}>
          {state.busy ? "…" : "Enregistrer"}
        </Button>
      </div>
      {state.error ? <p className="text-xs text-rose-700">{state.error}</p> : null}
      {state.saved ? <p className="text-xs text-emerald-700">{state.saved}</p> : null}
    </div>
  );
}
