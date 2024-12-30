import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Banner from "./components/banner/banner";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Login from './components/account/Login'  // Đảm bảo bạn đã import component Login
import Register from './components/account/Register'
import Banner from './component/banner/banner'
function App() {
  const [count, setCount] = useState(0)

  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Router path="/banner" element={<Banner />} />
      </Routes>
    </Router>
  )
}

export default App
