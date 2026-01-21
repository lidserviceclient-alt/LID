import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Sparkles,
  Search,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

export default function OnboardingPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà vu l'onboarding
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      // Petit délai pour ne pas agresser l'utilisateur immédiatement
      const timer = setTimeout(() => {
        setOpen(true);
        // Marquer comme vu dès l'affichage pour éviter la répétition au rechargement
        localStorage.setItem("hasSeenOnboarding", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setOpen(false);
  };

  const steps = [
    {
      title: "Bienvenue sur LID",
      desc: "Découvrez une nouvelle façon de shopper. Plus fluide, plus rapide, plus immersive.",
      icon: Sparkles,
      color: "bg-orange-100 text-orange-600",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Navigation Intuitive",
      desc: "Trouvez exactement ce que vous cherchez grâce à notre catalogue intelligent et nos filtres précis.",
      icon: Search,
      color: "bg-blue-100 text-blue-600",
      image: "https://i.pinimg.com/1200x/bb/03/c2/bb03c2a0ed0721498ef1677af6cd3061.jpg",
    },
    {
      title: "Détails Immersifs",
      desc: "Des fiches produits riches et détaillées pour vous aider à faire le meilleur choix.",
      icon: ShoppingBag,
      color: "bg-purple-100 text-purple-600",
      image: "https://i.pinimg.com/736x/e3/a3/a7/e3a3a78d51653c7aeecce590a1e10970.jpg",
    },
    {
      title: "Paiement Sécurisé",
      desc: "Commandez en toute confiance avec nos solutions de paiement cryptées et sécurisées.",
      icon: ShieldCheck,
      color: "bg-emerald-100 text-emerald-600",
      image: "https://i.pinimg.com/1200x/06/20/8e/06208e1237d8125165c1a67c619ed720.jpg",
    },
  ];

  const CurrentIcon = steps[step].icon;

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Bouton Fermer */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-md transition-colors text-neutral-500 dark:text-neutral-400"
            >
              <X size={20} />
            </button>

            {/* Partie Gauche : Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-neutral-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={step}
                  src={steps[step].image}
                  alt={steps[step].title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Overlay gradient pour texte lisible si besoin (mobile) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
            </div>

            {/* Partie Droite : Contenu */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
              
              {/* Indicateur d'étape (Top) */}
              <div className="flex gap-2 mb-8">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === step
                        ? "w-8 bg-neutral-900 dark:bg-white"
                        : "w-2 bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>

              {/* Contenu Animé */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${steps[step].color}`}>
                    <CurrentIcon size={24} />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
                    {steps[step].title}
                  </h2>
                  
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {steps[step].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Footer / Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={close}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Passer l'intro
                </button>

                <button
                  onClick={nextStep}
                  className="group flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-neutral-200/50 dark:shadow-none"
                >
                  <span>{step === steps.length - 1 ? "C'est parti !" : "Continuer"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
