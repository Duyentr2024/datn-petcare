import React, {useState, useEffect} from "react";
import {FaArrowCircleRight, FaFacebookF, FaGoogle} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                    }
                });
            },
            {threshold: 0.5}
        );

        const images = document.querySelectorAll(".load-img");
        images.forEach((img) => observer.observe(img));

        return () => images.forEach((img) => observer.unobserve(img));
    }, []);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            Swal.fire({
                icon: "error",
                title: "Vui lòng nhập email!",
                showConfirmButton: true,
            });
            return;
        }
        try {
            await axios.post("http://localhost:8080/api/otp/send-reset-password-otp", {email});
            Swal.fire({
                icon: "success",
                title: "Mã OTP đã được gửi!",
                text: "Vui lòng kiểm tra email của bạn.",
                showConfirmButton: true,
            });
            sessionStorage.setItem("otpType", "FORGOT_PASSWORD");
            navigate("/verify-otp", {state: {email}});
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
        <div className="bg-gradient-to-r flex items-center justify-center min-h-screen px-4">
            <div
                className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row max-w-4xl w-full border p-6 relative hover:bg-white transition-all duration-300">
                <div className="p-10  items-center justify-center w-full lg:w-1/2 rounded-lg load-img hidden lg:flex">
                    {/* Ẩn logo trên các màn hình có chiều rộng nhỏ hơn 1024px */}
                    <img
                        src="https://placehold.co/600x600"
                        alt="Logo with petcare"
                        className="w-full h-auto z-10 hidden md:inline rounded-full shadow-lg"
                    />
                </div>
                {/* Form Section */}
                <div className="p-4 sm:p-10 w-full lg:w-1/2 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-6 text-center">
                        Quên mật khẩu
                    </h2>

                    <form onSubmit={handleSendOTP}>
                        {/* Input Email */}
                        <div className="mb-4">
                            <div className="flex flex-col-reverse relative">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Nhập email của bạn"
                                    className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:ring-2 focus:ring-yellow-500 rounded-lg shadow-md"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span
                                    className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                                    Email đăng ký
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between mb-6">
                            <button type="submit"
                                    className="bg-yellow-500 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center group space-x-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 w-full sm:w-auto justify-center">
                                <span className="relative overflow-hidden">
                                    <span
                                        className="absolute inset-0 transform translate-x-[-100%] group-hover:translate-x-0 transition-all duration-300"></span>
                                    <span className="relative z-10">Lấy lại mật khẩu</span>
                                </span>
                                <FaArrowCircleRight
                                    className="h-5 w-5 transform transition-all duration-300 group-hover:text-yellow-300 group-hover:translate-x-2"/>
                            </button>
                        </div>

                        <div className="flex items-center justify-center mb-6">
                            <span className="text-gray-500">Đăng nhập qua mạng xã hội</span>
                        </div>


                        {/* Social Login */}
                        <div className="flex flex-row items-center justify-center space-x-4 mb-6">
                            <button
                                className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transform hover:scale-110 transition-all duration-300">
                                <FaFacebookF className="text-white"/>
                            </button>
                            <button
                                className="bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transform hover:scale-110 transition-all duration-300">
                                <FaGoogle className="text-white"/>
                            </button>
                        </div>


                        {/* Navigation Links */}
                        <div className="text-center">
                            <span className="flex-wrap items-center text-gray-500">
                                Bạn chưa có tài khoản?{" "}
                                <Link
                                    to="/register"
                                    className="text-yellow-500 hover:underline font-bold mx-1"
                                >
                                    Đăng ký ngay
                                </Link>
                                hoặc{" "}
                                <Link
                                    to="/login"
                                    className="text-yellow-500 hover:underline font-bold mx-1"
                                >
                                    Đăng nhập
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

}

export default ForgotPassword;

