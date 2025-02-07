import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulating login with password
    if (password === "marcus123") {
      login();
      navigate("/admin"); // Shows private routes
    } else {
      alert("Incorrect password. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div
        className="bg-white p-6 rounded-lg shadow-md w-80"
        role="form" // Added role="form" for better screen reader navigation
        aria-labelledby="login-title"
      >
        <h2 id="login-title" className="text-xl font-bold mb-4">
          Admin Login
        </h2>
        {/* Added a label for screen readers */}
        <label htmlFor="password" className="sr-only">
          Enter your admin password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          aria-describedby="password-help" // for additional guidance
        />
        {/* Assistive text for better UX */}
        <p id="password-help" className="text-sm text-gray-600">
          Enter the admin password to access the panel.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          aria-label="Log in to the admin panel" // to clarify button purpose
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
