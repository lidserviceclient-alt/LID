import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: { box: "w-10 h-10", text: "text-xl", gap: "gap-2" },
    md: { box: "w-14 h-14", text: "text-2xl", gap: "gap-3" },
    lg: { box: "w-20 h-20", text: "text-3xl", gap: "gap-4" },
    xl: { box: "w-24 h-24", text: "text-4xl", gap: "gap-4" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className={`flex items-center ${s.gap} group select-none`}>
      {/* Icon Container */}
      <motion.div
        className={`${s.box} relative flex items-center justify-center`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          <defs>
            <linearGradient id="bagGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA726" /> {/* Orange 400 */}
              <stop offset="100%" stopColor="#EF6C00" /> {/* Orange 800 */}
            </linearGradient>
          </defs>

          {/* Handle */}
          <motion.path
            d="M 35 30 C 35 10, 65 10, 65 30"
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Bag Body */}
          <motion.rect
            x="15" y="30" width="70" height="60" rx="15"
            fill="url(#bagGradient)"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          />

          {/* Handle Dots */}
          <circle cx="35" cy="30" r="3" fill="#1a1a1a" />
          <circle cx="65" cy="30" r="3" fill="#1a1a1a" />

          {/* Happy Person Icon (White) */}
          <motion.g
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {/* Head */}
            <circle cx="50" cy="48" r="7" fill="white" />
            
            {/* Arms (U shape) */}
            <path 
              d="M 28 62 Q 50 88 72 62" 
              stroke="white" 
              strokeWidth="14" 
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Torso (Vertical line merging with arms) */}
            <line 
              x1="50" y1="92" 
              x2="50" y2="72" 
              stroke="white" 
              strokeWidth="14" 
              strokeLinecap="round"
            />
          </motion.g>

        </svg>
      </motion.div>

      {/* Text Brand */}
      <div className="flex flex-col justify-center">
        <h1 
          className={`${s.text} tracking-wider leading-none text-neutral-900 dark:text-white relative`}
          style={{
            fontFamily: "Modak",
            textShadow: "1px 1px 0px #ea580c, 2px 2px 0px #c2410c, 3px 3px 0px #9a3412"
          }}
        >
          Lid<span className="">.</span>
        </h1>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:block mt-1 group-hover:text-orange-600 transition-colors">
          All In One Market
        </span>
      </div>
    </Link>
  );
}
