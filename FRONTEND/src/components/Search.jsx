import { ChevronDown, Search, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCatalogCategories } from '@/services/categoryService';
import { resolveBackendAssetUrl } from '@/services/categoryService';
import { getCatalogProductsPage } from '@/services/productService';

export default function SearchBar({ autoFocus, onSearch, variant = 'desktop' }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([{ label: 'Toutes catégories', value: '' }]);
  const [selectedCategory, setSelectedCategory] = useState({ label: 'Toutes catégories', value: '' });
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const requestSeqRef = useRef(0);
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

  const trimmedQuery = `${searchValue || ''}`.trim();
  const canSuggest = trimmedQuery.length >= 2;

  const categoryMatches = useMemo(() => {
    if (!canSuggest) return [];
    const q = trimmedQuery.toLowerCase();
    return (categories || [])
      .filter((c) => c && c.value && `${c.label || ''}`.trim().toLowerCase().includes(q))
      .slice(0, 5);
  }, [canSuggest, categories, trimmedQuery]);

  const flatActions = useMemo(() => {
    const actions = [];
    for (const c of categoryMatches) {
      actions.push({ type: 'category', key: `cat-${c.value}`, category: c });
    }
    for (const p of Array.isArray(suggestions) ? suggestions : []) {
      actions.push({ type: 'product', key: `prod-${p.id}`, product: p });
    }
    if (canSuggest) {
      actions.push({ type: 'all', key: 'all', q: trimmedQuery });
    }
    return actions;
  }, [categoryMatches, suggestions, canSuggest, trimmedQuery]);

  useEffect(() => {
    if (!searchFocused) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!canSuggest) {
      setSuggestions([]);
      setSuggestLoading(false);
      setActiveIndex(-1);
      return;
    }

    setSuggestLoading(true);
    const seq = ++requestSeqRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await getCatalogProductsPage(0, 8, {
          q: trimmedQuery,
          category: selectedCategory?.value || '',
        });
        if (requestSeqRef.current !== seq) return;
        const content = Array.isArray(data?.content) ? data.content : [];
        setSuggestions(content.filter((p) => p && p.id && p.name).slice(0, 8));
      } catch {
        if (requestSeqRef.current !== seq) return;
        setSuggestions([]);
      } finally {
        if (requestSeqRef.current === seq) {
          setSuggestLoading(false);
          setActiveIndex(-1);
        }
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchFocused, canSuggest, trimmedQuery, selectedCategory?.value]);

  const formatMoney = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '';
    return `${num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
  };

  const highlight = (text, q) => {
    const raw = `${text || ''}`;
    const query = `${q || ''}`.trim();
    if (!raw || query.length < 2) return raw;
    const lower = raw.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    if (idx < 0) return raw;
    const before = raw.slice(0, idx);
    const match = raw.slice(idx, idx + query.length);
    const after = raw.slice(idx + query.length);
    return (
      <>
        {before}
        <span className="text-[#6aa200] font-semibold">{match}</span>
        {after}
      </>
    );
  };

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

  const goToProduct = (product) => {
    if (!product?.id) return;
    navigate(`/product/${encodeURIComponent(product.id)}`);
    setSearchFocused(false);
    if (onSearch) onSearch();
  };

  const goToCategory = (category) => {
    const value = `${category?.value || ''}`.trim();
    if (!value) return;
    navigate(`/shop?category=${encodeURIComponent(value)}`);
    setSearchFocused(false);
    if (onSearch) onSearch();
  };

  const goToAll = () => {
    if (!trimmedQuery) return;
    const params = new URLSearchParams();
    params.append('q', trimmedQuery);
    if (selectedCategory?.value) params.append('category', selectedCategory.value);
    navigate(`/shop?${params.toString()}`);
    setSearchFocused(false);
    if (onSearch) onSearch();
  };

  const onKeyDown = (e) => {
    if (!searchFocused) return;
    if (e.key === 'Escape') {
      setSearchFocused(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!flatActions.length) return;
      setActiveIndex((idx) => {
        const next = idx + 1;
        return next >= flatActions.length ? 0 : next;
      });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!flatActions.length) return;
      setActiveIndex((idx) => {
        const next = idx - 1;
        return next < 0 ? flatActions.length - 1 : next;
      });
      return;
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const action = flatActions[activeIndex];
      if (!action) return;
      if (action.type === 'product') goToProduct(action.product);
      else if (action.type === 'category') goToCategory(action.category);
      else if (action.type === 'all') goToAll();
    }
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
            onKeyDown={onKeyDown}
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
              {canSuggest ? (
                <div className="space-y-4">
                  {categoryMatches.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-[#6aa200]" />
                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Catégories
                        </span>
                      </div>
                      <div className="space-y-1">
                        {categoryMatches.map((c, idx) => {
                          const actionIndex = flatActions.findIndex((a) => a.type === 'category' && a.category?.value === c.value);
                          return (
                            <button
                              key={c.value}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                goToCategory(c);
                              }}
                              onMouseEnter={() => setActiveIndex(actionIndex)}
                              className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors flex items-center gap-3 group ${
                                activeIndex === actionIndex
                                  ? 'bg-[#6aa200]/10 dark:bg-neutral-800'
                                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#6aa200]/10 dark:hover:bg-neutral-800'
                              }`}
                            >
                              <Search size={14} className="text-neutral-400 group-hover:text-[#6aa200] transition-colors" />
                              <span className="group-hover:text-[#6aa200] transition-colors">{highlight(c.label, trimmedQuery)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#6aa200]" />
                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          Produits
                        </span>
                      </div>
                      {suggestLoading ? (
                        <div className="h-4 w-4 rounded-full border-2 border-neutral-300 border-t-[#6aa200] animate-spin" />
                      ) : null}
                    </div>

                    {suggestions.length > 0 ? (
                      <div className="space-y-1">
                        {suggestions.map((p) => {
                          const img = resolveBackendAssetUrl(p?.imageUrl) || '/imgs/logo.png';
                          const actionIndex = flatActions.findIndex((a) => a.type === 'product' && a.product?.id === p.id);
                          const price = formatMoney(p?.price);
                          const rating = Number(p?.rating) || 0;
                          const reviews = Number(p?.reviews) || 0;
                          return (
                            <button
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                goToProduct(p);
                              }}
                              onMouseEnter={() => setActiveIndex(actionIndex)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${
                                activeIndex === actionIndex
                                  ? 'bg-[#6aa200]/10 dark:bg-neutral-800'
                                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                              }`}
                            >
                              <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
                                <img
                                  src={img}
                                  alt={p?.name || ''}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/imgs/logo.png';
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                  {highlight(p?.name, trimmedQuery)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                  {p?.brand ? <span className="truncate">{p.brand}</span> : null}
                                  {price ? <span className="text-[#6aa200] font-semibold">{price}</span> : null}
                                  {reviews > 0 ? <span>{rating.toFixed(1)} ({reviews})</span> : null}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      !suggestLoading ? (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 px-3 py-2">
                          Aucun produit trouvé.
                        </div>
                      ) : null
                    )}

                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        goToAll();
                      }}
                      onMouseEnter={() => setActiveIndex(flatActions.findIndex((a) => a.type === 'all'))}
                      className={`mt-2 w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors flex items-center gap-3 group ${
                        activeIndex === flatActions.findIndex((a) => a.type === 'all')
                          ? 'bg-[#6aa200]/10 dark:bg-neutral-800'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#6aa200]/10 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Search size={14} className="text-neutral-400 group-hover:text-[#6aa200] transition-colors" />
                      <span className="group-hover:text-[#6aa200] transition-colors">
                        Voir tous les résultats pour “{trimmedQuery}”
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleTrendingClick(search);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-[#6aa200]/10 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-3 group"
                      >
                        <Search size={14} className="text-neutral-400 group-hover:text-[#6aa200] transition-colors" />
                        <span className="group-hover:text-[#6aa200] transition-colors">{search}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
