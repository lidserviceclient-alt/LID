// Le jeton d'acces ne vit qu'en memoire : une faille XSS ne peut plus le lire dans le stockage du navigateur.
// Au chargement, la session est restauree par /auth/refresh (cookie HttpOnly). Seul un indicateur non secret
// (session ouverte oui/non) est conserve pour savoir s'il faut tenter cette restauration.
const LEGACY_ACCESS_TOKEN_KEY = 'lid_access_token';
export const SESSION_HINT_KEY = 'lid_session';
export const AUTH_TOKEN_CHANGED_EVENT = 'lid:auth-token-changed';

let accessTokenInMemory = null;

const writeSessionHint = (active) => {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, '1');
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // stockage indisponible : la session reste valable pour cet onglet
  }
};

// Nettoyage des anciens jetons laisses dans le stockage par les versions precedentes
try { localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY); } catch { /* sans incidence */ }

export const hasSessionHint = () => {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
};

export const getAccessToken = () => accessTokenInMemory;

/** Un seul rafraichissement a la fois entre les onglets : le refresh token est a usage unique (rotation). */
export const runExclusiveRefresh = (task) => {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('lid-auth-refresh', task);
  }
  return task();
};

const notifyAccessTokenChanged = (token) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT, { detail: { token: token || null } }));
};

export const setAccessToken = (token) => {
  if (token) {
    accessTokenInMemory = token;
    writeSessionHint(true);
    notifyAccessTokenChanged(token);
  }
};

export const clearAccessToken = () => {
  accessTokenInMemory = null;
  writeSessionHint(false);
  notifyAccessTokenChanged(null);
};

const decodeBase64Url = (value) => {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  try {
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const getAccessTokenPayload = () => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  return decodeBase64Url(parts[1]);
};

export const isTokenExpired = (token, skewSeconds = 30) => {
  if (!token) return true;
  const parts = token.split('.');
  const payload = parts.length === 3 ? decodeBase64Url(parts[1]) : null;
  const exp = payload?.exp;
  if (exp === null || exp === undefined) return false;
  const expSeconds = Number(exp);
  if (!Number.isFinite(expSeconds)) return false;
  const nowSeconds = Date.now() / 1000;
  return nowSeconds >= expSeconds - Math.max(0, Number(skewSeconds) || 0);
};

export const hasValidAccessToken = () => {
  const token = getAccessToken();
  if (!token) return false;
  const payload = getAccessTokenPayload();
  if (!payload?.sub) return false;
  return !isTokenExpired(token);
};
