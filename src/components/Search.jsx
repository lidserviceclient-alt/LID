import { ChevronDown, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCatalogCategories } from '@/services/categoryService';

export default function SearchBar({ autoFocus, onSearch, variant = 'desktop' }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([{ label: 'Toutes catégories', value: '' }]);
  const [selectedCategory, setSelectedCategory] = useState({ label: 'Toutes catégories', value: '' });
  const [categoryOpen, setCategoryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getCatalogCategories();
        const options = [{ label: 'Toutes catégories', value: '' }].concat(
          (Array.isArray(list) ? list : [])
            .filter((c) => c?.estActive !== false)
            .map((c) => ({ label: c.nom, value: c.slug || c.id }))
            .filter((o) => o.value)
        );
        if (!cancelled) setCategories(options);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  
  const trendingSearches = ['iPhone 15', 'Nike Air Max', 'MacBook Pro', 'PS5'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const params = new URLSearchParams();
    params.append('q', searchValue);
    if (selectedCategory?.value) {
      params.append('category', selectedCategory.value);
    }
    
    navigate(`/shop?${params.toString()}`);
    setSearchFocused(false);
    if (onSearch) onSearch();
  };

  const handleTrendingClick = (term) => {
    setSearchValue(term);
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    setSearchFocused(false);
    if (onSearch) onSearch();
  };

  return (
    <div className="flex-1 w-full max-w-3xl">
      <div className="relative">
        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className={`flex border border-neutral-200 dark:border-neutral-700 items-center h-12 bg-white dark:bg-neutral-900 rounded-full shadow-lg transition-all duration-300 ${
          searchFocused ? 'ring-2 ring-[#6aa200] shadow-xl' : 'shadow-md'
        }`}>
          {/* Categories  */}
          <div className="relative hidden md:block">
            <button 
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              onBlur={() => setTimeout(() => setCategoryOpen(false), 200)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-[#6aa200] transition-colors border-r border-neutral-200 dark:border-neutral-700"
            >
              <span className="max-w-[120px] truncate">{selectedCategory?.label || 'Toutes catégories'}</span>
              <ChevronDown size={16} className={`transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Categories Menu */}
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden z-50">
                <div className="max-h-80 overflow-y-auto py-2">
                  {categories.map((category) => (
                    <button
                      key={category.value || 'all'}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedCategory?.value === category.value
                          ? 'bg-[#6aa200]/10 dark:bg-[#6aa200]/20 text-[#6aa200] font-medium'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <input 
            type="text" 
            placeholder="Rechercher des produits, marques..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            autoFocus={autoFocus}
            className="flex-1 px-5 py-3 text-sm bg-transparent text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
          />
          
          {/* Search Button */}
          <button type="submit" className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#6aa200] to-[#6aa200] hover:from-[#6aa200] hover:to-[#6aa200] rounded-full text-white transition-all hover:scale-105">
            <Search size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {searchFocused && (
          <div className={variant === 'mobile' 
            ? "mt-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            : "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden z-50"
          }>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#6aa200]" />
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Recherches populaires
                </span>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(search)}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#6aa200]/10 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-3 group"
                  >
                    <Search size={14} className="text-neutral-400 group-hover:text-[#6aa200] transition-colors" />
                    <span className="group-hover:text-[#6aa200] transition-colors">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
