import { useSyncExternalStore } from "react";

// État global « le serveur répond-il ? », alimenté par chaque appel réseau.
// unreachable passe à true sur échec réseau ou 502/503/504, et repasse à false
// dès qu'une réponse valide arrive. dismissed masque la bulle jusqu'au retour du serveur.
let state = { unreachable: false, dismissed: false };
const listeners = new Set();

function setState(next) {
  if (next.unreachable === state.unreachable && next.dismissed === state.dismissed) return;
  state = next;
  listeners.forEach((listener) => listener());
}

const GATEWAY_STATUSES = new Set([502, 503, 504]);

export function reportUnreachable() {
  setState({ unreachable: true, dismissed: state.unreachable ? state.dismissed : false });
}

export function reportReachable() {
  setState({ unreachable: false, dismissed: false });
}

export function dismissApiStatus() {
  setState({ ...state, dismissed: true });
}

// fetch qui signale l'état du serveur. Les erreurs métier (4xx, 500) comptent comme « serveur joignable ».
export async function trackedFetch(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (error) {
    if (error?.name !== "AbortError") reportUnreachable();
    throw error;
  }
  if (GATEWAY_STATUSES.has(res.status)) reportUnreachable();
  else reportReachable();
  return res;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useApiStatus() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
