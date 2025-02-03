import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import socket from "../helpers/socket"; // Importamos la conexión WebSocket

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
}

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);

  // 🔄 Obtener productos disponibles desde la API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      setProducts(response.data.filter((product: Product) => product.isAvailable));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(); // Cargar productos al montar la página

    // 📌 Escuchar eventos de WebSocket para actualizaciones en tiempo real

    // 1️⃣ Cuando se CREA un producto
    socket.on("productCreated", (newProduct: Product) => {
      setProducts((prevProducts) => {
        // Solo agregarlo si está disponible
        if (newProduct.isAvailable) {
          return [...prevProducts, newProduct];
        }
        return prevProducts;
      });
    });

    // 2️⃣ Cuando se ACTUALIZA un producto
    socket.on("productUpdated", (updatedProduct: Product) => {
      setProducts((prevProducts) => {
        const productExists = prevProducts.some((product) => product.id === updatedProduct.id);

        if (productExists) {
          // Si el producto está en la lista y ahora `isAvailable` es `false`, eliminarlo
          if (!updatedProduct.isAvailable) {
            return prevProducts.filter((product) => product.id !== updatedProduct.id);
          }
          // Si el producto está en la lista y cambió algún atributo, actualizarlo
          return prevProducts.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          );
        } else {
          // Si el producto NO estaba en la lista pero ahora `isAvailable` es `true`, agregarlo
          if (updatedProduct.isAvailable) {
            return [...prevProducts, updatedProduct];
          }
        }

        return prevProducts;
      });
    });

    // 3️⃣ Cuando se ELIMINA un producto
    socket.on("productDeleted", ({ id }: { id: number }) => {
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    });

    // Cleanup function para evitar múltiples listeners
    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">Type: {product.type}</p>
              <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
              <Link
                to={`/product/${product.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No available products at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
