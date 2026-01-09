import axios from 'axios';
import { userManager } from './auth';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5173/api', // Fallback to localhost if env var is missing
  headers: {
    'Content-Type': 'application/json',
    'X-Client-ID': import.meta.env.VITE_CLIENT_ID, // ID Client header
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor
// Useful for adding authorization tokens (JWT) to every request
api.interceptors.request.use(
  async (config) => {
    // Retrieve the user from OIDC storage
    const user = await userManager.getUser();
    if (user && user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
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
  (error) => {
    if (error.response) {
      // Le serveur a répondu mais avec une erreur (hors 2xx)
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        console.error('Pas autorisé !'); 
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Accès refusé :', message);
      } else {
        console.error('Erreur API :', message);
      }
    } else if (error.request) {
      // La requête est partie mais rien n'est revenu
      console.error('Erreur réseau : pas de réponse du serveur');
    } else {
      // Une erreur est survenue en préparant la requête
      console.error('Erreur côté client :', error.message);
    }

    return Promise.reject(error); // Je renvoie l'erreur pour pouvoir la catcher ailleurs si besoin
  }
);

export default api;
