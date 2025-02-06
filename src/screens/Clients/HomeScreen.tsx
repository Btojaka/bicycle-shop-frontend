import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import socket from "../../helpers/socket";
import { useProductStore } from "../../store/useProductStore";

const HomeScreen = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [selectedType, setSelectedType] = useState(""); // Estado para el filtro

  const availableProducts = products.filter((product) => product.isAvailable); // Only availables

  const filteredProducts = selectedType
    ? availableProducts.filter((product) => product.type === selectedType) // Filter type
    : availableProducts;

  // Get data from the store
  useEffect(() => {
    fetchProducts(); // Fetch products once when mounts and then only when needed

    // Listen for product creation
    socket.on("productCreated", (newProduct) => {
      if (newProduct.isAvailable) {
        useProductStore.setState((state) => ({
          products: [...state.products, newProduct],
        }));
      }
    });
    // Listen for product updates (partial and total)
    socket.on("productUpdated", (updatedProduct) => {
      useProductStore.setState((state) => {
        const updatedProducts = state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        );

        return {
          products: updatedProduct.isAvailable
            ? updatedProducts
            : updatedProducts.filter((p) => p.id !== updatedProduct.id),
        };
      });
    });
    // Listen for product deletions
    socket.on("productDeleted", ({ id }) => {
      useProductStore.setState((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
    });
    // Clean up listeners
    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Products</h1>
      <div className="mb-4 flex justify-center">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option defaultChecked value="">
            All Products
          </option>
          <option value="bicycle">Bicycles</option>
          <option value="ski">Ski</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">🔄 Loading products...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">Type: {product.type}</p>
              <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>
              <Link
                to={`/product/${product.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No available products at the moment.</p>
      )}
    </div>
  );
};

export default HomeScreen;
