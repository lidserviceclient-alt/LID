import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Store,
  MapPin,
  Upload,
  Sparkles,
  FileText,
  CreditCard,
  Building2,
  Image as ImageIcon,
  ScrollText,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAuthenticated, getCurrentUserPayload, logout, getUserProfile, refreshSession } from "@/services/authService";
import { upgradeToPartner, registerPartnerStep1, registerPartnerStep2, registerPartnerStep3 } from "@/services/partnerService";

const BRAND = "#6aa200";
const cx = (...c) => c.filter(Boolean).join(" ");

// Animation variants
const stepAnim = {
  initial: { opacity: 0, x: 20, filter: "blur(5px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -20, filter: "blur(5px)" },
};

// --- Components ---

function TopHero({ step }) {
  const covers = {
    1: "https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg", // Compte
    2: "https://images.pexels.com/photos/4571888/pexels-photo-4571888.jpeg", // Entreprise
    3: "https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Branding
    4: "https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg", // Finance
    5: "https://images.pexels.com/photos/48148/document-agreement-documents-sign-48148.jpeg", // Contrat
  };

  const texts = {
    1: { k: "Étape 1/5", t: "Création du Compte", d: "Commençons par vos informations personnelles." },
    2: { k: "Étape 2/5", t: "Votre Entreprise", d: "Dites-nous en plus sur votre structure." },
    3: { k: "Étape 3/5", t: "Image de Marque", d: "Logo, bannière et identité visuelle." },
    4: { k: "Étape 4/5", t: "Informations Financières", d: "Pour recevoir vos paiements en toute sécurité." },
    5: { k: "Étape 5/5", t: "Contrat & Validation", d: "Signature électronique et documents justificatifs." },
  };

  const s = texts[step];

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/70 backdrop-blur-xl shadow-lg h-[240px]">
      <AnimatePresence mode="wait">
        <motion.img
          key={covers[step]}
          src={covers[step]}
          alt="cover"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
      
      <div className="absolute left-8 bottom-8 z-10 max-w-md">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#6aa200] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#6aa200]" />
            {s.k}
          </div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">{s.t}</h1>
          <p className="text-neutral-600 font-medium">{s.d}</p>
        </motion.div>
      </div>
    </div>
  );
}

