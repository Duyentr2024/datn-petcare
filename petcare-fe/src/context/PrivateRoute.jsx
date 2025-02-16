import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Lấy trạng thái đăng nhập

const PrivateRoute = () => {
  const { token } = useAuth(); // Lấy token từ context

  console.log("Private Route - Token:", token); // Debug xem token có nhận được không

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
