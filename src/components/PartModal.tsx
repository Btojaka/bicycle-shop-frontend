import React from "react";

interface PartFormData {
  typeProduct: string;
  category: string;
  value: string;
  price: string;
  quantity: string;
  isAvailable: boolean;
}

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PartFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartFormData>>;
  onSave: () => void;
}

const PartModal: React.FC<PartModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}) => {
  if (!isOpen) return null;

  // Handle input changes, including checkboxes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "typeProduct"
            ? value.toLowerCase()
            : name === "category"
              ? value
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : name === "value"
                ? value.toLowerCase()
                : value,
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog" // Provides semantic meaning for assistive technologies
      aria-labelledby="modal-title" // Associates title for screen readers
      aria-describedby="modal-description" // Associates description for screen readers
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-2xl">
        <h2 id="modal-title" className="text-2xl font-bold mb-4">
          {formData.value ? "Edit Part" : "Add Part"}
        </h2>

        <div id="modal-description" className="grid grid-cols-2 gap-4">
          {/* Type of Product */}
          <div>
            <label htmlFor="typeProduct" className="block font-medium">
              Type of Product
            </label>
            <input
              id="typeProduct"
              type="text"
              name="typeProduct"
              value={formData.typeProduct}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block font-medium">
              Category
            </label>
            <input
              id="category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Value */}
          <div>
            <label htmlFor="value" className="block font-medium">
              Value
            </label>
            <input
              id="value"
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block font-medium">
              Price (€)
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block font-medium">
              Stock Quantity
            </label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center mt-6">
            <input
              id="isAvailable"
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label htmlFor="isAvailable" className="ml-2 font-medium">
              Available
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={onSave}
            aria-label="Save part"
          >
            Save
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
            aria-label="Cancel and close modal"
            autoFocus // Focuses on the cancel button when modal opens
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartModal;
