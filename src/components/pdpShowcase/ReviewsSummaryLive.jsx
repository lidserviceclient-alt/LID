import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquarePlus, Send, Star, ThumbsUp, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCurrentUserPayload, isAuthenticated } from "@/services/authService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import {
  deleteProductReview,
  listProductReviews,
  reportReview,
  toggleReviewLike,
  upsertProductReview,
} from "@/services/reviewService";
import { FOCUS_RING } from "./liveUtils";

// Avis réels (API /catalog/products/{id}/reviews) : résumé, liste paginée, rédaction/modification,
// « utile », signalement et suppression de son propre avis.

const PAGE_SIZE = 5;
const ratingFormatter = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function Stars({ value, size = 16 }) {
  const filled = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill="currentColor"
          className={i <= filled ? "text-pdp-orange" : "text-pdp-line dark:text-neutral-700"}
        />
      ))}
    </span>
  );
}

function Avatar({ url }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="relative w-10 h-10 rounded-full bg-pdp-surface dark:bg-neutral-900 flex items-center justify-center overflow-hidden flex-shrink-0">
      {url && !broken ? (
        <img src={resolveBackendAssetUrl(url)} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <User size={18} className="text-pdp-gray-500" aria-hidden="true" />
      )}
    </span>
  );
}

function ReviewRow({ review, isMine, onToggleLike, onReport, onDelete }) {
  let date = "";
  try {
    date = review.createdAt ? dateFormatter.format(new Date(review.createdAt)) : "";
  } catch {
    date = "";
  }
  const rating = Number(review.rating) || 0;
  return (
    <li className="py-5 first:pt-0 border-b border-pdp-line-2 dark:border-neutral-800 last:border-b-0">
      <div className="flex items-center gap-3">
        <Avatar url={review.userAvatarUrl} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-pdp-ink dark:text-white truncate">
            {review.userName || "Client"}
            {isMine ? <span className="ml-2 text-xs font-medium text-pdp-gray-700 dark:text-neutral-400">(vous)</span> : null}
          </p>
          {date ? <p className="text-xs text-pdp-gray-700 dark:text-neutral-400">{date}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Stars value={rating} size={15} />
        <span className="sr-only">Note : {rating} sur 5</span>
      </div>
      {review.content ? (
        <p className="mt-2 text-[15px] leading-relaxed text-pdp-ink dark:text-neutral-200 whitespace-pre-line break-words">{review.content}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-pdp-gray-700 dark:text-neutral-400">
        <button
          type="button"
          onClick={() => onToggleLike(review.id)}
          aria-pressed={Boolean(review.likedByMe)}
          className={`inline-flex items-center gap-1.5 rounded ${FOCUS_RING} ${
            review.likedByMe ? "text-pdp-accent-strong font-semibold" : "hover:text-pdp-ink dark:hover:text-white"
          }`}
        >
          <ThumbsUp size={14} className={review.likedByMe ? "fill-current" : ""} aria-hidden="true" />
          Utile ({Number(review.likeCount) || 0})
        </button>
        {!isMine ? (
          <button type="button" onClick={() => onReport(review.id)} className={`rounded hover:text-pdp-ink dark:hover:text-white ${FOCUS_RING}`}>
            Signaler
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDelete(review.id)}
            className={`inline-flex items-center gap-1.5 rounded hover:text-pdp-red ${FOCUS_RING}`}
          >
            <Trash2 size={14} aria-hidden="true" /> Supprimer
          </button>
        )}
      </div>
    </li>
  );
}

function ReviewSkeleton() {
  return (
    <ul className="space-y-6" aria-hidden="true">
      {[0, 1].map((i) => (
        <li key={i} className="animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-pdp-surface dark:bg-neutral-900" />
            <span className="h-3 w-32 rounded bg-pdp-surface dark:bg-neutral-900" />
          </div>
          <div className="mt-3 h-3 w-24 rounded bg-pdp-surface dark:bg-neutral-900" />
          <div className="mt-3 h-3 w-full rounded bg-pdp-surface dark:bg-neutral-900" />
          <div className="mt-2 h-3 w-2/3 rounded bg-pdp-surface dark:bg-neutral-900" />
        </li>
      ))}
    </ul>
  );
}

export default function ReviewsSummaryLive({ productId, onSummaryChange }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, reviewCount: 0 });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [draft, setDraft] = useState({ rating: 0, content: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const currentUserId = getCurrentUserPayload()?.sub || null;

  const load = useCallback(
    async (targetPage, { append = false } = {}) => {
      if (!productId) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const res = await listProductReviews(productId, targetPage, PAGE_SIZE);
        const content = Array.isArray(res?.content) ? res.content : [];
        setReviews((prev) => (append ? prev.concat(content.filter((r) => !prev.some((p) => p.id === r.id))) : content));
        const next = { avgRating: Number(res?.avgRating) || 0, reviewCount: Number(res?.reviewCount) || 0 };
        setSummary(next);
        onSummaryChange?.(next);
        setPage(targetPage);
        setTotalPages(Number(res?.totalPages) || 0);
      } catch {
        setError("Impossible de charger les avis pour le moment.");
        if (!append) setReviews([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productId, onSummaryChange]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const myReview = useMemo(
    () => (currentUserId ? reviews.find((r) => r.userId === currentUserId) || null : null),
    [reviews, currentUserId]
  );

  // Répartition des notes : seulement quand tous les avis sont chargés (sinon elle serait trompeuse).
  const distribution = useMemo(() => {
    if (!summary.reviewCount || reviews.length < summary.reviewCount) return null;
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const star = Math.round(Number(r?.rating) || 0);
      if (star >= 1 && star <= 5) counts[star - 1] += 1;
    }
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star - 1],
      pct: Math.round((counts[star - 1] / summary.reviewCount) * 100),
    }));
  }, [reviews, summary.reviewCount]);

  const openWriter = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (myReview) setDraft({ rating: Number(myReview.rating) || 0, content: myReview.content || "" });
    setIsWriting(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.rating || !draft.content.trim()) return;
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      await upsertProductReview(productId, { rating: draft.rating, content: draft.content.trim() });
      setDraft({ rating: 0, content: "" });
      setIsWriting(false);
      toast.success(myReview ? "Votre avis a été mis à jour" : "Merci, votre avis a été publié");
      await load(0);
    } catch {
      toast.error("Impossible de publier votre avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleLike = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    try {
      const nextCount = await toggleReviewLike(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, likeCount: Number(nextCount) || 0, likedByMe: !r.likedByMe } : r))
      );
    } catch {
      toast.error("Action impossible pour le moment.");
    }
  };

  const onReport = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    const details = window.prompt("Pourquoi signalez-vous cet avis ? (optionnel)");
    if (details === null) return;
    try {
      await reportReview(reviewId, { reason: "SIGNALEMENT", details });
      toast.success("Merci, l'avis a été signalé à notre équipe.");
    } catch {
      toast.error("Signalement impossible pour le moment.");
    }
  };

  const onDelete = async (reviewId) => {
    if (!isAuthenticated()) return navigate("/login");
    if (!window.confirm("Supprimer votre avis ?")) return;
    try {
      await deleteProductReview(reviewId);
      toast.success("Votre avis a été supprimé");
      await load(0);
    } catch {
      toast.error("Suppression impossible pour le moment.");
    }
  };

  const shownRating = hoverRating || draft.rating;
  const hasMore = page + 1 < totalPages;

  return (
    <div className="font-barlow grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
      {/* Résumé */}
      <div className="self-start rounded-2xl bg-pdp-surface dark:bg-neutral-900 p-5">
        {summary.reviewCount > 0 ? (
          <>
            <div className="flex items-end gap-2">
              <span className="text-[40px] font-bold leading-none text-pdp-ink dark:text-white tabular-nums">
                {ratingFormatter.format(summary.avgRating)}
              </span>
              <span className="pb-1 text-sm text-pdp-gray-700 dark:text-neutral-400">/ 5</span>
            </div>
            <div className="mt-2">
              <Stars value={summary.avgRating} size={18} />
            </div>
            <p className="mt-1 text-sm text-pdp-gray-700 dark:text-neutral-400">
              {summary.reviewCount} avis client{summary.reviewCount > 1 ? "s" : ""}
            </p>
            {distribution ? (
              <ul className="mt-4 space-y-1.5" aria-label="Répartition des notes">
                {distribution.map((row) => (
                  <li key={row.star} className="flex items-center gap-2 text-xs text-pdp-gray-700 dark:text-neutral-400">
                    <span className="w-8 tabular-nums">{row.star} ★</span>
                    <span className="flex-1 h-1.5 rounded-full bg-white dark:bg-neutral-800 overflow-hidden">
                      <span className="block h-full rounded-full bg-pdp-orange" style={{ width: `${row.pct}%` }} />
                    </span>
                    <span className="w-6 text-right tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-pdp-ink dark:text-white">Aucun avis pour l'instant</p>
            <p className="mt-1 text-sm text-pdp-gray-700 dark:text-neutral-400">Vous avez acheté ce produit ? Partagez votre expérience.</p>
          </>
        )}
        <button
          type="button"
          onClick={isWriting ? () => setIsWriting(false) : openWriter}
          aria-expanded={isWriting}
          className={`mt-5 w-full h-11 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-bold border-2 border-pdp-ink dark:border-white text-pdp-ink dark:text-white hover:bg-pdp-ink hover:text-white dark:hover:bg-white dark:hover:text-pdp-ink transition-colors ${FOCUS_RING}`}
        >
          <MessageSquarePlus size={16} aria-hidden="true" />
          {isWriting ? "Annuler" : myReview ? "Modifier mon avis" : "Écrire un avis"}
        </button>
      </div>

      {/* Liste + formulaire */}
      <div className="min-w-0">
        <AnimatePresence initial={false}>
          {isWriting ? (
            <motion.form
              key="review-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="overflow-hidden"
            >
              <div className="mb-8 rounded-2xl border border-pdp-line-2 dark:border-neutral-800 p-5">
                <fieldset>
                  <legend className="text-sm font-semibold text-pdp-ink dark:text-white mb-2">Votre note</legend>
                  <div className="flex gap-1" role="radiogroup" aria-label="Votre note" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={draft.rating === star}
                        aria-label={`${star} étoile${star > 1 ? "s" : ""} sur 5`}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setDraft((p) => ({ ...p, rating: star }))}
                        className={`p-0.5 rounded ${FOCUS_RING}`}
                      >
                        <Star
                          size={26}
                          strokeWidth={star <= shownRating ? 0 : 1.5}
                          fill={star <= shownRating ? "currentColor" : "none"}
                          className={star <= shownRating ? "text-pdp-orange" : "text-pdp-gray-500"}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="pdp-review-content" className="block text-sm font-semibold text-pdp-ink dark:text-white mt-4 mb-2">
                  Votre avis
                </label>
                <textarea
                  id="pdp-review-content"
                  value={draft.content}
                  onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Qualité, utilisation, conformité à la description…"
                  maxLength={2000}
                  className="w-full min-h-[110px] p-3 rounded-xl border border-pdp-line dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm text-pdp-ink dark:text-white placeholder:text-pdp-gray-500 outline-none focus:border-pdp-ink dark:focus:border-white focus:ring-1 focus:ring-pdp-ink dark:focus:ring-white"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-pdp-gray-500">{draft.content.length} / 2000</span>
                  <button
                    type="submit"
                    disabled={!draft.rating || !draft.content.trim() || submitting}
                    className={`h-11 px-5 rounded-xl bg-pdp-accent-strong hover:bg-pdp-accent-deep text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_RING}`}
                  >
                    <Send size={15} aria-hidden="true" /> {submitting ? "Publication…" : "Publier"}
                  </button>
                </div>
              </div>
            </motion.form>
          ) : null}
        </AnimatePresence>

        {error ? (
          <div className="mb-4 rounded-xl border border-pdp-red/20 bg-pdp-red/5 px-4 py-3 text-sm text-pdp-red flex items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" onClick={() => load(0)} className={`rounded font-semibold underline ${FOCUS_RING}`}>
              Réessayer
            </button>
          </div>
        ) : null}

        {loading ? (
          <ReviewSkeleton />
        ) : reviews.length === 0 ? (
          !error ? (
            <p className="text-sm text-pdp-gray-700 dark:text-neutral-400">Soyez le premier à donner votre avis sur ce produit.</p>
          ) : null
        ) : (
          <>
            <ul>
              {reviews.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  isMine={Boolean(currentUserId) && review.userId === currentUserId}
                  onToggleLike={onToggleLike}
                  onReport={onReport}
                  onDelete={onDelete}
                />
              ))}
            </ul>
            {hasMore ? (
              <button
                type="button"
                onClick={() => load(page + 1, { append: true })}
                disabled={loadingMore}
                className={`mt-6 h-11 px-5 rounded-xl border border-pdp-line dark:border-neutral-700 text-sm font-semibold text-pdp-ink dark:text-white hover:border-pdp-ink dark:hover:border-white disabled:opacity-60 ${FOCUS_RING}`}
              >
                {loadingMore ? "Chargement…" : `Afficher plus d'avis (${reviews.length} sur ${summary.reviewCount})`}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
