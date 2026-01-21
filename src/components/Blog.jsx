import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "Streetwear 2024 : Le Guide Ultime",
    excerpt: "Les tendances incontournables qui vont marquer l'année.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop",
    category: "TENDANCE",
    date: "12 JAN",
  },
  {
    id: 2,
    title: "Sizing Guide : Sneakers & Fits",
    excerpt: "Comment choisir la taille parfaite pour chaque marque.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    category: "GUIDE",
    date: "08 JAN",
  },
  {
    id: 3,
    title: "L'art du Layering en Hiver",
    excerpt: "Maîtrisez les superpositions pour un style sans faille.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop",
    category: "STYLE",
    date: "03 JAN",
  },
  {
    id: 4,
    title: "Accessoires : Les Must-Have",
    excerpt: "Les détails qui font toute la différence dans une tenue.",
    image: "https://i.pinimg.com/736x/c0/21/ef/c021ef014b1e51778b742a6d932a8ae0.jpg",
    category: "SELECTION",
    date: "01 JAN",
  }
];

export default function Blog() {
  const [activePost, setActivePost] = useState(posts[0]);

  return (
    <section className="py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-16 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-neutral-900 dark:text-white">
              LATEST <span className="text-neutral-400 dark:text-neutral-600">NEWS</span>
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-neutral-500 transition-colors">
            Voir tout <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* List Section */}
          <div className="flex-1 flex flex-col justify-center">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                onMouseEnter={() => setActivePost(post)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`group relative py-8 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors duration-300 ${
                  activePost.id === post.id ? "opacity-100" : "opacity-50 hover:opacity-100"
                }`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                    {post.category} — {post.date}
                  </span>
                  <ArrowUpRight 
                    className={`w-5 h-5 transition-transform duration-300 ${
                      activePost.id === post.id ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                    }`} 
                  />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-white group-hover:translate-x-2 transition-transform duration-300">
                  {post.title}
                </h3>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activePost.id === post.id ? "max-h-20 mt-2 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                    {post.excerpt}
                  </p>
                </div>
              </motion.div>
            ))}
            
            <div className="mt-8 lg:hidden">
                <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-neutral-500 transition-colors">
                    Voir tout <ArrowRight size={16} />
                </button>
            </div>
          </div>

          {/* Preview Image Section (Desktop Sticky) */}
          <div className="hidden lg:block w-[500px] h-[600px] shrink-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePost.id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl overflow-hidden"
              >
                <img 
                  src={activePost.image} 
                  alt={activePost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-bold tracking-widest uppercase mb-1 opacity-80">
                        Lire l'article
                    </p>
                    <p className="text-white text-xl font-bold">
                        {activePost.title}
                    </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Decoration */}
            <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl" />
          </div>

        </div>
      </div>
    </section>
  );
}
