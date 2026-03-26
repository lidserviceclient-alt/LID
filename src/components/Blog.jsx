import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getBlogPosts } from "../services/blogService";

const formatShortDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).toUpperCase();
};

export default function Blog({ initialPosts = null, deferFetch = false, disableFetch = false }) {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const seeded = Array.isArray(initialPosts) ? initialPosts.slice(0, 4) : [];
    if (seeded.length > 0) {
      setPosts(seeded);
      setActivePost(seeded[0] || null);
      setIsLoading(false);
      return undefined;
    }
    if (deferFetch || disableFetch) {
      setPosts([]);
      setActivePost(null);
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);

    getBlogPosts()
      .then((list) => {
        if (cancelled) return;
        const items = (Array.isArray(list) ? list : []).slice(0, 4);
        setPosts(items);
        setActivePost(items[0] || null);
      })
      .catch(() => {
        if (cancelled) return;
        setPosts([]);
        setActivePost(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deferFetch, disableFetch, initialPosts]);

  const items = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

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
          <Link
            to="/blog"
            className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-neutral-500 transition-colors"
          >
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* List Section */}
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="py-8 text-sm text-neutral-500 dark:text-neutral-400">Chargement des articles...</div>
            ) : items.length > 0 ? (
              items.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="block">
                  <motion.div
                    onMouseEnter={() => setActivePost(post)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`group relative py-8 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors duration-300 ${
                      activePost?.id === post.id ? "opacity-100" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                        {`${post.category || ""}`.toUpperCase()}
                        {post.date ? ` — ${formatShortDate(post.date)}` : ""}
                      </span>
                      <ArrowUpRight
                        className={`w-5 h-5 transition-transform duration-300 ${
                          activePost?.id === post.id ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                        }`}
                      />
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-neutral-900 dark:text-white group-hover:translate-x-2 transition-transform duration-300">
                      {post.title}
                    </h3>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        activePost?.id === post.id ? "max-h-20 mt-2 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-neutral-600 dark:text-neutral-400 max-w-md">{post.excerpt}</p>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-sm text-neutral-500 dark:text-neutral-400">
                Aucun article pour le moment.{" "}
                <Link to="/blog" className="text-neutral-900 dark:text-white font-bold hover:underline">
                  Ouvrir le blog
                </Link>
              </div>
            )}

            <div className="mt-8 lg:hidden">
              <Link
                to="/blog"
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-neutral-500 transition-colors"
              >
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Preview Image Section (Desktop Sticky) */}
          <div className="hidden lg:block w-[500px] h-[600px] shrink-0 relative">
            <AnimatePresence mode="wait">
              {activePost ? (
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
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imgs/wall-1.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-bold tracking-widest uppercase mb-1 opacity-80">
                      Lire l'article
                    </p>
                    <p className="text-white text-xl font-bold">{activePost.title}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Decoration */}
            <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
