import api from './api';

/**
 * Service pour la gestion des partenaires.
 */

/**
 * Transforme un compte Client existant en compte Partenaire.
 * @param {Object} dto - Les données pour l'initialisation du partenaire (Step 1).
 * @returns {Promise<Object>} La réponse du serveur.
 */
export const upgradeToPartner = async (dto) => {
  const { data } = await api.post('/api/v1/partners/register/upgrade', dto);
  return data;
};

/**
 * Enregistre un nouveau partenaire (Step 1).
 * @param {Object} dto - Les données pour l'initialisation du partenaire.
 * @returns {Promise<Object>} La réponse du serveur.
 */
export const registerPartnerStep1 = async (dto) => {
    const { data } = await api.post('/api/v1/partners/register/step-1', dto);
    return data;
};

/**
 * Enregistre les infos boutique (Step 2).
 * @param {Object} dto - Les données boutique.
 * @returns {Promise<Object>} La réponse du serveur.
 */
export const registerPartnerStep2 = async (dto) => {
    const { data } = await api.post('/api/v1/partners/register/step-2', dto);
    return data;
};

/**
 * Enregistre les infos légales (Step 3).
 * @param {Object} dto - Les données légales.
 * @returns {Promise<Object>} La réponse du serveur.
 */
export const registerPartnerStep3 = async (dto) => {
    const { data } = await api.post('/api/v1/partners/register/step-3', dto);
    return data;
};

export const registerPartnerStep4 = async (dto) => {
    const { data } = await api.post('/api/v1/partners/register/step-4', dto);
    return data;
};
