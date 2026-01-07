import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Mail, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordForm({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final submit - Password reset successful
      // Here you would typically call the API to reset the password
      console.log("Password reset for:", email, code, password);
      toast.success("Mot de passe réinitialisé avec succès !");
      onBack(); // Return to login
    }
  };

  const titles = {
    1: "Mot de passe oublié ?",
    2: "Vérification",
    3: "Nouveau mot de passe"
  };

  const descriptions = {
    1: "Entrez votre email pour recevoir un code de réinitialisation.",
    2: `Entrez le code envoyé à ${email || "votre adresse email"}.`,
    3: "Créez votre nouveau mot de passe sécurisé."
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="text-center lg:text-left">
        <motion.h2 
          key={`title-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-2 text-white"
        >
          {titles[step]}
        </motion.h2>
        <motion.p 
          key={`desc-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-400 text-sm md:text-base"
        >
          {descriptions[step]}
        </motion.p>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ex. jean.dupont@gmail.com" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#E3B576] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Code de vérification</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    minLength={6}
                    maxLength={6}
                    placeholder="ex. 123456" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#E3B576] focus:border-transparent transition-all tracking-widest font-mono"
                  />
                </div>
                <p className="text-xs text-neutral-500 text-right">
                  Code non reçu ? <button type="button" className="text-[#E3B576] hover:underline">Renvoyer</button>
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 caractères" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#E3B576] focus:border-transparent transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Répétez le mot de passe" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#E3B576] focus:border-transparent transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full bg-[#E3B576] text-black font-bold rounded-xl py-3.5 mt-6 hover:shadow-lg hover:shadow-orange-500/20 transition-all shadow-md shadow-orange-500/5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === 1 && "Envoyer le code"}
              {step === 2 && "Vérifier le code"}
              {step === 3 && "Changer le mot de passe"}
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center text-sm">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : onBack()}
          className="text-neutral-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowRight size={14} className="rotate-180" /> 
          {step > 1 ? "Retour" : "Retour à la connexion"}
        </button>
      </div>
    </motion.div>
  );
}
