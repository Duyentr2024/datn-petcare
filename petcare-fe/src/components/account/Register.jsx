import React, { useState, useEffect } from "react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { FaArrowCircleRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "", confirmPassword: "" });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.5 }
    );

    const images = document.querySelectorAll(".load-img");
    images.forEach((img) => observer.observe(img));

    return () => images.forEach((img) => observer.unobserve(img));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Mật khẩu xác nhận không khớp!",
      });
      return;
    }
  
    try {
      // Hiển thị hiệu ứng loading
      Swal.fire({
        title: "Đang xử lý...",
        text: "Vui lòng đợi trong giây lát",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        fullName: formData.fullname,
        email: formData.email,
        password: formData.password,
      });
  
      // Khi thành công, hiển thị thông báo
      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
        text: "Vui lòng kiểm tra email để nhận mã OTP",
        showConfirmButton: false,
        timer: 2000,
      });
  
      // Chuyển hướng sau khi hoàn tất thông báo
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: formData.email } });
      }, 2000);
  
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Đã xảy ra lỗi!",
        text: error.response?.data || "Vui lòng thử lại sau!",
      });
    }
  };
  

  return (
    <div className="bg-gradient-to-r flex items-center justify-center min-h-screen ">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row max-w-4xl w-full border p-6 relative hover:bg-white transition-all duration-300">

        <div className="p-10 items-center justify-center w-full lg:w-1/2 rounded-lg load-img hidden lg:flex">
          <img src="https://placehold.co/600x600" alt="Logo with petcare" className="w-full h-auto z-10 hidden md:inline rounded-full shadow-lg" />
        </div>

        <div className="p-10 w-full lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-yellow-500 mb-6 text-center">Đăng ký</h2>

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input type="text" id="fullname" placeholder="Họ và tên" className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:ring-2 focus:ring-yellow-500 rounded-lg shadow-md" value={formData.fullname} onChange={handleInputChange} required />
                <span className="pl-2 text-gray-500">Họ và tên</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input type="email" id="email" placeholder="Email" className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:ring-2 focus:ring-yellow-500 rounded-lg shadow-md" value={formData.email} onChange={handleInputChange} required />
                <span className="pl-2 text-gray-500">Email</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input type={showPassword ? "text" : "password"} id="password" placeholder="Mật khẩu" className="peer outline-none border pl-2 py-2 pr-10 duration-500 border-gray-300 focus:ring-2 focus:ring-yellow-500 w-full rounded-lg shadow-md" value={formData.password} onChange={handleInputChange} required />
                <span className="pl-2 text-gray-500">Mật khẩu</span>
                <i onClick={togglePasswordVisibility} className="absolute right-3 cursor-pointer bg-white p-1">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-[#FBB321]" /> : <EyeIcon className="h-5 w-5 text-[#FBB321]" />}
                </i>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col-reverse relative">
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="Xác nhận mật khẩu" className="peer outline-none border pl-2 py-2 pr-10 duration-500 border-gray-300 focus:ring-2 focus:ring-yellow-500 w-full rounded-lg shadow-md" value={formData.confirmPassword} onChange={handleInputChange} required />
                <span className="pl-2 text-gray-500">Xác nhận mật khẩu</span>
                <i onClick={toggleConfirmPasswordVisibility} className="absolute right-3 cursor-pointer bg-white p-1">
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-[#FBB321]" /> : <EyeIcon className="h-5 w-5 text-[#FBB321]" />}
                </i>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button type="submit" className="bg-yellow-500 text-white px-6 py-3 rounded-lg flex items-center group space-x-2 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all duration-300">
                <span className="relative z-10">Đăng ký</span>
                <FaArrowCircleRight className="h-5 w-5 group-hover:text-yellow-300 group-hover:translate-x-2" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-gray-500">Bạn đã có tài khoản? <Link to="/login" className="text-yellow-500 hover:underline font-bold">Đăng nhập ngay</Link></span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
