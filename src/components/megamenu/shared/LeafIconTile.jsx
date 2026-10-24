import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

/** Icon tile for a single leaf (sous-sous-catégorie) link, used by the columns variant. */
export default function LeafIconTile({ item, onLinkClick }) {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(item.slug)}`}
      onClick={onLinkClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#6aa200]/5 transition-colors text-center group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#6aa200]/10 flex items-center justify-center text-[#4d7a00] group-hover:bg-[#6aa200] group-hover:text-white transition-colors">
        <Tag size={20} />
      </div>
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-[#6aa200] transition-colors line-clamp-2">
        {item.label}
      </span>
    </Link>
  );
}
