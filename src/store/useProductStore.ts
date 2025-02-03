import { create } from "zustand";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchProducts: async () => {
    const lastFetched = get().lastFetched;
    const fiveMinutes = 5 * 60 * 1000;

    if (lastFetched && Date.now() - lastFetched < fiveMinutes) {
      console.log("⏳ Usando datos cacheados, evitando nueva petición...");
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);

      // Compare the previous products with the new products
      const prevProducts = get().products;
      const newProducts = response.data;

      const hasChanged =
        prevProducts.length !== newProducts.length ||
        prevProducts.some((prevProduct, index) => {
          const newProduct = newProducts[index];
          return (
            prevProduct.name !== newProduct.name ||
            prevProduct.type !== newProduct.type ||
            prevProduct.price !== newProduct.price ||
            prevProduct.isAvailable !== newProduct.isAvailable
          );
        });

      if (hasChanged) {
        console.log("🔄 Detected changes in product data, updating state...");
        set({ products: newProducts, lastFetched: Date.now() });
      } else {
        console.log("✅ No changes detected, keeping existing state.");
      }

      set({ loading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "Error fetching products", loading: false });
      }
    }
  },
}));
