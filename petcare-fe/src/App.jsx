import { useState } from "react";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePage from "./page/HomePage.jsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // Import AuthProvider

function App() {
    const [count, setCount] = useState(0);

    return (
      <AuthProvider> {/* Bọc toàn bộ ứng dụng trong AuthProvider */}
        <Router>
          <Routes>
            <Route path="/*" element={<HomePage />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
}

export default App;
