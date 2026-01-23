import api from './api';
import { setAccessToken, clearAccessToken, getAccessTokenPayload } from './auth';

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
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }
  return data;
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
  const { data } = await api.get(`/api/v1/customers/${userId}`);
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
  const payload = getAccessTokenPayload();
  return Boolean(payload?.sub);
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
