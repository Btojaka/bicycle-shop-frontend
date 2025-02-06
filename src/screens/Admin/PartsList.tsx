import { useEffect, useState } from "react";
import { usePartStore } from "../../store/usePartStore";
import Pagination from "../../components/Pagination";
import socket from "../../helpers/socket";
import axios from "axios";
import PartModal from "../../components/PartModal";

interface Part {
  id: number;
  typeProduct: string;
  category: string;
  value: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
}

interface PartFormData {
  typeProduct: string;
  category: string;
  value: string;
  price: string;
  quantity: string;
  isAvailable: boolean;
}

const PartsList = () => {
  const { parts, fetchParts, loading, error } = usePartStore();
  const [isLoading, setIsLoading] = useState(loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPart, setEditPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<PartFormData>({
    typeProduct: "",
    category: "",
    value: "",
    price: "",
    quantity: "",
    isAvailable: true,
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(parts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParts = parts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setIsLoading(true);
    fetchParts().finally(() => setIsLoading(false));

    socket.on("partCreated", (newPart: Part) => {
      usePartStore.setState((state) => ({
        parts: [...state.parts, newPart],
      }));
    });

    socket.on("partUpdated", (updatedPart: Part) => {
      usePartStore.setState((state) => ({
        parts: state.parts.map((part) => (part.id === updatedPart.id ? updatedPart : part)),
      }));
    });

    socket.on("partDeleted", ({ id }: { id: number }) => {
      usePartStore.setState((state) => ({
        parts: state.parts.filter((part) => part.id !== id),
      }));
    });

    return () => {
      socket.off("partCreated");
      socket.off("partUpdated");
      socket.off("partDeleted");
    };
  }, []);

  const handleOpenModal = (part: Part | null = null) => {
    if (part) {
      setEditPart(part);
      setFormData({
        typeProduct: part.typeProduct || "",
        category: part.category || "",
        value: part.value || "",
        price: part.price ? String(part.price) : "0", // ✅ Always store as string
        quantity: part.quantity ? String(part.quantity) : "0",
        isAvailable: part.isAvailable ?? true,
      });
    } else {
      setEditPart(null);
      setFormData({
        typeProduct: "",
        category: "",
        value: "",
        price: "0",
        quantity: "0",
        isAvailable: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditPart(null);
  };

  const handleSavePart = async () => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(formData)
          .filter(([, value]) => value !== "") // Remove empty fields
          .map(([key, value]) => {
            if (key === "price" || key === "quantity") return [key, parseFloat(value)]; // Convert to number
            if (key === "isAvailable") return [key, Boolean(value)]; // Convert to boolean
            return [key, value.toString().trim()]; // Ensure all values are strings and trimmed
          })
      );

      const method = editPart
        ? Object.keys(filteredData).length < Object.keys(formData).length
          ? "patch"
          : "put"
        : "post";

      const url = editPart
        ? `${import.meta.env.VITE_API_URL}/api/parts/${editPart.id}`
        : `${import.meta.env.VITE_API_URL}/api/parts`;

      console.log("🔍 Data before sending:", formData);
      console.log("📦 Filtered data (only filled fields):", filteredData);
      console.log("🛠 Using method:", method.toUpperCase());

      await axios[method](url, filteredData);

      await fetchParts();
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error saving part:", error);
    }
  };

  const handleDeletePart = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/parts/${id}`);
      await fetchParts();
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Parts</h1>

      <button
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => handleOpenModal()}
      >
        ➕ Add Part
      </button>

      {isLoading ? (
        <p className="text-gray-500">🔄 Loading parts...</p>
      ) : error ? (
        <p className="text-red-500">❌ Error loading parts. Please try again.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Type</th>
                  <th className="border border-gray-300 px-4 py-2">Category</th>
                  <th className="border border-gray-300 px-4 py-2">Value</th>
                  <th className="border border-gray-300 px-4 py-2">Stock</th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Available</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentParts.map((part) => (
                  <tr key={part.id} className="text-center">
                    <td className="border border-gray-300 px-4 py-2">{part.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{part.typeProduct}</td>
                    <td className="border border-gray-300 px-4 py-2">{part.category}</td>
                    <td className="border border-gray-300 px-4 py-2">{part.value}</td>
                    <td className="border border-gray-300 px-4 py-2">{part.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Number(part.price).toFixed(2)} €
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {part.isAvailable ? "✅" : "❌"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                        onClick={() => handleOpenModal(part)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeletePart(part.id)}
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

      {/* Modal Integration */}
      <PartModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSavePart}
      />
    </div>
  );
};

export default PartsList;
