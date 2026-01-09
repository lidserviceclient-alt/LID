import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, PackageX, FileText, CheckCircle, ArrowRight, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Identification", icon: FileText },
  { id: 2, title: "Produits", icon: PackageX },
  { id: 3, title: "Raison", icon: RefreshCw },
  { id: 4, title: "Confirmation", icon: CheckCircle },
];

export default function Returns() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    orderId: "",
    email: "",
    reason: "",
    details: ""
  });

  const handleNext = () => {
    if (currentStep === 1 && (!formData.orderId || !formData.email)) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = () => {
    toast.success("Demande de retour enregistrée !");
    // Reset or redirect logic here
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Centre de <span className="text-[#6aa200]">Retours</span></h1>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Nous voulons que vous soyez entièrement satisfait. Suivez les étapes ci-dessous pour effectuer un retour simple et rapide.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 dark:bg-neutral-900 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#6aa200] -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }} 
          />
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-neutral-950 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                ${currentStep >= step.id ? 'bg-[#6aa200] border-[#6aa200] text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}
              >
                <step.icon size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide ${currentStep >= step.id ? 'text-[#6aa200]' : 'text-neutral-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div 
          layout
          className="bg-neutral-50 dark:bg-neutral-900/50 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-100/50 dark:shadow-none"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Retrouver votre commande</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-500">Numéro de commande</label>
                    <input 
                      type="text" 
                      placeholder="Ex: LID-8821"
                      value={formData.orderId}
                      onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-500">Email utilisé</label>
                    <input 
                      type="email" 
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Sélection des produits</h2>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-yellow-700 dark:text-yellow-500 text-sm">
                  Pour cette démo, nous simulons la présence de produits.
                </div>
                {/* Mock Product Selection */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-[#6aa200] transition-colors">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg"></div>
                  <div className="flex-1">
                    <h3 className="font-bold">Nike Air Max 90</h3>
                    <p className="text-sm text-neutral-500">Taille: 42 • Couleur: Noir</p>
                  </div>
                  <input type="checkbox" className="w-6 h-6 rounded border-neutral-300 text-[#6aa200] focus:ring-[#6aa200]" />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Motif du retour</h2>
                <div className="space-y-4">
                  {['Taille incorrecte', 'Produit endommagé', 'Ne correspond pas à la photo', 'Changé d\'avis'].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <input 
                        type="radio" 
                        name="reason" 
                        value={reason}
                        checked={formData.reason === reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        className="text-[#6aa200] focus:ring-[#6aa200]" 
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                  <textarea 
                    placeholder="Détails supplémentaires (optionnel)"
                    className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none min-h-[100px]"
                  ></textarea>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 bg-[#6aa200]/10 text-[#6aa200] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold">Demande Envoyée !</h2>
                <p className="text-neutral-500">
                  Votre demande de retour a bien été prise en compte. Vous recevrez par email votre étiquette de retour sous 24h.
                </p>
                <Link to="/" className="inline-block mt-8 px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity">
                  Retour à l'accueil
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                disabled={currentStep === 1}
                className="px-6 py-2 rounded-lg font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30"
              >
                Précédent
              </button>
              <button 
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-[#6aa200] text-white rounded-xl font-bold hover:bg-[#5a8a00] transition-colors"
              >
                {currentStep === 3 ? "Confirmer" : "Suivant"}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}