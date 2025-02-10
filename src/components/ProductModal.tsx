import React, { useState, useEffect } from "react";
import { useProductStore } from "../store/useProductStore";

interface ProductFormData {
  name: string;
  type: string;
  price: string;
  isAvailable: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: () => Promise<{ id: number } | null>;
  productId?: number | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  productId,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<
    Record<string, Record<string, string[]>>
  >({}); //

  const { restrictions, setRestrictions } = useProductStore();
  const [hasFetchedOptions, setHasFetchedOptions] = useState(false);
  const [tempRestrictions, setTempRestrictions] = useState<{ [category: string]: string[] }>({});

  useEffect(() => {
    if (productId && restrictions[productId]) {
      setTempRestrictions(restrictions[productId]);
    } else {
      setTempRestrictions({});
    }
  }, [productId, restrictions]);

  useEffect(() => {
    if (!isOpen || hasFetchedOptions) return;

    const fetchAvailableOptions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parts/options`);
        const data = await response.json();
        console.log("Available Options from API:", data);
        setAvailableOptions(data);
        setHasFetchedOptions(true); // to avoid more fetch
      } catch (error) {
        console.error("Error fetching available options:", error);
      }
    };

    fetchAvailableOptions();
  }, [isOpen]); // Only when modal is open

  if (!isOpen) return null;

  // Handle input changes, including checkboxes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "type"
            ? value.toLowerCase()
            : name === "name"
              ? value
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : value,
    }));
  };

  // Handle save with loading state
  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave();

      if (productId) {
        await setRestrictions(productId, tempRestrictions);
      }
    } catch (error) {
      console.error("Error saving product or restrictions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRestriction = (category: string, option: string) => {
    if (!option) return;
    if (!productId) return;

    setTempRestrictions((prev) => ({
      ...prev,
      [category]: prev[category] ? [...prev[category], option] : [option],
    }));
  };

  const handleRemoveRestriction = (category: string, option: string) => {
    if (!productId) return;

    setTempRestrictions((prev) => ({
      ...prev,
      [category]: prev[category]?.filter((item) => item !== option) || [],
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog" // Accessibility: Defines this as a dialog for screen readers
      aria-labelledby="modal-title" // Accessibility: Links the title to the modal
      aria-describedby="modal-description" // Accessibility: Links the description for screen readers
      aria-modal="true" // Accessibility: Indicates that this is an active modal
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-lg">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          {formData.name ? "Edit Product" : "Add Product"}
        </h2>

        <p id="modal-description" className="sr-only">
          Fill out the form below to {formData.name ? "edit" : "add"} a product.
        </p>

        {/* Product Form */}
        <div className="space-y-4" aria-busy={isSaving}>
          {/* Accessibility: Indicates the form is loading */}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product name"
              disabled={isSaving}
              aria-disabled={isSaving} // Accessibility: Marks as disabled when saving
              autoComplete="off"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-gray-700">
              Type
            </label>
            <input
              id="type"
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product type"
              disabled={isSaving}
              aria-disabled={isSaving}
              autoComplete="off"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-gray-700">
              Price (€)
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product price"
              disabled={isSaving}
              aria-disabled={isSaving}
              autoComplete="off"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              id="isAvailable"
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="mr-2"
              disabled={isSaving}
              aria-disabled={isSaving}
              autoComplete="off"
            />
            <label htmlFor="isAvailable" className="text-gray-700">
              Available
            </label>
          </div>
        </div>

        {/* Restrictions */}
        <div className="max-h-96 overflow-y-auto">
          <label className="block text-gray-700">Restrictions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOptions[formData.type] &&
              Object.entries(availableOptions[formData.type]).map(([category, options]) => (
                <div key={category} className="mt-2">
                  <span className="font-semibold">{category}:</span>
                  <ul className="list-disc pl-5 text-gray-700">
                    {tempRestrictions[category]?.map((restriction, index) => (
                      <li key={index}>
                        {restriction}
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRestriction(category, restriction)}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Add new restriction */}
                  <select
                    id={`restriction-${category}`} // Añadimos un id único
                    name={`restriction-${category}`}
                    className="border p-2 rounded mt-2 w-full"
                    onChange={(e) => handleAddRestriction(category, e.target.value)}
                  >
                    <option value="">Select restriction</option>
                    {Array.isArray(options)
                      ? options
                          .filter((option: string) => !tempRestrictions[category]?.includes(option))
                          .map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                      : null}
                  </select>
                </div>
              ))}
          </div>
        </div>

        {/* Save & Cancel Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            onClick={handleSaveClick}
            disabled={isSaving}
            aria-disabled={isSaving}
            aria-live="polite" // Accessibility: Announces status changes
          >
            {isSaving && (
              <div
                className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"
                role="status"
                aria-label="Saving product..." // Accessibility: Announces the loading state
              ></div>
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
            disabled={isSaving}
            aria-disabled={isSaving}
            autoFocus // Accessibility: Focuses on this button when the modal opens
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductModal);
