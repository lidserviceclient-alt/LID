import axios from 'axios';
import { clearAccessToken, getAccessToken } from './auth';

const resolvedBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';
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
// Apr�s chaque r�ponse, je g�re les erreurs globalement
api.interceptors.response.use(
  (response) => response, // Si tout va bien, je renvoie la r�ponse direct
  (error) => {
    if (error.response) {
      // Le serveur a r�pondu mais avec une erreur (hors 2xx)
      const status = error.response.status;
      const message =
        error.response.data?.errorMessage ||
        error.response.data?.message ||
        error.message;

      if (status === 401) {
        console.error('Pas autorisé !');
        clearAccessToken();
        const currentPath = window.location?.pathname || '';
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Accès refusé :', message);
      } else {
        console.error('Erreur API :', message);
      }
    } else if (error.request) {
      // La requ�te est partie mais rien n'est revenu
      console.error('Erreur réseau : pas de réponse du serveur');
      if (isDebug) {
        console.info('[API] no response; check CORS or network.');
      }
    } else {
      // Une erreur est survenue en pr�parant la requ�te
      console.error('Erreur côté client :', error.message);
    }

    return Promise.reject(error); // Je renvoie l'erreur pour pouvoir la catcher ailleurs si besoin
  }
);

export default api;
