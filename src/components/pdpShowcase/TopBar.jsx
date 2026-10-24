import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Smartphone, Truck, ShieldCheck, Gift } from "lucide-react";

const MESSAGES = [
  { icon: Truck, text: "Livraison le jour même ou le lendemain" },
  { icon: ShieldCheck, text: "Qualité garantie" },
  { icon: Gift, text: "Téléchargez l'application pour obtenir vos offres de bienvenue : Livraison GRATUITE | Jusqu'à -80 % | 30 jours d'essai gratuits" },
];

export default function TopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir) => setIndex((i) => (i + dir + MESSAGES.length) % MESSAGES.length);
  const Current = MESSAGES[index].icon;

  return (
    <div className="h-10 bg-pdp-ink flex items-center text-white font-barlow">
      <div className="max-w-[1228px] w-full mx-auto px-4 md:px-12 flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <Globe size={15} />
          <span className="text-xs font-medium">FR | Francais</span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <button type="button" onClick={() => go(-1)} aria-label="Message précédent" className="flex-shrink-0 opacity-70 hover:opacity-100">
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 min-w-0"
              >
                <Current size={14} className="flex-shrink-0" />
                <span className="text-xs font-medium truncate">{MESSAGES[index].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Message suivant" className="flex-shrink-0 opacity-70 hover:opacity-100">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <Smartphone size={18} />
          <span className="text-xs font-medium">Téléchargez l'application</span>
        </div>
      </div>
    </div>
  );
}
