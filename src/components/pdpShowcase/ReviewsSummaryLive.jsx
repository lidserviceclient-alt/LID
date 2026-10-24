import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { Send, Star, ThumbsUp, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserPayload, isAuthenticated } from "@/services/authService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import {
  deleteProductReview,
  listProductReviews,
  reportReview,
  toggleReviewLike,
  upsertProductReview,
} from "@/services/reviewService";

function ReviewRow({ review, currentUserId, onToggleLike, onReport, onDelete }) {
  const date = review.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(review.createdAt))
    : "";
  return (
    <div className="py-5 border-b border-pdp-line-2 last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-pdp-surface flex items-center justify-center overflow-hidden flex-shrink-0">
          <User size={18} className="text-pdp-gray-500" />
          {review.userAvatarUrl ? (
            <img
              src={resolveBackendAssetUrl(review.userAvatarUrl)}
              alt=""
              className="absolute w-10 h-10 rounded-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : null}
        </div>
        <div>
          <span className="text-sm font-semibold text-pdp-ink">{review.userName || "Utilisateur"}</span>
          <div className="text-xs text-pdp-gray-700">{date}</div>
        </div>
      </div>
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < (Number(review.rating) || 0) ? "fill-pdp-orange text-pdp-orange" : "text-pdp-line-2"} />
        ))}
      </div>
      <p className="text-[15px] leading-[22px] text-pdp-ink">{review.content || ""}</p>
      <div className="flex items-center gap-4 mt-3 text-[13px] text-pdp-gray-700">
        <button
          type="button"
          onClick={() => onToggleLike(review.id)}
          className={`flex items-center gap-1 ${review.likedByMe ? "text-pdp-red" : "hover:text-pdp-ink"}`}
        >
          <ThumbsUp size={13} /> Utile ({Number(review.likeCount) || 0})
        </button>
        <button type="button" onClick={() => onReport(review.id)} className="hover:text-pdp-ink">
          Signaler
        </button>
        {currentUserId && review.userId === currentUserId ? (
          <button type="button" onClick={() => onDelete(review.id)} className="flex items-center gap-1 hover:text-pdp-red ml-auto">
            <Trash2 size={13} /> Supprimer
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ReviewsSummaryLive({ productId }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const currentUserId = getCurrentUserPayload()?.sub || null;

  async function reload(page = 0) {
    if (!productId) return;
    setLoading(true);
    setError("");
    try {
      const res = await listProductReviews(productId, page, 10);
      setReviews(Array.isArray(res?.content) ? res.content : []);
      setSummary({ avgRating: Number(res?.avgRating) || 0, reviewCount: Number(res?.reviewCount) || 0 });
    } catch (e) {
      setError(e?.message || "Impossible de charger les avis.");
      setReviews([]);
      setSummary({ avgRating: 0, reviewCount: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.content.trim()) return;
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      await upsertProductReview(productId, { rating: newReview.rating, content: newReview.content });
      setNewReview({ rating: 0, content: "" });
      setIsWriting(false);
      await reload(0);
    } catch (e2) {
      setError(e2?.message || "Impossible de publier l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleLike = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    try {
      const nextCount = await toggleReviewLike(reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, likeCount: Number(nextCount) || 0, likedByMe: !r.likedByMe } : r)));
    } catch {
      /* no-op */
    }
  };

  const onReport = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    const details = window.prompt("Pourquoi signalez-vous cet avis ? (optionnel)") || "";
    try {
      await reportReview(reviewId, { reason: "SIGNALEMENT", details });
    } catch {
      /* no-op */
    }
  };

  const onDelete = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    if (!window.confirm("Supprimer votre avis ?")) return;
    try {
      await deleteProductReview(reviewId);
      await reload(0);
    } catch (e) {
      setError(e?.message || "Suppression impossible.");
    }
  };

  const histogram = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const star = Math.round(Number(r?.rating) || 0);
      if (star >= 1 && star <= 5) counts[star - 1] += 1;
    }
    const max = Math.max(1, ...counts);
    return [5, 4, 3, 2, 1].map((star) => ({ star, count: counts[star - 1], pct: (counts[star - 1] / max) * 100 }));
  }, [reviews]);

  const starsFilled = Math.round(summary.avgRating);

  return (
    <div id="reviews">
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-4">Avis ({summary.reviewCount})</h2>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-[280px] flex-shrink-0 border border-[#ECEDF0] rounded-lg p-5">
          <div className="text-[32px] font-bold text-pdp-ink leading-none">
            {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(summary.avgRating)}
          </div>
          <div className="flex my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < starsFilled ? "fill-pdp-orange text-pdp-orange" : "text-pdp-line-2"} />
            ))}
          </div>
          <span className="text-[13px] text-pdp-gray-700">{summary.reviewCount} avis</span>

          <div className="space-y-1.5 mt-4">
            {histogram.map((row) => (
              <div key={row.star} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 font-medium text-pdp-ink">{row.star}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[#EEEFF2] overflow-hidden">
                  <div className="h-full bg-pdp-orange rounded-full" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="w-5 text-right text-pdp-ink">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsWriting((v) => !v)}
            className="px-5 py-2 rounded bg-pdp-ink text-white text-sm font-semibold hover:bg-black transition-colors mb-4"
          >
            {isWriting ? "Fermer" : "Écrire un avis"}
          </button>

          {error ? <div className="mb-4 text-sm text-pdp-red">{error}</div> : null}

          <AnimatePresence>
            {isWriting ? (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSubmit}
                className="overflow-hidden mb-6"
              >
                <div className="bg-pdp-surface rounded-lg p-5">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-pdp-ink mb-2">Votre note</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewReview((p) => ({ ...p, rating: star }))}>
                          <Star size={22} className={star <= (hoverRating || newReview.rating) ? "fill-pdp-orange text-pdp-orange" : "text-pdp-line-2"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-pdp-ink mb-2">Votre avis</label>
                    <textarea
                      value={newReview.content}
                      onChange={(e) => setNewReview((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Partagez votre expérience avec ce produit..."
                      className="w-full p-3 rounded-lg border border-pdp-line-2 bg-white focus:border-pdp-ink outline-none min-h-[90px] text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={!newReview.rating || !newReview.content.trim() || submitting} className="px-5 py-2 bg-pdp-red text-white font-semibold rounded text-sm disabled:opacity-50 flex items-center gap-2">
                      <Send size={14} /> Publier
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : null}
          </AnimatePresence>

          {loading ? (
            <div className="text-sm text-pdp-gray-700">Chargement…</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-pdp-gray-700">Aucun avis pour le moment.</div>
          ) : (
            reviews.map((review) => (
              <ReviewRow key={review.id} review={review} currentUserId={currentUserId} onToggleLike={onToggleLike} onReport={onReport} onDelete={onDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
