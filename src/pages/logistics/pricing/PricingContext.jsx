import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SettingsStatus from "../../settings/components/SettingsStatus.jsx";
import { backofficeApi } from "../../../services/api.js";

const PricingContext = createContext(null);

/**
 * Charge une seule fois la vue d'ensemble de la tarification (stratégie, zones, tranches, grille, réglages) et la
 * partage entre toutes les sous-sections de /logistics/pricing/*. `reload` recharge après chaque enregistrement ;
 * `notify` / `onError` alimentent le bandeau de statut affiché en haut de chaque section.
 */
export function PricingProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { pathname } = useLocation();

  // Le bandeau d'état ne suit pas l'utilisateur d'une sous-section à l'autre.
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [pathname]);

  const reload = useCallback(async () => {
    try {
      setData(await backofficeApi.shippingPricing());
    } catch (err) {
      setError(err?.message || "Impossible de charger le calcul de livraison.");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const notify = useCallback((msg) => {
    setSuccess(msg);
    setError("");
  }, []);
  const onError = useCallback((msg) => {
    setError(msg);
    setSuccess("");
  }, []);

  const value = useMemo(() => ({ data, reload, notify, onError, error, success }), [data, reload, notify, onError, error, success]);
  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing doit être utilisé dans <PricingProvider>.");
  return ctx;
}

/**
 * Enveloppe d'une section : bandeau d'état (erreur / succès) puis le contenu, une fois les données chargées.
 * `children` reçoit `{ data, reload, notify, onError }`.
 */
export function PricingSection({ children }) {
  const ctx = usePricing();
  if (!ctx.data) {
    return ctx.error ? (
      <SettingsStatus error={ctx.error} />
    ) : (
      <p className="text-sm text-muted-foreground">Chargement du calcul de livraison…</p>
    );
  }
  return (
    <div className="space-y-6">
      {ctx.error || ctx.success ? <SettingsStatus error={ctx.error} success={ctx.success} /> : null}
      {children(ctx)}
    </div>
  );
}
