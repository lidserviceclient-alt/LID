import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Clock, 
  Tag, 
  ArrowUpRight, 
  ChevronRight, 
  User,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import Newsletter from "../components/Newsletter";
import { BLOG_POSTS, CATEGORIES } from "../assets/data/blog";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === "Tout" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS.find(p => p.featured);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* --- Hero Section --- */}
      <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredPost.image} 
            alt={featuredPost.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-[#6aa200] text-white text-xs font-bold uppercase tracking-wider rounded-full">
                À la une
              </span>
              <span className="text-neutral-300 text-sm font-medium flex items-center gap-2">
                <Calendar size={14} /> {featuredPost.date}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {featuredPost.title}
            </h1>
            
            <p className="text-lg text-neutral-300 mb-8 max-w-xl line-clamp-2">
              {featuredPost.excerpt}
            </p>

            <Link 
              to={`/blog/${featuredPost.id}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-wide rounded-full hover:bg-[#6aa200] hover:text-white transition-all duration-300 group"
            >
              Lire l'article
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- Controls & Grid --- */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                  ${activeCategory === cat 
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-neutral-900 border-none shadow-sm focus:ring-2 focus:ring-[#6aa200] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors" size={20} />
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/50 transition-all duration-500 border border-neutral-100 dark:border-neutral-800"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                    {post.category}
                  </div>
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} /> {post.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight group-hover:text-[#6aa200] transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <User size={14} />
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {post.author}
                      </span>
                    </div>
                    
                    <Link 
                      to={`/blog/${post.id}`}
                      className="text-sm font-bold text-[#6aa200] flex items-center gap-1 group/link"
                    >
                      Lire
                      <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aucun article trouvé</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Essayez de modifier vos filtres ou votre recherche.</p>
            <button 
              onClick={() => { setActiveCategory("Tout"); setSearchQuery(""); }}
              className="mt-6 text-[#6aa200] font-bold hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </section>

      {/* --- Newsletter --- */}
      <Newsletter />
    </div>
  );
}
