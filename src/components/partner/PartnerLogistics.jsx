import { useEffect, useState } from "react";
import { Truck, Warehouse, MapPin, Info, Save } from "lucide-react";
import api from "@/services/api";
import { getMyLogistics, updateMyPickupAddress } from "@/services/partnerBackofficeLogisticsService";
import { formatMoney } from "@/utils/orderStatus";

// Regle R4 : LID decide de l'option (A par defaut) et informe le partenaire des frais AVANT la mise en vente.
export const VIA_WAREHOUSE = "VIA_WAREHOUSE";

const MODE_UI = {
  DIRECT_FROM_PARTNER: {
    title: "Option A — enlèvement direct",
    icon: Truck,
    tone: "border-gray-200 bg-gray-50 text-gray-800",
  },
  VIA_WAREHOUSE: {
    title: "Option B — via l'entrepôt LID",
    icon: Warehouse,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
};

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

function FeeLine({ data }) {
  if (!data) return null;
  if (data.effectiveMode !== VIA_WAREHOUSE) {
    return <p className="text-xs">Aucuns frais de collecte : le colis est remis directement au livreur qui livre le client.</p>;
  }
  return (
    <div className="space-y-1 text-xs">
      <p>
        <span className="font-semibold">Frais de collecte estimés : </span>
        {data.collectionFeeEstimate != null ? (
          <span className="font-semibold">{formatMoney(data.collectionFeeEstimate)}</span>
        ) : (
          <span>non disponibles pour l'instant</span>
        )}
        {data.collectionFeeTierCode ? ` (tranche ${data.collectionFeeTierCode})` : ""}
      </p>
      {data.collectionFeeNote ? <p className="opacity-80">{data.collectionFeeNote}</p> : null}
    </div>
  );
}

/**
 * Bandeau du formulaire produit : mode applicable a CE produit et frais correspondants, avec accuse de lecture
 * non bloquant (la mise en vente reste possible, le partenaire est informe).
 */
export function PartnerLogisticsNotice({ articleId, weightGrams }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    let active = true;
    const grams = Number(weightGrams) > 0 ? Math.round(Number(weightGrams)) : undefined;
    const timer = setTimeout(() => {
      getMyLogistics({ articleId: articleId || undefined, weightGrams: grams })
        .then((res) => active && (setData(res), setError("")))
        .catch((err) => active && setError(errorMessage(err, "Mode de livraison indisponible.")));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [articleId, weightGrams]);

  if (error) {
    return <p className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">{error}</p>;
  }
  if (!data) return null;
  const ui = MODE_UI[data.effectiveMode] || MODE_UI.DIRECT_FROM_PARTNER;
  const Icon = ui.icon;
  return (
    <div className={`rounded-xl border p-4 text-sm ${ui.tone}`} role="note">
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          <p className="font-semibold">
            Livraison de ce produit : {ui.title}
            {data.productOverride ? " (décidé par LID pour ce produit)" : ""}
          </p>
          <p className="text-xs">
            {data.effectiveMode === VIA_WAREHOUSE
              ? "Le livreur LID collecte ce produit à votre adresse de retrait et le dépose à l'entrepôt LID ; un second trajet livre le client."
              : "Le livreur LID récupère ce produit à votre adresse de retrait et le livre directement au client."}
          </p>
          <FeeLine data={data} />
          {!data.pickupComplete ? (
            <p className="text-xs font-medium">Votre adresse de retrait est incomplète : complétez-la dans Paramètres › Livraison.</p>
          ) : null}
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
            J'ai pris connaissance du mode de livraison et des frais associés.
          </label>
        </div>
      </div>
    </div>
  );
}

/** Parametres partenaire : son mode, ce que cela signifie, son adresse de retrait et la grille des frais de collecte. */
export function PartnerLogisticsPanel() {
  const [data, setData] = useState(null);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ address: "", zoneCode: "", latitude: "", longitude: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apply = (res) => {
    setData(res);
    setForm({
      address: res?.pickup?.address || "",
      zoneCode: res?.pickup?.zoneCode || "",
      latitude: res?.pickup?.latitude ?? "",
      longitude: res?.pickup?.longitude ?? "",
    });
  };

  useEffect(() => {
    getMyLogistics()
      .then(apply)
      .catch((err) => setError(errorMessage(err, "Mode de livraison indisponible.")));
    api
      .get("/api/v1/public/shipping/zones")
      .then((res) => setZones(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setZones([]));
  }, []);

  const useMyPosition = () => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })),
      () => setError("Position indisponible : saisissez la latitude et la longitude.")
    );
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
      const res = await updateMyPickupAddress({
        address: form.address,
        zoneCode: form.zoneCode || null,
        latitude: toNum(form.latitude),
        longitude: toNum(form.longitude),
      });
      apply(res);
      setSuccess("Adresse de retrait enregistrée.");
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    } finally {
      setSaving(false);
    }
  };

  const ui = MODE_UI[data?.mode] || MODE_UI.DIRECT_FROM_PARTNER;
  const Icon = ui.icon;

  return (
    <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <Truck className="text-gray-400" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Livraison</h2>
      </div>

      {data ? (
        <div className={`rounded-xl border p-4 ${ui.tone}`}>
          <div className="flex items-start gap-3">
            <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Votre mode de livraison : {ui.title}</p>
              <p className="text-xs">{data.explanation}</p>
              <p className="text-xs opacity-80">
                LID détermine l'option applicable (par défaut A) selon les produits, les exigences de contrôle et
                l'organisation logistique, et vous informe des frais avant la mise en vente.
                {data.productsViaWarehouseCount > 0
                  ? ` ${data.productsViaWarehouseCount} de vos produits passent par l'entrepôt LID (décision LID).`
                  : ""}
              </p>
              {data.mode === VIA_WAREHOUSE && data.warehouseAddress ? (
                <p className="text-xs">Entrepôt LID : {data.warehouseAddress}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {data && (data.mode === VIA_WAREHOUSE || data.productsViaWarehouseCount > 0) ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Info size={16} /> Frais de collecte (vers l'entrepôt LID)
          </div>
          {Array.isArray(data.collectionFees) && data.collectionFees.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-1">Poids du colis</th>
                  <th className="py-1 text-right">Frais estimés</th>
                </tr>
              </thead>
              <tbody>
                {data.collectionFees.map((row) => (
                  <tr key={row.tierCode} className="border-t border-gray-100">
                    <td className="py-1">{row.label || row.tierCode}</td>
                    <td className="py-1 text-right font-medium">{formatMoney(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <p className="text-xs text-gray-500">{data.collectionFeeNote}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MapPin size={16} /> Adresse de retrait
        </div>
        <p className="text-xs text-gray-500">
          Lieu où le livreur LID récupère vos colis. Les coordonnées servent au calcul de la distance (et des frais de collecte en option B).
        </p>
        <div className="space-y-2">
          <label htmlFor="pickup-address" className="text-sm font-medium text-gray-700">Adresse</label>
          <input
            id="pickup-address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm"
            placeholder="Ex : Cocody Riviera 2, rue des Jardins, immeuble B"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="pickup-zone" className="text-sm font-medium text-gray-700">Zone</label>
            <select
              id="pickup-zone"
              value={form.zoneCode}
              onChange={(e) => setForm((f) => ({ ...f, zoneCode: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm"
            >
              <option value="">Choisir une zone…</option>
              {zones.map((z) => (
                <option key={z.code} value={z.code}>{z.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="pickup-lat" className="text-sm font-medium text-gray-700">Latitude</label>
            <input
              id="pickup-lat"
              inputMode="decimal"
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pickup-lng" className="text-sm font-medium text-gray-700">Longitude</label>
            <input
              id="pickup-lng"
              inputMode="decimal"
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={useMyPosition} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
            Utiliser ma position actuelle
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !form.address.trim()}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Enregistrement…" : "Valider l'adresse de retrait"}
          </button>
        </div>
        {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
        {success ? <p className="text-xs text-green-700">{success}</p> : null}
      </div>
    </div>
  );
}
