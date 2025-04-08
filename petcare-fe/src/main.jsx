// Import VNPayFix trước tiên để đảm bảo nó được chạy đầu tiên
import './VNPayFix.js';

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Chạy VNPayFix trực tiếp
// VNPayFix đã tự chạy khi import

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <App />
  </StrictMode>
);
