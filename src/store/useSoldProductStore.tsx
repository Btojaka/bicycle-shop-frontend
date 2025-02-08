import { create } from "zustand";
import axios from "axios";

interface Part {
  id: number;
  typeProduct: string;
  category: string;
  value: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
}

interface SoldProduct {
  id: number;
  typeProduct: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  parts: Part[];
}

interface SoldProductState {
  soldProducts: SoldProduct[];
  loading: boolean;
  error: string | null;
  fetchSoldProducts: () => Promise<void>;
}

export const useSoldProductsStore = create<SoldProductState>((set) => ({
  soldProducts: [],
  loading: false,
  error: null,
  fetchSoldProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/custom-products`);
      set({ soldProducts: response.data, loading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "Error fetching sold products", loading: false });
      }
    }
  },
}));
