import { useEffect, useState } from "react";
import { useProductStore } from "../../store/useProductStore";
import Pagination from "../../components/Pagination";
import socket from "../../helpers/socket";
import axios from "axios";
import ProductModal from "../../components/ProductModal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    type: "",
    price: "",
    isAvailable: true,
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (products.length === 0) {
      setIsLoading(true);
      fetchProducts().finally(() => setIsLoading(false));
    }

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

  // Save new or edited product
  const handleSaveProduct = async () => {
    try {
      if (editProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editProduct.id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData);
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      <button
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => handleOpenModal()}
      >
        ➕ Add Product
      </button>

      {isLoading ? (
        <p className="text-gray-500">🔄 Loading products...</p>
      ) : error ? (
        <p className="text-red-500">❌ Error loading products. Please try again.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Type</th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Available</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id} className="text-center">
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
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                        onClick={() => handleOpenModal(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductList;
