import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, MapPin, ShoppingCart, User } from "lucide-react";

const PLACEHOLDERS = ["ventilateur", "clavier", "couette", "manette", "robot aspirateur"];

export default function Header({ cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cycleP = () => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);

  return (
    <div
      className="h-20 bg-white sticky top-0 z-50 font-barlow transition-shadow duration-200"
      style={scrolled ? { boxShadow: "0 2px 8px rgba(0,0,0,.06)" } : undefined}
    >
      <div className="max-w-[1228px] h-full mx-auto px-4 md:px-12 flex items-center gap-4">
        <Link to="/pdp-showcase" className="flex-shrink-0 text-pdp-red font-extrabold text-2xl tracking-tight">
          joy.
        </Link>

        <button
          type="button"
          className="hidden md:flex items-center gap-2 h-[52px] px-4 rounded-full bg-pdp-surface text-[16px] font-semibold text-pdp-ink flex-shrink-0"
        >
          <Menu size={20} />
          Catégories
        </button>

        <div className="flex-1 max-w-[580px] h-[52px] flex items-center rounded-full border border-pdp-line-2 bg-white pl-4 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            onFocus={cycleP}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            className="flex-1 min-w-0 h-full text-base outline-none bg-transparent placeholder:text-pdp-gray-500"
          />
          <button
            type="button"
            aria-label="Rechercher"
            className="w-16 h-11 mr-0.5 rounded-full bg-pdp-ink flex items-center justify-center flex-shrink-0"
          >
            <Search size={22} className="text-white" />
          </button>
        </div>

        <button
          type="button"
          className="hidden lg:flex items-center gap-2 h-[52px] px-3 rounded-full hover:bg-pdp-surface flex-shrink-0 text-[16px] font-semibold text-pdp-ink"
        >
          <MapPin size={20} />
          Livrer à 94500
        </button>

        <button type="button" aria-label="Panier" className="relative w-[52px] h-[52px] rounded-full bg-pdp-surface flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={22} className="text-pdp-ink" />
          {cartCount > 0 ? (
            <span className="absolute top-0 right-0 min-w-[16px] h-4 px-0.5 rounded-full bg-pdp-red text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          ) : null}
        </button>

        <div className="w-12 h-12 rounded-full bg-[#E8EAF2] flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
