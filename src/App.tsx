import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ProductDetailScreen from "./screens/ProductDetailScreen";
// import CartScreen from "./screens/CartScreen";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            {/* <Route path="/product/:id" element={<ProductDetailScreen />} />
            <Route path="/cart" element={<CartScreen />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
