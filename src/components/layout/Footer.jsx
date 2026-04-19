import { useState, useRef, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '../Logo';
import { subscribeNewsletter } from '../../services/newsletterService';
import { useAppConfig } from '@/features/appConfig/useAppConfig.js';
import { useCatalogCategories } from '@/features/catalog/useCatalogCategories';

const sameFooterItems = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const other = right[index];
    return item?.name === other?.name && item?.path === other?.path;
  });
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const containerRef = useRef(null);
  const { data: appConfig } = useAppConfig();
  const { data: categoriesData } = useCatalogCategories();
  
  // Parallax Effect for Background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    const all = Array.isArray(categoriesData) ? categoriesData : [];
    const pick = (arr) =>
      arr
        .filter((c) => c && c.estActive !== false)
        .map((c) => ({
          name: `${c?.nom || ""}`.trim(),
          token: `${(c?.slug || c?.id || "")}`.trim(),
          niveau: `${c?.niveau || ""}`.trim(),
          ordre: Number(c?.ordre) || 0,
          dateCreation: c?.dateCreation || null
        }))
        .filter((c) => c.name && c.token);

    const subSub = pick(all).filter((c) => c.niveau === "SOUS_SOUS_CATEGORIE");
    const fallbackSubs = pick(all).filter((c) => c.niveau === "SOUS_CATEGORIE");

    const chosen = (subSub.length >= 4 ? subSub : subSub.concat(fallbackSubs))
      .sort((a, b) => {
        if (a.ordre !== b.ordre) return a.ordre - b.ordre;
        return a.name.localeCompare(b.name, "fr");
      })
      .slice(0, 4)
      .map((c) => ({
        name: c.name,
        path: `/shop?category=${encodeURIComponent(c.token)}&sort=featured`
      }));

    const items = chosen.filter((it) => it.name && it.path && !it.path.includes("category=&"));
    setFooterCategories((prev) => (sameFooterItems(prev, items) ? prev : items));
  }, [categoriesData]);

  const collectionsLinks = footerCategories.length > 0
    ? footerCategories
    : [
        { name: "Nouveautés", path: "/shop?sort=newest" },
        { name: "Boutique", path: "/shop" },
        { name: "Billetterie", path: "/tickets" },

      ];

  const links = {
    collections: collectionsLinks,
    aide: [
       { name: "Centre d'aide", path: "/help" },
       { name: "Livraisons", path: "/delivery" },
       { name: "Retours", path: "/returns" },
       { name: "Contact", path: "/contact" },
       { name: "Suivi de commande", path: "/tracking" },
     ],
    legal: [
      { name: "Confidentialité", path: "/privacy" },
      { name: "CGV", path: "/terms" },
      { name: "Mentions légales", path: "/help" },
      { name: "Cookies", path: "/privacy#cookies" },
    ],
  };

  const handleSubscribe = async () => {
    const value = (email || '').trim();
    if (!value || !value.includes('@')) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      await subscribeNewsletter(value);
      toast.success("Merci de votre inscription à la newsletter !");
      setEmail('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Impossible de s'inscrire à la newsletter.");
    }
  };

  const socialIconMap = {
    INSTAGRAM: Instagram,
    X: Twitter,
    TWITTER: Twitter,
    FACEBOOK: Facebook,
    LINKEDIN: Linkedin,
    WEBSITE: Globe
  };

  const socials = useMemo(() => {
    const raw = Array.isArray(appConfig?.socialLinks) ? appConfig.socialLinks : [];
    return raw
      .map((s) => ({
        platform: `${s?.platform || ''}`.trim().toUpperCase(),
        url: `${s?.url || ''}`.trim()
      }))
      .filter((s) => s.platform && s.url);
  }, [appConfig?.socialLinks]);

  const handleSocialClick = (e, platform) => {
    e.preventDefault();
    toast.info(`Le lien ${platform} n'est pas configuré`);
  };

  const handleLanguageClick = () => {
    toast.info("Le changement de langue sera bientôt disponible");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <footer ref={containerRef} className="w-full bg-neutral-950 text-white overflow-hidden relative">
      
      {/* Animated Background Decor */}
      <motion.div 
        style={{ y: springY, opacity }}
        className="absolute -top-12 -right-12 md:-top-24 md:-right-24 pointer-events-none select-none z-0"
      >
        <h1 className="text-[150px] md:text-[300px] lg:text-[400px] font-black leading-none tracking-tighter opacity-[0.03]" aria-hidden="true">LID</h1>
      </motion.div>

      {/* Floating Orbs/Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6aa200]/10 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1920px] mx-auto px-6 md:px-12 pt-24 pb-12 relative z-10"
      >
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <motion.div variants={itemVariants} className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="block overflow-hidden">
                <motion.span 
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="block"
                >
                  Rejoignez le mouvement.
                </motion.span>
              </span>
              <span className="block overflow-hidden text-neutral-500">
                <motion.span 
                  initial={{ y: "100%" }}
                  whileInView={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "circOut" }}
                  className="block"
                >
                  Ne manquez aucun drop.
                </motion.span>
              </span>
            </h2>
            
            {/* Input */}
            <motion.div variants={itemVariants} className="relative max-w-md group">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="w-full bg-transparent border-b border-neutral-700 py-4 pr-12 text-xl focus:outline-none focus:border-[#6aa200] transition-colors placeholder:text-neutral-600"
              />
              <motion.button 
                whileHover={{ x: 5, color: "#6aa200" }}
                onClick={handleSubscribe}
                aria-label="S'inscrire à la newsletter"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 transition-colors"
              >
                <ArrowRight size={24} />
              </motion.button>
              <motion.div 
                className="absolute bottom-0 left-0 h-[1px] bg-[#6aa200]"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
            {(socials.length
              ? socials
              : [
                  { platform: "INSTAGRAM", url: "" },
                  { platform: "X", url: "" },
                  { platform: "FACEBOOK", url: "" },
                  { platform: "LINKEDIN", url: "" }
                ]
            ).map(({ platform, url }, i) => {
              const Icon = socialIconMap[platform] || Globe;
              const label = platform === "X" ? "X" : platform.charAt(0) + platform.slice(1).toLowerCase();
              return (
                <motion.a
                  key={i}
                  href={url || "#"}
                  target={url ? "_blank" : undefined}
                  rel={url ? "noreferrer" : undefined}
                  onClick={url ? undefined : (e) => handleSocialClick(e, label)}
                  aria-label={`Suivez-nous sur ${label}`}
                  whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "#6aa200", borderColor: "#6aa200", color: "#fff" }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 transition-colors duration-300"
                >
                  <Icon size={20} strokeWidth={1.5} />
                </motion.a>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="w-full h-px bg-neutral-900 mb-20 overflow-hidden"
        >
          <motion.div 
             className="w-full h-full bg-neutral-800"
             initial={{ x: "-100%" }}
             whileInView={{ x: "0%" }}
             transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Main Grid Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          
          {/* Brand Info */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col justify-between h-full">
            <div className="mb-8">
               <Logo size="lg" />
            </div>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-sm">
              {`${appConfig?.slogan || ""}`.trim() || "LID est une plateforme de commerce nouvelle génération. Nous curons le meilleur du design, de la mode et de la technologie."}
            </p>
          </motion.div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
             {Object.entries(links).map(([category, items], colIndex) => (
               <motion.div 
                  key={category} 
                  variants={itemVariants}
                  custom={colIndex}
               >
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-8">{category}</h4>
                 <ul className="space-y-4">
                   {items.map((item) => (
                     <motion.li 
                        key={item.name}
                        whileHover={{ x: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                     >
                       <Link to={item.path} className="text-lg text-neutral-300 hover:text-white transition-colors block flex items-center group">
                         <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 text-[#6aa200] font-bold opacity-0 group-hover:opacity-100">/</span>
                         {item.name}
                       </Link>
                     </motion.li>
                   ))}
                 </ul>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-900 text-sm text-neutral-600"
        >
          <p>© 2025 LID. Tous droits réservés.</p>
          
          <div className="flex items-center gap-8 mt-4 md:mt-0">
             <div className="flex items-center gap-2">
               <div className="relative">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
               </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               onClick={handleLanguageClick}
               className="flex items-center gap-2 hover:text-white transition-colors"
             >
               <Globe size={16} />
               <span>FR (FCFA)</span>
             </motion.button>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}
