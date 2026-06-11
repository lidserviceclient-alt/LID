import axios from 'axios';
import { clearAccessToken, getAccessToken, isTokenExpired, setAccessToken } from './auth';
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

/**
 * Rafraîchit l'access token via le refresh token (cookie HttpOnly).
 * La promesse est partagée pour éviter les appels parallèles.
 */
async function refreshAccessToken() {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = refreshClient
      .post('/api/v1/auth/refresh')
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
      } catch {
        // On nettoie silencieusement — pas de log en prod pour ne pas exposer l'état.
        if (isDebug) console.info('[AUTH] proactive refresh failed');
        clearCustomerSessionCache();
        clearAccessToken();
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

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint && !isPublic && !skipAuthRefresh) {
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          if (isDebug) console.info('[AUTH] refresh failed — session invalide');
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