import { Bell, Landmark, Share2, ShieldCheck, Store, Truck, Users } from "lucide-react";

/**
 * Sous-pages de /settings, dans l'ordre d'affichage de la navigation.
 * `path` est relatif à /settings (routes déclarées dans App.jsx).
 */
export const SETTINGS_SECTIONS = [
  { key: "boutique", path: "boutique", label: "Boutique", description: "Identité, contact et TVA.", icon: Store },
  { key: "reversements", path: "reversements",
    label: "Reversements",
    description: "Commission LID et frais de paiement des partenaires.",
    icon: Landmark
  },
  { key: "livraison", path: "/logistics/pricing", label: "Livraison", description: "Tarification, modalités et gratuité : page Livraison.", icon: Truck },
  { key: "reseaux-sociaux", path: "reseaux-sociaux", label: "Réseaux sociaux", description: "Liens affichés dans le footer du site.", icon: Share2 },
  { key: "equipe", path: "equipe", label: "Équipe", description: "Administrateurs du back-office.", icon: Users },
  { key: "notifications", path: "notifications", label: "Notifications", description: "Types de notifications actifs.", icon: Bell },
  { key: "securite", path: "securite", label: "Sécurité", description: "2FA, export d’activité et logs serveur.", icon: ShieldCheck }
];

export const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTIONS[0].path;

export const findSettingsSection = (pathname) => {
  const segment = `${pathname || ""}`.split("/")[2] || "";
  return SETTINGS_SECTIONS.find((s) => s.path === segment) || null;
};
