import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  Bookmark
} from "lucide-react";
import Newsletter from "../components/Newsletter";
import { getBlogPost, getBlogPosts } from "../services/blogService";

export default function BlogDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  
  // Scroll to top on mount or id change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setPost(null);
      return;
    }
    setIsLoading(true);
    setLoadError("");
    getBlogPost(id)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setPost(null);
        setLoadError(err?.message || "Article introuvable");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getBlogPosts()
      .then((list) => {
        if (cancelled) return;
        const items = Array.isArray(list) ? list : [];
        const related = items
          .filter((p) => p?.category && post?.category && p.category === post.category && p.id !== post.id)
          .slice(0, 3);
        setRelatedPosts(related);
      })
      .catch(() => {
        if (cancelled) return;
        setRelatedPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [post?.category, post?.id]);

  const contentText = useMemo(() => {
    const content = `${post?.content || ""}`.trim();
    if (content) return content;
    const excerpt = `${post?.excerpt || ""}`.trim();
    return excerpt;
  }, [post?.content, post?.excerpt]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#6aa200] rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{loadError || "Article introuvable"}</h2>
        <Link to="/blog" className="text-[#6aa200] hover:underline">
          Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#6aa200] origin-left z-50"
        style={{ scaleX: 0 }} 
        animate={{ scaleX: 1 }}
      />

      {/* --- Header / Hero --- */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute inset-0 max-w-4xl mx-auto px-6 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={20} /> Retour au blog
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#6aa200] text-white text-xs font-bold uppercase tracking-wider rounded-full">
                {post.category}
              </span>
              <span className="text-neutral-300 text-sm font-medium flex items-center gap-2">
                <Clock size={14} /> {post.readTime} de lecture
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{post.author}</p>
                <p className="text-white/60 text-xs">{post.date}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12">
        
        {/* Article Body */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead text-xl text-neutral-600 dark:text-neutral-300 font-medium mb-8">
            {post.excerpt}
          </p>

          <div className="space-y-6 text-neutral-800 dark:text-neutral-200">
            <p className="whitespace-pre-wrap">{contentText}</p>
          </div>
        </article>

        {/* Sidebar / Actions */}
        <aside className="lg:w-24 flex flex-row lg:flex-col gap-6 lg:sticky lg:top-32 h-fit">
          <div className="flex lg:flex-col gap-4">
            <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-[#6aa200] hover:text-white transition-colors" title="Partager">
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-blue-600 hover:text-white transition-colors">
              <Facebook size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-sky-500 hover:text-white transition-colors">
              <Twitter size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-blue-700 hover:text-white transition-colors">
              <Linkedin size={20} />
            </button>
          </div>
          <div className="w-px h-12 bg-neutral-200 dark:bg-neutral-800 hidden lg:block mx-auto" />
          <button className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-orange-500 hover:text-white transition-colors lg:mx-auto">
            <Bookmark size={20} />
          </button>
        </aside>

      </div>

      {/* --- Related Posts --- */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-2xl font-bold mb-8 dark:text-white">Dans la même catégorie</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(related => (
                <Link 
                  key={related.id} 
                  to={`/blog/${related.id}`}
                  className="group block bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={related.image} 
                      alt={related.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-[#6aa200] uppercase tracking-wider mb-2 block">
                      {related.category}
                    </span>
                    <h4 className="font-bold text-lg dark:text-white mb-2 group-hover:text-[#6aa200] transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </div>
  );
}
