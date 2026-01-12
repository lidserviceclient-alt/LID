import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BackgroundLines } from "../components/textAnimat.jsx";
import ResetPasswordForm from "../components/ResetPasswordForm.jsx";
import { useNavigate } from "react-router-dom";
import { userManager } from "../../Config/auth.js"; // Import userManager

const avatars = [
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
];

const FloatingCard = ({ delay, className, icon: Icon, isCenter = false }) => (
  <motion.div
    initial={{ y: 0, rotate: isCenter ? 0 : (className.includes("-rotate-12") ? -12 : 12), rotateX: 0, rotateY: 0 }}
    animate={{ 
      y: [-10, 10, -10],
      rotate: isCenter ? 0 : (className.includes("-rotate-12") ? -12 : 12)
    }}
    whileHover={{ 
        scale: 1.1, 
        rotateX: isCenter ? 5 : 10, 
        rotateY: isCenter ? -5 : (className.includes("-rotate-12") ? -10 : 10),
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
    }}
    transition={{ 
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
        default: { type: "spring", stiffness: 300, damping: 20 }
    }}
    style={{ transformStyle: 'preserve-3d' }}
    className={`absolute rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10 ${className} ${isCenter ? 'bg-white shadow-white/20' : 'bg-neutral-900/80'}`}
  >
    <div style={{ transform: "translateZ(20px)" }}>
        {Icon ? (
          <Icon size={isCenter ? 48 : 32} className={isCenter ? "text-black" : "text-neutral-500"} />
        ) : (
           <div className={`w-12 h-12 rounded-full ${isCenter ? 'bg-black' : 'bg-neutral-800'}`} />
        )}
    </div>
  </motion.div>
);

const AnimatedBagIcon = ({ className, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M3 6h18"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M16 10a4 4 0 0 1-8 0"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
    />
  </svg>
);

const AnimatedCartIcon = ({ className, size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" 
       initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, duration: 0.5 }} />
    <motion.circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"
       initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, duration: 0.5 }} />
    <motion.path
      d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
  </svg>
);

