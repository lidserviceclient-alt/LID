import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initAnalytics } from "@/services/firebase";
import { trackTrafficHit } from "@/services/traffic";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("lid_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("lid_cookie_consent", "all");
    initAnalytics();
    trackTrafficHit({ path: window.location?.pathname || "/" });
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem("lid_cookie_consent", "essential");
    setVisible(false);
  };

  const savePreferences = () => {
    localStorage.setItem("lid_cookie_consent", "custom");
    localStorage.setItem(
      "lid_cookie_preferences",
      JSON.stringify({
        essential: true,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
      })
    );

    if (preferences.analytics) {
      initAnalytics();
      trackTrafficHit({ path: window.location?.pathname || "/" });
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[99999]"
      >
        <div className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-2xl backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-6">

            {!openSettings ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                
                {/* Texte */}
                <div className="max-w-2xl">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Gestion des cookies
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Nous utilisons des cookies pour assurer le bon fonctionnement du site,
                    analyser l’audience et améliorer nos services. 
                    Vous pouvez accepter tous les cookies ou personnaliser vos préférences.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <button
                    onClick={rejectAll}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Refuser
                  </button>

                  <button
                    onClick={() => setOpenSettings(true)}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Personnaliser
                  </button>

                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition"
                  >
                    Accepter tout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Préférences des cookies
                  </h3>
                  <button
                    onClick={() => setOpenSettings(false)}
                    className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition"
                  >
                    Retour
                  </button>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <Toggle
                    label="Cookies essentiels"
                    description="Nécessaires au fonctionnement du site."
                    checked
                    disabled
                  />

                  <Toggle
                    label="Cookies analytiques"
                    description="Mesure d’audience et amélioration des performances."
                    checked={preferences.analytics}
                    onChange={() =>
                      setPreferences((p) => ({
                        ...p,
                        analytics: !p.analytics,
                      }))
                    }
                  />

                  <Toggle
                    label="Cookies marketing"
                    description="Personnalisation des contenus publicitaires."
                    checked={preferences.marketing}
                    onChange={() =>
                      setPreferences((p) => ({
                        ...p,
                        marketing: !p.marketing,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={savePreferences}
                    className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition"
                  >
                    Enregistrer les préférences
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const Toggle = ({ label, description, checked, disabled = false, onChange }) => {
  return (
    <div className="flex justify-between items-start gap-6">
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </div>

      <button
        onClick={() => !disabled && onChange?.()}
        className={`w-11 h-6 rounded-full p-1 transition ${
          checked
            ? "bg-neutral-900 dark:bg-white"
            : "bg-neutral-300 dark:bg-neutral-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white dark:bg-neutral-900 shadow transform transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
};