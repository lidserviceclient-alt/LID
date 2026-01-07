import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  MapPin, 
  Upload, 
  TrendingUp, 
  ShieldCheck, 
  Globe,
  Check,
  ArrowRight,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// --- Components ---

const MobileStepIndicator = ({ currentStep, setStep }) => {
  const steps = [ "Profil", "Boutique", "Vérif." ];
  
  return (
    <div className="flex items-center justify-between w-full relative mb-8 px-2 lg:hidden isolate">
       {/* Background Line */}
       <div className="absolute left-0 top-[15px] w-full h-[2px] bg-white/20 -z-10" />
       
       {/* Active Line (Progress) */}
       <div 
          className="absolute left-0 top-[15px] h-[2px] bg-[#E3B576] -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
       />

       {steps.map((label, i) => {
         const stepNum = i + 1;
         const isActive = stepNum === currentStep;
         const isCompleted = stepNum < currentStep;
         
         return (
            <div 
              key={i} 
              className="flex flex-col items-center gap-2 cursor-pointer relative z-10" 
              onClick={() => stepNum < currentStep && setStep(stepNum)}
            >
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                 isActive || isCompleted 
                   ? "bg-[#E3B576] border-[#E3B576] text-white shadow-lg shadow-[#E3B576]/30" 
                   : "bg-white/10 backdrop-blur-md border-white/20 text-white/40"
               }`}>
                  {isCompleted ? <Check size={14} /> : stepNum}
               </div>
               <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                 isActive ? "text-[#E3B576]" : "text-white/40"
               }`}>
                 {label}
               </span>
            </div>
         )
       })}
    </div>
  )
}

