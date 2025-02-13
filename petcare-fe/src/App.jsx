import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route chính cho Petcare */}
            <Route path="/*" element={<HomePage />} />



          </Routes>
        </Router>
      </AuthProvider>
    );
}

export default App;
