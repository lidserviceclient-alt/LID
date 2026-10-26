import { useEffect, useRef } from "react";
import { useSettingsResolver } from "../../../resolvers/settingsResolver.js";

/**
 * Alimente l'état local d'une section à partir de la collection `settingsCollection`
 * (chargée une seule fois et mise en cache par le resolver).
 *
 * - `key` : partie de la collection (`shopProfile`, `socialLinks`, …)
 * - `apply(value)` : appliquée quand la partie change (chargement initial ou patch du cache)
 * - `setLoading` / `setError` : setters de la section
 *
 * L'effet ne dépend que de la partie concernée : un patch d'une autre section
 * n'écrase donc pas une saisie en cours.
 */
export function useSettingsSeed(key, { apply, setLoading, setError }) {
  const entry = useSettingsResolver();
  const active = entry.loaded || entry.loading || Boolean(entry.data);
  const hasData = Boolean(entry.data);
  const value = entry.data ? entry.data[key] : undefined;

  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    if (!active) return;
    setLoading(entry.loading);
    if (entry.error) {
      setError(entry.error);
      return;
    }
    if (hasData) {
      applyRef.current(value);
    }
  }, [active, entry.loading, entry.error, hasData, value, setLoading, setError]);
}
