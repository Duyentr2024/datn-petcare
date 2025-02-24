import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Admin from "./page/Admin.jsx";
import TopButton from "./elements/TopButton";
import SpaPage from "./page/SpaPage.jsx";
import AppointmentPage from "./page/AppointmentPage.jsx";
import ChatBot from './components/ChatBot';
import AdminSpa from "./page/AdminSpa.jsx";
function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route chính */}
            <Route path="/*" element={<HomePage />} />
            <Route path="/spa" element={<SpaPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/adspa" element={<AdminSpa />} />
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
