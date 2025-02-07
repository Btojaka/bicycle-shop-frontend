import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import ProductList from "./ProductList";
import PartsList from "./PartsList";
import SoldProducts from "./SoldProducts";

const AdminScreen = () => {
  const { isLoggedIn, login, logout } = useAuthStore();
  const [selectedSection, setSelectedSection] = useState<string | null>("products");
  const [password, setPassword] = useState("");

  // If Marcus is NOT logged in, show the login page inside /admin
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">🔐 Admin Login</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
          <label htmlFor="admin-password" className="sr-only">
            Admin password
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            aria-label="Enter admin password" // Accessibility: Descriptive label
            aria-describedby="password-info" // Accessibility: Provides security context
          />
          <p id="password-info" className="sr-only">
            Enter the password to access the admin panel.
          </p>
          <button
            onClick={() => password === "marcus123" && login()} // Fake login for Marcus
            className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-600"
            aria-live="polite" // Accessibility: Announces state changes
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Once logged in, show the admin panel
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-full w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <nav>
          <button
            className="w-full text-left p-2 hover:bg-gray-700 rounded"
            onClick={() => setSelectedSection("products")}
            aria-current={selectedSection === "products" ? "page" : undefined} // Accessibility: Indicates active page
          >
            Product List
          </button>
          <button
            className="w-full text-left p-2 hover:bg-gray-700 rounded"
            onClick={() => setSelectedSection("parts")}
            aria-current={selectedSection === "parts" ? "page" : undefined}
          >
            Parts List
          </button>
          <button
            className="w-full text-left p-2 hover:bg-gray-700 rounded"
            onClick={() => setSelectedSection("sold")}
            aria-current={selectedSection === "sold" ? "page" : undefined}
          >
            Sold Products
          </button>
        </nav>

        {/* Logout Button */}
        <button
          className="mt-6 w-full bg-red-500 p-2 rounded hover:bg-red-600"
          onClick={logout}
          aria-label="Logout from admin panel" // Accessibility: Clear logout action
        >
          Logout
        </button>
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
