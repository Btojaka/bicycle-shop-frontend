import { useEffect } from "react";
import axios from "axios";
import { create } from "zustand";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true });

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      const newProducts = response.data.filter((product: Product) => product.isAvailable); // 🔥 Filtra solo los disponibles

      const prevProducts = get().products;

      // 🔥 Comparar los datos anteriores con los nuevos
      const hasChanged = JSON.stringify(prevProducts) !== JSON.stringify(newProducts);

      if (hasChanged) {
        console.log("🔄 Datos cambiaron, actualizando...");
        set({ products: newProducts, error: null });
      } else {
        console.log("✅ No hay cambios en los productos.");
      }

      set({ loading: false });
    } catch (error) {
      set({ error: "Error fetching products", loading: false });
    }
  },
}));

const HomeScreen = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts(); // 🚀 Comprobar si hay cambios en la BD
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Products</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 && !loading && (
          <p className="text-center text-gray-500">No available products.</p>
        )}
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">Type: {product.type}</p>
            <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
