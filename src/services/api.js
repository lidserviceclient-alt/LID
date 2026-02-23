import { clearAccessToken, getAccessToken } from "./auth.js";

const BASE_URL = import.meta.env.VITE_BACKOFFICE_API_URL || "http://localhost:9000";

async function request(path, options = {}) {
  const accessToken = getAccessToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {})
      },
      ...options
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

async function requestBlob(path, options = {}) {
  const accessToken = getAccessToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {})
      },
      ...options
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

async function requestForm(path, options = {}) {
  const accessToken = getAccessToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {})
      },
      ...options
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
  overview: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/backoffice/overview${query ? `?${query}` : ""}`);
  },
  dashboard: () => request("/api/backoffice/dashboard"),
  recentOrders: () => request("/api/backoffice/orders/recent"),
  categories: () => request("/api/backoffice/categories"),
  createCategory: (payload) =>
    request("/api/backoffice/categories", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bulkCreateCategories: (categories) =>
    request("/api/backoffice/categories/bulk", {
      method: "POST",
      body: JSON.stringify({ categories })
    }),
  bulkDeleteCategories: (ids) =>
    request("/api/backoffice/categories/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids })
    }),
  purgeCategories: (withProducts = false) =>
    request(`/api/backoffice/categories/purge${withProducts ? "?withProducts=true" : ""}`, {
      method: "POST"
    }),
  updateCategory: (id, payload) =>
    request(`/api/backoffice/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id) =>
    request(`/api/backoffice/categories/${id}`, {
      method: "DELETE"
    }),
  uploadCategoryImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return requestForm("/api/backoffice/categories/upload-image", {
      method: "POST",
      body: formData
    });
  },
  boutiques: () => request("/api/backoffice/boutiques"),
  promoCodes: () => request("/api/backoffice/promo-codes"),
  promoCodeStats: (days) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") {
      params.set("days", `${days}`);
    }
    const query = params.toString();
    return request(`/api/backoffice/promo-codes/stats${query ? `?${query}` : ""}`);
  },
  createPromoCode: (payload) =>
    request("/api/backoffice/promo-codes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePromoCode: (id, payload) =>
    request(`/api/backoffice/promo-codes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deletePromoCode: (id) =>
    request(`/api/backoffice/promo-codes/${id}`, {
      method: "DELETE"
    }),
  blogPosts: () => request("/api/backoffice/blog-posts"),
  createBlogPost: (payload) =>
    request("/api/backoffice/blog-posts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBlogPost: (id, payload) =>
    request(`/api/backoffice/blog-posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteBlogPost: (id) =>
    request(`/api/backoffice/blog-posts/${id}`, {
      method: "DELETE"
    }),
  ticketEvents: () => request("/api/backoffice/tickets"),
  createTicketEvent: (payload) =>
    request("/api/backoffice/tickets", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTicketEvent: (id, payload) =>
    request(`/api/backoffice/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteTicketEvent: (id) =>
    request(`/api/backoffice/tickets/${id}`, {
      method: "DELETE"
    }),
  marketingOverview: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/backoffice/marketing/overview?${params.toString()}`);
  },
  marketingCampaigns: (page = 0, size = 20, status = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    return request(`/api/backoffice/marketing/campaigns?${params.toString()}`);
  },
  createMarketingCampaign: (payload) =>
    request("/api/backoffice/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateMarketingCampaign: (id, payload) =>
    request(`/api/backoffice/marketing/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  sendMarketingCampaign: (id) =>
    request(`/api/backoffice/marketing/campaigns/${id}/send`, {
      method: "POST"
    }),
  deleteMarketingCampaign: (id) =>
    request(`/api/backoffice/marketing/campaigns/${id}`, {
      method: "DELETE"
    }),
  newsletterStats: () => request("/api/backoffice/marketing/newsletter/stats"),
  newsletterSubscribers: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/backoffice/marketing/newsletter/subscribers?${params.toString()}`);
  },
  createNewsletterSubscriber: (payload) =>
    request("/api/backoffice/marketing/newsletter/subscribers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  unsubscribeNewsletterSubscriber: (id) =>
    request(`/api/backoffice/marketing/newsletter/subscribers/${id}/unsubscribe`, {
      method: "POST"
    }),
  deleteNewsletterSubscriber: (id) =>
    request(`/api/backoffice/marketing/newsletter/subscribers/${id}`, {
      method: "DELETE"
    }),
  loyaltyOverview: () => request("/api/backoffice/loyalty/overview"),
  loyaltyTiers: () => request("/api/backoffice/loyalty/tiers"),
  loyaltyConfig: () => request("/api/backoffice/loyalty/config"),
  updateLoyaltyConfig: (payload) =>
    request("/api/backoffice/loyalty/config", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  updateLoyaltyTier: (id, payload) =>
    request(`/api/backoffice/loyalty/tiers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  financeOverview: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/backoffice/finance/overview?${params.toString()}`);
  },
  financeTransactions: (size = 50) => {
    const params = new URLSearchParams();
    if (size !== null && size !== undefined && `${size}`.trim() !== "") params.set("size", `${size}`);
    return request(`/api/backoffice/finance/transactions?${params.toString()}`);
  },
  financeExportCsv: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return requestBlob(`/api/backoffice/finance/export?${params.toString()}`, {
      headers: { Accept: "text/csv" }
    });
  },
  orders: (page = 0, size = 20, status = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request(`/api/backoffice/orders?${params.toString()}`);
  },
  createOrder: (payload) =>
    request("/api/backoffice/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateOrderStatus: (id, status) =>
    request(`/api/backoffice/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),
  orderQuote: (payload) =>
    request("/api/backoffice/orders/quote", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  products: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/backoffice/products?${params.toString()}`);
  },
  stockMovements: (page = 0, size = 20, sku = "", type = "") => {
    const params = new URLSearchParams({ page, size });
    if (sku) params.set("sku", sku);
    if (type) params.set("type", type);
    return request(`/api/backoffice/stocks/movements?${params.toString()}`);
  },
  createStockMovement: (payload) =>
    request("/api/backoffice/stocks/movements", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createProduct: (payload) =>
    request("/api/backoffice/products", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  bulkCreateProducts: (products) =>
    request("/api/backoffice/products/bulk", {
      method: "POST",
      body: JSON.stringify({ products })
    }),
  bulkDeleteProducts: (ids) =>
    request("/api/backoffice/products/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids })
    }),
  updateProduct: (id, payload) =>
    request(`/api/backoffice/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteProduct: (id) =>
    request(`/api/backoffice/products/${id}`, {
      method: "DELETE"
    }),
  customers: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/backoffice/customers?${params.toString()}`);
  },
  users: (page = 0, size = 20, role = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (role) params.set("role", role);
    if (q) params.set("q", q);
    return request(`/api/backoffice/users?${params.toString()}`);
  },
  user: (id) => request(`/api/backoffice/users/${id}`),
  createUser: (payload) =>
    request("/api/backoffice/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUser: (id, payload) =>
    request(`/api/backoffice/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteUser: (id) =>
    request(`/api/backoffice/users/${id}`, {
      method: "DELETE"
    }),
  logisticsKpis: (days = 30) => {
    const params = new URLSearchParams();
    if (days !== null && days !== undefined && `${days}`.trim() !== "") params.set("days", `${days}`);
    return request(`/api/backoffice/logistics/kpis?${params.toString()}`);
  },
  shipments: (page = 0, size = 20, status = "", carrier = "", q = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.set("status", status);
    if (carrier) params.set("carrier", carrier);
    if (q) params.set("q", q);
    return request(`/api/backoffice/logistics/shipments?${params.toString()}`);
  },
  upsertShipment: (payload) =>
    request("/api/backoffice/logistics/shipments", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createCustomer: (payload) =>
    request("/api/backoffice/customers", {
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
  notifications: (page = 0, size = 20, since = "") => {
    const params = new URLSearchParams({ page, size });
    if (since) params.set("since", since);
    return request(`/api/backoffice/notifications?${params.toString()}`);
  },
  notificationsCount: (since = "") => {
    const params = new URLSearchParams();
    if (since) params.set("since", since);
    const qs = params.toString();
    return request(`/api/backoffice/notifications/count${qs ? `?${qs}` : ""}`);
  },
  messages: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return request(`/api/backoffice/messages?${params.toString()}`);
  },
  createMessage: (payload) =>
    request("/api/backoffice/messages", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  retryMessage: (id) =>
    request(`/api/backoffice/messages/${id}/retry`, {
      method: "POST"
    }),
  deleteMessage: (id) =>
    request(`/api/backoffice/messages/${id}`, {
      method: "DELETE"
    })
};
