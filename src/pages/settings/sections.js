import { Bell, Bike, RotateCcw, Share2, ShieldCheck, Store, Truck, Users } from "lucide-react";

/**
 * Sous-pages de /settings, dans l'ordre d'affichage de la navigation.
 * `path` est relatif à /settings (routes déclarées dans App.jsx).
 */
export const SETTINGS_SECTIONS = [
  { path: "boutique", label: "Boutique", description: "Identité, contact et TVA.", icon: Store },
  {
    path: "retours-commissions",
    label: "Retours & commissions",
    description: "Délais de retour, remboursement, commission et frais partenaires.",
    icon: RotateCcw
  },
  { path: "livraison", label: "Livraison", description: "Modalités, livraison gratuite et note client.", icon: Truck },
  { path: "reseaux-sociaux", label: "Réseaux sociaux", description: "Liens affichés dans le footer du site.", icon: Share2 },
  { path: "livreurs", label: "Livreurs", description: "Comptes de l’application Delivery.", icon: Bike },
  { path: "equipe", label: "Équipe", description: "Administrateurs du back-office.", icon: Users },
  { path: "notifications", label: "Notifications", description: "Types de notifications actifs.", icon: Bell },
  { path: "securite", label: "Sécurité", description: "2FA, export d’activité et logs serveur.", icon: ShieldCheck }
];

export const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTIONS[0].path;

export const findSettingsSection = (pathname) => {
  const segment = `${pathname || ""}`.split("/")[2] || "";
  return SETTINGS_SECTIONS.find((s) => s.path === segment) || null;
};
