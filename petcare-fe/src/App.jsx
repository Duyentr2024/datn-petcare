import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Admin from "./page/Admin.jsx";
import TopButton from "./elements/TopButton";
import ChatBot from "./components/ChatBot";
import PrivateRoute from "./context/PrivateRoute.jsx";
import AdminSpa from "./page/AdminSpa.jsx";
import ManageSpaPage from "./components/Manage/manageSpa/ManageSpaPage.jsx";
import OrderOffline from "./components/orderOffline/OrderOffline.jsx";
import StaffPage from "./page/StaffPage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageSlot from "./components/Manage/ManageSpa/ManageSlot.jsx";

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route công khai */}
            <Route path="/*" element={<HomePage />} />

            {/* Chỉ admin và staff vào được */}
            <Route element={<PrivateRoute requiredRoles={["ADMIN", "STAFF"]} />}>
              <Route path="/admin/*" element={<Admin />} />

              {/* Staff routes */}
              <Route path="/staff/*" element={<StaffPage />}>
                <Route path="orderOffline" element={<OrderOffline />} />
                <Route path="manage-spa" element={<ManageSpaPage />} />
                <Route path="admin-spa" element={<AdminSpa />} />
                <Route path="manage-slot" element={<ManageSlot />} />
              </Route>
              
              {/* Thêm route trực tiếp cho adminspa */}
              <Route path="/adminspa" element={<AdminSpa />} />
            </Route>
          </Routes>
          <ChatBot />
          <TopButton />
        </Router>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </AuthProvider>
  );
}

export default App;