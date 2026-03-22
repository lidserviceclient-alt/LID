import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ContainerTextFlip } from './textAnimat.jsx';
import { useNavigate } from 'react-router-dom';
import { HERO_PRODUCTS } from '@/assets/data/heroProducts';

const users = [
  "https://i.pinimg.com/736x/db/2b/8b/db2b8bb42bb8494e4640759c66914915.jpg",
  "https://i.pinimg.com/1200x/b3/a6/55/b3a655c44b783f5e3e3a2ff77576745a.jpg",
  "https://i.pinimg.com/1200x/b2/ca/eb/b2caeb3b429b486bd1ee32a5ef1bb18e.jpg",
  "https://i.pinimg.com/1200x/b8/e3/0c/b8e30c0bd21299e768d315448e6d60a0.jpg"
];

const MarqueeRow = ({ items, direction = "left", speed = 10, enableMotion = true }) => {
  if (!items || items.length === 0) return null;
  if (!enableMotion) {
    return (
      <div className="flex overflow-hidden relative z-0 py-4">
        <div className="flex gap-4 flex-shrink-0 px-2">
          {items.map((product, i) => {
            const hasImage = Boolean(product?.img);
            const src = hasImage ? product.img : "/imgs/logo.png";
            const imgClass = hasImage
              ? "w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
              : "w-full h-full object-contain opacity-30 p-10 transition-all duration-700 ease-out";

            return (
              <div key={i} className="relative group w-[280px] sm:w-[350px] aspect-[4/5] flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 shadow-sm border border-neutral-200/50">
                <img
                  src={src}
                  alt={product.name}
                  width="100%"
                  height="100%"
                  loading={i < 4 ? "eager" : "lazy"}
                  fetchPriority={i < 4 ? "high" : "auto"}
                  className={imgClass}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/imgs/logo.png";
                    e.currentTarget.className = "w-full h-full object-contain opacity-30 p-10 transition-all duration-700 ease-out";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                  <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                  </div>
                  <h3 className="text-neutral-900 text-2xl font-black italic uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-500">{product.name}</h3>
                  <p className="text-neutral-600 font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">{product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="flex overflow-hidden relative z-0 py-4">
      <motion.div
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex gap-4 flex-shrink-0 px-2"
      >
        {[...items, ...items].map((product, i) => {
          const hasImage = Boolean(product?.img);
          const src = hasImage ? product.img : "/imgs/logo.png";
          const imgClass = hasImage
            ? "w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
            : "w-full h-full object-contain opacity-30 p-10 transition-all duration-700 ease-out";

          return (
            <div key={i} className="relative group w-[280px] sm:w-[350px] aspect-[4/5] flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 shadow-sm border border-neutral-200/50">
              <img 
                src={src} 
                alt={product.name} 
                width="350"
                height="437"
                loading={i < 4 ? "eager" : "lazy"}
                fetchPriority={i < 4 ? "high" : "auto"}
                className={imgClass}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/imgs/logo.png";
                  e.currentTarget.className = "w-full h-full object-contain opacity-30 p-10 transition-all duration-700 ease-out";
                }}
              />
              {/* Gradient Overlay (Light Mode: White fade) */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                </div>
                <h3 className="text-neutral-900 text-2xl font-black italic uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-500">{product.name}</h3>
                <p className="text-neutral-600 font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">{product.price}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default function Hero({ enableMotion = true }) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);

  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.08,
      },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    },
  };
  
  const handleMouseMove = () => {
    // Optional: Add interaction logic here if needed
  };

  const [row1Items, row2Items] = useMemo(() => {
    const items = Array.isArray(HERO_PRODUCTS) ? HERO_PRODUCTS : [];
    if (items.length <= 1) return [items, items];
    const mid = Math.ceil(items.length / 2);
    return [items.slice(0, mid), items.slice(mid)];
  }, []);

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative max-h-[80vh] bg-white flex flex-col justify-center overflow-hidden pt-20"
    >
      {/* Background Elements (Light Mode) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft colorful blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-orange-100/60 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-100/60 rounded-full blur-[100px] mix-blend-multiply" />
        
        {/* Clean Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"></div>
      </div>

      {/* Main Content Layer */}
      <div className="absolute -top-[20%] inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        {enableMotion ? (
          <motion.h1 
            key="hero-title-anim"
            style={{ y }}
            variants={sentence}
            initial="hidden"
            animate="visible"
            className="text-[18vw] md:text-[15vw] leading-[0.8] font-black text-neutral-900 text-center tracking-tighter select-none mix-blend-hard-light"
          >
            <div className="inline-block overflow-hidden">
              { "MARKET".split("").map((char, index) => (
                <motion.span key={index} variants={letter} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </div>
            <br />
            <motion.span 
              className="text-transparent stroke-text-dark inline-block overflow-hidden"
              variants={sentence}
            >
                <motion.span  className="inline-block">
                  <ContainerTextFlip words={["Exclusivité", "Tendance", "Simple", "Livraison facile"]} className="text-transparent stroke-text-dark inline-block overflow-hidden" />
                </motion.span>
            </motion.span>
          </motion.h1>
        ) : (
          <h1 className="text-[18vw] md:text-[15vw] leading-[0.8] font-black text-neutral-900 text-center tracking-tighter select-none mix-blend-hard-light">
            <span className="inline-block">MARKET</span>
            <br />
            <span className="text-transparent stroke-text-dark inline-block overflow-hidden">Exclusivité</span>
          </h1>
        )}
      </div>

      {/* Marquee Layers */}
      <div className="relative z-10 flex flex-col gap-8 -rotate-2 scale-105 origin-center transform-gpu">
        <MarqueeRow items={row1Items} direction="left" speed={150} enableMotion={enableMotion} />
        <MarqueeRow items={row2Items} direction="right" speed={140} enableMotion={enableMotion} />
      </div>

      {/* Floating UI Controls */}
      <div className="absolute bottom-12 left-0 w-full z-30 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-end justify-between gap-6">

          {/* Right: Partner Button (User Request) */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/sellers')}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 rounded-full flex items-center gap-4 shadow-2xl shadow-black/5 hover:bg-white transition-colors"
          >
             <div className="flex items-center -space-x-3 group-hover:-space-x-1 transition-all duration-300"> 
               {users.map((img, i) => ( 
                 <motion.img 
                   initial={enableMotion ? { opacity: 0, x: -10 } : false}
                   animate={enableMotion ? { opacity: 1, x: 0 } : false}
                   transition={enableMotion ? { delay: i * 0.1 } : undefined}
                   key={i} 
                   src={img} 
                   alt="user" 
                   width="40"
                   height="40"
                   loading="lazy"
                   className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" 
                 /> 
               ))} 
             </div> 
             <div className="flex flex-col items-start">
                <span className="text-neutral-900 font-bold text-sm leading-none">
                  +500 partenaires
                </span> 
                <span className="text-neutral-500 text-[10px] font-medium">Rejoignez le mouvement</span>
             </div>
             <ChevronRight size={16} fill="currentColor" />
          </motion.button>

        </div>
      </div>

      {/* CSS for Outline Text (Dark Stroke) */}
      <style>{`
        .stroke-text-dark {
          -webkit-text-stroke: 2px #171717; /* neutral-900 */
        }
      `}</style>
    </section>
  );
}
