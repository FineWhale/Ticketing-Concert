import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string; // unique key: section + type + seatIds joined
  section: string;
  type: string;
  priceEach: number;
  quantity: number;
  seatIds: string[]; // kosong untuk standing
  seatLabels: string[]; // kosong untuk standing, e.g. ["IA1", "IA2"]
}

export interface AddCartItemInput {
  section: string;
  type: string;
  priceEach: number;
  quantity: number;
  seatIds: string[];
  seatLabels: string[];
}

interface CartContextType {
  cart: CartItem[];
  addItem: (input: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = (input: AddCartItemInput) => {
    const isSeated = input.seatIds.length > 0;

    // Seated ticket: ID unik per kombinasi seat
    // Standing ticket: ID unik per section+type, qty bisa di-stack
    const id = isSeated
      ? `${input.section}-${input.type}-${input.seatIds.sort().join("_")}`
      : `${input.section}-${input.type}`;

    setCart((prev) => {
      if (isSeated) {
        // Seated: selalu replace (bukan stack), karena seat list bisa berubah
        const exists = prev.find((i) => i.id === id);
        if (exists) {
          return prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  quantity: input.quantity,
                  seatIds: input.seatIds,
                  seatLabels: input.seatLabels,
                }
              : i,
          );
        }
        return [...prev, { id, ...input }];
      } else {
        // Standing: stack quantity
        const exists = prev.find((i) => i.id === id);
        if (exists) {
          return prev.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + input.quantity } : i,
          );
        }
        return [...prev, { id, ...input }];
      }
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.priceEach * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
