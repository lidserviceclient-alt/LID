import axios from 'axios';
import { clearAccessToken, getAccessToken, isTokenExpired, setAccessToken } from './auth';
import { clearCustomerSessionCache } from './sessionCleanup';

const resolvedBaseUrl = import.meta.env.VITE_API_URL || 'https://api.lidshopping.com/lid';
const isDebug = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

if (isDebug) {
  console.info('[API] baseURL:', resolvedBaseUrl);
}

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: resolvedBaseUrl, // Fallback to localhost if env var is missing
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

const refreshClient = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  withCredentials: true,
  timeout: 10000,
});

function isPublicRequest(url = '', method = 'get') {
  const safeMethod = `${method || 'get'}`.toLowerCase();
  const isReadRequest = safeMethod === 'get' || safeMethod === 'head' || safeMethod === 'options';
  return url.includes('/api/v1/public/')
    || (isReadRequest && url.includes('/api/v1/catalog/'))
    || url.includes('/api/v1/realtime/ws-access/public');
}

// Request Interceptor
// Useful for adding authorization tokens (JWT) to every request
api.interceptors.request.use(
  async (config) => {
    // Retrieve the user from OIDC storage
    const storedToken = getAccessToken();
    const accessToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null;
    const url = `${config.url || ''}`;
    const isAuthLogin = url.includes('/api/v1/auth/login');
    const isPublic = isPublicRequest(url, config.method);
    const clientId = import.meta.env.VITE_CLIENT_ID;

    if (storedToken && !accessToken) {
      clearCustomerSessionCache();
      clearAccessToken();
    }

    const existingAuth =
      config.headers?.Authorization ||
      config.headers?.authorization ||
      (typeof config.headers?.get === 'function'
        ? (config.headers.get('Authorization') || config.headers.get('authorization'))
        : null);

    if (clientId && !config.headers?.['X-Client-ID']) {
      config.headers['X-Client-ID'] = clientId;
    }
    if (!isAuthLogin && !isPublic && accessToken && !existingAuth) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (isDebug) {
      const method = (config.method || 'get').toUpperCase();
      const url = `${config.baseURL || ''}${config.url || ''}`;
      console.info('[API] request:', method, url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Après chaque réponse, je gère les erreurs globalement
api.interceptors.response.use(
  (response) => response, // Si tout va bien, je renvoie la réponse direct
  async (error) => {
    if (error.response) {
      // Le serveur a répondu mais avec une erreur (hors 2xx)
      const status = error.response.status;
      const message =
        error.response.data?.errorMessage ||
        error.response.data?.message ||
        error.message;

      const originalRequest = error.config || {};
      const url = `${originalRequest.url || ''}`;
      const skipAuthRefresh = originalRequest.skipAuthRefresh === true;
      const isAuthLogin = url.includes('/api/v1/auth/login');
      const isRefresh = url.includes('/api/v1/auth/refresh');
      const isPublic = isPublicRequest(url, originalRequest.method);
      const isAuthEndpoint = isAuthLogin || isRefresh || url.includes('/api/v1/auth/password');
      const currentToken = getAccessToken();
      const hadAccessToken = Boolean(currentToken && !isTokenExpired(currentToken));

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint && !isPublic && !skipAuthRefresh) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await refreshClient.post('/api/v1/auth/refresh');
          const accessToken = refreshResponse?.data?.accessToken;
          if (accessToken) {
            setAccessToken(accessToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          if (isDebug) {
            console.info('[AUTH] refresh failed:', refreshError?.message || refreshError);
          }
        }
        if (hadAccessToken) {
          clearCustomerSessionCache();
          clearAccessToken();
          const currentPath = window.location?.pathname || '';
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }
        }
      } else if (status === 403) {
        console.error('Accès refusé :', message);
      } else {
        console.error('Erreur API :', message);
      }
    } else if (error.request) {
      // La requête est partie mais rien n'est revenu
      console.error('Erreur réseau : pas de réponse du serveur');
      if (isDebug) {
        console.info('[API] no response; check CORS or network.');
      }
    } else {
      // Une erreur est survenue en préparant la requête
      console.error('Erreur côté client :', error.message);
    }

    return Promise.reject(error); // Je renvoie l'erreur pour pouvoir la catcher ailleurs si besoin
  }
);

export default api;