const AnimatedStoreIcon = ({ className, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <motion.path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
    <motion.path d="M5 21v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ height: 0 }} animate={{ height: 7 }} transition={{ duration: 1, delay: 0.2 }} />
    <motion.path d="M19 21v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ height: 0 }} animate={{ height: 7 }} transition={{ duration: 1, delay: 0.2 }} />
    <motion.path d="M2 10l2-6h16l2 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} />
    <motion.path d="M12 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);


const TokenAvatar = ({ src, index }) => (
  <motion.div
    whileHover={{ 
      scale: 1.25, 
      zIndex: 50,
      rotateY: 25,
      rotateX: 10,
      boxShadow: "0 20px 30px -10px rgba(106, 162, 0, 0.5)"
    }}
    initial={{ rotateY: 0, rotateX: 0 }}
    style={{ transformStyle: 'preserve-3d' }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    className="relative w-10 h-10 rounded-full border-[3px] border-[#6aa200] shadow-[0_5px_15px_-5px_rgba(0,0,0,0.5)] bg-neutral-900 overflow-hidden cursor-pointer flex-shrink-0"
  >
     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10" />
     <img src={src} alt="User" className="w-full h-full object-cover relative z-0" />
     
     {/* Shine/Reflection */}
     <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent z-20"
        animate={{ x: ['-150%', '150%'] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.8, ease: "linear", repeatDelay: 1 }}
     />
  </motion.div>
);

const MotionLink = motion(Link);

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    // Fallback: Si reCAPTCHA n'est pas chargé, on laisse passer
    if (!window.grecaptcha) {
      console.warn("reCAPTCHA not loaded, skipping verification.");
      userManager.signinRedirect();
      return;
    }

    try {
      // Attendre que reCAPTCHA soit prêt
      await new Promise(resolve => window.grecaptcha.enterprise.ready(resolve));
      
      // Obtenir le token
      const token = await window.grecaptcha.enterprise.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY, 
        { action: 'LOGIN' }
      );
      
      console.log("Token reCAPTCHA généré:", token);

      // NOTE IMPORTANTE : La vérification du token (Assessment) via l'API Google Cloud
      // ne peut PAS être faite directement depuis le navigateur à cause des restrictions de sécurité (CORS).
      // Elle doit être faite depuis votre BACKEND (serveur Node.js, Python, PHP, etc.).
      
      // Simulation de la vérification (On considère que c'est bon pour le frontend)
      // Une fois le backend prêt, vous enverrez ce token à votre API :
      // await api.post('/verify-recaptcha', { token });

      // On procède à la connexion
      userManager.signinRedirect();

      /* CODE CÔTÉ SERVEUR (BACKEND) REQUIS POUR CECI :
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      ... fetch(...) 
      */

    } catch (error) {
      console.error("Erreur reCAPTCHA:", error);
      // Fallback en cas d'erreur technique (ex: API injoignable)
      console.warn("Erreur technique reCAPTCHA, connexion autorisée.");
      userManager.signinRedirect();
    }
  };

  return (
    <div className="relative h-screen w-screen bg-neutral-950 text-white flex lg:flex-row overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Left Side - Hero/Branding */}
      <div className="absolute inset-0 z-0 w-full h-full lg:static lg:z-auto lg:w-1/2 lg:h-auto flex flex-col justify-center items-center lg:p-12 bg-neutral-950 lg:border-r border-neutral-800 overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 lg:opacity-50 mix-blend-screen pointer-events-none"
        >
          <source src="/videos/video-og.mp4" type="video/mp4" />
        </video>

        {/* Spotlight Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-800/40 via-yellow-950/0 to-neutral-950/0 pointer-events-none" />
        
        {/* Content Container - Hidden on Mobile */}
        <div className="hidden lg:flex flex-col items-center w-full h-full justify-center relative z-10">
            {/* Top Section: 3 Floating Cards */}
            <div className="relative w-full max-w-[500px] h-[350px] flex justify-center items-center scale-100 mb-12" style={{ perspective: "1200px" }}>
                {/* Left Card - Product/Tag */}
                <FloatingCard 
                  delay={0} 
                  className="w-40 h-40 z-10 -left-[40px] top-15 -rotate-12 bg-neutral-900 border-neutral-800" 
                  icon={({ className, size }) => <AnimatedBagIcon className={className} size={size} />}
                />
                {/* Right Card - Cart/Transaction */}
                <FloatingCard 
                  delay={2} 
                  className="w-40 h-40 z-10 -right-[40px] top-15 rotate-12 bg-neutral-900 border-neutral-800" 
                  icon={({ className, size }) => <AnimatedCartIcon className={className} size={size} />}
                />
                {/* Center Card (Main) - Marketplace/Store */}
                <FloatingCard 
                  delay={1} 
                  isCenter={true}
                  className="w-48 h-48 z-20 left-[calc(50%-100px)] top-0 -translate-x-1/2" 
                  icon={({ className, size }) => <AnimatedStoreIcon className={className} size={size} />}
                />
            </div>

            {/* Text Content */}
            <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center">
              <h1 className="text-5xl font-bold text-white mb-12 leading-tight tracking-tight">
                Nous vous donnons <br />
                <span className="text-neutral-500">
                  une raison de plus d'etre notre partenaire ?
                </span>
              </h1>
              
              <div className="flex flex-row items-center justify-between gap-1 w-full px-4 mb-16">
                  {/* Left Text Paragraph */}
                  <p className="text-neutral-100 text-left text-sm leading-relaxed max-w-[320px]">
                    Cada dia mais pessoas comuns estão mudando de vida ao aprender como investir do jeito certo. Não fique só olhando de fora.
                  </p>

                  {/* Right Social Proof Pill */}
                  <div className="flex items-center gap-3 bg-white border border-neutral-800 rounded-full py-2 pl-2 pr-5 shadow-lg">
                     <div className="flex -space-x-3" style={{ perspective: "1000px" }}>
                        {avatars.slice(0, 3).map((avatar, i) => (
                            <TokenAvatar key={i} src={avatar} index={i} />
                        ))}
                     </div>
                     <span className="text-black text-xs font-medium whitespace-nowrap">+500 partenaires</span>
                  </div>
              </div>
              
              {/* CTA Button */}
              <MotionLink 
                to="/seller-join" 
                className="group relative inline-flex items-center justify-center gap-3 bg-[#E3B576] text-black font-semibold text-lg py-4 px-8 rounded-full shadow-xl shadow-orange-500/20 w-full max-w-md overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: 1, 
                    y: 0,
                    boxShadow: ["0px 10px 15px -3px rgba(227, 181, 118, 0.1)", "0px 20px 25px -5px rgba(227, 181, 118, 0.3)", "0px 10px 15px -3px rgba(227, 181, 118, 0.1)"]
                }}
                transition={{ 
                    duration: 0.5,
                    boxShadow: {
                        duration: 3, 
                        repeat: Infinity, 
                        repeatType: "reverse"
                    }
                }}
              >
                 <motion.div 
                    className="absolute inset-0 bg-white/30 translate-x-[-100%] skew-x-12 group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" 
                 />
                 <span className="relative z-10">Poursuivez votre aventure !</span>
                 <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </MotionLink>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <BackgroundLines 
        className="relative z-10 w-full min-h-screen lg:w-1/2 lg:h-auto flex flex-col items-center justify-center p-4 md:p-6 !bg-black/60 lg:!bg-neutral-950 backdrop-blur-sm lg:backdrop-blur-none" 
        svgOptions={{ duration: 10 }}
      >
        {/* Mobile Gradient */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#E3B576]/10 blur-[100px] rounded-full pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-6 lg:space-y-8 relative z-10 scale-100 origin-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 lg:space-y-8"
          >
            <div className="text-center ">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                Bienvenue
              </h2>
              <p className="text-neutral-400 text-sm md:text-base">
                Connectez-vous ou inscrivez-vous pour continuer.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="">
              <button 
                type="button"
                onClick={() => userManager.signinRedirect()}
                className="flex w-full items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl py-3 px-4 transition-all shadow-sm group"
              >
                <GoogleIcon />
                <span className="text-neutral-300 text-sm font-medium group-hover:text-white transition-colors">Continuer avec Google</span>
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-neutral-500">
                Vous souhaitez vendre sur LID ?{" "}
              </span>
              <button 
                onClick={() => navigate("/seller-join")}
                className="gold-text text-[#E3B576] font-medium hover:underline"
              >
                Devenez partenaire
              </button>
            </div>
          </motion.div>
        </div>
          
          <div className="mt-8 text-center">
              <Link to="/" className="text-xs text-neutral-600 hover:text-white transition-colors flex items-center justify-center gap-1 z-50 relative">
                 <ArrowRight size={12} className="rotate-180" /> Retour à l'accueil
              </Link>
          </div>
      </BackgroundLines>
    </div>
  );
}
