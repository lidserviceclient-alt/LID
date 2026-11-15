import { Calculator, Coins, FileSpreadsheet, History, MapPinned, Package, Route as RouteIcon, Scale, Settings2, Truck, Warehouse } from "lucide-react";

/**
 * Sous-sections de /logistics/pricing (Tarification), dans l'ordre de la navigation.
 * `path` est relatif à /logistics/pricing.
 */
export const PRICING_SECTIONS = [
  { key: "strategie", path: "strategie", label: "Stratégie", icon: Settings2 },
  { key: "zones", path: "zones", label: "Zones & communes", icon: MapPinned },
  { key: "grille", path: "grille", label: "Grille tarifaire", icon: Coins },
  { key: "poids", path: "poids", label: "Poids", icon: Scale },
  { key: "hors-abidjan", path: "hors-abidjan", label: "Hors Abidjan", icon: RouteIcon },
  { key: "collecte", path: "collecte", label: "Collecte (option B)", icon: Package },
  { key: "depot", path: "depot", label: "Dépôt", icon: Warehouse },
  { key: "modes", path: "modes", label: "Modes & gratuité", icon: Truck },
  { key: "simulateur", path: "simulateur", label: "Simulateur", icon: Calculator },
  { key: "import-export", path: "import-export", label: "Import / Export", icon: FileSpreadsheet },
  { key: "historique", path: "historique", label: "Historique", icon: History }
];

export const DEFAULT_PRICING_SECTION = "grille";
