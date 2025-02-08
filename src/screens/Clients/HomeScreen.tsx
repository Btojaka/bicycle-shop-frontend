import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import socket from "../../helpers/socket";
import { useProductStore } from "../../store/useProductStore";
import Filters from "../../components/Filters";

const HomeScreen = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [selectedType, setSelectedType] = useState(""); // State for the filter
  const [priceOrder, setPriceOrder] = useState<"asc" | "desc" | "">("");

  // Memoize product types
  const productTypes = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.type)));
  }, [products]);

  // Only filter products if `products`, `selectedType`, or `priceOrder` change
  const filteredProducts = useMemo(() => {
    let availableProducts = products.filter((product) => product.isAvailable);
    if (selectedType) {
      availableProducts = availableProducts.filter((product) => product.type === selectedType);
    }
    if (priceOrder) {
      availableProducts = [...availableProducts].sort((a, b) =>
        priceOrder === "asc" ? a.price - b.price : b.price - a.price
      );
    }
    return availableProducts;
  }, [products, selectedType, priceOrder]);

  // Get data from the store
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }

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
      <h1 className="text-3xl font-bold mb-6 text-center" id="products-title">
        {" "}
        {/* id for better association with screen readers */}
        Available Products
      </h1>

      {/* Filters Component*/}
      <Filters
        productTypes={productTypes}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        priceOrder={priceOrder}
        setPriceOrder={setPriceOrder}
      />

      {loading ? (
        <p className="text-center text-gray-500" role="alert">
          🔄 Loading products...
        </p>
      ) : // Added role="alert" so screen readers announce loading status
      products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-lg shadow-blue-950 border border-gray-300 rounded-lg p-4 transition-all duration-300 
              hover:shadow-xl hover:shadow-blue-900 hover:border-2 hover:border-blue-950 hover:bg-blue-50"
              role="region"
              aria-labelledby={`product-${product.id}-title`} // Added a region role to group each product for better navigation
            >
              <h2 id={`product-${product.id}-title`} className="text-xl font-semibold">
                {product.name}
              </h2>
              <p className="text-gray-900">Type: {product.type}</p>
              <p className="text-lg font-bold">{product.price.toFixed(2)}€</p>
              <Link
                to={`/product/${product.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                aria-label={`View details for ${product.name}`} // Ensures screen readers provide clear navigation context
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500" role="alert">
          No available products at the moment.
        </p>
        // Role alert to ensure screen readers announce when there are no products
      )}
    </div>
  );
};

export default React.memo(HomeScreen);
