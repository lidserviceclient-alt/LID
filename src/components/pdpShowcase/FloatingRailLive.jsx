// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUp, Headset, MessageCircle } from "lucide-react";

export default function FloatingRailLive({ showBackToTop, onScrollToReviews }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="hidden lg:flex fixed right-2 top-[55%] z-30 flex-col gap-2 font-barlow">
      <button
        type="button"
        onClick={onScrollToReviews}
        className="w-[76px] h-14 bg-white rounded-lg flex flex-col items-center justify-center gap-1"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
      >
        <MessageCircle size={22} className="text-pdp-ink" />
        <span className="text-[12px] font-medium text-pdp-ink">Avis</span>
      </button>

      <Link
        to="/help"
        className="w-[76px] h-14 bg-white rounded-lg flex flex-col items-center justify-center gap-1"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
      >
        <Headset size={22} className="text-pdp-ink" />
        <span className="text-[12px] font-medium text-pdp-ink text-center leading-none px-1">Service Client</span>
      </Link>

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
