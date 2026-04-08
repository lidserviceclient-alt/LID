export const CUSTOMER_SESSION_CLEARED_EVENT = "lid:customer-session-cleared";

const LOCAL_STORAGE_KEYS = [
  "cart",
  "wishlist",
];

const SESSION_STORAGE_PREFIXES = [
  "lid_payment_verify_result_",
  "lid_payment_checkout_consumed_",
  "lid_payment_checkout_items_",
];

const removeSessionStorageByPrefix = (prefix) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  const keys = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  keys.forEach((key) => window.sessionStorage.removeItem(key));
};

export const clearCustomerSessionCache = () => {
  if (typeof window === "undefined") return;

  try {
    LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    SESSION_STORAGE_PREFIXES.forEach(removeSessionStorageByPrefix);
    window.dispatchEvent(new CustomEvent(CUSTOMER_SESSION_CLEARED_EVENT));
  } catch {
    // Cache cleanup must never block logout.
  }
};