function ProgressSteps({ step, setStep }) {
  const steps = [
    { n: 1, label: "Compte" },
    { n: 2, label: "Entreprise" },
    { n: 3, label: "Branding" },
    { n: 4, label: "Finance" },
    { n: 5, label: "Contrat" },
  ];

  return (
    <div className="flex items-center justify-between px-2 relative">
      {/* Connecting Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-100 -z-10 rounded-full mx-4" />
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#6aa200] -z-10 rounded-full mx-4 transition-all duration-500"
        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((s) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <button
            key={s.n}
            onClick={() => done && setStep(s.n)} // Allow going back
            className={cx(
              "flex flex-col items-center gap-2 group outline-none",
              done ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div 
              className={cx(
                "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                active ? "bg-[#6aa200] border-white shadow-lg scale-110" : 
                done ? "bg-[#6aa200] border-[#6aa200] text-white" : 
                "bg-white border-neutral-200 text-neutral-300"
              )}
            >
              {done ? <Check size={16} strokeWidth={3} /> : <span className={cx("text-sm font-bold", active ? "text-white" : "")}>{s.n}</span>}
            </div>
            <span className={cx(
              "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 absolute -bottom-6",
              active ? "text-[#6aa200]" : done ? "text-neutral-600" : "text-neutral-300"
            )}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors duration-300">
            <Icon size={18} />
          </div>
        )}
        <input
          {...props}
          className={cx(
            "w-full rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none transition-all duration-300",
            error ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : 
            "border-neutral-200 hover:border-neutral-300 focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/10",
            Icon ? "pl-11" : ""
          )}
        />
      </div>
      {error && <div className="text-xs text-red-500 font-medium ml-1">{error}</div>}
    </div>
  );
}

function FileUploadZone({ label, accept, onChange, value }) {
  const inputRef = useRef(null);
  
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={cx(
          "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
          value ? "border-[#6aa200] bg-[#6aa200]/5" : "border-neutral-200 hover:border-[#6aa200]/50 hover:bg-neutral-50"
        )}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept={accept} 
          onChange={handleFile} 
        />
        
        {value ? (
          <>
             <div className="h-12 w-12 rounded-full bg-[#6aa200] text-white flex items-center justify-center mb-2 shadow-lg shadow-[#6aa200]/30">
               <Check size={24} />
             </div>
             <div className="text-sm font-bold text-[#6aa200]">{value.name}</div>
             <div className="text-xs text-neutral-400 mt-1">Cliquez pour remplacer</div>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-neutral-100 text-neutral-400 group-hover:bg-[#6aa200]/10 group-hover:text-[#6aa200] flex items-center justify-center mb-3 transition-colors duration-300">
              <Upload size={24} />
            </div>
            <div className="text-sm font-bold text-neutral-700 group-hover:text-neutral-900">Glissez ou cliquez pour uploader</div>
            <div className="text-xs text-neutral-400 mt-1">PNG, JPG, PDF (Max 5MB)</div>
          </>
        )}
      </div>
    </div>
  );
}

function PDFContractViewer({ onAccept, accepted }) {
  return (
    <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-700 font-bold text-sm">
          <FileText size={16} className="text-[#6aa200]" />
          Contrat Partenaire Vendeur v1.0
        </div>
        <a href="#" className="text-xs font-bold text-[#6aa200] hover:underline">Télécharger PDF</a>
      </div>
      
      {/* Mock PDF Content */}
      <div className="h-64 overflow-y-auto p-6 text-xs text-neutral-600 space-y-4 leading-relaxed font-serif bg-white">
        <p className="font-bold text-neutral-900 text-sm">CONDITIONS GÉNÉRALES DE PARTENARIAT - LID</p>
        <p><strong>1. Objet du contrat :</strong> Le présent contrat a pour objet de définir les conditions dans lesquelles le Vendeur propose ses produits sur la plateforme Life Distribution (LID).</p>
        <p><strong>2. Obligations du Vendeur :</strong> Le Vendeur s'engage à proposer des produits conformes, à respecter les délais de livraison indiqués et à fournir un service client de qualité. Toute contrefaçon est strictement interdite.</p>
        <p><strong>3. Commission et Paiement :</strong> LID prélève une commission de 10% sur chaque vente réalisée. Les paiements sont effectués hebdomadairement sur le compte bancaire fourni par le Vendeur.</p>
        <p><strong>4. Résiliation :</strong> Chaque partie peut résilier le contrat avec un préavis de 30 jours. En cas de manquement grave, LID se réserve le droit de suspendre le compte immédiatement.</p>
        <p><strong>5. Confidentialité :</strong> Les parties s'engagent à garder confidentielles toutes les informations commerciales échangées.</p>
        <p className="italic text-neutral-400">... (Suite du contrat fictif pour démonstration) ...</p>
        <div className="h-20" /> {/* Spacer for scroll feel */}
      </div>

      <div className="p-4 bg-neutral-50 border-t border-neutral-200">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={cx(
            "mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200",
            accepted ? "bg-[#6aa200] border-[#6aa200] text-white" : "bg-white border-neutral-300 group-hover:border-[#6aa200]"
          )}>
            {accepted && <Check size={14} strokeWidth={3} />}
          </div>
          <input type="checkbox" className="hidden" checked={accepted} onChange={(e) => onAccept(e.target.checked)} />
          <div className="text-sm text-neutral-600">
            Je certifie avoir lu et j'accepte les <span className="font-bold text-neutral-900">Conditions Générales de Partenariat</span> ainsi que la politique de confidentialité.
          </div>
        </label>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function Seller() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  
  const isAuth = isAuthenticated();
  const currentUser = getCurrentUserPayload();
  
  const [formData, setFormData] = useState({
    // 1. Compte
    firstName: "", lastName: "", email: "", phone: "", password: "",
    // 2. Entreprise
    storeName: "", category: "fashion", description: "",
    address: "", city: "", region: "", ninea: "", rccm: "",
    // 3. Branding
    logo: null, banner: null,
    // 4. Finance
    bankName: "", accountHolder: "", rib: "", iban: "", swift: "",
    // 5. Contrat & Docs
    contractAccepted: false, idDoc: null, nineaDoc: null
  });

  const isPartner = Array.isArray(currentUser?.roles) && 
    currentUser.roles.some(r => r === "PARTNER" || r === "ROLE_PARTNER");

  useEffect(() => {
    if (isAuth && currentUser) {
        // Pre-fill basic info
        setFormData(prev => ({
            ...prev,
            firstName: currentUser.firstName || prev.firstName,
            lastName: currentUser.lastName || prev.lastName,
            email: currentUser.email || prev.email,
        }));

        // Fetch full profile to get phone number if missing
        getUserProfile(currentUser.sub).then(profile => {
            if (profile && profile.phoneNumber) {
                setFormData(prev => ({ ...prev, phone: profile.phoneNumber }));
            }
        }).catch(err => console.error("Failed to fetch profile", err));
    }
  }, [isAuth, currentUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Simulation de vérification d'email existant
    if (field === "email") {
        if (["test@lid.com", "admin@lid.com", "vendeur@lid.com"].includes(value)) {
            setEmailError(true);
        } else {
            setEmailError(false);
        }
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!formData.contractAccepted) {
      toast.error("Veuillez accepter le contrat pour continuer.");
      return;
    }
    setLoading(true);

    try {
        let partnerId = null;

        // --- STEP 1: ACCOUNT ---
        const step1Data = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phone,
            passwordHash: formData.password || "oauth2_placeholder" // TODO: Handle password correctly
        };

        if (isAuth && !isPartner) {
            // Upgrade existing customer
            const res = await upgradeToPartner(step1Data);
            partnerId = res.userId;
            toast.success("Compte mis à niveau avec succès !");
            await refreshSession();
        } else if (!isAuth) {
            // Create new partner
            const res = await registerPartnerStep1(step1Data);
            partnerId = res.userId;
            toast.success("Compte créé avec succès !");
        } else {
            // Already partner?
            partnerId = currentUser.sub;
        }

        if (!partnerId) throw new Error("Impossible de récupérer l'ID partenaire");

        // If we are not authenticated (fresh signup), we can't proceed to protected steps
        if (!isAuth) {
            setLoading(false);
            toast.success("Compte créé ! Veuillez vous connecter pour finaliser votre dossier.");
            navigate("/login");
            return;
        }

        // --- STEP 2: SHOP ---
        const step2Data = {
            partnerId: partnerId,
            shopName: formData.storeName,
            shopDescription: formData.description,
            mainCategoryId: 1 // TODO: Fetch real categories. Defaulting to 1.
        };
        await registerPartnerStep2(step2Data);

        // --- STEP 3: LEGAL ---
        const step3Data = {
            partnerId: partnerId,
            headOfficeAddress: formData.address,
            city: formData.city,
            country: formData.region || "Senegal",
            businessRegistrationDocumentUrl: "https://example.com/doc.pdf" // TODO: Handle file upload
        };
        await registerPartnerStep3(step3Data);

        setLoading(false);
        toast.success("Félicitations ! Votre demande est en cours de validation.");
        
        // Refresh token/session if possible or redirect
        window.location.href = "/dashboard/seller";

    } catch (error) {
        console.error("Erreur inscription", error);
        setLoading(false);
        toast.error(error.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] text-neutral-900 font-sans selection:bg-[#6aa200] selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6aa200] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.06] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.06] animate-blob animation-delay-2000" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar / Info Panel (Desktop only - simplified for now) */}
        {/* We keep it centered in a single column layout for focus, but wider */}

        <div className="lg:col-span-12 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <Link to="/" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition font-bold text-sm group">
              <div className="p-2 bg-white rounded-full border border-neutral-200 group-hover:border-neutral-300 transition shadow-sm">
                <ArrowLeft size={16} />
              </div>
              <span>Retour à l'accueil</span>
            </Link>
            <div className="flex items-center gap-4">
               {!isAuth && (
                 <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Déjà inscrit ?</div>
                    <Link to="/login" className="text-sm font-bold text-[#6aa200] hover:underline">Se connecter</Link>
                 </div>
               )}
               <span className="text-xl font-black tracking-tighter">
                <img src="/imgs/favicon.ico" width={40} alt="logo lid" />
               </span>
            </div>
          </div>

          <TopHero step={step} />

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-neutral-200/40 relative">
             
             <div className="mb-10 mt-2">
               <ProgressSteps step={step} setStep={setStep} />
             </div>

             <div className="min-h-[400px]">
               <AnimatePresence mode="wait">
                 
                 {/* STEP 1: COMPTE */}
                 {step === 1 && (
                   <motion.div key="step1" {...stepAnim} className="space-y-6">
                     
                     {isAuth ? (
                        /* Authenticated View */
                        <div className="bg-gradient-to-br from-[#6aa200]/5 to-transparent border border-[#6aa200]/20 rounded-3xl p-8 text-center relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#6aa200]/10 rounded-full blur-2xl -mr-10 -mt-10" />
                           
                           <div className="relative z-10 flex flex-col items-center">
                              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl mb-4 overflow-hidden bg-neutral-100">
                                 {currentUser?.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                       <User size={40} />
                                    </div>
                                 )}
                              </div>
                              
                              <h3 className="text-2xl font-black text-neutral-900 mb-1">
                                 Bienvenue, {currentUser?.firstName || "Partenaire"} !
                              </h3>
                              <p className="text-neutral-500 font-medium mb-6">
                                 {currentUser?.email}
                              </p>

                              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#6aa200]/20 shadow-sm mb-8">
                                 <div className="w-2 h-2 rounded-full bg-[#6aa200] animate-pulse" />
                                 <span className="text-xs font-bold text-[#6aa200] uppercase tracking-wide">Compte Vérifié</span>
                              </div>

                              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed mb-6">
                                 {isPartner 
                                   ? "Vous êtes déjà enregistré comme partenaire. Accédez à votre espace de gestion pour piloter votre activité."
                                   : "Pour finaliser la transformation de votre compte, veuillez confirmer votre numéro de téléphone."
                                 }
                              </p>

                              {!isPartner && (
                                <div className="max-w-xs mx-auto mb-8">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                            <Phone size={16} />
                                        </div>
                                        <input 
                                            type="tel" 
                                            placeholder="Votre numéro de téléphone"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#6aa200] focus:border-transparent outline-none transition-all text-sm font-medium shadow-sm"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                        />
                                    </div>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mx-auto">
                                 <button 
                                    onClick={async () => {
                                        if (isPartner) {
                                            navigate("/dashboard/seller");
                                        } else {
                                            if (!formData.phone) {
                                                toast.error("Veuillez entrer votre numéro de téléphone");
                                                return;
                                            }
                                            try {
                                                setLoading(true);
                                                // Appel API pour upgrade
                                                await upgradeToPartner({
                                                    userId: currentUser.sub,
                                                    firstName: formData.firstName,
                                                    lastName: formData.lastName,
                                                    email: formData.email,
                                                    phoneNumber: formData.phone
                                                });
                                                
                                                await refreshSession();
                                                
                                                toast.success("Compte mis à niveau avec succès !");
                                                // On passe à l'étape suivante (Boutique)
                                                nextStep();
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Erreur lors de la mise à niveau du compte.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }
                                    }}
                                    disabled={loading}
                                    className="flex-1 w-full bg-[#6aa200] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                 >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : isPartner ? (
                                        <>Accéder à mon tableau de bord <Briefcase size={18} /></>
                                    ) : (
                                        <>Continuer <ArrowRight size={18} /></>
                                    )}
                                 </button>
                                 <button 
                                    onClick={async () => {
                                       await logout();
                                       window.location.reload();
                                    }}
                                    className="px-6 py-3.5 rounded-xl font-bold text-neutral-500 hover:text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                                 >
                                    <LogOut size={18} /> Changer de compte
                                 </button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        /* Guest View */
                        <>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <Field label="Prénom" icon={User} placeholder="Jean" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
                             <Field label="Nom" placeholder="Dupont" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <Field 
                                label="Email Professionnel" 
                                icon={Mail} 
                                type="email" 
                                placeholder="contact@boutique.com" 
                                value={formData.email} 
                                onChange={e => handleChange("email", e.target.value)}
                                error={emailError ? " " : null} // Just to trigger red border
                             />
                             <Field label="Téléphone Mobile" icon={Phone} placeholder="+221 77 000 00 00" value={formData.phone} onChange={e => handleChange("phone", e.target.value)} />
                           </div>
                           
                           {/* Email Collision Alert */}
                           <AnimatePresence>
                              {emailError && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0, y: -10 }} 
                                  animate={{ opacity: 1, height: "auto", y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                                    <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm shrink-0 border border-orange-100">
                                      <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-orange-900 text-sm mb-1">Compte déjà existant</h4>
                                      <p className="text-xs text-orange-800/80 leading-relaxed mb-3">
                                        L'adresse email <strong className="font-medium text-orange-900">{formData.email}</strong> est déjà associée à un compte Life Distribution.
                                      </p>
                                      <div className="flex items-center gap-3">
                                        <Link to="/login" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition shadow-md shadow-orange-500/20 flex items-center gap-2">
                                          Se connecter maintenant <ArrowRight size={12} />
                                        </Link>
                                        <button onClick={() => setEmailError(false)} className="px-3 py-2 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition">
                                          Utiliser une autre adresse
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                           </AnimatePresence>

                           <Field label="Mot de passe" icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={e => handleChange("password", e.target.value)} />
                           
                           <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-xs flex gap-3 leading-relaxed">
                             <AlertCircle size={18} className="shrink-0 mt-0.5" />
                             Ces informations serviront à vous connecter à votre espace vendeur et à sécuriser votre compte.
                           </div>
                        </>
                     )}
                   </motion.div>
                 )}

                 {/* STEP 2: ENTREPRISE */}
                 {step === 2 && (
                   <motion.div key="step2" {...stepAnim} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Nom de la Boutique" icon={Store} placeholder="Ex: Dakar Shop" value={formData.storeName} onChange={e => handleChange("storeName", e.target.value)} />
                       <div className="space-y-1.5">
                         <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Catégorie Principale</label>
                         <select 
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/10 transition-all"
                            value={formData.category}
                            onChange={e => handleChange("category", e.target.value)}
                         >
                           <option value="fashion">Mode & Accessoires</option>
                           <option value="tech">High-Tech & Électronique</option>
                           <option value="home">Maison & Décoration</option>
                           <option value="beauty">Beauté & Santé</option>
                           <option value="food">Alimentation</option>
                         </select>
                       </div>
                     </div>

                     <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Description Courte</label>
                       <textarea 
                         rows={3}
                         className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/10 transition-all resize-none"
                         placeholder="Décrivez votre activité en quelques mots..."
                         value={formData.description}
                         onChange={e => handleChange("description", e.target.value)}
                       />
                     </div>

                     <div className="border-t border-neutral-100 my-4" />
                     <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4">Siège Social & Fiscalité</h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Adresse Complète" icon={MapPin} placeholder="Ex: 12 Rue de la République" value={formData.address} onChange={e => handleChange("address", e.target.value)} />
                       <Field label="Ville / Région" placeholder="Dakar" value={formData.city} onChange={e => handleChange("city", e.target.value)} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Numéro NINEA" icon={Briefcase} placeholder="000000000" value={formData.ninea} onChange={e => handleChange("ninea", e.target.value)} />
                       <Field label="Numéro RCCM" icon={Building2} placeholder="SN-DKR-2024-..." value={formData.rccm} onChange={e => handleChange("rccm", e.target.value)} />
                     </div>
                   </motion.div>
                 )}

                 {/* STEP 3: BRANDING */}
                 {step === 3 && (
                   <motion.div key="step3" {...stepAnim} className="space-y-8">
                     <div className="text-center max-w-lg mx-auto mb-6">
                       <h3 className="font-bold text-lg mb-2">L'identité de votre boutique</h3>
                       <p className="text-neutral-500 text-sm">C'est la première chose que vos clients verront. Choisissez des images de haute qualité.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FileUploadZone 
                          label="Logo de la boutique (Carré)" 
                          accept="image/*" 
                          value={formData.logo}
                          onChange={f => handleChange("logo", f)}
                        />
                        <FileUploadZone 
                          label="Bannière de couverture (Paysage)" 
                          accept="image/*" 
                          value={formData.banner}
                          onChange={f => handleChange("banner", f)}
                        />
                     </div>

                     <div className="mt-8 pt-8 border-t border-neutral-100">
                       <div className="flex items-center justify-between mb-4">
                         <h4 className="text-sm font-black uppercase text-neutral-400 tracking-wider">Aperçu en temps réel</h4>
                         <div className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">MODE CLIENT</div>
                       </div>
                       
                       <div className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-neutral-200/50 border border-neutral-100 transform transition-all hover:scale-[1.02] duration-500">
                         {/* Banner Area */}
                         <div className="h-32 bg-neutral-100 relative">
                           {formData.banner ? (
                             <img src={URL.createObjectURL(formData.banner)} alt="Banner" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-r from-neutral-200 to-neutral-100 flex items-center justify-center">
                               <ImageIcon className="text-neutral-300" size={32} />
                             </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                         </div>

                         {/* Content */}
                         <div className="px-6 pb-6 relative">
                           {/* Logo - Overlapping */}
                           <div className="absolute -top-10 left-6">
                             <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-lg shadow-black/5">
                               <div className="w-full h-full rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100 flex items-center justify-center">
                                  {formData.logo ? (
                                     <img src={URL.createObjectURL(formData.logo)} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                     <Store className="text-neutral-300" size={32} />
                                  )}
                               </div>
                             </div>
                           </div>

                           {/* Info */}
                           <div className="pt-12">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <h3 className="font-black text-xl text-neutral-900 leading-tight">
                                     {formData.storeName || "Nom de votre boutique"}
                                   </h3>
                                   <p className="text-xs font-bold text-[#6aa200] uppercase tracking-wide mt-1">
                                     {formData.category === 'fashion' ? 'Mode & Accessoires' : 
                                      formData.category === 'tech' ? 'High-Tech' :
                                      formData.category === 'home' ? 'Maison & Déco' :
                                      formData.category === 'beauty' ? 'Beauté & Santé' :
                                      formData.category === 'food' ? 'Alimentation' : 'Catégorie'}
                                   </p>
                                 </div>
                                 {/* Rating Mockup */}
                                 <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">
                                    <div className="text-yellow-400 text-xs">★</div>
                                    <span className="text-xs font-bold text-neutral-700">5.0</span>
                                 </div>
                              </div>

                              <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-4">
                                {formData.description || "Une courte description de votre activité apparaîtra ici pour vos futurs clients."}
                              </p>

                              <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 border-t border-neutral-50 pt-4">
                                 <div className="flex items-center gap-1.5">
                                   <MapPin size={14} />
                                   {formData.city || "Ville"}, {formData.address || "Adresse"}
                                 </div>
                              </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}

                 {/* STEP 4: FINANCE */}
                 {step === 4 && (
                   <motion.div key="step4" {...stepAnim} className="space-y-6">
                     <div className="bg-[#6aa200]/5 border border-[#6aa200]/20 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="p-2 bg-[#6aa200] rounded-lg text-white shrink-0">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#6aa200] text-sm mb-1">Informations Bancaires</h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            Les paiements sont effectués automatiquement tous les lundis pour les commandes livrées. Assurez-vous que le titulaire du compte correspond au nom de l'entreprise ou du gérant.
                          </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Nom de la Banque" icon={Building2} placeholder="Ex: CBAO, Ecobank..." value={formData.bankName} onChange={e => handleChange("bankName", e.target.value)} />
                       <Field label="Titulaire du Compte" icon={User} placeholder="Nom complet" value={formData.accountHolder} onChange={e => handleChange("accountHolder", e.target.value)} />
                     </div>
                     
                     <Field label="Numéro de Compte / IBAN" icon={CreditCard} placeholder="SN..." value={formData.iban} onChange={e => handleChange("iban", e.target.value)} />
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Code Banque" placeholder="XXXXX" value={formData.bankCode} onChange={e => handleChange("bankCode", e.target.value)} />
                       <Field label="Clé RIB" placeholder="XX" value={formData.ribKey} onChange={e => handleChange("ribKey", e.target.value)} />
                     </div>
                   </motion.div>
                 )}

                 {/* STEP 5: CONTRAT & DOCS */}
                 {step === 5 && (
                   <motion.div key="step5" {...stepAnim} className="space-y-8">
                     
                     <div className="space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="h-8 w-8 rounded-full bg-[#6aa200] text-white flex items-center justify-center font-bold text-sm">1</div>
                         <h3 className="font-bold text-lg">Contrat de Partenariat</h3>
                       </div>
                       <PDFContractViewer accepted={formData.contractAccepted} onAccept={v => handleChange("contractAccepted", v)} />
                     </div>

                     <div className="border-t border-neutral-100" />

                     <div className="space-y-4">
                       <div className="flex items-center gap-2 mb-4">
                         <div className="h-8 w-8 rounded-full bg-[#6aa200] text-white flex items-center justify-center font-bold text-sm">2</div>
                         <h3 className="font-bold text-lg">Documents Justificatifs</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FileUploadZone 
                            label="Pièce d'identité (CNI / Passeport)" 
                            accept=".pdf,.jpg,.png"
                            value={formData.idDoc}
                            onChange={f => handleChange("idDoc", f)}
                         />
                         <FileUploadZone 
                            label="Registre de Commerce / NINEA" 
                            accept=".pdf,.jpg,.png"
                            value={formData.nineaDoc}
                            onChange={f => handleChange("nineaDoc", f)}
                         />
                       </div>
                     </div>

                   </motion.div>
                 )}

               </AnimatePresence>
             </div>

             {/* Footer Navigation */}
             <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-100">
               <button 
                 onClick={prevStep}
                 disabled={step === 1}
                 className="px-6 py-3 rounded-xl font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition disabled:opacity-0"
               >
                 Précédent
               </button>

               {step < 5 ? (
                 <button 
                   onClick={nextStep}
                   className="group px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition flex items-center gap-2"
                   style={{ background: BRAND }}
                 >
                   Suivant <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   disabled={loading || !formData.contractAccepted}
                   className="group px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                   style={{ background: BRAND }}
                 >
                   {loading && <Loader2 size={18} className="animate-spin" />}
                   {loading ? "Traitement..." : "Finaliser l'inscription"}
                 </button>
               )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
