import { useEffect, useState } from "react";
import { useSoldProductsStore } from "../../store/useSoldProductStore";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import socket from "../../helpers/socket"; // Importamos socket.io-client

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(soldProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = soldProducts.slice(indexOfFirstItem, indexOfLastItem);

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sold Products</h1>

      {loading ? (
        <p className="text-gray-500">🔄 Loading sold products...</p>
      ) : error ? (
        <p className="text-red-500">❌ Error loading sold products. Please try again.</p>
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
                  <th className="border border-gray-300 px-4 py-2">Date Sold</th>
                  <th className="border border-gray-300 px-4 py-2">Parts</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id} className="text-center">
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
                      >
                        Show Parts
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

      {/* Modal */}
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
    </div>
  );
};

export default SoldProducts;
