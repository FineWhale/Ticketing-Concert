import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  section: string;
  type: string;
  priceEach: number;
  quantity: number;
  seatIds: string[];
  seatLabels: string[];
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
  decreaseItem: (id: string) => void; // ← kurangi 1, hapus jika 0
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
    const id = isSeated
      ? `${input.section}-${input.type}-${input.seatIds.sort().join("_")}`
      : `${input.section}-${input.type}`;

    setCart((prev) => {
      if (isSeated) {
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

  // Hapus item sepenuhnya
  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Kurangi 1, hapus jika qty jadi 0
  const decreaseItem = (id: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.priceEach * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        decreaseItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCartContext must be used within a CartProvider");
  return context;
};
