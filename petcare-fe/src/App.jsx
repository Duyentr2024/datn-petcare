import { useState } from "react";
import Banner from "./components/banner/banner.jsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Login from "./components/account/Login"; // Đảm bảo bạn đã import component Login
import Register from "./components/account/Register";
import GoodPrice from "./components/card/GoodPrice.jsx";
import Contact from "./pages/Contact.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/good-price" element={<GoodPrice />} />
        <Route path="/" element={<Banner />} />
          <Route path="/contact" element={<Contact />} />

      </Routes>
    </Router>
  );
}

export default App;
