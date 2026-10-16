import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProductVariant } from "@/lib/products";

export type CartProduct = {
  id: string;
  name: string;
  unitPrice: number;
  subtitle: string;
  category: string;
  imageUrl: string;
  variants: ProductVariant[];
};

export type CartItem = CartProduct & {
  lineId: string;
  size: string;
  variantId: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, size: string, quantity: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  updateSize: (lineId: string, size: string) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (product, size, quantity) => {
      const variant = product.variants.find((item) => item.size === size);
      if (!variant || quantity < 1) return;
      setItems((current) => {
        const lineId = `${product.id}:${size}`;
        const existing = current.find((item) => item.lineId === lineId);

        if (existing) {
          return current.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item,
          );
        }

        return [
          ...current,
          { ...product, lineId, size, variantId: variant.variantId, quantity: Math.min(10, quantity) },
        ];
      });
    };

    const updateQuantity: CartContextValue["updateQuantity"] = (
      lineId,
      quantity,
    ) => {
      setItems((current) =>
        current.map((item) =>
          item.lineId === lineId ? { ...item, quantity } : item,
        ),
      );
    };

    const updateSize: CartContextValue["updateSize"] = (lineId, size) => {
      setItems((current) => {
        const item = current.find((entry) => entry.lineId === lineId);
        if (!item || item.size === size) return current;
        const variant = item.variants.find((entry) => entry.size === size);
        if (!variant) return current;

        const nextLineId = `${item.id}:${size}`;
        const matchingItem = current.find(
          (entry) => entry.lineId === nextLineId,
        );

        return current
          .filter((entry) => entry.lineId !== lineId)
          .map((entry) =>
            entry.lineId === nextLineId
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry,
          )
          .concat(
            matchingItem
              ? []
              : [{ ...item, lineId: nextLineId, size, variantId: variant.variantId }],
          );
      });
    };

    return {
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotal: items.reduce(
        (amount, item) => amount + item.unitPrice * item.quantity,
        0,
      ),
      addItem,
      updateQuantity,
      updateSize,
      removeItem: (lineId) =>
        setItems((current) => current.filter((item) => item.lineId !== lineId)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
