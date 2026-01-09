import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: { box: "w-10 h-10", text: "text-xl", gap: "gap-2" },
    md: { box: "w-[70px] h-[50px]", text: "text-2xl", gap: "gap-3" },
    lg: { box: "w-[100px] h-[70px]", text: "text-3xl", gap: "gap-4" },
    xl: { box: "w-[130px] h-[90px]", text: "text-4xl", gap: "gap-0" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className={`flex flex-col items-start ${s.gap} group select-none transition-all duration-500 ease-in-out`}>
      {/* Icon Container */}
      <motion.div
        className={`${s.box} relative flex items-center justify-start overflow-hidden transition-all duration-500 ease-in-out`}
       
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.img 
          src="/imgs/lid-green.png" 
          alt="Lid App" 
          className="w-full h-full relative z-10"
          initial={{ clipPath: "inset(0 100% 0 0)" }} 
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        
        {/* Shine Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full z-20"
          style={{
            background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Text Brand */}
        <motion.div 
          className="text-[7px] px-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:flex group-hover:text-[#6aa200] transition-colors"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {"Plus simple que jamais".split("").map((char, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
    </Link>
  );
}
