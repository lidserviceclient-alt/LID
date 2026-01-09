import { UserManager } from 'oidc-client-ts';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const userManager = new UserManager({
  authority: 'https://accounts.google.com',
  client_id: googleClientId , // Fallback pour éviter le crash si non défini
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  // Ajout de post_logout_redirect_uri pour rediriger après déconnexion
  post_logout_redirect_uri: window.location.origin,
});

export default userManager;
