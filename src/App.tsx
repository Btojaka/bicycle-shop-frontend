import { BrowserRouter as Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/Clients/HomeScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductDetailScreen from "./screens/Clients/ProductDetailScreen";
import CartScreen from "./screens/Clients/CartScreen";
import AdminScreen from "./screens/Admin/AdminScreen";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductDetailScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
