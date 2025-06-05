import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PrivateRoute = ({ requiredRoles }) => {
    const { token, user } = useAuth();
    const role = user?.role; // Lấy role từ user

    if (!token) {
        console.log("Private Route - Không có token");
        return <Navigate to="/login" replace />;
    }

    // **Chờ user cập nhật trước khi check quyền**
    if (!user) {
        console.log("Private Route - Đang tải thông tin người dùng...");
        return <div>Loading...</div>; // Hoặc hiển thị một spinner
    }

   // Kiểm tra quyền truy cập
   if (requiredRoles && !requiredRoles.includes(role)) {
    console.log(`Private Route - Không có quyền (${requiredRoles.join(", ")}), role hiện tại: ${role}`);
    return <Navigate to="/*" replace />;
}

    return <Outlet />;
};

export default PrivateRoute;
