import axios from 'axios';
import { clearAccessToken, getAccessToken, hasSessionHint, isTokenExpired, runExclusiveRefresh, setAccessToken } from './auth';
import { clearCustomerSessionCache } from './sessionCleanup';
import { getApiBaseUrl } from '../config/apiConfig';

const resolvedBaseUrl = getApiBaseUrl();

if (!resolvedBaseUrl) {
  throw new Error('VITE_API_URL is not set');
}

// ─── Guards d'environnement ──────────────────────────────────────────────────
const isBrowser = typeof window !== 'undefined';
const isDebug   = isBrowser && (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true');

// #region debug-point A : resolved-api-base
// ⚠️  Uniquement en dev — aucune donnée sensible n'est envoyée en production.
if (isDebug && !window.__lidDebugApiBaseReported) {
  window.__lidDebugApiBaseReported = true;

  // On ne transmet que des métadonnées non-sensibles (pas de token, pas de cookie).
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId:   'staging-api-mismatch',
      runId:       'pre-fix',
      hypothesisId:'A',
      location:    'src/services/api.js',
      msg:         '[DEBUG] resolved API base at module init',
      data: {
        href:          location.href,
        host:          location.host,
        mode:          import.meta.env.MODE,
        baseUrl:       resolvedBaseUrl,
        viteApiUrl:    import.meta.env.VITE_API_URL,
        isDev:         import.meta.env.DEV,
        isProd:        import.meta.env.PROD,
        hasController: !!navigator.serviceWorker?.controller,
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

if (isDebug) {
  console.info('[API] baseURL:', resolvedBaseUrl);
}

// ─── Instances Axios ─────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:         resolvedBaseUrl,
  headers:         { 'Content-Type': 'application/json; charset=utf-8' },
  withCredentials: true,
  timeout:         10_000,
});

// Client dédié au refresh n'intercepte pas les 401 pour éviter les boucles infinies.
const refreshClient = axios.create({
  baseURL:         resolvedBaseUrl,
  headers:         { 'Content-Type': 'application/json; charset=utf-8' },
  withCredentials: true,
  timeout:         10_000,
});

//  Helpers 

let refreshAccessTokenPromise = null;

/**
 * Détermine si la requête est publique (pas de jeton d'accès requis).
 * On valide `url` pour ne pas autoriser des chemins malformés.
 */
function isPublicRequest(url = '', method = 'get') {
  // Guard : url doit être une chaîne courte, sans caractères suspects.
  if (typeof url !== 'string' || url.length > 2048) return false;

  const safeMethod    = String(method).toLowerCase();
  const isReadRequest = ['get', 'head', 'options'].includes(safeMethod);

  // Les routes de suivi de commandes restent protégées même sous /public/.
  if (url.includes('/api/v1/public/orders/tracking/')) return false;

  return (
    url.includes('/api/v1/public/')                         ||
    (isReadRequest && url.includes('/api/v1/catalog/'))     ||
    url.includes('/api/v1/realtime/ws-access/public')
  );
}

/**
 * Extrait l'en-tête Authorization de façon sûre
 * (axios normalise les headers selon la version, on gère les deux).
 */
function getExistingAuthHeader(headers) {
  if (!headers) return null;
  if (typeof headers.get === 'function') {
    return headers.get('Authorization') || headers.get('authorization') || null;
  }
  return headers['Authorization'] || headers['authorization'] || null;
}

const REFRESH_MAX_ATTEMPTS = 3;
const REFRESH_MAX_TOTAL_WAIT_MS = 5_000;
const REFRESH_BASE_BACKOFF_MS = 500;

/** Refus définitif du refresh token (cookie expiré/révoqué) : seul cas où la session est vidée. */
export function isDefinitiveRefreshFailure(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/** Erreur transitoire : 429, 5xx ou absence de réponse (réseau/timeout). */
function isTransientRefreshFailure(error) {
  const status = error?.response?.status;
  if (!error?.response) return error?.isAxiosError === true;
  return status === 429 || status >= 500;
}

function parseRetryAfterMs(error) {
  const raw = error?.response?.headers?.['retry-after'];
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(raw);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Appelle /auth/refresh avec réessais bornés (3 tentatives, ~5 s cumulées max)
 * sur 429 / 5xx / erreur réseau, en respectant Retry-After.
 */
async function postRefreshWithRetry() {
  let waited = 0;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await runExclusiveRefresh(() => refreshClient.post('/api/v1/auth/refresh'));
    } catch (error) {
      if (!isTransientRefreshFailure(error) || attempt >= REFRESH_MAX_ATTEMPTS) throw error;
      const delay = parseRetryAfterMs(error) ?? REFRESH_BASE_BACKOFF_MS * 2 ** (attempt - 1);
      if (waited + delay > REFRESH_MAX_TOTAL_WAIT_MS) throw error;
      waited += delay;
      await sleep(delay);
    }
  }
}

/**
 * Rafraîchit l'access token via le refresh token (cookie HttpOnly).
 * La promesse est partagée pour éviter les appels parallèles.
 */
export async function refreshAccessToken() {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = postRefreshWithRetry()
      .then(({ data }) => {
        const accessToken = data?.accessToken;
        if (typeof accessToken !== 'string' || !accessToken) {
          throw new Error('Refresh token response missing accessToken');
        }
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }
  return refreshAccessTokenPromise;
}

/**
 * Restaure la session au demarrage a partir du cookie de rafraichissement (le jeton n'est plus stocke).
 * Sans indice de session (visiteur anonyme), aucun appel n'est emis.
 * Retourne 'none' | 'restored' | 'denied' | 'transient'.
 */
export async function bootstrapSession() {
  if (getAccessToken()) return 'restored';
  if (!hasSessionHint()) return 'none';
  try {
    await refreshAccessToken();
    return 'restored';
  } catch (error) {
    if (isDefinitiveRefreshFailure(error)) {
      clearAccessToken();
      return 'denied';
    }
    // Erreur transitoire : l'indice de session est conserve, la restauration sera retentee.
    return 'transient';
  }
}

/**
 * Redirige vers /login de façon sûre (open-redirect mitigation).
 * On force l'origin courant pour éviter toute injection d'URL externe.
 */
function redirectToLogin() {
  if (!isBrowser) return;
  const currentPath = window.location?.pathname || '';
  if (currentPath === '/login') return;
  // On construit l'URL avec l'origin courante — jamais avec une valeur externe.
  window.location.href = `${window.location.origin}/login`;
}

// ─── Intercepteur de requête ──────────────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    const storedToken = getAccessToken();
    const isTokenValid = storedToken && !isTokenExpired(storedToken);
    let accessToken = isTokenValid ? storedToken : null;

    const url         = String(config.url || '');
    const isAuthLogin = url.includes('/api/v1/auth/login');
    const isRefresh   = url.includes('/api/v1/auth/refresh');
    const isPublic    = isPublicRequest(url, config.method);
    const clientId    = import.meta.env.VITE_CLIENT_ID;
    const existingAuth = getExistingAuthHeader(config.headers);

    // Refresh proactif si le token est expiré et qu'on en a besoin.
    if (!isAuthLogin && !isRefresh && !isPublic && storedToken && !accessToken && !existingAuth) {
      try {
        accessToken = await refreshAccessToken();
      } catch (refreshError) {
        if (isDebug) console.info('[AUTH] proactive refresh failed');
        // Session vidée uniquement sur refus définitif (401/403), jamais sur 429/5xx/réseau.
        if (isDefinitiveRefreshFailure(refreshError)) {
          clearCustomerSessionCache();
          clearAccessToken();
        }
      }
    }

    if (clientId && !config.headers?.['X-Client-ID']) {
      config.headers['X-Client-ID'] = clientId;
    }

    if (!isAuthLogin && !isPublic && accessToken && !existingAuth) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // #region debug-point C : axios-request (dev uniquement)
    if (isDebug) {
      const method  = (config.method || 'get').toUpperCase();
      const fullUrl = `${config.baseURL || ''}${url}`;
      console.info('[API] request:', method, fullUrl);

      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId:    'staging-api-mismatch',
          runId:        'pre-fix',
          hypothesisId: 'C',
          location:     'src/services/api.js',
          msg:          '[DEBUG] axios request prepared',
          data: {
            href:          window.location.href,
            method,
            baseURL:       config.baseURL || '',
            url,
            fullUrl,
            hasController: Boolean(navigator.serviceWorker?.controller),
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur de réponse ──────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status  = error.response.status;
      // On n'expose pas le message serveur brut en production.
      const message = isDebug
        ? (error.response.data?.errorMessage || error.response.data?.message || error.message)
        : 'Une erreur est survenue.';

      const originalRequest  = error.config || {};
      const url              = String(originalRequest.url || '');
      const skipAuthRefresh  = originalRequest.skipAuthRefresh === true;
      const isAuthLogin      = url.includes('/api/v1/auth/login');
      const isRefresh        = url.includes('/api/v1/auth/refresh');
      const isPublic         = isPublicRequest(url, originalRequest.method);
      const isAuthEndpoint   = isAuthLogin || isRefresh || url.includes('/api/v1/auth/password');
      const currentToken     = getAccessToken();
      const hadAccessToken   = Boolean(currentToken && !isTokenExpired(currentToken));

      // Sans indice de session ni jeton (visiteur anonyme), inutile d'appeler /auth/refresh.
      const canRefresh = Boolean(currentToken) || hasSessionHint();

      if (status === 401 && canRefresh && !originalRequest._retry && !isAuthEndpoint && !isPublic && !skipAuthRefresh) {
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          if (isDebug) console.info('[AUTH] refresh failed');
          // Échec transitoire (429/5xx/réseau) : on garde la session et on propage l'erreur d'origine.
          if (!isDefinitiveRefreshFailure(refreshError)) return Promise.reject(error);
        }

        // On ne redirige que si on avait effectivement une session ouverte.
        if (hadAccessToken) {
          clearCustomerSessionCache();
          clearAccessToken();
          redirectToLogin();
        }
      } else if (status === 403) {
        // Log interne uniquement — aucun détail exposé à l'utilisateur final ici.
        if (isDebug) console.warn('[API] 403 Accès refusé :', message);
      } else {
        if (isDebug) console.error('[API] Erreur :', status, message);
      }
    } else if (error.request) {
      if (isDebug) console.info('[API] Pas de réponse serveur — vérifier CORS ou réseau.');
    } else {
      if (isDebug) console.error('[API] Erreur de configuration :', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;