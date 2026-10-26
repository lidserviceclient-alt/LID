// Geolocalisation du navigateur + adresse approchee (Nominatim), partagee par le checkout et le Profil.

export const getGeolocationBlockReason = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return "";
  if (!window.isSecureContext) {
    return "La géolocalisation exige un contexte sécurisé HTTPS.";
  }

  const policy = document.permissionsPolicy || document.featurePolicy;
  if (policy?.allowsFeature) {
    try {
      if (!policy.allowsFeature('geolocation')) {
        return "La géolocalisation est bloquée par la politique de permissions du navigateur ou de l'iframe.";
      }
    } catch {
      // no-op
    }
  }

  return "";
};

export const formatGeolocationError = (error) => {
  const blockedReason = getGeolocationBlockReason();
  if (blockedReason) return blockedReason;
  const code = error?.code;
  if (code === 1) return "L'accès à votre position a été refusé.";
  if (code === 2) return "Votre position n'a pas pu être déterminée.";
  if (code === 3) return "La récupération de votre position a expiré.";
  return "Impossible de récupérer votre position actuellement.";
};

/**
 * Position actuelle et adresse approchee. Leve une Error dont le message est affichable tel quel.
 * @returns {Promise<{ street: string, city: string, postalCode: string, country: string, latitude: number, longitude: number }>}
 */
export const locateCurrentAddress = async () => {
  if (typeof navigator === 'undefined' || !navigator?.geolocation) {
    throw new Error("La géolocalisation n'est pas disponible sur cet appareil.");
  }
  const blockedReason = getGeolocationBlockReason();
  if (blockedReason) {
    throw new Error(blockedReason);
  }
  let pos;
  try {
    pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
  } catch (error) {
    throw new Error(formatGeolocationError(error));
  }
  const latitude = Number(pos.coords.latitude);
  const longitude = Number(pos.coords.longitude);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data?.address || {};
    return {
      street: [addr.house_number, addr.road].filter(Boolean).join(' ') || data?.display_name || '',
      city: addr.city || addr.town || addr.village || '',
      postalCode: addr.postcode || '',
      country: addr.country || '',
      latitude,
      longitude
    };
  } catch {
    throw new Error(formatGeolocationError(null));
  }
};
