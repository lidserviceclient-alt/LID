import { History, Inbox, Send } from "lucide-react";

/** Sous-pages de /contact (chemins relatifs à /contact, routes déclarées dans App.jsx). */
export const CONTACT_SECTIONS = [
  { key: "inbox", path: "inbox", label: "Boîte de réception", description: "Messages du formulaire de contact du site.", icon: Inbox },
  { key: "envoyer", path: "envoyer", label: "Envoyer un message", description: "E-mail à des clients, visiteurs ou à l'équipe.", icon: Send },
  { key: "historique", path: "historique", label: "Historique", description: "Tous les messages reçus et envoyés.", icon: History }
];

export const DEFAULT_CONTACT_SECTION = CONTACT_SECTIONS[0].path;
