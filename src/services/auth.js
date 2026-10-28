import { trackedFetch } from "./apiStatus.js";
// Le jeton d'acces ne vit qu'en memoire (une XSS ne peut plus le lire) ; la session est restauree au demarrage
// par /auth/refresh grace au cookie HttpOnly. Seul un indicateur non secret est conserve.
export const AUTH_TOKEN_KEY = "lid-backoffice-access-token"; // ancienne cle : purgee au chargement
export const SESSION_HINT_KEY = "lid-backoffice-session";

let accessTokenInMemory = "";

try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch { /* sans incidence */ }

function writeSessionHint(active) {
  try {
    if (active) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // stockage indisponible : la session reste valable pour cet onglet
  }
}

export function hasSessionHint() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Un seul rafraichissement a la fois entre les onglets : le refresh token est a usage unique. */
export function runExclusiveRefresh(task) {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request("lid-backoffice-auth-refresh", task);
  }
  return task();
}

export async function bootstrapSession() {
  if (accessTokenInMemory || !hasSessionHint()) return;
  const baseUrl = import.meta.env.VITE_BACKOFFICE_API_URL || "http://localhost:9000";
  try {
    const data = await runExclusiveRefresh(async () => {
      const res = await trackedFetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) {
        const error = new Error(`Refresh failed: ${res.status}`);
        error.status = res.status;
        throw error;
      }
      return res.json().catch(() => null);
    });
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      clearAccessToken();
    }
  }
}

function base64UrlDecodeToString(input) {
  const base64 = `${input}`.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof globalThis === "undefined") return "";

  const atobFn = globalThis.atob;
  if (typeof atobFn === "function") {
    const binary = atobFn(padded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(bytes);
    }
    // Best-effort fallback (ASCII-safe)
    // eslint-disable-next-line no-undef
    return decodeURIComponent(escape(binary));
  }

  return "";
}

export function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = `${token}`.split(".");
  if (parts.length < 2) return null;

  try {
    const json = base64UrlDecodeToString(parts[1]);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return accessTokenInMemory;
}

export function isTokenExpired(token, skewSeconds = 30) {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (exp === null || exp === undefined) return false;

  const expSeconds = Number(exp);
  if (!Number.isFinite(expSeconds)) return false;

  const nowSeconds = Date.now() / 1000;
  return nowSeconds >= expSeconds - Math.max(0, Number(skewSeconds) || 0);
}

export function isAuthenticated() {
  const token = getAccessToken();
  return Boolean(token);
}

export function setAccessToken(token) {
  if (!token) return;
  accessTokenInMemory = token;
  writeSessionHint(true);
}

export function clearAccessToken() {
  accessTokenInMemory = "";
  writeSessionHint(false);
}

export function getAuthenticatedUser() {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : [];
  const email = payload.email ? String(payload.email) : "";
  const firstName = payload.firstName ? String(payload.firstName) : "";
  const lastName = payload.lastName ? String(payload.lastName) : "";
  const avatarUrl = payload.avatarUrl ? String(payload.avatarUrl) : "";
  const userId = payload.sub ? String(payload.sub) : "";

  return { userId, email, firstName, lastName, avatarUrl, roles };
}
