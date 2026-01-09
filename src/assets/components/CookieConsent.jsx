import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sliders, ChevronUp } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({ analytics: true, marketing: true });

  useEffect(() => {
    const consent = localStorage.getItem("lid_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("lid_cookie_consent", "all");
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("lid_cookie_consent", "essential");
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("lid_cookie_consent", "custom");
    localStorage.setItem(
      "lid_cookie_preferences",
      JSON.stringify({ essential: true, analytics: preferences.analytics, marketing: preferences.marketing })
    );
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed lg:bottom-6 bottom-[15%] left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-4 w-full max-w-[90%] sm:max-w-[440px]">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            layoutId="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 pl-2 pr-6 py-2 bg-neutral-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-neutral-900 rounded-full shadow-2xl shadow-orange-500/20 border border-white/10 dark:border-neutral-900/10 cursor-pointer group"
          >
            <div className="w-10 h-10 animate-bounce bg-orange-500 rounded-full flex items-center justify-center text-xl shadow-lg group-hover:rotate-12 transition-transform">
              🍪
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Cookies ?</span>
              <span className="text-[10px] opacity-70">Gérer mes préférences</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-orange-500 ml-2 animate-pulse" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            layoutId="cookie-banner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl shadow-black/20 overflow-hidden border border-neutral-100 dark:border-neutral-800"
          >
            {/* Header Art */}
            <div className="h-32 bg-orange-600 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-10 -top-10 w-40 h-40 border-[20px] border-white/10 rounded-full border-dashed"
              />
               <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -left-10 -bottom-10 w-40 h-40 border-[20px] border-white/10 rounded-full border-dotted"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="text-7xl drop-shadow-lg z-10"
              >
                🍪
              </motion.div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors backdrop-blur-sm"
              >
                <ChevronUp size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showSettings ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">On peut avoir un cookie ?</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Promis, ils ne font pas grossir ! Ils servent juste à améliorer votre expérience sur LID.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAcceptAll}
                      className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 group"
                    >
                      <span>Accepter & Continuer</span>
                      <Check size={18} className="group-hover:scale-125 transition-transform" />
                    </motion.button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Sliders size={14} />
                        Réglages
                      </button>
                      <button
                        onClick={handleRejectAll}
                        className="py-3 px-4 bg-transparent border-2 border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold rounded-xl transition-colors text-sm"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900 dark:text-white">Vos préférences</h3>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      Retour
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    <ToggleOption label="Essentiels" description="Nécessaires au site" checked disabled />
                    <ToggleOption
                      label="Analytique"
                      description="Stats anonymes"
                      checked={preferences.analytics}
                      onToggle={() => setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))}
                    />
                    <ToggleOption
                      label="Marketing"
                      description="Pubs ciblées"
                      checked={preferences.marketing}
                      onToggle={() => setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))}
                    />
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all"
                  >
                    Enregistrer mes choix
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ToggleOption = ({ label, description, checked = false, disabled = false, onToggle }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        checked ? "border-orange-500/30 bg-orange-50 dark:bg-orange-900/10" : "border-neutral-100 dark:border-neutral-800"
      }`}
    >
      <div>
        <div className="font-bold text-sm text-neutral-900 dark:text-white">{label}</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">{description}</div>
      </div>
      <button 
        onClick={() => !disabled && onToggle?.()}
        className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div 
          animate={{ x: checked ? 18 : 2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
};
