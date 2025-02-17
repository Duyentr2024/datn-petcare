import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Admin from "./page/Admin.jsx";
import ManageProductColor from './components/Manage/ManageProductColor';
import ManageProductSize from "./components/Manage/ManageProductSize";
import ManageProductWeights from "./components/Manage/ManageProductWeights";
import ManageProductBrand from "./components/Manage/ManageProductBrand";
import ManageProductCategories from "./components/Manage/ManageProductCategories";
import ManageProducts from "./components/Manage/ManageProducts";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route chính cho Petcare */}
          <Route path="/*" element={<HomePage />} />
          <Route path="/admin" element={<Admin />} >
            <Route path="product-color" element={<ManageProductColor />} />
            <Route path="product-size" element={<ManageProductSize />} />
            <Route path="product-weights" element={<ManageProductWeights />} />
            <Route path="product-brands" element={<ManageProductBrand />} />
            <Route path="product-categories" element={<ManageProductCategories />} />
            <Route path="products-list" element={<ManageProducts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
