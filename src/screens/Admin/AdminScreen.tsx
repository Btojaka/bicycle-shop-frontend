import { useState } from "react";
import ProductList from "./ProductList";
import PartsList from "./PartsList";
import SoldProducts from "./SoldProducts";

const AdminScreen = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>("products");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-full w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <ul>
          <li>
            <button
              className="w-full text-left p-2 hover:bg-gray-700 rounded"
              onClick={() => setSelectedSection("products")}
            >
              Product List
            </button>
          </li>
          <li>
            <button
              className="w-full text-left p-2 hover:bg-gray-700 rounded"
              onClick={() => setSelectedSection("parts")}
            >
              Parts List
            </button>
          </li>
          <li>
            <button
              className="w-full text-left p-2 hover:bg-gray-700 rounded"
              onClick={() => setSelectedSection("sold")}
            >
              Sold Products
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {selectedSection === "products" && <ProductList />}
        {selectedSection === "parts" && <PartsList />}
        {selectedSection === "sold" && <SoldProducts />}
      </div>
    </div>
  );
};

export default AdminScreen;
