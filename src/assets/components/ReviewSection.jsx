import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User, MessageSquarePlus, ThumbsUp } from 'lucide-react';

const mockReviews = [
  {
    id: 1,
    user: "Sophie Martin",
    date: "Il y a 2 jours",
    rating: 5,
    content: "Absolument ravie de mon achat ! La qualité est au rendez-vous et la livraison a été ultra rapide. Je recommande vivement.",
    likes: 12
  },
  {
    id: 2,
    user: "Thomas Dubreuil",
    date: "Il y a 1 semaine",
    rating: 4,
    content: "Bon produit, conforme à la description. Petit bémol sur l'emballage qui était un peu abîmé, mais le produit est intact.",
    likes: 5
  },
  {
    id: 3,
    user: "Léa Dubois",
    date: "Il y a 2 semaines",
    rating: 5,
    content: "C'est exactement ce que je cherchais. Le rapport qualité/prix est excellent.",
    likes: 8
  }
];

// eslint-disable-next-line no-unused-vars
const ReviewSection = ({ productId }) => {
  // TODO: Use productId to fetch real reviews
  const [reviews, setReviews] = useState(mockReviews);
  const [isWriting, setIsWriting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.content.trim()) return;

    const review = {
      id: Date.now(),
      user: "Utilisateur",
      date: "À l'instant",
      rating: newReview.rating,
      content: newReview.content,
      likes: 0,
      isNew: true
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, content: "" });
    setIsWriting(false);
  };

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
                <Star key={star} size={20} className="fill-[#FFA41C] text-[#FFA41C]" />
              ))}
            </div>
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">4.8 sur 5</span>
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
                  disabled={!newReview.rating || !newReview.content.trim()}
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
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={review.isNew ? { opacity: 0, y: -20, scale: 0.9 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className={`p-6 rounded-2xl border ${
                review.isNew 
                  ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30" 
                  : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800"
              } shadow-sm`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <User size={20} className="text-neutral-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{review.user}</h4>
                    <span className="text-xs text-neutral-500">{review.date}</span>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "fill-[#FFA41C] text-[#FFA41C]" : "text-neutral-200 dark:text-neutral-700"}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                {review.content}
              </p>

              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                  <ThumbsUp size={14} /> Utile ({review.likes})
                </button>
                <button className="hover:text-neutral-900 dark:hover:text-white transition-colors">
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
