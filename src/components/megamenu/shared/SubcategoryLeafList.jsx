import { Link } from "react-router-dom";

/** Mobile subcategory block: title + vertical list of leaf links. Shared across mobile variants. */
export default function SubcategoryLeafList({ sub, onLinkClick }) {
  return (
    <div>
      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#6aa200] rounded-full"></span>
        {sub.title}
      </h4>
      <ul className="pl-3 space-y-2 border-l border-neutral-200 dark:border-neutral-700 ml-0.5">
        {sub.items.map((item) => (
          <li key={item.slug}>
            <Link
              to={`/shop?category=${encodeURIComponent(item.slug)}`}
              onClick={onLinkClick}
              className="block text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#6aa200] pl-3 py-0.5"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
