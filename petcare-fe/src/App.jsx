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
import TopButton from "./elements/TopButton";
import SpaPage from "./page/SpaPage.jsx";
import AppoinmentPage from "./page/AppointmentPage.jsx";
import ChatBot from './components/ChatBot';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route chính */}
            <Route path="/*" element={<HomePage />} />

            <Route path="/spa" element={<SpaPage />} />
            <Route path="/appointment" element={<AppoinmentPage />} />

            <Route path="/admin/*" element={<Admin />}>

            </Route>
          </Routes>
          <ChatBot />
          <TopButton />
        </Router>
      </AuthProvider>
  );
}

export default App;
