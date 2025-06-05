import React, {useState} from "react";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import axios from "axios";
import {useAuth} from "../../context/AuthContext";
import Swal from "sweetalert2";

const ChangePassword = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const {token} = useAuth();
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleVerifyPassword = async () => {
        if (!currentPassword.trim()) {
            setVerifyError("Vui lòng nhập mật khẩu hiện tại!");
            return;
        }

        setLoading(true);
        setVerifyError(""); // Xóa lỗi trước đó

        if (!token) {
            Swal.fire("Lỗi", "Bạn chưa đăng nhập!", "error");
            setLoading(false);
            return;
        }

        try {
            await axios.post(
                "http://localhost:8080/api/auth/verify-password",
                {password: currentPassword},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setIsVerified(true);
            setStep(2);
        } catch (error) {
            Swal.fire("Lỗi", error.response?.data || "Có lỗi xảy ra", "error");
        }

        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!isVerified) {
            Swal.fire("Lỗi", "Bạn chưa xác minh mật khẩu hiện tại!", "error");
            return;
        }

        // 🔍 Kiểm tra lỗi nhập liệu
        if (!newPassword.trim() || !confirmPassword.trim()) {
            Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "error");
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp!", "error");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                "http://localhost:8080/api/auth/change-password",
                {newPassword}, // 🔥 Gửi đúng format
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            Swal.fire("Thành công", "Mật khẩu đã được thay đổi!", "success");

            // ✅ Reset state về ban đầu
            setStep(1); // Quay về bước 1
            setNewPassword(""); // Xóa input
            setConfirmPassword("");
            setCurrentPassword("");
            setIsVerified(false); // Cần xác minh lại nếu đổi mật khẩu lần nữa

        } catch (error) {
            console.error("❌ Lỗi:", error.response?.data);
            Swal.fire("Lỗi", error.response?.data || "Có lỗi xảy ra", "error");
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center min-h-100 items-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Đổi mật khẩu</h2>

                {step === 1 ? (
                    <div>
                        {/* Mật khẩu hiện tại */}
                        <label className="block text-gray-600 text-sm mb-1">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input
                                type={showPassword.current ? "text" : "password"}
                                className={`w-full border ${verifyError ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBB321]`}
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    setVerifyError(""); // Xóa lỗi khi người dùng nhập lại
                                }}
                            />
                            <i
                                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                            >
                                {showPassword.current ? <FaEye/> : <FaEyeSlash/>}
                            </i>
                        </div>

                        {/* Hiển thị lỗi nếu có */}
                        {verifyError && <p className="text-red-500 text-sm mt-1">{verifyError}</p>}

                        {/* Xác minh mật khẩu */}
                        <button
                            className="mt-5 w-full bg-[#FBB321] text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-[#e0a816] shadow-md"
                            onClick={handleVerifyPassword}
                            disabled={loading}
                        >
                            {loading ? "Đang xác minh..." : "Xác minh"}
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Mật khẩu mới */}
                        <label className="block text-gray-600 text-sm mb-1">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                className={`w-full border ${newPassword.length > 0 && newPassword.length < 6 ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBB321]`}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <i
                                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                            >
                                {showPassword.new ? <FaEye/> : <FaEyeSlash/>}
                            </i>
                        </div>
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-red-500 text-sm mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                        )}
                        {/* Xác nhận mật khẩu mới */}
                        <label className="block text-gray-600 text-sm mt-4 mb-1">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                className={`w-full border ${confirmPassword && confirmPassword !== newPassword ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBB321]`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <i
                                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                            >
                                {showPassword.confirm ? <FaEye/> : <FaEyeSlash/>}
                            </i>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-red-500 text-sm mt-1">Mật khẩu xác nhận không khớp</p>
                        )}
                        {/* Đổi mật khẩu */}
                        <button
                            className="mt-5 w-full bg-[#FBB321] text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-[#e0a816] shadow-md"
                            onClick={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;