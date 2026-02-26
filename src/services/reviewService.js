import api from "./api";

export const listProductReviews = async (productId, page = 0, size = 10) => {
  const encoded = encodeURIComponent(productId);
  const url = `/api/v1/catalog/products/${encoded}/reviews?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const res = await api.get(url, {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404
  });
  if (res.status === 404) {
    return {
      avgRating: 0,
      reviewCount: 0,
      content: [],
      page: Number(page) || 0,
      size: Number(size) || 10,
      totalElements: 0,
      totalPages: 0
    };
  }
  return res?.data;
};

export const upsertProductReview = async (productId, payload) => {
  const encoded = encodeURIComponent(productId);
  const { data } = await api.post(`/api/v1/catalog/products/${encoded}/reviews`, payload);
  return data;
};

export const deleteProductReview = async (reviewId) => {
  const encoded = encodeURIComponent(reviewId);
  await api.delete(`/api/v1/catalog/reviews/${encoded}`);
};

export const toggleReviewLike = async (reviewId) => {
  const encoded = encodeURIComponent(reviewId);
  const { data } = await api.post(`/api/v1/catalog/reviews/${encoded}/like`);
  return data;
};

export const reportReview = async (reviewId, payload) => {
  const encoded = encodeURIComponent(reviewId);
  await api.post(`/api/v1/catalog/reviews/${encoded}/report`, payload);
};
