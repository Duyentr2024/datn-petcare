import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Admin from "./page/Admin.jsx";

function App() {
    return (
      <AuthProvider> 
        <Router>
          <Routes>
            {/* Route chính cho Petcare */}
            <Route path="/*" element={<HomePage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
}

export default App;
