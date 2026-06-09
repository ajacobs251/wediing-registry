"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartProductSnapshot } from "@/types/store";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "wedding-website-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

        if (storedCart) {
          setItems(JSON.parse(storedCart) as CartItem[]);
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [isLoaded, items]);

  const addItem = useCallback((product: CartProductSnapshot, quantity = 1) => {
    const quantityToAdd = Math.max(1, Math.min(quantity, 99));
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, 99) }
            : item,
        );
      }
      return [...currentItems, { product, quantity: quantityToAdd }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, 99) }
          : item,
      ),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotalCents,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [addItem, clearCart, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