const VerticalStepIndicator = ({ currentStep, setStep }) => {
  const steps = [
    { title: "Profil", desc: "Vos informations personnelles" },
    { title: "Boutique", desc: "Détails de votre commerce" },
    { title: "Vérification", desc: "Documents légaux" }
  ];

  return (
    <div className="hidden lg:flex flex-col gap-6 lg:gap-8">
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div 
            key={i} 
            className={`flex items-start gap-4 relative group cursor-pointer ${stepNum > currentStep ? "opacity-50" : "opacity-100"}`}
            onClick={() => stepNum < currentStep && setStep(stepNum)}
          >
            {/* Vertical Line */}
            {i < steps.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-[-24px] lg:bottom-[-32px] w-[2px] bg-neutral-200">
                <motion.div 
                  initial={false}
                  animate={{ height: isCompleted ? "100%" : "0%" }}
                  className="w-full bg-[#E3B576]"
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {/* Circle */}
            <motion.div 
              animate={{
                backgroundColor: isActive || isCompleted ? "#E3B576" : "#ffffff",
                borderColor: isActive || isCompleted ? "#E3B576" : "#e5e5e5",
                color: isActive || isCompleted ? "#ffffff" : "#a3a3a3",
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 z-10 transition-colors duration-300"
            >
              {isCompleted ? <Check size={14} /> : stepNum}
            </motion.div>

            {/* Text */}
            <div className="pt-1">
              <h3 className={`text-sm font-bold transition-colors ${isActive ? "text-neutral-900" : "text-neutral-500"}`}>
                {s.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 border border-neutral-100 hover:border-[#E3B576]/30 hover:bg-white/80 transition-all duration-300 group">
    <div className="p-2.5 rounded-lg bg-[#E3B576]/10 text-[#E3B576] group-hover:bg-[#E3B576] group-hover:text-white transition-colors">
      <Icon size={18} />
    </div>
    <div>
      <h4 className="text-sm font-bold text-neutral-800">{title}</h4>
      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

const InputGroup = ({ label, icon: Icon, mobileDark, ...props }) => (
  <div className="space-y-1.5">
    <label className={`text-xs font-bold uppercase tracking-wide ml-1 ${mobileDark ? 'text-white/80 lg:text-neutral-600' : 'text-neutral-600'}`}>{label}</label>
    <div className="relative">
      {Icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${mobileDark ? 'text-white/40 lg:text-neutral-400' : 'text-neutral-400'}`}>
          <Icon size={18} />
        </div>
      )}
      <input 
        required
        {...props}
        className={`w-full rounded-xl py-3.5 transition-all outline-none focus:ring-2 focus:border-[#E3B576] ${
            mobileDark 
            ? 'bg-white/5 lg:bg-neutral-50 border border-white/10 lg:border-neutral-200 text-white lg:text-neutral-900 focus:ring-[#E3B576]/50 lg:focus:ring-[#E3B576]/20 placeholder:text-white/20 lg:placeholder:text-neutral-300 hover:bg-white/10 lg:hover:bg-white' 
            : 'bg-neutral-50 border border-neutral-200 text-neutral-900 focus:ring-[#E3B576]/20 placeholder:text-neutral-300 hover:bg-white'
        } ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

// --- Main Component ---

export default function Seller() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    storeName: "", category: "", description: "",
    address: "", city: "", country: "", idDocument: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, idDocument: file }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success("Votre demande vendeur a été envoyée !");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full lg:bg-[#FDFBF7] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden relative bg-black">
      
      {/* --- Mobile Only Background & Header --- */}
      <div className="absolute inset-0 z-0 lg:hidden">
         <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
            <source src="/imgs/video-bg.mp4" type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </div>

      <div className="relative z-20 lg:hidden px-6 pt-6 pb-2 flex items-center justify-between text-white">
         <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <ArrowRight className="rotate-180" size={14} />
            </div>
            <span className="text-sm font-medium">Retour</span>
         </button>
         <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#E3B576] uppercase tracking-wider">Etape {step}/3</span>
         </div>
      </div>

      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[480px] bg-white border-r border-neutral-200/60 p-5 md:p-8 lg:p-12 flex-col justify-between relative shrink-0 z-20">
        <div className="relative z-10">
          {/* Brand / Back */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-800 transition-colors mb-6 lg:mb-12 group">
             <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-[#E3B576] group-hover:text-white transition-colors">
               <ArrowRight className="rotate-180" size={14} />
             </div>
             <span className="text-sm font-medium">Retour</span>
          </button>

          <div className="mb-8 lg:mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 rounded-full bg-[#E3B576]/10 text-[#E3B576] text-xs font-bold uppercase tracking-wider mb-4"
            >
              Espace Vendeur
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-4"
            >
              Lancez votre <br/>
              <span className="text-[#E3B576]">Empire.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-500 leading-relaxed text-sm lg:text-base hidden sm:block"
            >
              Rejoignez 5,000+ vendeurs qui transforment leur passion en revenus sur notre plateforme mondiale.
            </motion.p>
          </div>

          <div className="hidden sm:block">
             {/* MobileStepIndicator moved to mobile section */}
          </div>
          <VerticalStepIndicator currentStep={step} setStep={setStep} />
        </div>

        {/* Footer Info - Hidden on small mobile to save space or kept if needed */}
        <div className="pt-8 lg:pt-12 relative z-10 hidden sm:block">
           <div className="flex items-center gap-4 text-xs text-neutral-400">
             <span>© 2025 LID</span>
             <span className="w-1 h-1 rounded-full bg-neutral-300" />
             <a href="#" className="hover:text-[#E3B576]">Conditions</a>
             <span className="w-1 h-1 rounded-full bg-neutral-300" />
             <a href="#" className="hover:text-[#E3B576]">Aide</a>
           </div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#E3B576]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* Right Content - Wrapper for Video & Scroll */}
      <div className="flex-1 relative lg:bg-[#FDFBF7] flex flex-col h-full overflow-hidden">
         
         {/* Video Background (Desktop Only) */}
         <div className="absolute inset-0 z-0 h-full w-full hidden lg:block">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-90"
            >
              <source src="/imgs/video-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-neutral-900/5 backdrop-blur-[1px]" />
         </div>

         {/* Scrollable Content */}
         <div className="relative z-10 flex-1 lg:absolute lg:inset-0 lg:overflow-y-auto flex flex-col">
            {/* Top Features Bar (Hidden on Mobile Immersive) */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-3 lg:gap-4 p-4 lg:p-8 max-w-4xl mx-auto pb-6 lg:pb-8">
              <div className="min-w-[240px] lg:min-w-0 shrink-0">
                <FeatureCard icon={TrendingUp} title="Croissance" description="+40% de revenus moy." />
              </div>
              <div className="min-w-[240px] lg:min-w-0 shrink-0">
                <FeatureCard icon={ShieldCheck} title="Sécurité" description="Paiements garantis" />
              </div>
              <div className="min-w-[240px] lg:min-w-0 shrink-0">
                <FeatureCard icon={Globe} title="Global" description="Vendez partout" />
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-12 pb-safe">
              <div className="w-full max-w-xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl lg:bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl lg:shadow-sm border border-white/20 lg:border-neutral-100 min-h-[400px] lg:min-h-0 relative overflow-hidden"
                  >
                    {/* Glass Shine Effect for Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none lg:hidden" />

                    <div className="mb-6 lg:mb-8 relative z-10">
                      
                      <div className="lg:hidden mb-6">
                        <MobileStepIndicator currentStep={step} setStep={setStep} />
                      </div>

                      <h2 className="text-xl lg:text-2xl font-bold text-white lg:text-neutral-900">
                        {step === 1 ? "Qui êtes-vous ?" : step === 2 ? "Votre Boutique" : "Vérification"}
                      </h2>
                      <p className="text-white/60 lg:text-neutral-500 text-xs lg:text-sm mt-1">
                        {step === 1 ? "Commençons par les présentations." : step === 2 ? "Dites-nous en plus sur votre activité." : "Dernière étape avant le lancement."}
                      </p>
                    </div>

                    <form onSubmit={handleNext} className="space-y-6 relative z-10">
                      <AnimatePresence mode="wait">
                          {step === 1 && (
                            <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4 lg:space-y-5"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" mobileDark />
                                <InputGroup label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" mobileDark />
                              </div>
                              <InputGroup label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jean@exemple.com" mobileDark />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup label="Téléphone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+33 6 12 34 56 78" mobileDark />
                                <InputGroup label="Mot de passe" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" icon={Lock} mobileDark />
                              </div>
                            </motion.div>
                          )}

                          {step === 2 && (
                            <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4 lg:space-y-5"
                            >
                              <InputGroup label="Nom de la boutique" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="Ma Super Boutique" icon={Store} mobileDark />
                              
                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-white/80 lg:text-neutral-600 uppercase tracking-wide ml-1">Catégorie</label>
                                  <div className="relative">
                                    <select 
                                      name="category"
                                      value={formData.category}
                                      onChange={handleChange}
                                      required
                                      className="w-full bg-white/5 lg:bg-neutral-50 border border-white/10 lg:border-neutral-200 rounded-xl px-4 py-3.5 text-white lg:text-neutral-900 focus:ring-2 focus:ring-[#E3B576]/50 lg:focus:ring-[#E3B576]/20 focus:border-[#E3B576] transition-all outline-none appearance-none hover:bg-white/10 lg:hover:bg-white [&>option]:text-neutral-900"
                                    >
                                      <option value="">Sélectionner...</option>
                                      <option value="fashion">Mode & Accessoires</option>
                                      <option value="tech">High-Tech</option>
                                      <option value="home">Maison & Déco</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 lg:text-neutral-400">
                                      <ArrowRight className="rotate-90" size={16} />
                                    </div>
                                  </div>
                              </div>

                              <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-white/80 lg:text-neutral-600 uppercase tracking-wide ml-1">Description</label>
                                  <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white/5 lg:bg-neutral-50 border border-white/10 lg:border-neutral-200 rounded-xl px-4 py-3.5 text-white lg:text-neutral-900 focus:ring-2 focus:ring-[#E3B576]/50 lg:focus:ring-[#E3B576]/20 focus:border-[#E3B576] transition-all outline-none resize-none placeholder:text-white/20 lg:placeholder:text-neutral-300 hover:bg-white/10 lg:hover:bg-white"
                                    placeholder="Décrivez votre univers..."
                                  />
                              </div>
                            </motion.div>
                          )}

                          {step === 3 && (
                            <motion.div
                              key="step3"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4 lg:space-y-5"
                            >
                              <InputGroup label="Adresse" name="address" value={formData.address} onChange={handleChange} placeholder="123 Rue du Commerce" icon={MapPin} mobileDark />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup label="Ville" name="city" value={formData.city} onChange={handleChange} placeholder="Paris" mobileDark />
                                <InputGroup label="Pays" name="country" value={formData.country} onChange={handleChange} placeholder="France" mobileDark />
                              </div>

                              <div className="space-y-1.5 pt-2">
                                  <label className="text-xs font-bold text-white/80 lg:text-neutral-600 uppercase tracking-wide ml-1">Kbis / Identité</label>
                                  <label className="relative border-2 border-dashed border-white/20 lg:border-neutral-200 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center text-center hover:border-[#E3B576] hover:bg-[#E3B576]/5 transition-all cursor-pointer group bg-white/5 lg:bg-neutral-50/50">
                                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} className="hidden" />
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 lg:bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#E3B576]">
                                      {formData.idDocument ? <Check size={24} /> : <Upload size={24} />}
                                    </div>
                                    {formData.idDocument ? (
                                      <div>
                                        <p className="text-sm text-white lg:text-neutral-900 font-bold">{formData.idDocument.name}</p>
                                        <p className="text-xs text-[#E3B576] mt-1 font-medium">Fichier chargé avec succès</p>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-sm text-white lg:text-neutral-900 font-bold group-hover:text-[#E3B576] transition-colors">Glissez votre document ici</p>
                                        <p className="text-xs text-white/40 lg:text-neutral-400 mt-1">PDF, JPG ou PNG (Max 10MB)</p>
                                      </div>
                                    )}
                                  </label>
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>

                      <div className="pt-6 flex gap-3">
                          {step > 1 && (
                            <button 
                              type="button"
                              onClick={() => setStep(step - 1)}
                              className="px-6 py-4 rounded-xl border border-white/20 lg:border-neutral-200 text-white lg:text-neutral-600 font-bold text-sm hover:bg-white/10 lg:hover:bg-neutral-50 lg:hover:border-neutral-300 transition-all"
                            >
                              Retour
                            </button>
                          )}
                          <motion.button 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={isLoading}
                            className="flex-1 bg-[#E3B576] text-white font-bold text-sm rounded-xl py-4 shadow-lg shadow-[#E3B576]/20 hover:shadow-[#E3B576]/40 hover:bg-[#d4a366] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                {step === 3 ? "Envoyer ma candidature" : "Continuer"}
                                <ArrowRight size={16} />
                              </>
                            )}
                          </motion.button>
                      </div>
                    </form>
                  </motion.div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
