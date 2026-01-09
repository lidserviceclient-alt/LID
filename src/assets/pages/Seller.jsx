import { useState } from "react";
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
  Lock,
  ChevronRight,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Loader2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Components ---

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between w-full mb-10 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -z-10" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-[#6aa200] -z-10 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={i} className="flex flex-col items-center bg-white px-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                isActive 
                  ? "border-[#6aa200] text-[#6aa200] bg-white scale-110" 
                  : isCompleted
                    ? "border-[#6aa200] bg-[#6aa200] text-white"
                    : "border-neutral-200 text-neutral-400 bg-neutral-50"
              )}
            >
              {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
            </div>
            <span className={cn(
              "absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap",
              isActive ? "text-[#6aa200]" : isCompleted ? "text-neutral-800" : "text-neutral-400"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const InputField = ({ label, icon: Icon, className, ...props }) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors duration-300">
          <Icon size={18} />
        </div>
      )}
      <input 
        required
        {...props}
        className={cn(
          "w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3.5 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-300",
          "focus:bg-white focus:ring-2 focus:ring-[#6aa200]/20 focus:border-[#6aa200]",
          "hover:bg-neutral-100/50",
          Icon ? "pl-11 pr-4" : "px-4"
        )}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, options, className, ...props }) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors duration-300">
          <Icon size={18} />
        </div>
      )}
      <select 
        required
        {...props}
        className={cn(
          "w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3.5 text-neutral-900 outline-none transition-all duration-300 appearance-none cursor-pointer",
          "focus:bg-white focus:ring-2 focus:ring-[#6aa200]/20 focus:border-[#6aa200]",
          "hover:bg-neutral-100/50",
          Icon ? "pl-11 pr-10" : "px-4 pr-10"
        )}
      >
        <option value="">Sélectionner...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
        <ChevronRight className="rotate-90" size={16} />
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4"
  >
    <div className="w-10 h-10 rounded-full bg-[#6aa200] flex items-center justify-center text-white shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/60 font-medium uppercase tracking-wide">{label}</div>
    </div>
  </motion.div>
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

  const steps = [
    { label: "Compte", title: "Créons votre compte", desc: "Vos informations personnelles pour commencer." },
    { label: "Boutique", title: "Votre Boutique", desc: "Dites-nous en plus sur votre activité." },
    { label: "Vérif.", title: "Vérification", desc: "Dernière étape avant le lancement." }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const currentStepInfo = steps[step - 1];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans">
      
      {/* --- Left Column: Hero & Stats --- */}
      <div className="hidden lg:flex lg:w-5/12 bg-neutral-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Video/Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
          >
            <source src="/videos/video-og.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/0 via-neutral-900/60 to-neutral-900" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 group">
             <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:border-[#6aa200] group-hover:bg-[#6aa200] transition-all">
               <ArrowRight className="rotate-180" size={14} />
             </div>
             <span className="text-sm font-medium">Retour à l'accueil</span>
          </Link>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex px-3 py-1 rounded-full bg-[#6aa200]/20 text-[#6aa200] border border-[#6aa200]/30 text-xs font-bold uppercase tracking-wider mb-6">
              Espace Partenaire
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Développez votre <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6aa200] to-lime-400">Business.</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-md leading-relaxed">
              Rejoignez une communauté de vendeurs d'élite. Accédez à des millions de clients et profitez d'outils puissants pour gérer votre croissance.
            </p>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid gap-4">
          <StatCard icon={TrendingUp} value="+125%" label="Croissance Moyenne" delay={0.2} />
          <StatCard icon={ShieldCheck} value="100%" label="Paiements Sécurisés" delay={0.3} />
          <StatCard icon={Globe} value="24/7" label="Support Dédié" delay={0.4} />
        </div>
      </div>

      {/* --- Right Column: Form --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-xl">
          
          {/* Mobile Back Button */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8">
            <ArrowRight className="rotate-180" size={16} />
            <span className="text-sm font-medium">Retour</span>
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">{currentStepInfo.title}</h2>
            <p className="text-neutral-500">{currentStepInfo.desc}</p>
          </div>

          <StepIndicator currentStep={step} steps={steps} />

          <form onSubmit={handleNext} className="mt-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" icon={User} />
                    <InputField label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                  </div>
                  <InputField label="Email Pro" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@entreprise.com" icon={Mail} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Téléphone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+33 6 12 34 56 78" icon={Phone} />
                    <InputField label="Mot de passe" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" icon={Lock} />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <InputField label="Nom de la boutique" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="Ma Super Boutique" icon={Store} />
                  
                  <SelectField 
                    label="Catégorie Principale"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    icon={Briefcase}
                    options={[
                      { value: "fashion", label: "Mode & Accessoires" },
                      { value: "tech", label: "High-Tech & Informatique" },
                      { value: "home", label: "Maison & Décoration" },
                      { value: "beauty", label: "Beauté & Santé" },
                    ]}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide ml-1">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-[#6aa200]/20 focus:border-[#6aa200] hover:bg-neutral-100/50 resize-none"
                      placeholder="Décrivez votre activité et vos produits en quelques lignes..."
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
                  className="space-y-5"
                >
                  <InputField label="Adresse du siège" name="address" value={formData.address} onChange={handleChange} placeholder="123 Avenue du Commerce" icon={MapPin} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Ville" name="city" value={formData.city} onChange={handleChange} placeholder="Abidjan" />
                    <InputField label="Pays" name="country" value={formData.country} onChange={handleChange} placeholder="Côte d'Ivoire" icon={Globe} />
                  </div>

                  <div className="pt-4">
                    <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#6aa200] hover:bg-[#6aa200]/5 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-[#6aa200] group-hover:text-white transition-colors mb-3">
                        <Upload size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">Registre de Commerce</h4>
                      <p className="text-xs text-neutral-500 mt-1">Glissez votre fichier ici ou cliquez pour parcourir</p>
                      <input type="file" className="hidden" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              {step > 1 ? (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  Précédent
                </button>
              ) : (
                <div /> // Spacer
              )}
              
              <button 
                type="submit"
                disabled={isLoading}
                className="group relative px-8 py-3 bg-[#6aa200] hover:bg-[#5a8a00] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6aa200]/30 hover:shadow-[#6aa200]/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
                  {step === 3 ? "Envoyer ma demande" : "Continuer"}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:px-12">
          <p className="text-xs text-neutral-400">
            En continuant, vous acceptez nos <a href="#" className="underline hover:text-[#6aa200]">Conditions Générales de Vente</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
