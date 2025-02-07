import { create } from "zustand";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
  restrictions?: { [category: string]: string[] }; // Restrictions per category
}

interface ProductRestrictions {
  [productId: number]: { [category: string]: string[] };
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  restrictions: ProductRestrictions;
  fetchProducts: () => Promise<void>;
  fetchProductRestrictions: (productId: number) => Promise<void>;
  setRestrictions: (
    productId: number,
    restrictions: { [category: string]: string[] }
  ) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  restrictions: {}, // Store restrictions for each product

  fetchProducts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);

      // Extract restrictions from products
      const extractedRestrictions: ProductRestrictions = {};
      const productsWithRestrictions = response.data.map((product: Product) => {
        extractedRestrictions[product.id] = product.restrictions || {};
        return { ...product, restrictions: product.restrictions || {} };
      });

      set({
        products: productsWithRestrictions,
        restrictions: extractedRestrictions,
        loading: false,
      });
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      set({ error: "Error fetching products", loading: false });
    }
  },

  fetchProductRestrictions: async (productId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);

      if (response.data) {
        set((state) => ({
          restrictions: {
            ...state.restrictions,
            [productId]: response.data.restrictions || {}, // Ensure it's always an object
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching restrictions for product ${productId}:`, error);
    }
  },

  setRestrictions: async (productId, restrictions) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
        restrictions,
      });

      set((state) => {
        const updatedProducts = state.products.map((product) =>
          product.id === productId ? { ...product, restrictions } : product
        );

        return {
          restrictions: { ...state.restrictions, [productId]: restrictions },
          products: updatedProducts, // Ensure products reflect updated restrictions
        };
      });
    } catch (error) {
      console.error(`Error updating restrictions for product ${productId}:`, error);
    }
  },
}));
