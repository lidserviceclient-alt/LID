// Adresses client : contrat de l'API (CustomerAddressDto) =
// { id, label, line1, line2, city, country, postalCode, phoneNumber, latitude, longitude, isDefault }.

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const toCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/**
 * Lecture tolerante : accepte aussi les anciens noms du front (type/name, addressLine/address, phone, default)
 * pour d'eventuelles donnees deja enregistrees sous cette forme.
 */
export const normalizeCustomerAddress = (raw) => {
  const address = raw || {};
  return {
    id: address.id ?? null,
    label: firstText(address.label, address.type, address.name),
    line1: firstText(address.line1, address.addressLine, address.address),
    line2: firstText(address.line2),
    city: firstText(address.city),
    postalCode: firstText(address.postalCode, address.zip),
    country: firstText(address.country),
    phoneNumber: firstText(address.phoneNumber, address.phone),
    latitude: toCoordinate(address.latitude),
    longitude: toCoordinate(address.longitude),
    isDefault: Boolean(address.isDefault ?? address.default)
  };
};

export const normalizeCustomerAddresses = (list) =>
  (Array.isArray(list) ? list : []).filter(Boolean).map(normalizeCustomerAddress);

/** Corps envoye a POST/PUT /api/v1/customers/{id}/addresses (champ vide => null). */
export const toCustomerAddressPayload = (form) => {
  const text = (value) => {
    const trimmed = `${value ?? ''}`.trim();
    return trimmed || null;
  };
  const latitude = toCoordinate(form?.latitude);
  const longitude = toCoordinate(form?.longitude);
  const hasCoordinates = latitude !== null && longitude !== null;
  return {
    label: text(form?.label),
    line1: `${form?.line1 ?? ''}`.trim(),
    line2: text(form?.line2),
    city: text(form?.city),
    postalCode: text(form?.postalCode),
    country: text(form?.country),
    phoneNumber: text(form?.phoneNumber),
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    isDefault: Boolean(form?.isDefault)
  };
};

export const hasCoordinates = (address) =>
  toCoordinate(address?.latitude) !== null && toCoordinate(address?.longitude) !== null;

/** Adresse par defaut, sinon la plus recente (l'API renvoie la liste triee de la plus recente a la plus ancienne). */
export const pickPreferredAddress = (addresses) => {
  const list = Array.isArray(addresses) ? addresses : [];
  return list.find((address) => address?.isDefault) || list[0] || null;
};

/** Rue + complement, pour l'affichage resume. */
export const formatAddressStreet = (address) =>
  [address?.line1, address?.line2].map((part) => `${part || ''}`.trim()).filter(Boolean).join(', ');

export const formatAddressSummary = (address) =>
  [formatAddressStreet(address), [address?.postalCode, address?.city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' · ');

/** Texte compare sans casse, accents ni espaces superflus (dedoublonnage des adresses). */
const normalizeText = (value) =>
  `${value ?? ''}`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Cle de comparaison d'une adresse : rue (line1) + complement (line2) + ville + code postal. */
export const addressDedupKey = ({ line1, line2, city, postalCode }) =>
  [line1, line2, city, postalCode].map(normalizeText).join('|');

/** Cle d'une adresse enregistree. */
export const savedAddressKey = (address) =>
  addressDedupKey({ line1: address?.line1, line2: address?.line2, city: address?.city, postalCode: address?.postalCode });

export const findMatchingAddress = (addresses, { line1, line2, city, postalCode }) => {
  if (!normalizeText(line1)) return null;
  const key = addressDedupKey({ line1, line2, city, postalCode });
  return (Array.isArray(addresses) ? addresses : []).find((address) => savedAddressKey(address) === key) || null;
};
