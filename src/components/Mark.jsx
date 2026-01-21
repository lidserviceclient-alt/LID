import React, { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const brands = [
  { 
    name: "Apple", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    color: "from-gray-900 to-gray-700"
  },
  { 
    name: "Nike", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    color: "from-neutral-800 to-neutral-600"
  },
  { 
    name: "Samsung", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    color: "from-blue-900 to-blue-700"
  },
  { 
    name: "Adidas", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    color: "from-neutral-900 to-neutral-800"
  },
  { 
    name: "Sony", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    color: "from-black to-neutral-800"
  },
  { 
    name: "PlayStation", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg",
    color: "from-blue-800 to-indigo-900"
  },
  { 
    name: "Xbox", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg",
    color: "from-green-700 to-green-900"
  },
  { 
    name: "Google", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    color: "from-red-500 to-yellow-500"
  }
];

const TiltCard = ({ brand }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * 32.5;
    const mouseY = (e.clientY - rect.top) * 32.5;

    const rX = (mouseY / height - 32.5 / 2) * -1;
    const rY = mouseX / width - 32.5 / 2;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative h-48 w-full rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-neutral-900/80 dark:to-neutral-900/40 p-6 shadow-xl border border-white/50 dark:border-white/10 backdrop-blur-md flex items-center justify-center group cursor-pointer overflow-hidden"
    >
      <div 
        style={{ transform: "translateZ(50px)" }} 
        className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-300"
      >
        <div className="w-24 h-16 flex items-center justify-center">
          <img 
            src={brand.logo} 
            alt={brand.name} 
            className="max-w-full max-h-full object-contain dark:invert drop-shadow-2xl filter"
          />
        </div>
        <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
          {brand.name}
        </p>
      </div>

      {/* Shine Effect */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        style={{ transform: "translateZ(20px)" }}
      />
      
      {/* Background Glow */}
      <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r ${brand.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
    </motion.div>
  );
};

export default function Mark() {
  return (
    <section className="w-full py-32 bg-neutral-100 dark:bg-black overflow-hidden perspective-1000">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-400 dark:from-white dark:to-neutral-600 mb-6 drop-shadow-sm"
          >
            NOS PARTENAIRES
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto"
          >
            Une collaboration exclusive avec les leaders mondiaux pour vous offrir le meilleur.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 perspective-1000">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
            >
              <TiltCard brand={brand} />
            </motion.div>
          ))}
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      </div>
    </section>
  );
}
