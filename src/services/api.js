﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { clearAccessToken, getAccessToken } from "./auth.js";
import { setAccessToken } from "./auth.js";

const BASE_URL = import.meta.env.VITE_BACKOFFICE_API_URL || "http://localhost:9000";
let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Refresh failed: ${res.status}`);
      }
      const data = await res.json().catch(() => null);
      const accessToken = data?.accessToken;
      if (!accessToken) {
        throw new Error("Token manquant");
      }
      setAccessToken(accessToken);
      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function request(path, options = {}, retryAuth = true) {
  const accessToken = getAccessToken();
  const { headers: optionHeaders, retryAuth: retryAuthOverride, ...restOptions } = options || {};
  const shouldRetryAuth = typeof retryAuthOverride === "boolean" ? retryAuthOverride : retryAuth;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(optionHeaders || {})
      },
      credentials: "include",
      ...restOptions
    });
  } catch {
    throw new Error(`API indisponible. Vérifie que le backend tourne sur ${BASE_URL}.`);
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let message = `Request failed: ${res.status}`;

    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);
      message = payload?.errorMessage || payload?.message || message;
    } else {
      const text = await res.text();
      if (text) message = text;
    }

    if (res.status === 401 && shouldRetryAuth && !path.includes("/api/v1/auth/refresh") && !path.includes("/api/v1/auth/login")) {
      try {
        const refreshedToken = await refreshAccessToken();
        const nextHeaders = {
          ...(optionHeaders || {}),
          Authorization: `Bearer ${refreshedToken}`
        };
        return await request(path, { ...restOptions, headers: nextHeaders }, false);
      } catch {
        clearAccessToken();
      }
    }

    if (res.status === 401 || res.status === 403) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        const currentPath = window.location?.pathname || "";
        if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
      throw new Error("Session expirée ou accès refusé. Merci de vous reconnecter.");
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return null;
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function requestBlob(path, options = {}, retryAuth = true) {
  const accessToken = getAccessToken();
  const { headers: optionHeaders, retryAuth: retryAuthOverride, ...restOptions } = options || {};
  const shouldRetryAuth = typeof retryAuthOverride === "boolean" ? retryAuthOverride : retryAuth;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(optionHeaders || {})
      },
      credentials: "include",
      ...restOptions
    });
  } catch {
    throw new Error(`API indisponible. Vérifie que le backend tourne sur ${BASE_URL}.`);
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let message = `Request failed: ${res.status}`;

    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);
      message = payload?.errorMessage || payload?.message || message;
    } else {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }

    if (res.status === 401 && shouldRetryAuth && !path.includes("/api/v1/auth/refresh") && !path.includes("/api/v1/auth/login")) {
      try {
        const refreshedToken = await refreshAccessToken();
        const nextHeaders = {
          ...(optionHeaders || {}),
          Authorization: `Bearer ${refreshedToken}`
        };
        return await requestBlob(path, { ...restOptions, headers: nextHeaders }, false);
      } catch {
        clearAccessToken();
      }
    }

    if (res.status === 401 || res.status === 403) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        const currentPath = window.location?.pathname || "";
        if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
      throw new Error("Session expirée ou accès refusé. Merci de vous reconnecter.");
    }

    throw new Error(message);
  }

  return res.blob();
}

async function requestForm(path, options = {}, retryAuth = true) {
  const accessToken = getAccessToken();
  const { headers: optionHeaders, retryAuth: retryAuthOverride, ...restOptions } = options || {};
  const shouldRetryAuth = typeof retryAuthOverride === "boolean" ? retryAuthOverride : retryAuth;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(optionHeaders || {})
      },
      credentials: "include",
      ...restOptions
    });
  } catch {
    throw new Error(`API indisponible. Vérifie que le backend tourne sur ${BASE_URL}.`);
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let message = `Request failed: ${res.status}`;

    if (contentType.includes("application/json")) {
      const payload = await res.json().catch(() => null);
      message = payload?.errorMessage || payload?.message || message;
    } else {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }

    if (res.status === 401 && shouldRetryAuth && !path.includes("/api/v1/auth/refresh") && !path.includes("/api/v1/auth/login")) {
      try {
        const refreshedToken = await refreshAccessToken();
        const nextHeaders = {
          ...(optionHeaders || {}),
          Authorization: `Bearer ${refreshedToken}`
        };
        return await requestForm(path, { ...restOptions, headers: nextHeaders }, false);
      } catch {
        clearAccessToken();
      }
    }

    if (res.status === 401 || res.status === 403) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        const currentPath = window.location?.pathname || "";
        if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
      throw new Error("Session expirée ou accès refusé. Merci de vous reconnecter.");
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return null;
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const backofficeApi = {
  loginLocal: (email, password) =>
    request("/api/v1/auth/login/local", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  logout: () =>
    request("/api/v1/auth/logout", {
      method: "POST"
    }),
  realtimeWsAccess: (topics = []) =>
    request("/api/v1/realtime/ws-access", {
      method: "POST",
      retryAuth: false,
      body: JSON.stringify({ topics: Array.isArray(topics) ? topics : [] })
    }),
  verifyAdminMfa: (mfaTokenId, code) =>
    request("/api/v1/auth/login/local/verify", {
      method: "POST",
      body: JSON.stringify({ mfaTokenId, code })
    }),
  overview: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/v1/backoffice/overview${query ? `?${query}` : ""}`);
  },
  analyticsCollection: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/v1/backoffice/analytics/collection${query ? `?${query}` : ""}`);
  },
  dashboard: () => request("/api/v1/backoffice/dashboard"),
  settingsCollection: () => request("/api/v1/backoffice/setting/collection"),
  recentOrders: () => request("/api/v1/backoffice/orders/recent"),
  categories: () => request("/api/v1/backoffice/categories"),
  createCategory: (payload) =>
    request("/api/v1/backoffice/categories", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bulkCreateCategories: (categories) =>
    request("/api/v1/backoffice/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ categories })
    }),
  bulkDeleteCategories: (ids) =>
    request("/api/v1/backoffice/categories/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids })
    }),
  purgeCategories: (withProducts = false) =>
    request(`/api/v1/backoffice/categories/purge${withProducts ? "?withProducts=true" : ""}`, {
      method: "POST"
    }),
  updateCategory: (id, payload) =>
    request(`/api/v1/backoffice/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id) =>
    request(`/api/v1/backoffice/categories/${id}`, {
      method: "DELETE"
    }),
  uploadCategoryImage: (file, { overwrite = false } = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "categories");
    formData.append("overwrite", `${overwrite}`);
    return requestForm("/api/v1/storage/upload", {
      method: "POST",
      body: formData
    });
  },
  uploadMedia: (file, folder = "uploads", { overwrite = false } = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("overwrite", `${overwrite}`);
    return requestForm("/api/v1/storage/upload", {
      method: "POST",
      body: formData
    });
  },
  uploadMediaBulk: (files, folder = "uploads", { overwrite = false } = {}) => {
    const formData = new FormData();
    for (const file of Array.from(files || [])) {
      formData.append("files", file);
    }
    formData.append("folder", folder);
    formData.append("overwrite", `${overwrite}`);
    return requestForm("/api/v1/storage/upload-bulk", {
      method: "POST",
      body: formData
    });
  },
  listMedia: ({ ownerScope = "LID", ownerUserId = "", folder = "", q = "", page = 0, size = 24 } = {}) => {
    const params = new URLSearchParams();
    if (ownerScope) params.set("ownerScope", ownerScope);
    if (ownerUserId) params.set("ownerUserId", ownerUserId);
    if (folder) params.set("folder", folder);
    if (q) params.set("q", q);
    params.set("page", `${page}`);
    params.set("size", `${size}`);
    return request(`/api/v1/storage/media?${params.toString()}`);
  },
  deleteMedia: (objectKey) =>
    request(`/api/v1/storage/delete?objectKey=${encodeURIComponent(objectKey)}`, {
      method: "DELETE"
    }),
  boutiques: () => request("/api/v1/backoffice/shops"),
  promoCodes: () => request("/api/v1/backoffice/promo-codes"),
  promoCodesCollection: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/v1/backoffice/promo-codes/collection${query ? `?${query}` : ""}`);
  },
  promoCodeStats: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/v1/backoffice/promo-codes/stats${query ? `?${query}` : ""}`);
  },
  createPromoCode: (payload) =>
    request("/api/v1/backoffice/promo-codes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePromoCode: (id, payload) =>
    request(`/api/v1/backoffice/promo-codes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deletePromoCode: (id) =>
    request(`/api/v1/backoffice/promo-codes/${id}`, {
      method: "DELETE"
    }),
  blogPosts: () => request("/api/v1/backoffice/blog-posts"),
  createBlogPost: (payload) =>
    request("/api/v1/backoffice/blog-posts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBlogPost: (id, payload) =>
    request(`/api/v1/backoffice/blog-posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteBlogPost: (id) =>
    request(`/api/v1/backoffice/blog-posts/${id}`, {
      method: "DELETE"
    }),
  ticketEvents: () => request("/api/v1/backoffice/tickets"),
  createTicketEvent: (payload) =>
    request("/api/v1/backoffice/tickets", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTicketEvent: (id, payload) =>
    request(`/api/v1/backoffice/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteTicketEvent: (id) =>
    request(`/api/v1/backoffice/tickets/${id}`, {
      method: "DELETE"
    }),
  ticketInventory: (id) => request(`/api/v1/backoffice/tickets/${id}/inventory`),
  adjustTicketInventory: (id, payload) =>
    request(`/api/v1/backoffice/tickets/${id}/inventory`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  marketingOverview: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/v1/backoffice/marketing/overview?${params.toString()}`);
  },
  marketingCampaigns: (page = 0, size = 20, status = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    return request(`/api/v1/backoffice/marketing/campaigns?${params.toString()}`);
  },
  createMarketingCampaign: (payload) =>
    request("/api/v1/backoffice/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateMarketingCampaign: (id, payload) =>
    request(`/api/v1/backoffice/marketing/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  sendMarketingCampaign: (id) =>
    request(`/api/v1/backoffice/marketing/campaigns/${id}/send`, {
      method: "POST"
    }),
  deleteMarketingCampaign: (id) =>
    request(`/api/v1/backoffice/marketing/campaigns/${id}`, {
      method: "DELETE"
    }),
  newsletterStats: () => request("/api/v1/backoffice/marketing/newsletter/stats"),
  newsletterCollection: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/marketing/newsletter/collection?${params.toString()}`);
  },
  newsletterSubscribers: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/marketing/newsletter/subscribers?${params.toString()}`);
  },
  createNewsletterSubscriber: (payload) =>
    request("/api/v1/backoffice/marketing/newsletter/subscribers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  unsubscribeNewsletterSubscriber: (id) =>
    request(`/api/v1/backoffice/marketing/newsletter/subscribers/${id}/unsubscribe`, {
      method: "POST"
    }),
  deleteNewsletterSubscriber: (id) =>
    request(`/api/v1/backoffice/marketing/newsletter/subscribers/${id}`, {
      method: "DELETE"
    }),
  loyaltyOverview: () => request("/api/v1/backoffice/loyalty/overview"),
  loyaltyCollection: (q = "", page = 0, size = 10, topLimit = 10) => {
    const params = new URLSearchParams({ page, size, topLimit });
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/loyalty/collection?${params.toString()}`);
  },
  loyaltyTiers: () => request("/api/v1/backoffice/loyalty/tiers"),
  loyaltyCustomers: (limit = 10) => request(`/api/v1/backoffice/loyalty/customers?limit=${encodeURIComponent(limit)}`),
  loyaltyCustomersPage: (q = "", page = 0, size = 10) =>
    request(
      `/api/v1/backoffice/loyalty/customers?q=${encodeURIComponent(q || "")}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`
    ),
  loyaltyCustomer: (userId) => request(`/api/v1/backoffice/loyalty/customers/${encodeURIComponent(userId)}`),
  loyaltyCustomerTransactions: (userId, page = 0, size = 20) =>
    request(
      `/api/v1/backoffice/loyalty/customers/${encodeURIComponent(userId)}/transactions?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`
    ),
  adjustLoyaltyPoints: (userId, payload) =>
    request(`/api/v1/backoffice/loyalty/customers/${encodeURIComponent(userId)}/adjust`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createLoyaltyTier: (payload) =>
    request("/api/v1/backoffice/loyalty/tiers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  deleteLoyaltyTier: (id) =>
    request(`/api/v1/backoffice/loyalty/tiers/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),
  loyaltyConfig: () => request("/api/v1/backoffice/loyalty/config"),
  updateLoyaltyConfig: (payload) =>
    request("/api/v1/backoffice/loyalty/config", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  updateLoyaltyTier: (id, payload) =>
    request(`/api/v1/backoffice/loyalty/tiers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  financeOverview: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/v1/backoffice/finance/overview?${params.toString()}`);
  },
  financeTransactions: (size = 50) => {
    const params = new URLSearchParams();
    if (size !== null && size !== undefined && `${size}`.trim() !== "") params.set("size", `${size}`);
    return request(`/api/v1/backoffice/finance/transactions?${params.toString()}`);
  },
  financeExportCsv: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return requestBlob(`/api/v1/backoffice/finance/export?${params.toString()}`, {
      headers: { Accept: "text/csv" }
    });
  },
  orders: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/orders?${params.toString()}`);
  },
  createOrder: (payload) =>
    request("/api/v1/backoffice/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateOrderStatus: (id, status) =>
    request(`/api/v1/backoffice/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),
  orderQuote: (payload) =>
    request("/api/v1/backoffice/orders/quote", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  orderCreateBootstrap: (customersPage = 0, customersSize = 20, productsPage = 0, productsSize = 20) => {
    const params = new URLSearchParams({ customersPage, customersSize, productsPage, productsSize });
    return request(`/api/v1/backoffice/orders/create-bootstrap?${params.toString()}`);
  },
  products: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/v1/backoffice/products?${params.toString()}`);
  },
  productCollection: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/v1/backoffice/products/collection?${params.toString()}`);
  },
  stockMovements: (page = 0, size = 20, sku = "", type = "") => {
    const params = new URLSearchParams({ page, size });
    if (sku) params.set("sku", sku);
    if (type) params.set("type", type);
    return request(`/api/v1/backoffice/stocks/movements?${params.toString()}`);
  },
  createStockMovement: (payload) =>
    request("/api/v1/backoffice/stocks/movements", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  inventoryCollection: (productsPage = 0, productsSize = 20, movementsPage = 0, movementsSize = 20, sku = "", type = "") => {
    const params = new URLSearchParams({ productsPage, productsSize, movementsPage, movementsSize });
    if (sku) params.set("sku", sku);
    if (type) params.set("type", type);
    return request(`/api/v1/backoffice/stocks/collection?${params.toString()}`);
  },
  createProduct: (payload) =>
    request("/api/v1/backoffice/products", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bulkCreateProducts: (products) =>
    request("/api/v1/backoffice/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products })
    }),
  bulkDeleteProducts: (ids) =>
    request("/api/v1/backoffice/products/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids })
    }),
  updateProduct: (id, payload) =>
    request(`/api/v1/backoffice/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteProduct: (id) =>
    request(`/api/v1/backoffice/products/${id}`, {
      method: "DELETE"
    }),
  productReviews: (page = 0, size = 20, status = "", q = "", productId = "", userId = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (productId) params.set("productId", productId);
    if (userId) params.set("userId", userId);
    return request(`/api/v1/backoffice/product-reviews?${params.toString()}`);
  },
  productReview: (id) => request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}`),
  updateProductReview: (id, payload) =>
    request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  validateProductReview: (id) =>
    request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}/validate`, { method: "POST" }),
  unvalidateProductReview: (id) =>
    request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}/unvalidate`, { method: "POST" }),
  restoreProductReview: (id) =>
    request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}/restore`, { method: "POST" }),
  deleteProductReview: (id) =>
    request(`/api/v1/backoffice/product-reviews/${encodeURIComponent(id)}`, { method: "DELETE" }),
  customers: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/v1/backoffice/customers?${params.toString()}`);
  },
  customerCollection: (page = 0, size = 20, q = "", segment = "") => {
    const params = new URLSearchParams({ page, size });
    if (q) params.set("q", q);
    if (segment) params.set("segment", segment);
    return request(`/api/v1/backoffice/customers/collection?${params.toString()}`);
  },
  users: (page = 0, size = 20, role = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (role) params.set("role", role);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/users?${params.toString()}`);
  },
  user: (id) => request(`/api/v1/backoffice/users/${id}`),
  createUser: (payload) =>
    request("/api/v1/backoffice/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createCourier: (payload) =>
    request("/api/v1/backoffice/users/couriers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUser: (id, payload) =>
    request(`/api/v1/backoffice/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  partners: (page = 0, size = 20, status = "ALL", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/partners?${params.toString()}`);
  },
  partner: (id) => request(`/api/v1/backoffice/partners/${encodeURIComponent(id)}`),
  approvePartner: (id) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(id)}/approve`, {
      method: "POST"
    }),
  rejectPartner: (id, payload) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: JSON.stringify(payload || {})
    }),
  partnerTransactions: (id, fromDate, toDate, page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    return request(`/api/v1/backoffice/partners/${encodeURIComponent(id)}/transactions?${params.toString()}`);
  },
  payPartnerTransactionDirect: (partnerId, transactionId) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(partnerId)}/transactions/${encodeURIComponent(transactionId)}/pay`, {
      method: "POST"
    }),
  payPartnerTransactionManual: (partnerId, transactionId) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(partnerId)}/transactions/${encodeURIComponent(transactionId)}/pay-manual`, {
      method: "POST"
    }),
  schedulePartnerTransaction: (partnerId, transactionId, scheduledAt) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(partnerId)}/transactions/${encodeURIComponent(transactionId)}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt })
    }),
  cancelPartnerTransaction: (partnerId, transactionId) =>
    request(`/api/v1/backoffice/partners/${encodeURIComponent(partnerId)}/transactions/${encodeURIComponent(transactionId)}/cancel`, {
      method: "POST"
    }),
  returns: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/returns?${params.toString()}`);
  },
  returnDetail: (id) => request(`/api/v1/backoffice/returns/${id}`),
  updateReturnStatus: (id, status) =>
    request(`/api/v1/backoffice/returns/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),
  deleteUser: (id) =>
    request(`/api/v1/backoffice/users/${id}`, {
      method: "DELETE"
    }),
  blockUser: (id) =>
    request(`/api/v1/backoffice/users/${id}/block`, {
      method: "POST"
    }),
  unblockUser: (id) =>
    request(`/api/v1/backoffice/users/${id}/unblock`, {
      method: "POST"
    }),
  freeShippingRules: () => request("/api/v1/backoffice/free-shipping-rules"),
  createFreeShippingRule: (payload) =>
    request("/api/v1/backoffice/free-shipping-rules", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateFreeShippingRule: (id, payload) =>
    request(`/api/v1/backoffice/free-shipping-rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteFreeShippingRule: (id) =>
    request(`/api/v1/backoffice/free-shipping-rules/${id}`, {
      method: "DELETE"
    }),
  enableFreeShippingRule: (id) =>
    request(`/api/v1/backoffice/free-shipping-rules/${id}/enable`, {
      method: "POST"
    }),
  disableFreeShippingRule: (id) =>
    request(`/api/v1/backoffice/free-shipping-rules/${id}/disable`, {
      method: "POST"
    }),
  shippingMethods: () => request("/api/v1/backoffice/shipping-methods"),
  createShippingMethod: (payload) =>
    request("/api/v1/backoffice/shipping-methods", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateShippingMethod: (id, payload) =>
    request(`/api/v1/backoffice/shipping-methods/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteShippingMethod: (id) =>
    request(`/api/v1/backoffice/shipping-methods/${id}`, {
      method: "DELETE"
    }),
  enableShippingMethod: (id) =>
    request(`/api/v1/backoffice/shipping-methods/${id}/enable`, {
      method: "POST"
    }),
  disableShippingMethod: (id) =>
    request(`/api/v1/backoffice/shipping-methods/${id}/disable`, {
      method: "POST"
    }),
  setDefaultShippingMethod: (id) =>
    request(`/api/v1/backoffice/shipping-methods/${id}/default`, {
      method: "POST"
    }),
  logisticsKpis: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/v1/backoffice/logistics/kpis?${params.toString()}`);
  },
  shipments: (page = 0, size = 20, status = "", carrier = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (carrier) params.set("carrier", carrier);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/logistics/shipments?${params.toString()}`);
  },
  shipment: (id) => request(`/api/v1/backoffice/logistics/shipments/${id}`),
  logisticsCollection: ({
    days = 30,
    page = 0,
    size = 20,
    status = "",
    carrier = "",
    q = "",
    deliveredPage = 0,
    deliveredSize = 10,
    deliveredStatus = "LIVREE",
    deliveredCarrier = "",
    deliveredQ = ""
  } = {}) => {
    const params = new URLSearchParams({ days, page, size, deliveredPage, deliveredSize });
    if (status) params.set("status", status);
    if (carrier) params.set("carrier", carrier);
    if (q) params.set("q", q);
    if (deliveredStatus) params.set("deliveredStatus", deliveredStatus);
    if (deliveredCarrier) params.set("deliveredCarrier", deliveredCarrier);
    if (deliveredQ) params.set("deliveredQ", deliveredQ);
    return request(`/api/v1/backoffice/logistics/collection?${params.toString()}`);
  },
  upsertShipment: (payload) =>
    request("/api/v1/backoffice/logistics/shipments", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateShipmentStatus: (id, payload) =>
    request(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  createCustomer: (payload) =>
    request("/api/v1/backoffice/customers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  forgotPassword: (email) =>
    request("/api/v1/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  verifyResetCode: (code) =>
    request("/api/v1/auth/password/verify", {
      method: "POST",
      body: JSON.stringify({ code })
    }),
  resetPassword: (payload) =>
    request("/api/v1/auth/password/reset", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  notifications: (page = 0, size = 20) =>
    request(`/api/v1/backoffice/notifications?${new URLSearchParams({ page, size }).toString()}`),
  notificationsCount: () => request("/api/v1/backoffice/notifications/unread-count"),
  markNotificationRead: (id) =>
    request(`/api/v1/backoffice/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST"
    }),
  readAllNotifications: () =>
    request("/api/v1/backoffice/notifications/read-all", {
      method: "POST"
    }),
  securitySettings: () => request("/api/v1/backoffice/security/settings"),
  updateSecuritySettings: (payload) =>
    request("/api/v1/backoffice/security/settings", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  securityActivityExportCsv: (size = 500) => {
    const params = new URLSearchParams();
    if (size !== null && size !== undefined && `${size}`.trim() !== "") params.set("size", `${size}`);
    return requestBlob(`/api/v1/backoffice/security/activity/export?${params.toString()}`, {
      headers: { Accept: "text/csv" }
    });
  },
  appConfig: () => request("/api/v1/backoffice/app-config"),
  updateAppConfig: (payload) =>
    request("/api/v1/backoffice/app-config", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  socialLinks: () => request("/api/v1/backoffice/app-config/social-links"),
  createSocialLink: (payload) =>
    request("/api/v1/backoffice/app-config/social-links", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateSocialLink: (id, payload) =>
    request(`/api/v1/backoffice/app-config/social-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteSocialLink: (id) =>
    request(`/api/v1/backoffice/app-config/social-links/${id}`, {
      method: "DELETE"
    }),
  notificationPreferences: () => request("/api/v1/backoffice/notification-preferences"),
  updateNotificationPreferences: (payload) =>
    request("/api/v1/backoffice/notification-preferences", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  logs: ({ page = 0, size = 20, from = "", to = "", level = "", logger = "", q = "" } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (level) params.set("level", level);
    if (logger) params.set("logger", logger);
    if (q) params.set("q", q);
    return request(`/api/v1/backoffice/logs?${params.toString()}`);
  },
  purgeLogs: (before = "") => {
    const params = new URLSearchParams();
    if (before) params.set("before", before);
    return request(`/api/v1/backoffice/logs${params.toString() ? `?${params.toString()}` : ""}`, {
      method: "DELETE"
    });
  },
  integrations: () => request("/api/v1/backoffice/integrations"),
  updateIntegrations: (payload) =>
    request("/api/v1/backoffice/integrations", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  recipients: ({ segment = "CLIENT", roles = [], q = "", limit = 200 } = {}) => {
    const params = new URLSearchParams();
    if (segment) params.set("segment", segment);
    for (const r of roles || []) {
      if (r) params.append("roles", r);
    }
    if (q) params.set("q", q);
    if (limit !== null && limit !== undefined) params.set("limit", `${limit}`);
    return request(`/api/v1/backoffice/recipients?${params.toString()}`);
  },
  messages: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/v1/backoffice/messages?${params.toString()}`);
  },
  message: (id) => request(`/api/v1/backoffice/messages/${id}`),
  createMessage: (payload) =>
    request("/api/v1/backoffice/messages", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  retryMessage: (id) =>
    request(`/api/v1/backoffice/messages/${id}/retry`, {
      method: "POST"
    }),
  deleteMessage: (id) =>
    request(`/api/v1/backoffice/messages/${id}`, {
      method: "DELETE"
    }),
  searchBootstrap: ({
    productsPage = 0,
    productsSize = 200,
    customersPage = 0,
    customersSize = 200,
    usersPage = 0,
    usersSize = 200,
    usersRole = "",
    usersQuery = ""
  } = {}) => {
    const params = new URLSearchParams({
      productsPage,
      productsSize,
      customersPage,
      customersSize,
      usersPage,
      usersSize
    });
    if (usersRole) params.set("usersRole", usersRole);
    if (usersQuery) params.set("usersQuery", usersQuery);
    return request(`/api/v1/backoffice/search/bootstrap?${params.toString()}`);
  },
  financeCollection: (days = 30, size = 50) => {
    const params = new URLSearchParams({ days, size });
    return request(`/api/v1/backoffice/finance/collection?${params.toString()}`);
  }
};
