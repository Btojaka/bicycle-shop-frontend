import { Link } from "react-router-dom";
import Logo from "../assets/sports.svg";

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={Logo} alt="Bicycle Shop" className="h-10 w-auto" />
          <span className="text-2xl font-bold">Sport Shop</span>
        </Link>

        {/* Navegación */}
        <nav className="space-x-6">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/cart" className="hover:text-gray-300">
            Cart
          </Link>
          <Link to="/admin" className="hover:text-gray-300">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
