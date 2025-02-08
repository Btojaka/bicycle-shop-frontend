import React, { useEffect, useState, useMemo } from "react";
import { useSoldProductsStore } from "../../store/useSoldProductStore";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Filters from "../../components/Filters";
import ConfirmModal from "../../components/ConfirmModal";
import socket from "../../helpers/socket";
import axios from "axios";

interface Part {
  id: number;
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

const SoldProducts = () => {
  const { soldProducts, fetchSoldProducts, loading, error } = useSoldProductsStore();
  const [modalProduct, setModalProduct] = useState<SoldProduct | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [priceOrder, setPriceOrder] = useState<"asc" | "desc" | "">("");

  const itemsPerPage = 10;

  // Filter by type and price
  const filteredProducts = useMemo(() => {
    let result = selectedType
      ? soldProducts.filter((product) => product.typeProduct === selectedType)
      : soldProducts;

    if (priceOrder) {
      result = [...result].sort((a, b) =>
        priceOrder === "asc" ? a.price - b.price : b.price - a.price
      );
    }
    return result;
  }, [soldProducts, selectedType, priceOrder]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / itemsPerPage),
    [filteredProducts.length, itemsPerPage]
  );

  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSoldProducts();

    // Listeners
    socket.on("customProductCreated", (newProduct) => {
      useSoldProductsStore.setState((state) => ({
        soldProducts: [...state.soldProducts, newProduct],
      }));
    });

    socket.on("customProductDeleted", ({ id }) => {
      useSoldProductsStore.setState((state) => ({
        soldProducts: state.soldProducts.filter((product) => product.id !== id),
      }));
    });

    // Clear events
    return () => {
      socket.off("customProductCreated");
      socket.off("customProductDeleted");
    };
  }, []);

  // Save product types
  const productTypes = useMemo(
    () => [...new Set(soldProducts.map((product) => product.typeProduct))],
    [soldProducts]
  );

  // Function to delete a sold product
  const handleDeleteSoldProduct = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(confirmDeleteId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/custom-products/${confirmDeleteId}`);
      fetchSoldProducts();
    } catch (error) {
      console.error("Error deleting sold product:", error);
    } finally {
      setIsDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  const productToDelete = useMemo(
    () => currentProducts.find((product) => product.id === confirmDeleteId),
    [currentProducts, confirmDeleteId]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" id="sold-products-title">
        Sold Products
      </h1>{" "}
      {/* Added ID to associate the heading with the table for accessibility */}
      {loading ? (
        <p className="text-gray-500" role="status">
          🔄 Loading sold products...
        </p>
      ) : // Indicates a loading state for screen readers
      error ? (
        <p className="text-red-500" role="alert">
          Error loading sold products. Please try again.
        </p>
      ) : (
        // Alerts the user about an error
        <>
          {/* Filters Component*/}
          <Filters
            productTypes={productTypes}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            priceOrder={priceOrder}
            setPriceOrder={setPriceOrder}
          />

          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse border border-gray-300"
              role="table"
              aria-labelledby="sold-products-title" // Ensures the table is properly identified for screen readers
            >
              <thead>
                <tr className="bg-gray-200" role="row">
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    ID
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Name
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Type
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Price Sold
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Date Sold
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Parts
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id} className="text-center" role="row">
                    <td className="border border-gray-300 px-4 py-2">{product.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-4 py-2 capitalize">
                      {product.typeProduct}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => setModalProduct(product)}
                        aria-label={`Show parts for ${product.name}`} // Provides a clear label for screen readers
                      >
                        Show Parts
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => setConfirmDeleteId(product.id)}
                        disabled={isDeleting === product.id}
                        aria-label={`Delete sold product ${product.name}`} // Adds context for screen readers
                      >
                        {isDeleting === product.id ? (
                          <div
                            className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"
                            aria-hidden="true" // Prevents unnecessary screen reader announcement
                          ></div>
                        ) : null}
                        {isDeleting === product.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      {/* Modal to show associated parts */}
      {modalProduct && (
        <Modal
          title={`Parts for ${modalProduct.name}`}
          columns={["ID", "Category", "Value", "Price", "Quantity", "Available"]}
          data={modalProduct.parts.map((part) => ({
            id: part.id,
            category: part.category,
            value: part.value,
            price: `${part.price.toFixed(2)} €`,
            quantity: part.quantity,
            available: part.isAvailable ? "✅ Yes" : "❌ No",
          }))}
          onClose={() => setModalProduct(null)}
        />
      )}
      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteSoldProduct}
        title={`Delete ${productToDelete ? productToDelete.typeProduct + " / " + productToDelete.name : ""}`}
        message="Are you sure you want to delete this sold product? This action cannot be undone, and it will also be removed from the custom product parts list."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        aria-live="polite" // Ensures screen readers announce this change
      />
    </div>
  );
};

export default React.memo(SoldProducts);
