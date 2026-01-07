import { useState, useRef } from 'react';
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
import Logo from '../components/Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const containerRef = useRef(null);
  
  // Parallax Effect for Background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const links = {
    collections: ["Nouveautés", "Streetwear", "Minimalist", "Accessoires", "Éditions Limitées"],
    aide: ["Centre d'aide", "Livraisons", "Retours", "Contact", "Suivi de commande"],
    legal: ["Confidentialité", "CGV", "Mentions Légales", "Cookies"],
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
        <h1 className="text-[150px] md:text-[300px] lg:text-[400px] font-black leading-none tracking-tighter opacity-[0.03]">LID</h1>
      </motion.div>

      {/* Floating Orbs/Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[128px] pointer-events-none animate-pulse" />
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
                className="w-full bg-transparent border-b border-neutral-700 py-4 pr-12 text-xl focus:outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
              <motion.button 
                whileHover={{ x: 5, color: "#f97316" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 transition-colors"
              >
                <ArrowRight size={24} />
              </motion.button>
              <motion.div 
                className="absolute bottom-0 left-0 h-[1px] bg-orange-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
             {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
               <motion.a 
                 key={i} 
                 href="#" 
                 whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "#f97316", borderColor: "#f97316", color: "#fff" }}
                 whileTap={{ scale: 0.95 }}
                 className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 transition-colors duration-300"
               >
                 <Icon size={20} strokeWidth={1.5} />
               </motion.a>
             ))}
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
              LID est une plateforme de commerce nouvelle génération. Nous curons le meilleur du design, de la mode et de la technologie.
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
                        key={item}
                        whileHover={{ x: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                     >
                       <a href="#" className="text-lg text-neutral-300 hover:text-white transition-colors block flex items-center group">
                         <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 text-orange-500 font-bold opacity-0 group-hover:opacity-100">/</span>
                         {item}
                       </a>
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
               <span className="text-neutral-400">Systems Normal</span>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               className="flex items-center gap-2 hover:text-white transition-colors"
             >
               <Globe size={16} />
               <span>FR (EUR)</span>
             </motion.button>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
}
