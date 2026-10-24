// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bell, Headset, MessageCircle, Smartphone } from "lucide-react";

export default function FloatingRail({ showBackToTop, onScrollToReviews }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const items = [
    { id: "download", icon: Smartphone, label: "Télécharger" },
    { id: "notifications", icon: Bell, label: "Notifications", dot: true },
    { id: "support", icon: Headset, label: "Service Client" },
    { id: "reviews", icon: MessageCircle, label: "Avis", onClick: onScrollToReviews },
  ];

  return (
    <div
      className="hidden lg:flex fixed right-2 top-[55%] z-30 flex-col gap-2 font-barlow"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="relative w-[76px] h-14 bg-white rounded-lg flex flex-col items-center justify-center gap-1"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
          >
            {item.dot ? <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-pdp-red" /> : null}
            <Icon size={22} className="text-pdp-ink" />
            <span className="text-[12px] font-medium text-pdp-ink text-center leading-none px-1">{item.label}</span>
          </button>
        );
      })}

      <AnimatePresence>
        {showBackToTop ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={scrollToTop}
            aria-label="Retour en haut"
            className="w-[76px] h-14 bg-white rounded-lg flex items-center justify-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
          >
            <ArrowUp size={22} className="text-pdp-ink" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
