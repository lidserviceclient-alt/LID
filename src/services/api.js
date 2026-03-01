import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './auth';

const resolvedBaseUrl = import.meta.env.VITE_API_URL || 'https://jean-emmanuel-diap.com/lid';
const isDebug = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

if (isDebug) {
  console.info('[API] baseURL:', resolvedBaseUrl);
}

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: resolvedBaseUrl, // Fallback to localhost if env var is missing
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

const refreshClient = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request Interceptor
// Useful for adding authorization tokens (JWT) to every request
api.interceptors.request.use(
  async (config) => {
    // Retrieve the user from OIDC storage
    const accessToken = getAccessToken();
    const isAuthLogin = (config.url || '').includes('/api/v1/auth/login');
    const clientId = import.meta.env.VITE_CLIENT_ID;

    const existingAuth =
      config.headers?.Authorization ||
      config.headers?.authorization ||
      (typeof config.headers?.get === 'function'
        ? (config.headers.get('Authorization') || config.headers.get('authorization'))
        : null);

    if (clientId && !config.headers?.['X-Client-ID']) {
      config.headers['X-Client-ID'] = clientId;
    }
    if (!isAuthLogin && accessToken && !existingAuth) {
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
      const isAuthLogin = url.includes('/api/v1/auth/login');
      const isRefresh = url.includes('/api/v1/auth/refresh');
      const isAuthEndpoint = isAuthLogin || isRefresh || url.includes('/api/v1/auth/password');
      const hadAccessToken = Boolean(getAccessToken());

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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
