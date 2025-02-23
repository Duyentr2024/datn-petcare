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
import ManageProductImages from "./components/Manage/ManageProductImages";
import ManageProductDetails from "./components/Manage/ManageProductDetails";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import TopButton from "./elements/TopButton";
import IntroducePage from "./page/IntroducePage.jsx";
import SpaPage from "./page/SpaPage.jsx";
import AppoinmentPage from "./page/AppointmentPage.jsx";

import ChatBot from './components/ChatBot';

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
            <Route path="product-image" element={<ManageProductImages />} />
            <Route path="product-details" element={<ManageProductDetails />} />
          </Route>
        </Routes>
        <ChatBot />
        <TopButton />
      </Router>
    </AuthProvider>
  );
    const [count, setCount] = useState(0);

    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<HomePage />} />
            <Route path="/introduce" element={<IntroducePage />} />
            <Route path="/spa" element={<SpaPage />} />
            <Route path="/appointment" element={<AppoinmentPage />} />
          </Routes>
          <TopButton />
        </Router>
      </AuthProvider>
    );
}

export default App;
