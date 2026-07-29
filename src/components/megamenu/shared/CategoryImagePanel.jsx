// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function CategoryImagePanel({ imageUrl, label, className = "" }) {
  return (
    <motion.div
      key={label || "panel"}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={label || ""}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent flex flex-col justify-end p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{label}</h3>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-end p-6 text-white">
          <h3 className="text-2xl font-bold">{label}</h3>
        </div>
      )}
    </motion.div>
  );
}
