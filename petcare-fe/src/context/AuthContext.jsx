import React, { createContext, useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie"; // Import hook từ react-cookie
import { decodeToken } from "../components/utils/jwt"; // Import hàm giải mã token

// Tạo context để lưu thông tin xác thực
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Sử dụng hook useCookies để lấy và lưu trữ cookie
    const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
    const [token, setToken] = useState(cookies.accessToken || null);
    const [user, setUser] = useState(null);
    // Lắng nghe sự thay đổi của cookies và cập nhật token
    useEffect(() => {
        if (cookies.accessToken && cookies.accessToken !== token) {
            setToken(cookies.accessToken); // Cập nhật token nếu có thay đổi trong cookie
        }
    }, [cookies.accessToken]); // Chỉ lắng nghe sự thay đổi của cookie accessToken

    useEffect(() => {
        if (token) {
            try {
                const decoded = decodeToken(token);
                console.log("decoded", decoded);
                if (decoded) {
                    setUser({
                        userId: decoded.userId,
                        fullName: decoded.fullName,
                        role: decoded.roles?.[0]?.roleName || "Guest",
                        email: decoded.email || "",
                        phone: decoded.phone || "",
                        registration_date: decoded.registration_date || "",
                        imageUrl: decoded.imageUrl || "",
                        totalSpent: decoded.totalSpent || "Chưa có điểm tích lũy, vui lòng hãy mua sắm!",
                        // Bổ sung thêm các trường khác nếu cần
                    });
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]); // Chỉ cập nhật thông tin người dùng khi token thay đổi

    // Hàm đăng xuất
    const logout = () => {
        removeCookie("accessToken"); // Xóa token từ cookie
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        setToken,
        user, // Lưu toàn bộ thông tin user
        setUser, // Thêm dòng này vào để có thể sử dụng setUser trong component khác
        logout, // Hàm đăng xuất
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook giúp lấy thông tin xác thực ở mọi nơi
export const useAuth = () => useContext(AuthContext);
