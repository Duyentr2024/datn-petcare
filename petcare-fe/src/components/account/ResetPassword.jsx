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
    const [email, setEmail] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const emailFromState = location.state?.email;
        const emailFromLocalStorage = localStorage.getItem("resetEmail");
        if (emailFromState) {
            setEmail(emailFromState);
        } else if (emailFromLocalStorage) {
            setEmail(emailFromLocalStorage);
        }
    }, [location]);
    const handlePasswordChange = (e) => {
        const newPass = e.target.value;
        setPassword(newPass);
        calculateStrength(newPass);
        if (newPass === email) {
            setErrorMessage("Mật khẩu không được trùng với email!");
        } else {
            setErrorMessage("");
        }
    };
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (e.target.value !== password) {
            setErrorMessage("Mật khẩu xác nhận không khớp!");
        } else {
            setErrorMessage("");
        }
    };
    const calculateStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[a-z]/.test(pass)) strength += 1;
        if (/[0-9]/.test(pass)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
        setPasswordStrength(strength);
    };
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
        <div className="flex items-center justify-center min-h-132.5 px-4">
            <div className="bg-white rounded-3xl shadow-6 p-6 w-full max-w-lg">
                <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">Đặt lại mật khẩu</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            className="border p-2 w-full rounded-lg"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        <div className="h-2 mt-2 w-full bg-gray-200 rounded-full">
                            <div
                                className={`h-full rounded-full ${
                                    passwordStrength === 1 ? "bg-red-500 w-1/5" :
                                        passwordStrength === 2 ? "bg-orange-500 w-2/5" :
                                            passwordStrength === 3 ? "bg-yellow-500 w-3/5" :
                                                passwordStrength === 4 ? "bg-green-400 w-4/5" :
                                                    passwordStrength === 5 ? "bg-green-600 w-full" : "w-0"
                                }`}
                            ></div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            className="border p-2 w-full rounded-lg"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <button
                        type="submit"
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg w-full hover:bg-yellow-600"
                        disabled={errorMessage !== ""}
                    >
                        Đặt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;