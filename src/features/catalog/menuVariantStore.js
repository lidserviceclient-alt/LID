const STORAGE_KEY = "lid_menu_variant";

export const MENU_VARIANTS = ["list-grid", "columns", "tabs", "grouped"];
export const DEFAULT_MENU_VARIANT = "list-grid";

function readInitial() {
  if (typeof window === "undefined") return DEFAULT_MENU_VARIANT;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return MENU_VARIANTS.includes(stored) ? stored : DEFAULT_MENU_VARIANT;
}

let currentVariant = readInitial();
const listeners = new Set();

export function getMenuVariant() {
  return currentVariant;
}

export function setMenuVariant(variant) {
  if (!MENU_VARIANTS.includes(variant) || variant === currentVariant) return;
  currentVariant = variant;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, variant);
  }
  listeners.forEach((listener) => listener(currentVariant));
}

export function subscribeMenuVariant(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
