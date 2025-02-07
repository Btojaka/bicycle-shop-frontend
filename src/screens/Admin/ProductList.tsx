import { useEffect, useState } from "react";
import { useProductStore } from "../../store/useProductStore";
import Pagination from "../../components/Pagination";
import socket from "../../helpers/socket";
import axios from "axios";
import ProductModal from "../../components/ProductModal";
import ConfirmModal from "../../components/ConfirmModal";

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
}

interface ProductFormData {
  name: string;
  type: string;
  price: string;
  isAvailable: boolean;
}

const ProductList = () => {
  const { products, fetchProducts, loading, error } = useProductStore();
  const [isLoading, setIsLoading] = useState(loading);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    price: "",
    isAvailable: true,
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (products.length === 0) {
      setIsLoading(true);
      fetchProducts().finally(() => setIsLoading(false));
    }

    // Listeners
    socket.on("productCreated", (newProduct: Product) => {
      useProductStore.setState((state) => ({
        products: [...state.products, newProduct],
      }));
    });

    socket.on("productUpdated", (updatedProduct: Product) => {
      useProductStore.setState((state) => ({
        products: state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        ),
      }));
    });

    socket.on("productDeleted", ({ id }: { id: number }) => {
      useProductStore.setState((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
    });
    // Clear listeners
    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
      socket.off("productDeleted");
    };
  }, []);

  // Open modal for adding/editing a product
  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditProduct(product);
      setFormData({
        name: product.name || "",
        type: product.type || "",
        price: product.price?.toString() || "",
        isAvailable: product.isAvailable ?? true,
      });
    } else {
      setEditProduct(null);
      setFormData({ name: "", type: "", price: "", isAvailable: true });
    }
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  const handleSaveProduct = async (): Promise<{ id: number } | null> => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(formData)
          .filter(([, value]) => value !== "") // Remove empty fields
          .map(([key, value]) => {
            if (key === "price") return [key, parseFloat(value)]; // Convert price to number
            if (key === "isAvailable") return [key, Boolean(value)]; // Ensure `isAvailable` is strictly a boolean
            return [key, value.toString().trim()]; // Trim strings
          })
      );

      const method = editProduct
        ? Object.keys(filteredData).length < Object.keys(formData).length
          ? "patch"
          : "put"
        : "post";

      const url = editProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editProduct.id}`
        : `${import.meta.env.VITE_API_URL}/api/products`;

      console.log("Using method:", method.toUpperCase(), "Data:", filteredData);

      const response = await axios[method](url, filteredData);
      console.log("respuesta", response);
      await fetchProducts();
      handleCloseModal();

      return response.data.data; // Ensure response.data contains { id: number }
    } catch (error) {
      console.error("Error saving product:", error);
      return null;
    }
  };

  const handleDeleteProduct = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(confirmDeleteId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${confirmDeleteId}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(null);
      setConfirmDeleteId(null);
    }
  };
  // Save item to delete
  const productToDelete = currentProducts.find((product) => product.id === confirmDeleteId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" id="products-title">
        All Products
      </h1>{" "}
      {/* Added ID for accessibility */}
      <button
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => handleOpenModal()}
        aria-label="Add a new product" // Added aria-label for clarity
      >
        ➕ Add Product
      </button>
      {isLoading ? (
        <p className="text-gray-500" role="status">
          🔄 Loading products...
        </p> // Added role for screen readers
      ) : error ? (
        <p className="text-red-500" role="alert">
          Error loading products. Please try again.
        </p> // Role alert for errors
      ) : (
        <>
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse border border-gray-300"
              role="table"
              aria-labelledby="products-title" // Improved table accessibility
            >
              <thead>
                <tr className="bg-gray-200" role="row">
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    ID
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Name
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Type
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Price
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Available
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id} className="text-center" role="row">
                    <td className="border border-gray-300 px-4 py-2">{product.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-4 py-2 capitalize">{product.type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.isAvailable ? "✅" : "❌"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          className="bg-blue-500 text-white px-2 sm:px-3 py-1 text-sm sm:text-base rounded hover:bg-blue-600"
                          onClick={() => handleOpenModal(product)}
                          aria-label={`Edit product ${product.name}`} // Added aria-label for clarity
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="bg-red-500 text-white px-2 sm:px-3 py-1 text-sm sm:text-base rounded hover:bg-red-600"
                          onClick={() => setConfirmDeleteId(product.id)}
                          disabled={isDeleting === product.id}
                          aria-label={`Delete product ${product.name}`} // Added aria-label for deletion
                        >
                          {isDeleting === product.id ? (
                            <div
                              className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"
                              aria-hidden="true" // Added aria-hidden to avoid redundant screen reader announcements
                            ></div>
                          ) : (
                            "🗑️ Delete"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Confirm modal in deletion */}
            <ConfirmModal
              isOpen={confirmDeleteId !== null}
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={handleDeleteProduct}
              title={`Delete product ${productToDelete ? productToDelete.type + " / " + productToDelete.name : ""}`}
              message="Are you sure you want to delete this product? This action cannot be undone."
              confirmText="Yes, Delete"
              cancelText="Cancel"
              aria-live="polite" // Ensures changes in modal state are announced
            />
          </div>
          {/* Pagination component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      {/* Edit / Create Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProduct}
        productId={editProduct ? editProduct.id : null}
      />
    </div>
  );
};

export default ProductList;
