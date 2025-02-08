import React from "react";

interface FiltersProps {
  productTypes: string[];
  selectedType: string;
  setSelectedType: (value: string) => void;
  priceOrder: "asc" | "desc" | "";
  setPriceOrder: (value: "asc" | "desc" | "") => void;
}

const Filters: React.FC<FiltersProps> = ({
  productTypes,
  selectedType,
  setSelectedType,
  priceOrder,
  setPriceOrder,
}) => {
  return (
    <div className="mb-4 flex justify-around">
      {/* Type filter */}
      <select
        id="product-filter"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="bg-gray-200 text-gray-900 text-lg border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        {productTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      {/* Price filter */}
      <select
        id="price-order"
        value={priceOrder}
        onChange={(e) => setPriceOrder(e.target.value as "asc" | "desc" | "")}
        className="bg-gray-200 text-gray-900 text-lg border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Sort by Price</option>
        <option value="asc">Lowest to Highest</option>
        <option value="desc">Highest to Lowest</option>
      </select>
    </div>
  );
};

export default Filters;
