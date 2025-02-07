import { create } from "zustand";
import axios from "axios";

interface Part {
  id: number;
  category: string;
  value: string;
  price: number;
  isAvailable: boolean;
  quantity: number;
  typeProduct: string;
}

interface PartState {
  parts: Part[];
  loading: boolean;
  error: string | null;
  fetchParts: () => Promise<void>;
}

export const usePartStore = create<PartState>((set) => ({
  parts: [],
  loading: false,
  error: null,

  fetchParts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/parts`);
      // Convert 'price' to a number when updating the state
      const formattedParts = response.data.map((part: Part) => ({
        ...part,
        price: Number(part.price) || 0, // fallback to 0
      }));

      set({ parts: formattedParts, loading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, loading: false });
      } else {
        set({ error: "Error fetching parts", loading: false });
      }
    }
  },
}));
