import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User, MessageSquarePlus, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { listProductReviews, reportReview, toggleReviewLike, upsertProductReview } from '../services/reviewService';

// eslint-disable-next-line no-unused-vars
const ReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, reviewCount: 0, page: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function reload(page = 0) {
    if (!productId) return;
    setLoading(true);
    setError("");
    try {
      const res = await listProductReviews(productId, page, 10);
      setReviews(Array.isArray(res?.content) ? res.content : []);
      setSummary({
        avgRating: Number(res?.avgRating) || 0,
        reviewCount: Number(res?.reviewCount) || 0,
        page: Number(res?.page) || 0,
        totalPages: Number(res?.totalPages) || 0
      });
    } catch (e) {
      setError(e?.message || "Impossible de charger les avis.");
      setReviews([]);
      setSummary({ avgRating: 0, reviewCount: 0, page: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload(0);
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.content.trim()) return;
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await upsertProductReview(productId, { rating: newReview.rating, content: newReview.content });
      setNewReview({ rating: 0, content: "" });
      setIsWriting(false);
      await reload(0);
    } catch (e2) {
      setError(e2?.message || "Impossible de publier l’avis.");
    } finally {
      setSubmitting(false);
    }
  };

  async function onToggleLike(reviewId) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    try {
      const nextCount = await toggleReviewLike(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, likeCount: Number(nextCount) || 0, likedByMe: !r.likedByMe } : r
        )
      );
    } catch {
    }
  }

  async function onReport(reviewId) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const details = window.prompt("Pourquoi signalez-vous cet avis ? (optionnel)") || "";
    try {
      await reportReview(reviewId, { reason: "SIGNALEMENT", details });
    } catch {
    }
  }

  const starsFilled = Math.round(Math.max(0, Math.min(5, summary.avgRating)));

  return (
    <div id="reviews" className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 scroll-mt-24">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageSquarePlus className="text-orange-500" /> Avis clients
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={star <= starsFilled ? "fill-[#FFA41C] text-[#FFA41C]" : "text-neutral-300 dark:text-neutral-600"}
                />
              ))}
            </div>
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(summary.avgRating)} sur 5 ({summary.reviewCount})
            </span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsWriting(!isWriting)}
          className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          {isWriting ? "Fermer" : "Écrire un avis"}
        </motion.button>
      </div>

      {error ? (
        <div className="mb-6 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <AnimatePresence>
        {isWriting && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Votre note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoverRating || newReview.rating)
                            ? "fill-[#FFA41C] text-[#FFA41C]"
                            : "text-neutral-300 dark:text-neutral-600"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-neutral-900 dark:text-white mb-2">Votre avis</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Partagez votre expérience avec ce produit..."
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newReview.rating || !newReview.content.trim() || submitting}
                  className="px-6 py-2 bg-[#FFA41C] text-black font-bold rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} /> Publier
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Chargement…</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Aucun avis.</div>
          ) : reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <User size={20} className="text-neutral-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{review.userName || "Utilisateur"}</h4>
                    <span className="text-xs text-neutral-500">
                      {review.createdAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(review.createdAt)) : ""}
                    </span>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < (Number(review.rating) || 0) ? "fill-[#FFA41C] text-[#FFA41C]" : "text-neutral-200 dark:text-neutral-700"}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {review.content || ""}
              </p>

              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <button
                  onClick={() => onToggleLike(review.id)}
                  className={`flex items-center gap-1 transition-colors ${review.likedByMe ? "text-orange-600" : "hover:text-orange-600"}`}
                >
                  <ThumbsUp size={14} /> Utile ({Number(review.likeCount) || 0})
                </button>
                <button onClick={() => onReport(review.id)} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Signaler
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewSection;
