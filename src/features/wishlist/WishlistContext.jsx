import { createContext, useContext, useState, useEffect } from "react";
import { getAccessTokenPayload } from "@/services/auth";
import { getCustomerWishlist, addCustomerWishlist, removeCustomerWishlist } from "@/services/customerService";

const normalizeWishlistId = (value) => {
  if (value === null || value === undefined) return null;
  const id = `${value}`.trim();
  return id ? id : null;
};

const WishlistContext = createContext({
  wishlistItems: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  toggleWishlist: () => {},
  wishlistCount: 0,
});

const normalizeWishlistItem = (item) => {
  if (!item) return null;
  const id = normalizeWishlistId(item.id ?? item.articleId ?? item.productId);
  if (!id) return null;
  const name = item.name ?? item.articleName ?? item.title ?? "";
  const image = item.imageUrl ?? item.image ?? item.articleImage ?? item.img ?? "";
  const rawPrice = item.price ?? item.amount ?? item.unitPrice;
  const parsedPrice =
    rawPrice === "" || rawPrice === null || rawPrice === undefined ? 0 : Number(`${rawPrice}`.replace(/\s+/g, ""));
  const price = Number.isFinite(parsedPrice) ? parsedPrice : rawPrice;
  return { ...item, id, name, image, price };
};

const mergeWishlistItems = (localItems, remoteItems) => {
  const merged = new Map();
  for (const item of remoteItems) {
    const id = normalizeWishlistId(item?.id);
    if (id) merged.set(id, { ...item, id });
  }
  for (const item of localItems) {
    const id = normalizeWishlistId(item?.id);
    if (!id) continue;
    if (!merged.has(id)) {
      merged.set(id, { ...item, id });
    }
  }
  return Array.from(merged.values());
};

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("wishlist");
      const items = savedWishlist ? JSON.parse(savedWishlist) : [];
      return items.map(normalizeWishlistItem).filter(Boolean);
    }
    return [];
  });
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (hasSynced) return;
    const payload = getAccessTokenPayload();
    if (!payload?.sub) return;
    let active = true;
    (async () => {
      try {
        const apiItems = await getCustomerWishlist(payload.sub);
        if (!active) return;
        const normalizedApi = apiItems.map(normalizeWishlistItem).filter(Boolean);
        let pendingAdds = [];
        setWishlistItems((prevItems) => {
          const normalizedLocal = prevItems.map(normalizeWishlistItem).filter(Boolean);
          pendingAdds = normalizedLocal.filter((item) => !normalizedApi.some((api) => api.id === item.id));
          return mergeWishlistItems(normalizedLocal, normalizedApi);
        });
        for (const item of pendingAdds) {
          await addCustomerWishlist(payload.sub, item.id);
        }
      } finally {
        if (active) setHasSynced(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [hasSynced]);

  const addToWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized) return;
    setWishlistItems((prevItems) => {
      if (prevItems.some((item) => normalizeWishlistId(item.id) === normalized.id)) {
        return prevItems;
      }
      return [...prevItems, normalized];
    });
    const payload = getAccessTokenPayload();
    if (payload?.sub) {
      addCustomerWishlist(payload.sub, normalized.id).catch(() => {});
    }
  };

  const removeFromWishlist = (productId) => {
    const normalizedId = normalizeWishlistId(productId);
    if (!normalizedId) return;
    setWishlistItems((prevItems) => prevItems.filter((item) => normalizeWishlistId(item.id) !== normalizedId));
    const payload = getAccessTokenPayload();
    if (payload?.sub) {
      removeCustomerWishlist(payload.sub, normalizedId).catch(() => {});
    }
  };

  const isInWishlist = (productId) => {
    const normalizedId = normalizeWishlistId(productId);
    if (!normalizedId) return false;
    return wishlistItems.some((item) => normalizeWishlistId(item.id) === normalizedId);
  };

  const toggleWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized) return false;
    if (isInWishlist(normalized.id)) {
      removeFromWishlist(normalized.id);
      return false; // Removed
    } else {
      addToWishlist(normalized);
      return true; // Added
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
