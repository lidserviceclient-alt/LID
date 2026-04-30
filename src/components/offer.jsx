import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, TicketPercent, X } from "lucide-react";
import { cn } from "@/utils/cn";
import CheckoutFlow from "./CheckoutFlow";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import { useFlashSaleProduct } from "@/features/flashSale/useFlashSaleProduct";

export default function Offer({ className, onClose, enableMotion = true }) {
  const [particles, setParticles] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { data: offerProduct } = useFlashSaleProduct(1);

  const offerImageSrc = useMemo(() => {
    const raw = offerProduct?.mainImageUrl;
    const resolved = raw ? resolveBackendAssetUrl(raw) : "";
    return resolved || "/imgs/logo.png";
  }, [offerProduct]);

  const offerPrice = useMemo(() => Number(offerProduct?.price) || 0, [offerProduct?.price]);

  useEffect(() => {
    // Generate particles only once on mount to avoid hydration mismatch and re-renders
    const newParticles = [...Array(5)].map(() => ({
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 10
    }));
    // eslint-disable-next-line
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs once on mount

  if (!offerProduct) return null;
  if (!enableMotion) {
    return (
      <section className={cn("w-full py-12 md:py-24 bg-neutral-950 text-white overflow-hidden relative rounded-3xl mx-auto max-w-full bg-[url('/imgs/wall-1.jpg')] bg-cover bg-center bg-no-repeat", className)}>
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40 z-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <TicketPercent className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  OFFRE EXCLUSIVE
                </span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-sans tracking-tight leading-tight">
              FUTURE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                COLLECTION
              </span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Plongez dans une nouvelle dimension de style. Une fusion parfaite entre design futuriste et confort absolu. L'avenir de la mode est ici.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <button 
                type="button"
                disabled={!offerProduct}
                onClick={() => offerProduct && setShowCheckout(true)}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all inline-flex items-center justify-center w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center gap-2">
                  Commander maintenant
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
              <Link
                to={offerProduct?.id ? `/product/${offerProduct.id}` : "/shop"}
                onClick={() => onClose && onClose()}
                className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg inline-flex items-center justify-center cursor-pointer w-full sm:w-auto"
              >
                Voir les détails
              </Link>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="relative w-full max-w-[320px] md:max-w-[400px] h-[420px] md:h-[500px] rounded-[30px] overflow-hidden bg-neutral-900 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 to-black/50" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <img
                  src={offerImageSrc}
                  alt={offerProduct?.name || "Produit"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/imgs/logo.png";
                  }}
                  className={cn(
                    "w-full h-full object-contain",
                    offerProduct?.mainImageUrl ? "opacity-100" : "opacity-30"
                  )}
                />
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                  <h3 className="text-lg md:text-2xl font-bold text-white">
                    {offerPrice > 0 ? `${offerPrice.toLocaleString()} FCFA` : "—"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CheckoutFlow 
          isOpen={showCheckout} 
          onClose={() => setShowCheckout(false)} 
          product={offerProduct}
          selectedColor={offerProduct?.color || "Noir"}
          selectedSize={offerProduct?.sizes?.[0] || "42"}
          quantity={1}
        />
      </section>
    );
  }

  return (
    <section className={cn("w-full py-12 md:py-24 bg-neutral-950 text-white overflow-hidden relative rounded-3xl mx-auto max-w-full perspective-1000 bg-[url('/imgs/wall-1.jpg')] bg-cover bg-center bg-no-repeat", className)}>
      {/* Close Button for Modal Context */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all active:scale-90"
        >
          <X size={24} />
        </button>
      )}

      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40 z-0" />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)] z-0" />

      
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute bg-orange-500/20 rounded-full blur-3xl"
            style={{
              width: particle.width,
              height: particle.height,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              x: [0, particle.x, 0],
              y: [0, particle.y, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="space-y-8 text-center lg:text-left"
        >
          <div className="flex justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,165,0,0.3)]">
              <TicketPercent className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                OFFRE EXCLUSIVE
              </span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-sans tracking-tight leading-tight">
            FUTURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
              COLLECTION
            </span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
            Plongez dans une nouvelle dimension de style. Une fusion parfaite entre design futuriste et confort absolu. L'avenir de la mode est ici.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              type="button"
              disabled={!offerProduct}
              onClick={() => offerProduct && setShowCheckout(true)}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] inline-flex items-center justify-center w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Commander maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/5 transition-all inline-flex items-center justify-center cursor-pointer w-full sm:w-auto"
            > 
               {isFlipped ? "Masquer les détails" : "Voir les détails"}
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-400">
              <span className="text-white font-bold">1.2k+</span> personnes intéressées
            </p>
          </div>
        </motion.div>


        {/* 3D Floating Card */}
        <div className="flex justify-center w-full">
            <TiltCard isFlipped={isFlipped} onClose={onClose} product={offerProduct} imageSrc={offerImageSrc} price={offerPrice} />
        </div>
      </div>

      <CheckoutFlow 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        product={offerProduct}
        selectedColor={offerProduct?.color || "Noir"}
        selectedSize={offerProduct?.sizes?.[0] || "42"}
        quantity={1}
      />
    </section>
  );
}

function TiltCard({ isFlipped, onClose, product, imageSrc, price }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
      whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative w-full max-w-[320px] md:max-w-[400px] h-[420px] md:h-[500px] flex items-center justify-center perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{
          rotateX,
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        <motion.div 
           style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
           className="w-full h-full relative"
        >
             {/* FRONT FACE */}
            <div className={cn("absolute inset-0 rounded-[30px] overflow-hidden bg-neutral-900 backface-hidden", isFlipped ? "pointer-events-none" : "pointer-events-auto")}>
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 to-black/50" />
            
            {/* Product Image Layer - Floating */}
            <motion.div 
                className="absolute inset-0 flex items-center justify-center z-10 backface-hidden"
                style={{ translateZ: 60 }}
                animate={{ opacity: isFlipped ? 0 : 1 }}
                transition={{ duration: 0.15, delay: 0.2 }}
            >
                <img
                    src={imageSrc}
                    alt={product?.name || "Produit"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imgs/logo.png";
                    }}
                    className={cn(
                      "h-auto drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 transition-all duration-500 backface-hidden",
                      product?.mainImageUrl ? "w-[120%] object-cover" : "w-[70%] object-contain opacity-30"
                    )}
                />
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
                className="absolute top-4 right-4 md:top-10 md:right-10 z-20 backface-hidden"
                style={{ translateZ: 80 }}
                animate={{ opacity: isFlipped ? 0 : 1 }}
                transition={{ duration: 0.15, delay: 0.2 }}
            >
                <div className="bg-black/50 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-white/20 shadow-xl">
                    <h3 className="text-lg md:text-2xl font-bold text-white">
                      {price && Number(price) > 0 ? `${Number(price).toLocaleString()} FCFA` : "—"}
                    </h3>
                </div>
            </motion.div>

            <motion.div 
                className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-20 backface-hidden"
                style={{ translateZ: 40 }}
                animate={{ opacity: isFlipped ? 0 : 1 }}
                transition={{ duration: 0.15, delay: 0.2 }}
            >
                <h3 className="text-lg md:text-3xl font-black italic text-white/10 tracking-widest uppercase">
                    {product?.brand || product?.categoryName || "LID"}
                </h3>
            </motion.div>

            {/* Shine Effect */}
            <motion.div 
                className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                style={{
                    backgroundPosition: shineX,
                    backgroundSize: "200% 100%",
                    opacity: 0.5,
                }}
            />
            </div>

            {/* BACK FACE */}
            <div 
                className={cn("absolute inset-0 rounded-[30px] overflow-hidden bg-neutral-800 border border-white/10 backface-hidden", !isFlipped ? "pointer-events-none" : "pointer-events-auto")}
                style={{ transform: "rotateY(180deg)" }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black p-5 md:p-8 flex flex-col">
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{product?.name || "Offre exclusive"}</h3>
                    <div className="flex items-center gap-2 mb-3 md:mb-6">
                        {product?.isBestSeller ? (
                          <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">Best Seller</span>
                        ) : product?.isFeatured ? (
                          <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">En phare</span>
                        ) : (
                          <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">Offre</span>
                        )}
                        <span className="text-neutral-400 text-xs md:text-sm">{product?.categoryName || "Catalogue"}</span>
                    </div>

                    <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto no-scrollbar">
                        <p className="text-xs md:text-base text-neutral-300 leading-relaxed">
                          {product?.name ? `Découvrez ${product.name} sur LID.` : "Découvrez ce produit sur LID."}
                        </p>
                        
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                          <h4 className="text-xs md:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Stock</h4>
                          <div className="text-white font-bold text-lg">
                            {Number.isFinite(Number(product?.stock)) ? `${Number(product.stock)} disponible(s)` : "—"}
                          </div>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
                        <Link 
                            to={product?.id ? `/product/${product.id}` : "/shop"}
                            onClick={() => onClose && onClose()}
                            className="w-full py-3 md:py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors relative z-50 cursor-pointer text-sm md:text-base"
                        >
                            Voir la fiche complète
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
