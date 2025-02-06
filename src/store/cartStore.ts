import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Part {
  id: number;
  category: string;
  value: string;
  price: number;
  isAvailable: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  type: string;
  isAvailable: boolean;
  parts?: Part[];
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    // Save cart in localStorage
    (set) => ({
      cart: [],
      // Add product to cart
      addToCart: (product) => {
        console.log("State before adding:", useCartStore.getState().cart);
        console.log("Adding product to cart in Zustand:", product);
        // To update the state
        set((state) => ({
          cart: [...state.cart, product],
        }));

        console.log("State after adding:", useCartStore.getState().cart);
      },
      // Remove product from cart
      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },
      // Clear cart
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: "cart-storage", // Save cart in localStorage
    }
  )
);

export default useCartStore;
