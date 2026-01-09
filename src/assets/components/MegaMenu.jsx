import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { categories } from '../data/categories';

export default function MegaMenu({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    } else if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Portaled to document.body) */}
          {typeof document !== 'undefined' && createPortal(
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-40"
            />,
            document.body
          )}

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute left-0 top-full w-full bg-white dark:bg-neutral-900 shadow-2xl border-t border-neutral-200 dark:border-neutral-800 h-[600px] max-h-[calc(100vh-60px)]"
          >
            <div className="max-w-[1400px] mx-auto h-full flex">
              
              {/* Left Sidebar: Categories List */}
              <div className="w-1/4 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onMouseEnter={() => setActiveCategory(category)}
                    className={`w-full text-left px-6 py-3 flex items-center justify-between group transition-all duration-200 ${
                      activeCategory.id === category.id 
                        ? 'bg-white dark:bg-neutral-800 shadow-sm border-l-4 border-[#6aa200]' 
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon 
                        size={20} 
                        className={`${
                          activeCategory.id === category.id 
                            ? 'text-[#6aa200]' 
                            : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
                        }`} 
                      />
                      <span className={`font-medium ${
                        activeCategory.id === category.id 
                          ? 'text-neutral-900 dark:text-white' 
                          : 'text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
                      }`}>
                        {category.label}
                      </span>
                    </div>
                    {activeCategory.id === category.id && (
                      <ChevronRight size={16} className="text-[#6aa200]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 h-full p-8 flex gap-8">
                
                {/* Subcategories Grid */}
                <div className="flex-1 grid grid-cols-2 gap-8 content-start">
                  {activeCategory.subcategories.map((sub, index) => (
                    <motion.div
                      key={`${activeCategory.id}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#6aa200] rounded-full"></span>
                        {sub.title}
                      </h3>
                      <ul className="space-y-2">
                        {sub.items.map((item) => (
                          <li key={item}>
                            <a href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#6aa200] dark:hover:text-[#6aa200] hover:translate-x-1 transition-all inline-block">
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Featured Image / Offer */}
                <div className="w-1/3">
                  <motion.div
                    key={activeCategory.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <img 
                      src={activeCategory.image} 
                      alt={activeCategory.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="bg-[#6aa200] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                        Recommandé
                      </span>
                      <h3 className="text-2xl font-bold mb-2">{activeCategory.label}</h3>
                      <p className="text-neutral-300 text-sm mb-4">{activeCategory.offer}</p>
                      <button className="bg-white text-neutral-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-neutral-100 transition-colors w-fit">
                        Voir la collection
                      </button>
                    </div>
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
