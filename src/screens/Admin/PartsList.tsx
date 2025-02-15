import React, { useEffect, useState, useMemo } from "react";
import { usePartStore } from "../../store/usePartStore";
import Pagination from "../../components/Pagination";
import PartModal from "../../components/PartModal";
import ConfirmModal from "../../components/ConfirmModal";
import Filters from "../../components/Filters";
import socket from "../../helpers/socket";
import axios from "axios";

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
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
  const [selectedType, setSelectedType] = useState("");
  const [priceOrder, setPriceOrder] = useState<"asc" | "desc" | "">("");

  // Filter by type
  const filteredParts = useMemo(() => {
    if (!Array.isArray(parts)) return [];

    let result = selectedType ? parts.filter((part) => part.typeProduct === selectedType) : parts;

    if (priceOrder) {
      result = [...result].sort((a, b) =>
        priceOrder === "asc" ? a.price - b.price : b.price - a.price
      );
    }

    return result;
  }, [parts, selectedType, priceOrder]);

  const totalPages = useMemo(
    () => Math.ceil(filteredParts.length / itemsPerPage),
    [filteredParts, itemsPerPage]
  );

  const currentParts = useMemo(() => {
    if (!Array.isArray(filteredParts) || filteredParts.length === 0) return [];

    const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredParts.length);
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    return filteredParts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredParts, currentPage, itemsPerPage]);

  useEffect(() => {
    if (parts.length === 0) {
      fetchParts();
    }

    // Listeners
    socket.on("partCreated", (newPart: Part) => {
      usePartStore.setState((state) => {
        const alreadyExists = state.parts.some((part) => part.id === newPart.id);
        if (alreadyExists) return state;

        return {
          parts: [...state.parts, newPart],
        };
      });
    });

    socket.on("partUpdated", (updatedPart: Part) => {
      usePartStore.setState((state) => {
        const existingPart = state.parts.find((part) => part.id === updatedPart.id);
        if (existingPart && JSON.stringify(existingPart) === JSON.stringify(updatedPart))
          return state;
        return {
          parts: state.parts.map((part) => (part.id === updatedPart.id ? updatedPart : part)),
        };
      });
    });

    socket.on("partDeleted", ({ id }: { id: number }) => {
      usePartStore.setState((state) => ({
        parts: state.parts.filter((part) => part.id !== id),
      }));
    });
    // Clear listeners
    return () => {
      socket.off("partCreated");
      socket.off("partUpdated");
      socket.off("partDeleted");
    };
  }, []);

  // Save product types
  const productTypes = useMemo(
    () => [...new Set((Array.isArray(parts) ? parts : []).map((part) => part.typeProduct))],
    [parts]
  );

  const handleOpenModal = (part: Part | null = null) => {
    if (part) {
      setEditPart(part);
      setFormData({
        typeProduct: part.typeProduct || "",
        category: part.category || "",
        value: part.value || "",
        price: part.price ? String(part.price) : "0", // Always store as string (important)
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

  // Function to handle changes in edition or creation
  const handleSavePart = async () => {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(formData)
          .filter(([, value]) => value !== "") // Remove empty fields (important)
          .map(([key, value]) => {
            if (key === "price" || key === "quantity") return [key, parseFloat(value)]; // Convert to number
            if (key === "isAvailable") return [key, Boolean(value)]; // Convert to boolean
            return [key, value.toString().trim()]; // Ensure all values are strings and trimmed
          })
      );
      // Choose method depending on action and fill fields
      const method = editPart
        ? Object.keys(filteredData).length < Object.keys(formData).length
          ? "patch"
          : "put"
        : "post";

      const url = editPart
        ? `${import.meta.env.VITE_API_URL}/api/parts/${editPart.id}`
        : `${import.meta.env.VITE_API_URL}/api/parts`;

      console.log("Using method:", method.toUpperCase());

      await axios[method](url, filteredData);

      handleCloseModal();
    } catch (error) {
      console.error("Error saving part:", error);
    }
  };

  // Deletion handle
  const handleDeletePart = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(confirmDeleteId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/parts/${confirmDeleteId}`);
      await fetchParts();
    } catch (error) {
      console.error("Error deleting part:", error);
    } finally {
      setIsDeleting(null);
      setConfirmDeleteId(null);
    }
  };
  // Save item to delete
  const partToDelete = useMemo(
    () => currentParts.find((part) => part.id === confirmDeleteId),
    [currentParts, confirmDeleteId]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4" id="parts-title">
        All Parts
      </h1>{" "}
      {/* Added ID for accessibility */}
      <button
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => handleOpenModal()}
        aria-label="Add a new part" // Added label for screen readers
      >
        ➕ Add Part
      </button>
      {loading ? (
        <p className="text-gray-500" role="status">
          🔄 Loading parts...
        </p> // Added role for loading feedback
      ) : error ? (
        <p className="text-red-500" role="alert">
          Error loading parts. Please try again.
        </p> // Added role for error messages
      ) : (
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
              aria-labelledby="parts-title" // Added table role and aria-labelledby
            >
              <thead>
                <tr className="bg-gray-200" role="row">
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    ID
                  </th>{" "}
                  {/* Added scope for better table navigation */}
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Type
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Category
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Value
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Stock
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Price
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Available
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentParts.length > 0 ? (
                  currentParts.map((part) => (
                    <tr key={part.id} className="text-center" role="row">
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
                          aria-label={`Edit part ${part.value}`} //Added aria-label for clarity
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => setConfirmDeleteId(part.id)}
                          disabled={isDeleting === part.id}
                          aria-label={`Delete part ${part.value}`} //Added aria-label for deletion
                        >
                          {isDeleting === part.id ? (
                            <div
                              className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"
                              aria-hidden="true" // Added aria-hidden to avoid unnecessary screen reader announcements
                            ></div>
                          ) : (
                            "🗑️ Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-4">
                      No parts available now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Confirm modal in deletion */}
            <ConfirmModal
              isOpen={confirmDeleteId !== null}
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={handleDeletePart}
              title={`Delete part ${partToDelete ? partToDelete.category + " / " + partToDelete.value : ""}`}
              message="Are you sure you want to delete this part? This action cannot be undone."
              confirmText="Yes, Delete"
              cancelText="Cancel"
              aria-live="polite" // Ensures screen readers announce changes in modal status
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
      {/* Modal to create and edit */}
      {modalOpen && (
        <PartModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSavePart}
        />
      )}
    </div>
  );
};

export default React.memo(PartsList);
