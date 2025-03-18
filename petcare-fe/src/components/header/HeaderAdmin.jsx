import React, { useEffect, useState } from "react";
import { FiBell, FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const HeaderAdmin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Admin",
        avatar: "https://via.placeholder.com/40",
    });

    useEffect(() => {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Thông tin user từ token:", decoded);
                setUser({
                    name: decoded.fullName || "Admin",
                    avatar: decoded.imageUrl || "https://via.placeholder.com/40",
                });
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove("accessToken"); // Xóa token khỏi cookie
        navigate("/login"); // Chuyển hướng về trang đăng nhập
    };

    return (
        <div className="flex justify-between items-center bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 px-6 py-3 text-white shadow-md top-0">
            {/* Tiêu đề */}
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>

            {/* Khu vực phải */}
            <div className="flex items-center gap-6">
                {/* Chuông thông báo */}
                <button className="relative p-2 hover:bg-gray-700 rounded-full">
                    <FiBell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Avatar và Tên người dùng */}
                <div className="flex items-center gap-2">
                    <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border border-gray-600"
                    />
                    <span className="font-medium">{user.name}</span>
                </div>

                {/* Đăng xuất */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default HeaderAdmin;
