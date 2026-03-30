import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const playSuccessSound = () => {
    const audioObj = new Audio('/sound/click.wav'); 
    audioObj.volume = 0.5;
    audioObj.play().catch(() => {});
  };

  const addToCart = (product) => {
    playSuccessSound();
    toast.success("Ajouté au panier !");
    const qtyToAdd = Math.max(1, Math.trunc(Number(product?.quantity) || 1));
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.color === product.color && item.size === product.size);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.color === product.color && item.size === product.size
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = (itemId, color, size) => {
    setCartItems((prevItems) => prevItems.filter((item) => !(item.id === itemId && item.color === color && item.size === size)));
  };

  const updateQuantity = (itemId, color, size, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId && item.color === color && item.size === size) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
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

        const lineId = toNumberId(line?.articleId);
        const lineRef = normalizeRef(line?.referenceProduitPartenaire);

        for (let i = 0; i < nextItems.length && remaining > 0; i += 1) {
          const item = nextItems[i];
          const itemId = toNumberId(item?.articleId ?? item?.id);
          const itemRef = normalizeRef(item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku);
          const idMatch = lineId !== null && itemId !== null && lineId === itemId;
          const refMatch = !!lineRef && !!itemRef && lineRef === itemRef;
          if (!idMatch && !refMatch) continue;

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

      return nextItems.filter(Boolean);
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
