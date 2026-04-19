import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getCurrentUserPayload } from "@/services/authService";
import { clearCustomerCart, getCustomerCart, syncCustomerCart } from "@/services/cartService";
import { CUSTOMER_SESSION_CLEARED_EVENT } from "@/services/sessionCleanup";

const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  consumePurchasedItems: () => {},
  cartTotal: 0,
  cartCount: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

const LOCAL_CART_KEY = "cart";
const ITEM_TYPES = {
  ARTICLE: "ARTICLE",
  TICKET: "TICKET",
};

const normalizeVariant = (value) => {
  const normalized = `${value ?? ""}`.trim();
  return normalized || null;
};

const lineKey = (item) => {
  const itemType = `${item?.itemType || (item?.ticketEventId ? ITEM_TYPES.TICKET : ITEM_TYPES.ARTICLE)}`.trim().toUpperCase();
  const articleId = Number(item?.articleId ?? (itemType === ITEM_TYPES.ARTICLE ? item?.id : null));
  const ticketEventId = Number(item?.ticketEventId ?? (itemType === ITEM_TYPES.TICKET ? item?.id : null));
  const color = `${normalizeVariant(item?.color) || ""}`.toLowerCase();
  const size = `${normalizeVariant(item?.size) || ""}`.toLowerCase();
  return `${itemType}::${articleId || 0}::${ticketEventId || 0}::${color}::${size}`;
};

const toPositiveInt = (value, fallback = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
};

const toSignedInt = (value, fallback = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
};

const normalizeCartItem = (item) => {
  if (!item) return null;
  const itemType = `${item?.itemType || (item?.ticketEventId ? ITEM_TYPES.TICKET : item?.type === "ticket" ? ITEM_TYPES.TICKET : ITEM_TYPES.ARTICLE)}`.trim().toUpperCase();
  const articleId = itemType === ITEM_TYPES.ARTICLE ? toPositiveInt(item?.articleId ?? item?.id, 0) : 0;
  const ticketEventId = itemType === ITEM_TYPES.TICKET ? toPositiveInt(item?.ticketEventId ?? item?.id, 0) : 0;
  if (itemType === ITEM_TYPES.ARTICLE && !articleId) return null;
  if (itemType === ITEM_TYPES.TICKET && !ticketEventId) return null;
  const quantity = toPositiveInt(item?.quantity, 0);
  if (!quantity) return null;
  const price = Number(item?.price);
  return {
    ...item,
    id: itemType === ITEM_TYPES.TICKET ? ticketEventId : articleId,
    itemType,
    articleId,
    ticketEventId,
    quantity,
    color: itemType === ITEM_TYPES.ARTICLE ? normalizeVariant(item?.color) : null,
    size: itemType === ITEM_TYPES.ARTICLE ? normalizeVariant(item?.size) : null,
    price: Number.isFinite(price) ? price : 0,
    name: `${item?.name ?? item?.articleName ?? item?.title ?? ""}`.trim(),
    image: `${item?.image ?? item?.articleImage ?? item?.imageUrl ?? ""}`.trim(),
    imageUrl: `${item?.imageUrl ?? item?.articleImage ?? item?.image ?? ""}`.trim(),
    referenceProduitPartenaire: `${item?.referenceProduitPartenaire ?? item?.referencePartenaire ?? item?.sku ?? ""}`.trim(),
  };
};

const localCartSnapshot = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return (Array.isArray(parsed) ? parsed : []).map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
};

const saveLocalCartSnapshot = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(Array.isArray(items) ? items : []));
};

const readCustomerId = () => {
  const payload = getCurrentUserPayload();
  if (!payload?.sub) return null;
  return payload.sub;
};

const mapServerCartToItems = (cart) => {
  const fromItems = Array.isArray(cart?.items) ? cart.items : [];
  if (fromItems.length > 0) {
    return fromItems.map((item) => normalizeCartItem(item)).filter(Boolean);
  }
  const fromArticles = Array.isArray(cart?.articles) ? cart.articles : [];
  return fromArticles
    .map((line) =>
      normalizeCartItem({
        id: line?.article?.id,
        articleId: line?.article?.id,
        itemType: ITEM_TYPES.ARTICLE,
        quantity: line?.quantity,
        color: line?.color,
        size: line?.size,
        name: line?.article?.name,
        price: line?.article?.price,
        image: line?.article?.mainImageUrl,
        imageUrl: line?.article?.mainImageUrl,
        sku: line?.article?.sku,
        referenceProduitPartenaire: line?.article?.referenceProduitPartenaire || line?.article?.sku,
      })
    )
    .filter(Boolean);
};

