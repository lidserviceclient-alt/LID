import { useMemo } from "react";
import SubPageLayout from "../../components/ui/SubPageLayout.jsx";
import { useContactSummary } from "../../resolvers/contactSummaryStore.js";
import { CONTACT_SECTIONS } from "./sections.js";

/** Coquille de /contact : boîte de réception, envoi et historique, avec le nombre de messages non lus en badge. */
export default function ContactLayout() {
  const { data } = useContactSummary();
  const unread = Number(data?.unread) || 0;
  const sections = useMemo(
    () => CONTACT_SECTIONS.map((s) => (s.key === "inbox" && unread > 0 ? { ...s, badge: unread > 99 ? "99+" : unread } : s)),
    [unread]
  );

  return (
    <SubPageLayout
      title="Contact"
      subtitle="Messages reçus du site, réponses et e-mails envoyés aux clients."
      basePath="/contact"
      sections={sections}
      storageKey="contact"
      navLabel="Sections de Contact"
    />
  );
}
