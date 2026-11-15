import { useEffect, useState } from 'react';
import api from './api';

// Grille par zone : la boutique demande la commune de livraison (Abidjan) ; hors Abidjan, la livraison est estimee
// par la distance (ou forfaitaire / indisponible selon le back-office). Le montant fait foi cote serveur (devis).

const STORAGE_KEY = 'lid_shipping_zone';
let zonesPromise = null;

export const fetchShippingZones = async () => {
  if (!zonesPromise) {
    zonesPromise = api.get('/api/v1/public/shipping/zones')
      .then(({ data }) => (Array.isArray(data) ? data : []))
      .catch((err) => {
        zonesPromise = null;
        throw err;
      });
  }
  return zonesPromise;
};

/**
 * Options du selecteur : groupes « Abidjan — Zone n » (communes rattachees a une zone tarifaire) puis
 * « Hors Abidjan (estimation) » (villes et pays hors des zones tarifees).
 */
export const buildZoneGroups = (zones = []) => {
  const byCode = new Map(zones.map((z) => [z.code, z]));
  const tariffZones = zones.filter((z) => z.level === 'TARIFF_ZONE')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || `${a.name}`.localeCompare(`${b.name}`));
  const tariffOf = (zone) => {
    let current = zone;
    for (let i = 0; current && i < 6; i += 1) {
      if (current.level === 'TARIFF_ZONE') return current;
      current = byCode.get(current.parentCode);
    }
    return null;
  };
  const groups = tariffZones.map((tz) => ({
    code: tz.code,
    label: `Abidjan — ${tz.name}`,
    outside: false,
    options: zones.filter((z) => z.level === 'COMMUNE' && tariffOf(z)?.code === tz.code)
      .sort((a, b) => `${a.name}`.localeCompare(`${b.name}`, 'fr'))
      .map((z) => ({ value: z.code, label: z.name, tariffZoneName: tz.name }))
  })).filter((g) => g.options.length > 0);
  const outside = zones
    .filter((z) => (z.level === 'COMMUNE' || z.level === 'COUNTRY') && !tariffOf(z) && z.code !== 'CI')
    .sort((a, b) => (a.level === b.level ? `${a.name}`.localeCompare(`${b.name}`, 'fr') : a.level === 'COMMUNE' ? -1 : 1))
    .map((z) => ({ value: z.code, label: z.level === 'COUNTRY' ? `${z.name} (pays)` : z.name, tariffZoneName: null }));
  if (outside.length > 0) {
    groups.push({ code: 'OUTSIDE', label: 'Hors Abidjan (livraison estimée)', outside: true, options: outside });
  }
  return groups;
};

const normalize = (value) => `${value || ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Devine la commune a partir de l'adresse / la ville saisies (pre-selection seulement : le client confirme). */
export const guessZoneCode = (groups = [], ...texts) => {
  const haystack = normalize(texts.filter(Boolean).join(' '));
  if (!haystack.trim()) return '';
  for (const group of groups) {
    for (const option of group.options) {
      const name = normalize(option.label.replace(/\s*\(.*\)\s*$/, ''));
      if (name.length >= 4 && haystack.includes(name)) return option.value;
    }
  }
  return '';
};

export const readStoredZone = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const storeZone = (code) => {
  try {
    if (code) window.localStorage.setItem(STORAGE_KEY, code);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* stockage indisponible : sans incidence */ }
};

/** Zones publiques groupees (chargees une fois par session de page). */
export const useShippingZones = () => {
  const [state, setState] = useState({ zones: [], groups: [], loading: true, error: false });
  useEffect(() => {
    let active = true;
    fetchShippingZones()
      .then((zones) => active && setState({ zones, groups: buildZoneGroups(zones), loading: false, error: false }))
      .catch(() => active && setState({ zones: [], groups: [], loading: false, error: true }));
    return () => {
      active = false;
    };
  }, []);
  return state;
};

/** Livraison d'un devis : libelle de zone, estimation, detail par colis. */
export const describeShippingQuote = (quote) => {
  if (!quote) return null;
  const parcels = Array.isArray(quote.shippingParcels) ? quote.shippingParcels : [];
  return {
    zoneName: quote.shippingTariffZoneName || null,
    outside: Boolean(quote.shippingOutsideZone),
    estimate: Boolean(quote.shippingEstimate || quote.shippingDistanceEstimated),
    available: quote.shippingAvailable !== false,
    unavailableReason: quote.shippingUnavailableReason || '',
    freeApplied: Boolean(quote.shippingFreeApplied),
    gross: Number(quote.shippingGrossCost),
    cost: Number(quote.shippingCost),
    parcels: parcels.map((p, i) => ({
      key: `${p.sellerId || i}`,
      label: p.sellerName && p.sellerName !== 'LID' ? p.sellerName : 'LID',
      cost: Number(p.cost),
      weightKg: p.billableWeightGrams ? Number(p.billableWeightGrams) / 1000 : null
    }))
  };
};
