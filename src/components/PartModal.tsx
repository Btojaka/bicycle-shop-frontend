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
            : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{formData.value ? "Edit Part" : "Add Part"}</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Type of Product */}
          <div>
            <label className="block font-medium">Type of Product</label>
            <input
              type="text"
              name="typeProduct"
              value={formData.typeProduct}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block font-medium">Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block font-medium">Price (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium">Stock Quantity</label>
            <input
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
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label className="ml-2 font-medium">Available</label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={onSave}
          >
            Save
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartModal;
