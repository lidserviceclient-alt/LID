import { useEffect, useSyncExternalStore } from "react";
import { backofficeApi } from "../services/api.js";

/**
 * Compteurs de la boîte de réception Contact ({ unread, read, processed, archived, total }), partagés entre le badge
 * de la barre latérale et les onglets de la page. Une seule requête en vol, actualisation toutes les 60 s tant qu'un
 * composant l'utilise, et pas de nouvelle tentative automatique en cas d'erreur (évite de marteler l'API).
 */
const POLL_MS = 60_000;
let state = { data: null, loading: false, error: "" };
let inflight = null;
let subscribers = 0;
let timer = null;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l());
const setState = (next) => {
  state = { ...state, ...next };
  emit();
};

export function reloadContactSummary() {
  if (inflight) return inflight;
  setState({ loading: true });
  inflight = backofficeApi
    .contactSummary()
    .then((data) => setState({ data, loading: false, error: "" }))
    .catch((e) => setState({ loading: false, error: e?.message || "Compteurs indisponibles." }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useContactSummary() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    subscribers += 1;
    if (!state.data && !inflight && !state.error) reloadContactSummary();
    if (subscribers === 1) timer = window.setInterval(() => reloadContactSummary(), POLL_MS);
    return () => {
      subscribers -= 1;
      if (subscribers === 0 && timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
  }, []);
  return { ...snapshot, reload: reloadContactSummary };
}