const toServerPayload = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => normalizeCartItem(item))
    .filter(Boolean)
    .map((item) => ({
      itemType: item.itemType || ITEM_TYPES.ARTICLE,
      articleId: item.articleId || undefined,
      ticketEventId: item.ticketEventId || undefined,
      quantity: item.quantity,
      color: item.color || null,
      size: item.size || null,
    }));

const mergeItems = (baseItems, incomingItems) => {
  const merged = new Map();
  for (const raw of Array.isArray(baseItems) ? baseItems : []) {
    const item = normalizeCartItem(raw);
    if (!item) continue;
    merged.set(lineKey(item), item);
  }
  for (const raw of Array.isArray(incomingItems) ? incomingItems : []) {
    const item = normalizeCartItem(raw);
    if (!item) continue;
    const key = lineKey(item);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
    } else {
      merged.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    }
  }
  return Array.from(merged.values());
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => localCartSnapshot());
  const [customerId, setCustomerId] = useState(() => readCustomerId());
  const syncTimerRef = useRef(null);
  const pendingSyncRef = useRef(null);
  const hydratingRef = useRef(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCustomerId = useCallback(() => {
    setCustomerId(readCustomerId());
  }, []);

  const flushSync = useCallback(async () => {
    if (!customerId) return;
    if (!pendingSyncRef.current) return;
    const payload = pendingSyncRef.current;
    pendingSyncRef.current = null;
    try {
      const cart = await syncCustomerCart(customerId, payload);
      setCartItems(mapServerCartToItems(cart));
    } catch {
      // Keep optimistic local state, backend sync will retry on next mutation.
    }
  }, [customerId]);

  const scheduleSync = useCallback(
    (items) => {
      if (!customerId) return;
      pendingSyncRef.current = toServerPayload(items);
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = window.setTimeout(() => {
        syncTimerRef.current = null;
        flushSync();
      }, 250);
    },
    [customerId, flushSync]
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (event) => {
      if (event?.key && event.key !== "lid_access_token") return;
      refreshCustomerId();
    };
    const onFocus = () => refreshCustomerId();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCustomerId]);

  useEffect(() => {
    const clearLocalSessionCart = () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      pendingSyncRef.current = null;
      setCustomerId(null);
      setCartItems([]);
      saveLocalCartSnapshot([]);
    };
    window.addEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearLocalSessionCart);
    return () => window.removeEventListener(CUSTOMER_SESSION_CLEARED_EVENT, clearLocalSessionCart);
  }, []);

  useEffect(() => {
    if (!customerId) {
      setCartItems(localCartSnapshot());
      return;
    }
    if (hydratingRef.current) return;
    hydratingRef.current = true;
    (async () => {
      try {
        const dbCart = await getCustomerCart(customerId).catch((err) => (err?.response?.status === 404 ? null : Promise.reject(err)));
        const dbItems = mapServerCartToItems(dbCart);
        const localItems = localCartSnapshot();
        const merged = mergeItems(dbItems, localItems);
        const synced = await syncCustomerCart(customerId, toServerPayload(merged));
        setCartItems(mapServerCartToItems(synced));
        saveLocalCartSnapshot([]);
      } finally {
        hydratingRef.current = false;
      }
    })();
  }, [customerId]);

  useEffect(() => {
    if (customerId) return;
    saveLocalCartSnapshot(cartItems);
  }, [cartItems, customerId]);

  const playSuccessSound = () => {
    const audioObj = new Audio('/sound/click.wav'); 
    audioObj.volume = 0.5;
    audioObj.play().catch(() => {});
  };

  const addToCart = (product) => {
    playSuccessSound();
    toast.success("Ajouté au panier !");
    const qtyToAdd = Math.max(1, toPositiveInt(product?.quantity, 1));
    setCartItems((prevItems) => {
      const normalized = normalizeCartItem({ ...product, quantity: qtyToAdd });
      if (!normalized) return prevItems;
      const existingItem = prevItems.find((item) => lineKey(item) === lineKey(normalized));
      if (existingItem) {
        const next = prevItems.map((item) =>
          lineKey(item) === lineKey(normalized)
            ? { ...item, quantity: toPositiveInt(item.quantity, 0) + qtyToAdd }
            : item
        );
        scheduleSync(next);
        return next;
      }
      const next = [...prevItems, normalized];
      scheduleSync(next);
      return next;
    });
  };

  const removeFromCart = (itemId, color, size) => {
    setCartItems((prevItems) => {
      const targetKey = lineKey({ id: itemId, color, size, itemType: prevItems.find((item) => `${item?.id}` === `${itemId}` && `${item?.color || ""}` === `${color || ""}` && `${item?.size || ""}` === `${size || ""}`)?.itemType });
      const next = prevItems.filter((item) => lineKey(item) !== targetKey);
      scheduleSync(next);
      return next;
    });
  };

  const updateQuantity = (itemId, color, size, delta) => {
    setCartItems((prevItems) => {
      const targetKey = lineKey({ id: itemId, color, size, itemType: prevItems.find((item) => `${item?.id}` === `${itemId}` && `${item?.color || ""}` === `${color || ""}` && `${item?.size || ""}` === `${size || ""}`)?.itemType });
      const next = prevItems
        .map((item) => {
          if (lineKey(item) !== targetKey) return item;
          const newQuantity = Math.max(1, toPositiveInt(item.quantity, 1) + toSignedInt(delta, 0));
          return { ...item, quantity: newQuantity };
        })
        .filter(Boolean);
      scheduleSync(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveLocalCartSnapshot([]);
    if (customerId) {
      clearCustomerCart(customerId).catch(() => {});
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      pendingSyncRef.current = null;
      return;
    }
    saveLocalCartSnapshot([]);
  };

  const consumePurchasedItems = (purchasedItems) => {
    const normalized = Array.isArray(purchasedItems) ? purchasedItems : [];
    if (normalized.length === 0) return;

    const toNumberId = (value) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    };
    const normalizeRef = (value) => `${value || ''}`.trim().toLowerCase();

    setCartItems((prevItems) => {
      let nextItems = [...prevItems];

      normalized.forEach((line) => {
        let remaining = Math.max(0, Math.trunc(Number(line?.quantity) || 0));
        if (remaining <= 0) return;

        const lineType = `${line?.itemType || (line?.ticketEventId ? ITEM_TYPES.TICKET : ITEM_TYPES.ARTICLE)}`.trim().toUpperCase();
        const lineId = toNumberId(line?.articleId);
        const ticketId = toNumberId(line?.ticketEventId);
        const lineRef = normalizeRef(line?.referenceProduitPartenaire);

        for (let i = 0; i < nextItems.length && remaining > 0; i += 1) {
          const item = nextItems[i];
          const itemType = `${item?.itemType || (item?.ticketEventId ? ITEM_TYPES.TICKET : ITEM_TYPES.ARTICLE)}`.trim().toUpperCase();
          const itemId = toNumberId(item?.articleId ?? item?.id);
          const itemTicketId = toNumberId(item?.ticketEventId);
          const itemRef = normalizeRef(item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku);
          const idMatch = lineType === ITEM_TYPES.ARTICLE && itemType === ITEM_TYPES.ARTICLE && lineId !== null && itemId !== null && lineId === itemId;
          const ticketMatch = lineType === ITEM_TYPES.TICKET && itemType === ITEM_TYPES.TICKET && ticketId !== null && itemTicketId !== null && ticketId === itemTicketId;
          const refMatch = !!lineRef && !!itemRef && lineRef === itemRef;
          if (!idMatch && !ticketMatch && !refMatch) continue;

          const itemQty = Math.max(0, Math.trunc(Number(item?.quantity) || 0));
          if (itemQty <= remaining) {
            remaining -= itemQty;
            nextItems[i] = null;
          } else {
            nextItems[i] = { ...item, quantity: itemQty - remaining };
            remaining = 0;
          }
        }
      });

      const next = nextItems.filter(Boolean);
      scheduleSync(next);
      return next;
    });
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = Number(item?.price);
    const qty = Number(item?.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) return total;
    return total + price * qty;
  }, 0);
  const cartCount = cartItems.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        consumePurchasedItems,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
