export const AUTH_TOKEN_KEY = "lid-backoffice-access-token";

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
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
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
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
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
