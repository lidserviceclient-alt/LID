const ACCESS_TOKEN_KEY = 'lid_access_token';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
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
