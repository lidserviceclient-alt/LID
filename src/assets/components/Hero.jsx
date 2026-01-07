// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { ContainerTextFlip } from './textAnimat.jsx';
import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

 const productsRow1 = [
  { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500', name: 'URBAN JACKET', price: '$129' },
  { img: 'https://images.unsplash.com/photo-1529139574466-a302d2052505?w=500', name: 'SILK DRESS', price: '$89' },
  { img: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500', name: 'CLASSIC TEE', price: '$199' },
  { img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500', name: 'NEON SHIRT', price: '$65' },
  { img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500', name: 'SPORT LUXE', price: '$145' },
  { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500', name: 'LEATHER BAG', price: '$149' },
  { img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500', name: 'WOOL COAT', price: '$299' },
  { img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500', name: 'SUMMER HAT', price: '$59' },
  { img: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500', name: 'STREET SNEAKERS', price: '$180' },
  { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', name: 'WINTER SCARF', price: '$45' },
];

const productsRow2 = [
  { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', name: 'LUXURY WATCH', price: '$349' },
  { img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', name: 'DESIGNER SUNGLASSES', price: '$199' },
  { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', name: 'WIRELESS HEADPHONES', price: '$279' },
  { img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', name: 'SMART WATCH', price: '$399' },
  { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500', name: 'RUNNING SHOES', price: '$159' },
  { img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500', name: 'PREMIUM BACKPACK', price: '$229' },
  { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500', name: 'DENIM JEANS', price: '$119' },
  { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', name: 'YOGA MAT PRO', price: '$89' },
  { img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', name: 'CROSSBODY BAG', price: '$139' },
  { img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500', name: 'LEATHER WALLET', price: '$79' },
  { img: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=500', name: 'HOODIE STREETWEAR', price: '$95' },
  { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500', name: 'BLAZER PREMIUM', price: '$259' },
  { img: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500', name: 'PERFUME LUXURY', price: '$189' },
  { img: 'https://images.unsplash.com/photo-1622445275576-721325f6ad24?w=500', name: 'BOOTS LEATHER', price: '$249' },
  { img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500', name: 'CARGO PANTS', price: '$129' },
];


const users = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/86.jpg"
];

const MarqueeRow = ({ items, direction = "left", speed = 10 }) => {
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
        {[...items, ...items, ...items, ...items].map((product, i) => (
          <div key={i} className="relative group w-[280px] sm:w-[350px] aspect-[4/5] flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 shadow-sm border border-neutral-200/50">
            <img 
              src={product.img} 
              alt={product.name} 
              className="w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
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
        ))}
      </motion.div>
    </div>
  );
};

export default function Hero() {
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
        <motion.h1 
          key="hero-title-anim"
          style={{ y }}
          variants={sentence}
          initial="hidden"
          animate="visible"
          className="text-[18vw] md:text-[15vw] leading-[0.8] font-black text-neutral-900 text-center tracking-tighter select-none mix-blend-hard-light"
        >
          <div className="inline-block overflow-hidden">
            { "FUTURE".split("").map((char, index) => (
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
                <ContainerTextFlip words={["FASHION", "FUTURE"]} className="text-transparent stroke-text-dark inline-block overflow-hidden" />
              </motion.span>
          </motion.span>
        </motion.h1>
      </div>

      {/* Marquee Layers */}
      <div className="relative z-10 flex flex-col gap-8 -rotate-2 scale-105 origin-center transform-gpu">
        <MarqueeRow items={productsRow1} direction="left" speed={150} />
        <MarqueeRow items={productsRow2} direction="right" speed={140} />
      </div>

      {/* Floating UI Controls */}
      <div className="absolute bottom-12 left-0 w-full z-30 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-end justify-between gap-6">

          {/* Right: Partner Button (User Request) */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/seller-join')}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 rounded-full flex items-center gap-4 shadow-2xl shadow-black/5 hover:bg-white transition-colors"
          >
             <div className="flex items-center -space-x-3 group-hover:-space-x-1 transition-all duration-300"> 
               {users.map((img, i) => ( 
                 <motion.img 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   key={i} 
                   src={img} 
                   alt="user" 
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
