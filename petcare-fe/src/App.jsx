import { useState } from "react";

import "./App.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePage from "./page/HomePage.jsx";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
    const [count, setCount] = useState(0);

    return (
       <Router>
        <Routes>
            <Route path="/*" element={<HomePage/>}></Route>
         
        </Routes>
       </Router>
    );
}

export default App;
