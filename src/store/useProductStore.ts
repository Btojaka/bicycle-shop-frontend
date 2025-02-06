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
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      set({ products: response.data, loading: false }); // Guardamos TODOS los productos en el estado global
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "Error fetching products", loading: false });
      }
    }
  },
}));
