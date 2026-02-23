import { createContext, useContext, useState, useEffect } from "react";
import { getAccessTokenPayload } from "@/services/auth";
import { getCustomerWishlist, addCustomerWishlist, removeCustomerWishlist } from "@/services/customerService";

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
  const rawId = item.productId ?? item.articleId ?? item.id;
  const id = rawId === null || rawId === undefined ? "" : `${rawId}`.trim();
  if (!id) return null;

  const name = `${item.name ?? item.articleName ?? item.title ?? ""}`.trim();
  const image =
    [
      item.image,
      item.imageUrl,
      item.articleImage,
      item.img,
      item.image_url,
    ]
      .map((v) => `${v ?? ""}`.trim())
      .find(Boolean) || "";

  const rawPrice = item.price ?? item.amount ?? item.unitPrice;
  const priceNum = Number(rawPrice);
  const price = Number.isFinite(priceNum) ? priceNum : rawPrice;

  return { ...item, id, name, image, price };
};

const mergeWishlistItems = (localItems, remoteItems) => {
  const merged = new Map();
  for (const item of remoteItems) {
    merged.set(item.id, item);
  }
  for (const item of localItems) {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
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
          try {
            await addCustomerWishlist(payload.sub, item.id);
          } catch {
            // Ignore sync errors (offline / 403 / etc.)
          }
        }
      } catch {
        // Ignore sync errors (offline / 403 / etc.)
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
      if (prevItems.some((item) => item.id === normalized.id)) {
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
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    const payload = getAccessTokenPayload();
    if (payload?.sub) {
      removeCustomerWishlist(payload.sub, productId).catch(() => {});
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false; // Removed
    } else {
      addToWishlist(product);
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
