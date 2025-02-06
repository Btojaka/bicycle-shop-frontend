import React from "react";

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
  onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}) => {
  if (!isOpen) return null;

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "type"
            ? value.toLowerCase()
            : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-lg">
        <h2 className="text-xl font-bold mb-4">{formData.name ? "Edit Product" : "Add Product"}</h2>

        {/* Product Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product name"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-700">Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product type"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700">Price (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Product price"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700">Available</label>
          </div>
        </div>

        {/* Save & Cancel Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
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

export default ProductModal;
