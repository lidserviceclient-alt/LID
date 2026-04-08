import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getAccessTokenPayload } from "@/services/auth";
import { addCustomerWishlist, removeCustomerWishlist } from "@/services/customerService";
import { CUSTOMER_SESSION_CLEARED_EVENT } from "@/services/sessionCleanup";
import { useCustomerSession } from "@/features/customerSession/CustomerSessionContext";

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
  const customerSession = useCustomerSession();
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("wishlist");
      const items = savedWishlist ? JSON.parse(savedWishlist) : [];
      return items.map(normalizeWishlistItem).filter(Boolean);
    }
    return [];
  });
  const [hasSynced, setHasSynced] = useState(false);
  const remoteWishlistItems = useMemo(() => {
    return (Array.isArray(customerSession?.wishlist) ? customerSession.wishlist : [])
      .map(normalizeWishlistItem)
      .filter(Boolean);
  }, [customerSession?.wishlist]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    const clearWishlist = () => {
      setHasSynced(false);
      setWishlistItems([]);
    };
    window.addEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearWishlist);
    return () => window.removeEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearWishlist);
  }, []);

  useEffect(() => {
    if (hasSynced) return;
    const payload = getAccessTokenPayload();
    if (!payload?.sub) return;
    if (!customerSession?.canLoadCustomerSession) return;
    if (!customerSession?.isResolved) return;
    let active = true;
    (async () => {
      try {
        const normalizedApi = remoteWishlistItems;
        let pendingAdds = [];
        setWishlistItems((prevItems) => {
          const normalizedLocal = prevItems.map(normalizeWishlistItem).filter(Boolean);
          pendingAdds = normalizedLocal.filter((item) => !normalizedApi.some((api) => api.id === item.id));
          return mergeWishlistItems(normalizedLocal, normalizedApi);
        });
        for (const item of pendingAdds) {
          try {
            await addCustomerWishlist(payload.sub, item.id);
            customerSession?.updateCustomerCollection?.((prev) => {
              const current = Array.isArray(prev?.wishlist) ? prev.wishlist : [];
              if (current.some((entry) => normalizeWishlistItem(entry)?.id === item.id)) {
                return prev;
              }
              return { ...(prev || {}), wishlist: [...current, item] };
            });
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
  }, [customerSession, hasSynced, remoteWishlistItems]);

  useEffect(() => {
    if (!customerSession?.isResolved) return;
    if (remoteWishlistItems.length === 0) return;
    setWishlistItems((prevItems) => mergeWishlistItems(prevItems.map(normalizeWishlistItem).filter(Boolean), remoteWishlistItems));
  }, [customerSession?.isResolved, remoteWishlistItems]);

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
      addCustomerWishlist(payload.sub, normalized.id)
        .then(() => {
          customerSession?.updateCustomerCollection?.((prev) => {
            const current = Array.isArray(prev?.wishlist) ? prev.wishlist : [];
            if (current.some((entry) => normalizeWishlistItem(entry)?.id === normalized.id)) {
              return prev;
            }
            return { ...(prev || {}), wishlist: [...current, normalized] };
          });
        })
        .catch(() => {});
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    const payload = getAccessTokenPayload();
    if (payload?.sub) {
      removeCustomerWishlist(payload.sub, productId)
        .then(() => {
          customerSession?.updateCustomerCollection?.((prev) => ({
            ...(prev || {}),
            wishlist: (Array.isArray(prev?.wishlist) ? prev.wishlist : []).filter(
              (entry) => normalizeWishlistItem(entry)?.id !== productId
            ),
          }));
        })
        .catch(() => {});
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
