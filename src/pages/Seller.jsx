import { useState, useRef, useEffect, useCallback } from "react";
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
import { isAuthenticated, getCurrentUserPayload, logout, getUserProfile, refreshSession, loginPartnerLocal, storeAccessToken } from "@/services/authService";
import { uploadFile } from "@/services/fileStorageService";
import { getPartnerRegistrationAggregate, upgradeToPartner, registerPartnerStep1, registerPartnerStep2, registerPartnerStep3, registerPartnerStep4 } from "@/services/partnerService";
import { getCatalogCategories } from "@/services/categoryService";
import ResetPasswordForm from "@/components/ResetPasswordForm";

const BRAND = "#6aa200";
const cx = (...c) => c.filter(Boolean).join(" ");
const normalizePartnerStatus = (status) => `${status || ""}`.trim().toUpperCase();
const RESUME_STEP_BY_STATUS = {
  STEP_1_PENDING: 2,
  STEP_2_PENDING: 3,
  STEP_3_PENDING: 4,
  STEP_4_PENDING: 4,
  UNDER_REVIEW: 4,
  REJECTED: 4,
};
const STATUS_LABELS = {
  STEP_1_PENDING: "Étape 1 complétée",
  STEP_2_PENDING: "Étape 2 complétée",
  STEP_3_PENDING: "Étape 3 complétée",
  STEP_4_PENDING: "Dossier finalisé",
  UNDER_REVIEW: "Dossier en cours d'analyse",
  VERIFIED: "Compte vérifié",
  REJECTED: "Dossier rejeté",
};
const isLockedPartnerStatus = (status) => ["STEP_4_PENDING", "UNDER_REVIEW", "VERIFIED"].includes(normalizePartnerStatus(status));
const buildCdnPreviewUrl = (cdnBaseUrl, path) => {
  const base = `${cdnBaseUrl || ""}`.trim().replace(/\/+$/, "");
  const objectPath = `${path || ""}`.trim().replace(/^\/+/, "");
  if (!base || !objectPath) return "";
  return `${base}/${objectPath}`;
};

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
    4: "https://images.pexels.com/photos/48148/document-agreement-documents-sign-48148.jpeg", // Contrat
  };

  const texts = {
    1: { k: "Étape 1/4", t: "Création du Compte", d: "Commençons par vos informations personnelles." },
    2: { k: "Étape 2/4", t: "Votre Entreprise", d: "Dites-nous en plus sur votre structure." },
    3: { k: "Étape 3/4", t: "Image de Marque", d: "Logo, bannière et identité visuelle." },
    4: { k: "Étape 4/4", t: "Contrat & Validation", d: "Signature électronique et validation." },
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
    { n: 4, label: "Contrat" },
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

  const displayName = `${value?.name || value?.path || ""}`.split("/").filter(Boolean).pop() || "";

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
             <div className="text-sm font-bold text-[#6aa200]">{displayName}</div>
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
  const [stepLoading, setStepLoading] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // signup | login
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [partnerLoginOnly, setPartnerLoginOnly] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  const isAuth = isAuthenticated();
  const currentUser = getCurrentUserPayload();
  const currentUserId = `${currentUser?.sub || ""}`.trim();
  const currentUserFirstName = `${currentUser?.firstName || ""}`.trim();
  const currentUserLastName = `${currentUser?.lastName || ""}`.trim();
  const currentUserEmail = `${currentUser?.email || ""}`.trim();
  const lastProfileFetchRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // 1. Compte
    firstName: "", lastName: "", email: "", phone: "", password: "",
    // 2. Entreprise
    storeName: "", mainCategoryId: "", description: "",
    address: "", city: "", region: "Côte d'Ivoire",
    // 3. Branding
    logo: null, banner: null,
    // 4. Contrat
    contractAccepted: false
  });

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const categories = await getCatalogCategories();
        if (cancelled) return;
        const mains = (Array.isArray(categories) ? categories : [])
          .filter((c) => !c?.parentId && !c?.parent_id)
          .map((c) => ({
            id: `${c?.id ?? ""}`.trim(),
            label: `${c?.nom || c?.name || ""}`.trim(),
          }))
          .filter((c) => c.id && c.label);
        setCategoryOptions(mains);
      } catch (_error) {
        if (!cancelled) {
          setCategoryOptions([]);
        }
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!categoryOptions.length) return;
    setFormData((prev) => {
      const currentId = `${prev.mainCategoryId || ""}`.trim();
      if (currentId && categoryOptions.some((c) => c.id === currentId)) {
        return prev;
      }
      return { ...prev, mainCategoryId: categoryOptions[0].id };
    });
  }, [categoryOptions]);

  const isPartner = Array.isArray(currentUser?.roles) && 
    currentUser.roles.some(r => r === "PARTNER" || r === "ROLE_PARTNER");

  const handleUploadedAsset = async (field, file) => {
    if (!file) return;
    const upload = await uploadFile(file, { folder: "partners" });
    const path = `${upload?.path || ""}`.trim();
    const previewUrl = buildCdnPreviewUrl(upload?.cdnBaseUrl, path) || `${upload?.url || ""}`.trim();
    if (!path || !previewUrl) {
      throw new Error("Réponse d'upload invalide.");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: {
        name: file.name,
        path,
        previewUrl,
        objectKey: upload?.objectKey || path,
      },
    }));
  };

  const applyPartnerDataToForm = useCallback((profile, aggregate) => {
    const step1 = aggregate?.step1 || {};
    const step2 = aggregate?.step2 || {};
    const step4 = aggregate?.step4 || {};
    const shop = profile?.shop || {};

    setFormData((prev) => ({
      ...prev,
      firstName: step1.firstName || profile?.firstName || currentUserFirstName || prev.firstName,
      lastName: step1.lastName || profile?.lastName || currentUserLastName || prev.lastName,
      email: step1.email || profile?.email || currentUserEmail || prev.email,
      phone: step1.phoneNumber || profile?.phoneNumber || prev.phone,
      storeName: step2.shopName || shop.shopName || prev.storeName,
      mainCategoryId: `${step2.mainCategoryId || shop.mainCategoryId || prev.mainCategoryId || categoryOptions[0]?.id || ""}`,
      description: step2.description || step2.shopDescription || shop.shopDescription || prev.description,
      address: step2.headOfficeAddress || profile?.headOfficeAddress || prev.address,
      city: step2.city || profile?.city || prev.city,
      region: step2.country || profile?.country || prev.region,
      contractAccepted: Boolean(step4.contractAccepted ?? profile?.contractAccepted ?? prev.contractAccepted),
      logo: prev.logo,
      banner: prev.banner,
    }));
  }, [categoryOptions, currentUserEmail, currentUserFirstName, currentUserLastName]);

  const resolvePartnerRoute = (status, aggregate) => {
    const normalizedStatus = normalizePartnerStatus(status || aggregate?.currentStatus);
    setPartnerStatus(normalizedStatus);

    if (normalizedStatus === "VERIFIED") {
      navigate("/sel-off/dashboard", { replace: true });
      return true;
    }

    const nextStep = Number(aggregate?.nextStep);
    if (Number.isFinite(nextStep) && nextStep >= 1 && nextStep <= 4) {
      setStep(nextStep);
      return false;
    }

    const resumedStep = RESUME_STEP_BY_STATUS[normalizedStatus];
    if (resumedStep) {
      setStep(resumedStep);
      return false;
    }

    return false;
  };

  useEffect(() => {
    setPartnerLoginOnly(false);
  }, [isAuth, isPartner]);

  useEffect(() => {
    if (!isAuth || !currentUserId) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: currentUserFirstName || prev.firstName,
      lastName: currentUserLastName || prev.lastName,
      email: currentUserEmail || prev.email
    }));

    if (lastProfileFetchRef.current === currentUserId) {
      return;
    }
    lastProfileFetchRef.current = currentUserId;

    let cancelled = false;
    const hydratePartnerState = async () => {
      try {
        const profile = await getUserProfile(currentUserId);
        if (cancelled) return;

        const normalizedStatus = normalizePartnerStatus(profile?.registrationStatus);
        if (!normalizedStatus) {
          const phone = `${profile?.phoneNumber || ""}`.trim();
          if (!phone) return;
          setFormData((prev) => ({ ...prev, phone: prev.phone || phone }));
          return;
        }

        let aggregate = null;
        if (normalizedStatus !== "STEP_1_PENDING") {
          try {
            aggregate = await getPartnerRegistrationAggregate();
          } catch (_error) {
            aggregate = null;
          }
          if (cancelled) return;
        }

        applyPartnerDataToForm(profile, aggregate);
        resolvePartnerRoute(normalizedStatus, aggregate);
      } catch (_error) {}
    };

    hydratePartnerState();

    return () => {
      cancelled = true;
    };
  }, [isAuth, currentUserId, currentUserFirstName, currentUserLastName, currentUserEmail]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCategoryLabel = (() => {
    const raw = `${formData.mainCategoryId || ""}`.trim();
    if (!raw) return "";
    const match = categoryOptions.find((c) => `${c.id}` === raw);
    return `${match?.label || ""}`.trim();
  })();

  const validateStep = (stepToValidate) => {
    if (stepToValidate === 1) {
      if (isAuth) return null;
      const email = `${formData.email || ""}`.trim();
      const password = `${formData.password || ""}`.trim();
      if (!email) return "Veuillez renseigner votre email.";
      if (!email.includes("@")) return "Veuillez renseigner un email valide.";
      if (!password) return "Veuillez renseigner votre mot de passe.";
      if (authMode === "login") return null;
      const firstName = `${formData.firstName || ""}`.trim();
      const lastName = `${formData.lastName || ""}`.trim();
      const phone = `${formData.phone || ""}`.trim();
      if (!firstName) return "Veuillez renseigner votre prénom.";
      if (!lastName) return "Veuillez renseigner votre nom.";
      if (!phone) return "Veuillez renseigner votre numéro de téléphone.";
      if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
      return null;
    }

    if (stepToValidate === 2) {
      const storeName = `${formData.storeName || ""}`.trim();
      const categoryId = `${formData.mainCategoryId || ""}`.trim();
      const description = `${formData.description || ""}`.trim();
      const address = `${formData.address || ""}`.trim();
      const city = `${formData.city || ""}`.trim();
      const country = `${formData.region || ""}`.trim();
      if (!storeName) return "Veuillez renseigner le nom de la boutique.";
      if (!categoryId) return "Veuillez choisir une catégorie.";
      if (!description || description.length < 10) return "Veuillez renseigner une description (au moins 10 caractères).";
      if (!address) return "Veuillez renseigner l'adresse du siège social.";
      if (!city) return "Veuillez renseigner la ville.";
      if (!country) return "Veuillez renseigner le pays.";
      return null;
    }

    if (stepToValidate === 3) {
      return null;
    }

    if (stepToValidate === 4) {
      if (!formData.contractAccepted) return "Veuillez accepter le contrat pour finaliser.";
      return null;
    }

    return null;
  };

  const goPrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const goNext = async () => {
    if (!isAuth && step === 1 && authMode === "login" && showResetPassword) {
      return;
    }
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    if (stepLoading) return;

    setStepLoading(true);
    try {
      if (step === 1) {
        if (isAuth) {
          if (isPartner) {
            const profile = await getUserProfile(currentUserId);
            const aggregate = normalizePartnerStatus(profile?.registrationStatus) !== "STEP_1_PENDING"
              ? await getPartnerRegistrationAggregate().catch(() => null)
              : null;
            applyPartnerDataToForm(profile, aggregate);
            const redirected = resolvePartnerRoute(profile?.registrationStatus, aggregate);
            if (!redirected) {
              toast.success("Inscription partenaire retrouvée.");
            }
            return;
          }
          const upgraded = await upgradeToPartner({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phone,
            password: formData.password || null
          });
          if (upgraded?.accessToken) {
            storeAccessToken(upgraded.accessToken);
          } else {
            const refreshed = await refreshSession();
            if (!refreshed) {
              throw new Error("Session invalide. Veuillez vous reconnecter.");
            }
          }
          setStep(2);
          return;
        }

        if (authMode === "login") {
          await loginPartnerLocal({ email: formData.email, password: formData.password });
          const loggedPayload = getCurrentUserPayload();
          const profile = await getUserProfile(loggedPayload?.sub);
          const normalizedStatus = normalizePartnerStatus(profile?.registrationStatus);
          const aggregate = normalizedStatus && normalizedStatus !== "STEP_1_PENDING"
            ? await getPartnerRegistrationAggregate().catch(() => null)
            : null;
          applyPartnerDataToForm(profile, aggregate);
          const redirected = resolvePartnerRoute(profile?.registrationStatus, aggregate);
          if (!redirected) {
            toast.success("Connexion réussie.");
          }
          return;
        }

        const created = await registerPartnerStep1({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password
        });
        if (created?.accessToken) {
          storeAccessToken(created.accessToken);
          setStep(2);
          return;
        }
        throw new Error("Création du compte impossible.");
      }

      if (step === 2) {
        const mainCategoryId = Number(formData.mainCategoryId);
        await registerPartnerStep2({
          shopName: formData.storeName,
          mainCategoryId: Number.isFinite(mainCategoryId) ? mainCategoryId : null,
          shopDescription: formData.description,
          description: formData.description,
          headOfficeAddress: formData.address,
          city: formData.city,
          country: formData.region
        });
        setStep(3);
        return;
      }

      if (step === 3) {
        await registerPartnerStep3({
          logoUrl: formData.logo?.path || null,
          bannerUrl: formData.banner?.path || null,
          businessRegistrationDocumentUrl: null
        });
        setStep(4);
        return;
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        setShowResetPassword(false);
        setAuthMode("login");
        toast.error("Cet email existe déjà. Connectez-vous pour continuer.");
        return;
      }
      toast.error(error?.response?.data?.message || error?.message || "Une erreur est survenue.");
    } finally {
      setStepLoading(false);
    }
  };

  const finalizeRegistration = async () => {
    const error = validateStep(4);
    if (error) {
      toast.error(error);
      return;
    }
    if (stepLoading) return;
    if (isLockedPartnerStatus(partnerStatus)) return;
    setStepLoading(true);
    try {
      const response = await registerPartnerStep4({ contractAccepted: true });
      const normalizedStatus = normalizePartnerStatus(response?.registrationStatus);
      setPartnerStatus(normalizedStatus);

      if (normalizedStatus === "VERIFIED") {
        toast.success("Félicitations ! Votre compte partenaire est validé.");
        window.location.href = "/sel-off";
        return;
      }

      toast.success("Votre dossier partenaire a bien été transmis.");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Une erreur est survenue.");
    } finally {
      setStepLoading(false);
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setAuthMode("login");
                        setStep(1);
                        navigate('/login')
                      }}
                      className="text-sm font-bold text-[#6aa200] hover:underline"
                    >
                      Se connecter
                    </button>
                 </div>
               )}
               <span className="text-xl font-black tracking-tighter">
                <img src="/imgs/favicon.ico" width={40} alt="logo lid" />
               </span>
            </div>
          </div>

          {!partnerLoginOnly ? <TopHero step={step} /> : null}

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-neutral-200/40 relative">
             
             {!partnerLoginOnly ? (
               <div className="mb-10 mt-2">
                 <ProgressSteps step={step} setStep={setStep} />
               </div>
             ) : null}

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
                                    <img src={currentUser.avatarUrl} alt="Avatar client" className="w-full h-full object-cover" />
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
                                 <span className="text-xs font-bold text-[#6aa200] uppercase tracking-wide">
                                   {STATUS_LABELS[normalizePartnerStatus(partnerStatus)] || "Compte authentifié"}
                                 </span>
                              </div>

                              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed mb-6">
                                 {isPartner 
                                   ? normalizePartnerStatus(partnerStatus) === "VERIFIED"
                                     ? "Vous êtes déjà enregistré comme partenaire. Accédez à votre espace de gestion pour piloter votre activité."
                                     : "Votre inscription partenaire est en cours. Reprenez le parcours à l'étape correspondante."
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
                              <div className="flex flex-col sm:flex-row items-center gap-4 w-full mx-auto">
                                {isPartner && normalizePartnerStatus(partnerStatus) === "VERIFIED" ? (
                                  <button
                                    onClick={() => navigate("/sel-off/dashboard")}
                                    className="flex-1 w-full bg-[#6aa200] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center whitespace-nowrap gap-2"
                                  >
                                    Accéder à mon tableau de bord <Briefcase size={18} />
                                  </button>
                                ) : null}
                                <button 
                                  onClick={async () => {
                                    await logout();
                                    window.location.reload();
                                  }}
                                  className="px-6 py-3.5 rounded-xl font-bold text-neutral-500 hover:text-red-500 hover:bg-red-50 whitespace-nowrap transition flex items-center gap-2"
                                >
                                  <LogOut size={18} /> Changer de compte
                                </button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        /* Guest View */
                        <>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowResetPassword(false);
                                setAuthMode("signup");
                              }}
                              className={cx(
                                "px-4 py-2 rounded-full text-xs font-bold transition border",
                                authMode === "signup"
                                  ? "bg-[#6aa200] text-white border-[#6aa200]"
                                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                              )}
                            >
                              Créer un compte
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowResetPassword(false);
                                setAuthMode("login");
                              }}
                              className={cx(
                                "px-4 py-2 rounded-full text-xs font-bold transition border",
                                authMode === "login"
                                  ? "bg-[#6aa200] text-white border-[#6aa200]"
                                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                              )}
                            >
                              Se connecter
                            </button>
                          </div>

                          {authMode === "signup" ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field 
                                  label="Prénom" 
                                  icon={User} 
                                  placeholder="Jean" 
                                  value={formData.firstName} 
                                  onChange={e => handleChange("firstName", e.target.value)} 
                                />
                                <Field 
                                  label="Nom" 
                                  placeholder="Koffi" 
                                  value={formData.lastName} 
                                  onChange={e => handleChange("lastName", e.target.value)} 
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field 
                                  label="Email Professionnel" 
                                  icon={Mail} 
                                  type="email" 
                                  placeholder="jean@mail.com" 
                                  value={formData.email} 
                                  onChange={e => handleChange("email", e.target.value)}
                                />
                                <Field 
                                  label="Téléphone Mobile" 
                                  icon={Phone} 
                                  placeholder="+225 77 000 00 00" 
                                  value={formData.phone} 
                                  onChange={e => handleChange("phone", e.target.value)} 
                                />
                              </div>
                              <Field label="Mot de passe" icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={e => handleChange("password", e.target.value)} />
                            </>
                          ) : (
                            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#152600] p-6 md:p-8">
                              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#6aa200]/25 blur-3xl" />
                              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                                <div className="text-white">
                                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase">
                                    <span className="h-2 w-2 rounded-full bg-[#6aa200]" />
                                    Connexion partenaire
                                  </div>
                                  <h3 className="text-2xl md:text-3xl font-black tracking-tight mt-4">
                                    Reprenez votre inscription, sans friction
                                  </h3>
                                  <p className="text-sm md:text-base text-white/70 mt-3 leading-relaxed">
                                    Connectez-vous pour continuer l’étape suivante et accéder à votre espace vendeur une fois validé.
                                  </p>

                                  <div className="mt-6 space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 h-5 w-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                        <Check size={14} className="text-[#6aa200]" />
                                      </div>
                                      <div className="text-white/80">Accès sécurisé à votre dossier partenaire</div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 h-5 w-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                        <Check size={14} className="text-[#6aa200]" />
                                      </div>
                                      <div className="text-white/80">Récupération de mot de passe en 3 étapes</div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 h-5 w-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                        <Check size={14} className="text-[#6aa200]" />
                                      </div>
                                      <div className="text-white/80">Validation avant passage à l’étape suivante</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-2xl bg-white/10 border border-white/10 p-5 md:p-6">
                                  <AnimatePresence mode="wait">
                                    {showResetPassword ? (
                                      <ResetPasswordForm
                                        key="reset"
                                        initialEmail={formData.email}
                                        onBack={() => setShowResetPassword(false)}
                                      />
                                    ) : (
                                      <motion.div
                                        key="login"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                      >
                                        <div className="space-y-2">
                                          <label className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1">Email</label>
                                          <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                                              <Mail size={16} />
                                            </div>
                                            <input
                                              type="email"
                                              placeholder="vous@mail.com"
                                              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6aa200]/20 focus:border-[#6aa200]/60 transition-all text-sm text-white placeholder:text-white/40"
                                              value={formData.email}
                                              onChange={(e) => handleChange("email", e.target.value)}
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1">Mot de passe</label>
                                          <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                                              <Lock size={16} />
                                            </div>
                                            <input
                                              type="password"
                                              placeholder="••••••••"
                                              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6aa200]/20 focus:border-[#6aa200]/60 transition-all text-sm text-white placeholder:text-white/40"
                                              value={formData.password}
                                              onChange={(e) => handleChange("password", e.target.value)}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <button
                                            type="button"
                                            onClick={() => setShowResetPassword(true)}
                                            className="text-xs font-bold text-white/80 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white transition"
                                          >
                                            Mot de passe oublié ?
                                          </button>
                                          <div className="text-[11px] text-white/60 font-medium">
                                            Connexion locale partenaire
                                          </div>
                                        </div>

                                        <div className="bg-white/10 text-white/80 p-4 rounded-2xl text-xs flex gap-3 leading-relaxed border border-white/10">
                                          <AlertCircle size={18} className="shrink-0 mt-0.5 text-white/70" />
                                          Connectez-vous ici pour reprendre votre inscription partenaire.
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                          )}
                           {authMode === "signup" ? (
                             <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-xs flex gap-3 leading-relaxed">
                               <AlertCircle size={18} className="shrink-0 mt-0.5" />
                               Ces informations serviront à vous connecter à votre espace vendeur et à sécuriser votre compte.
                             </div>
                           ) : null}
                        </>
                     )}
                   </motion.div>
                 )}

                 {/* STEP 2: ENTREPRISE */}
                 {step === 2 && (
                   <motion.div key="step2" {...stepAnim} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <Field label="Nom de la Boutique" icon={Store} placeholder="Ex: Babi Shop" value={formData.storeName} onChange={e => handleChange("storeName", e.target.value)} />
                       <div className="space-y-1.5">
                         <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Type de boutique</label>
                         <select 
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/10 transition-all"
                            value={formData.mainCategoryId}
                            onChange={e => handleChange("mainCategoryId", e.target.value)}
                         >
                          {categoryOptions.map((c) => (
                            <option key={c.id} value={`${c.id}`}>
                              {c.label}
                            </option>
                          ))}
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
                       <Field label="Ville" placeholder="Dakar" value={formData.city} onChange={e => handleChange("city", e.target.value)} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Pays</label>
                        <select
                          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#6aa200] focus:ring-4 focus:ring-[#6aa200]/10 transition-all"
                          value={formData.region}
                          onChange={e => handleChange("region", e.target.value)}
                        >
                          <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 ml-1">Code</label>
                        <input
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none"
                          value="CI"
                          disabled
                        />
                      </div>
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
                          onChange={async (file) => {
                            try {
                              await handleUploadedAsset("logo", file);
                              toast.success("Logo uploadé.");
                            } catch (error) {
                              toast.error(error?.response?.data?.message || error?.message || "Upload du logo impossible.");
                            }
                          }}
                        />
                        <FileUploadZone 
                          label="Bannière de couverture (Paysage)" 
                          accept="image/*" 
                          value={formData.banner}
                          onChange={async (file) => {
                            try {
                              await handleUploadedAsset("banner", file);
                              toast.success("Bannière uploadée.");
                            } catch (error) {
                              toast.error(error?.response?.data?.message || error?.message || "Upload de la bannière impossible.");
                            }
                          }}
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
                             <img src={formData.banner.previewUrl} alt="Banner" className="w-full h-full object-cover" />
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
                                     <img src={formData.logo.previewUrl} alt="Logo" className="w-full h-full object-cover" />
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
                                     {selectedCategoryLabel || "Catégorie"}
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

                 {/* STEP 4: CONTRAT */}
                 {step === 4 && (
                   <motion.div key="step4" {...stepAnim} className="space-y-8">
                     {normalizePartnerStatus(partnerStatus) === "UNDER_REVIEW" ? (
                       <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex gap-3">
                         <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                         Votre dossier est en cours d'analyse. Vous ne pouvez plus le modifier pour le moment.
                       </div>
                     ) : null}
                     {normalizePartnerStatus(partnerStatus) === "STEP_4_PENDING" ? (
                       <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-3">
                         <AlertCircle size={18} className="shrink-0 mt-0.5" />
                         Votre dossier a été finalisé. La vérification est encore en attente.
                       </div>
                     ) : null}
                     {normalizePartnerStatus(partnerStatus) === "REJECTED" ? (
                       <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex gap-3">
                         <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                         Votre précédent dossier a été rejeté. Vérifiez les informations puis soumettez à nouveau.
                       </div>
                     ) : null}
                     <div className="space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="h-8 w-8 rounded-full bg-[#6aa200] text-white flex items-center justify-center font-bold text-sm">1</div>
                         <h3 className="font-bold text-lg">Contrat de Partenariat</h3>
                       </div>
                       <PDFContractViewer accepted={formData.contractAccepted} onAccept={v => handleChange("contractAccepted", v)} />
                     </div>
                   </motion.div>
                 )}

               </AnimatePresence>
             </div>

             {/* Footer Navigation */}
             <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-100">
               <button 
                 onClick={goPrev}
                 disabled={step === 1 || stepLoading}
                 className="px-6 py-3 rounded-xl font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition disabled:opacity-0"
               >
                 Précédent
               </button>

               {step < 4 ? (
                 <button 
                   onClick={goNext}
                  disabled={stepLoading || (!isAuth && step === 1 && authMode === "login" && showResetPassword)}
                   className="group px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                   style={{ background: BRAND }}
                 >
                   {stepLoading && <Loader2 size={18} className="animate-spin" />}
                   Suivant <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                 </button>
                  ) : (
                    <button
                      onClick={finalizeRegistration}
                      disabled={stepLoading || !formData.contractAccepted || isLockedPartnerStatus(partnerStatus)}
                      className="group px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-[#6aa200]/30 hover:shadow-xl hover:shadow-[#6aa200]/40 hover:-translate-y-0.5 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ background: BRAND }}
                    >
                      {stepLoading && <Loader2 size={18} className="animate-spin" />}
                      {stepLoading ? "Traitement..." : isLockedPartnerStatus(partnerStatus) ? "Dossier en traitement" : "Finaliser l'inscription"}
                    </button>
                  )}
                </div>

          </div>
        </div>
      </div>
    </div>
  );
}
