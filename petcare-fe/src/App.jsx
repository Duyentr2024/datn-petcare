import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Admin from "./page/Admin.jsx";
import TopButton from "./elements/TopButton";
import SpaPage from "./page/SpaPage.jsx";
import AppointmentPage from "./page/AppointmentPage.jsx";
import ChatBot from "./components/ChatBot";
import PrivateRoute from "./context/PrivateRoute.jsx";
import AdminSpa from "./components/spaGrooming/admin/AdminAppointment.jsx";

import OrderOffline from "./components/orderOffline/OrderOffline.jsx"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route chính */}
          <Route path="/*" element={<HomePage />} />

          <Route path="/spa" element={<SpaPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/admin-spa" element={<AdminSpa />} />

          {/* Chỉ admin vào được */}
          <Route element={<PrivateRoute requiredRoles={["ADMIN", "STAFF"]} />}>
            <Route path="/admin/*" element={<Admin />} />
          </Route>

          <Route path="/orderOffline" element={<OrderOffline />} />

        </Routes>
        <ChatBot />
        <TopButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
