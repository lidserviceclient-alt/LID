import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

/**
 * Shared subcategory card: icon square + title, then either the
 * sub-subcategory links joined inline ("layout=inline", the default) or as a
 * vertical list ("layout=list"). Used by the grid-based menu variants.
 */
export default function SubcategoryCard({ sub, onLinkClick, layout = "inline", index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#6aa200]/10 flex items-center justify-center text-[#4d7a00] flex-shrink-0">
          <Tag size={18} />
        </div>
        <h3 className="font-bold text-neutral-900 dark:text-white">{sub.title}</h3>
      </div>

      {layout === "list" ? (
        <ul className="space-y-2">
          {sub.items.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/shop?category=${encodeURIComponent(item.slug)}`}
                onClick={onLinkClick}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#6aa200] dark:hover:text-[#6aa200] hover:translate-x-1 transition-all inline-block"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {sub.items.map((item, i) => (
            <span key={item.slug}>
              <Link
                to={`/shop?category=${encodeURIComponent(item.slug)}`}
                onClick={onLinkClick}
                className="hover:text-[#6aa200] dark:hover:text-[#6aa200] transition-colors"
              >
                {item.label}
              </Link>
              {i < sub.items.length - 1 ? (
                <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
              ) : null}
            </span>
          ))}
        </p>
      )}
    </motion.div>
  );
}
