import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../config";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const queryParams = new URLSearchParams(location.search);
// Lấy email từ URL, state hoặc localStorage

    const [email, setEmail] = useState("");

    useEffect(() => {
        const emailFromState = location.state?.email;
        const emailFromLocalStorage = localStorage.getItem("resetEmail");

        if (emailFromState) {
            setEmail(emailFromState);
        } else if (emailFromLocalStorage) {
            setEmail(emailFromLocalStorage);
        }
    }, [location]);

    console.log("Email để đặt lại mật khẩu:", email);


    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Mật khẩu không khớp!",
                text: "Vui lòng nhập lại mật khẩu chính xác.",
                showConfirmButton: true,
            });
            return;
        }

        // Kiểm tra dữ liệu trước khi gửi
        console.log("Email để đặt lại mật khẩu:", email);
        console.log("Mật khẩu mới:", password);

        if (!email || !password) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Email hoặc mật khẩu không hợp lệ.",
                showConfirmButton: true,
            });
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/auth/reset-password", { email, password });
            Swal.fire({
                icon: "success",
                title: "Đặt lại mật khẩu thành công!",
                text: "Bạn có thể đăng nhập ngay bây giờ.",
                showConfirmButton: true,
            });
            navigate("/login");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: error.response?.data || "Đã xảy ra lỗi.",
                showConfirmButton: true,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">Đặt lại mật khẩu</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            className="border p-2 w-full rounded-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            className="border p-2 w-full rounded-lg"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg w-full hover:bg-yellow-600"
                    >
                        Đặt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;