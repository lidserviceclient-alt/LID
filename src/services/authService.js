import api from './api';
import { setAccessToken, clearAccessToken, getAccessTokenPayload, hasValidAccessToken } from './auth';

/**
 * Service centralisant toute la logique d'authentification et de gestion utilisateur.
 * (Connexion, Déconnexion, Données de l'utilisateur)
 */

/**
 * Connecte l'utilisateur via le token Google et sauvegarde la session.
 * @param {string} idToken - Le token d'identité fourni par Google.
 * @returns {Promise<Object>} La réponse du serveur incluant l'accessToken.
 */
export const loginWithGoogle = async (idToken) => {
  const { data } = await api.post(
    "/api/v1/auth/login",
    null,
    { headers: { Authorization: `Bearer ${idToken}` }, timeout: 30000 }
  );
  
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }
  return data;
};

export const loginPartnerLocal = async ({ email, password }) => {
  const { data } = await api.post("/api/v1/auth/login/local/partner", { email, password });
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }
  return data;
};

export const storeAccessToken = (token) => {
  setAccessToken(token);
};

/**
 * Déconnecte l'utilisateur : appel API pour invalider la session serveur
 * puis nettoyage du token local.
 */
export const logout = async () => {
  try {
    await api.post('/api/v1/auth/logout');
  } catch (error) {
    // On log l'erreur mais on procède quand même au nettoyage local
    console.warn('Erreur lors de la déconnexion serveur (token peut-être déjà expiré):', error);
  } finally {
    clearAccessToken();
  }
};

/**
 * Récupère le profil complet de l'utilisateur depuis l'API.
 * @param {string} userId - L'identifiant unique de l'utilisateur (sub).
 * @returns {Promise<Object>} Les données du profil utilisateur.
 */
export const getUserProfile = async (userId) => {
  const encodedUserId = encodeURIComponent(userId);

  try {
    const { data } = await api.get(`/api/v1/partners/${encodedUserId}`);
    return data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 403) {
      const { data } = await api.get(`/api/v1/customers/${encodedUserId}`);
      return data;
    }
    throw error;
  }
};

export const updateUserProfile = async (userId, payload) => {
  const encodedUserId = encodeURIComponent(userId);
  const { data } = await api.put(`/api/v1/customers/${encodedUserId}`, payload);
  return data;
};


/**
 * Récupère les informations de l'utilisateur actuel à partir du token stocké.
 * @returns {Object|null} Le payload décodé du token ou null si non connecté.
 */
export const getCurrentUserPayload = () => {
  return getAccessTokenPayload();
};

/**
 * Vérifie si un utilisateur est actuellement connecté.
 * @returns {boolean} True si un token valide existe.
 */
export const isAuthenticated = () => {
  return hasValidAccessToken();
};

/**
 * Tente de rafraîchir le token de session.
 * Utile après un changement de rôle (ex: Customer -> Partner).
 * @returns {Promise<boolean>} True si le refresh a réussi.
 */
export const refreshSession = async () => {
  try {
    const { data } = await api.post('/api/v1/auth/refresh');
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
      return true;
    }
  } catch (error) {
    console.warn('Erreur lors du refresh session:', error);
  }
  return false;
};

export const requestPasswordReset = async (email) => {
  const { data } = await api.post('/api/v1/auth/password/forgot', { email });
  return data;
};

export const verifyPasswordResetCode = async (code) => {
  await api.post('/api/v1/auth/password/verify', { code });
};

export const resetPasswordWithCode = async ({ code, newPassword }) => {
  await api.post('/api/v1/auth/password/reset', { code, newPassword });
};
