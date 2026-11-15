import { ClipboardList, Landmark, ScrollText } from "lucide-react";

/** Sous-pages de /returns (chemins relatifs à /returns ; routes déclarées dans App.jsx). */
export const RETURNS_SECTIONS = [
  { key: "demandes", label: "Demandes de retour", description: "Liste, analyse et traitement.", icon: ClipboardList, path: "", end: true },
  { key: "remboursements", label: "Remboursements", description: "File à traiter et délais.", icon: Landmark, path: "remboursements" },
  { key: "politique", label: "Politique de retour", description: "Délais, coût et remboursement.", icon: ScrollText, path: "politique" }
];
