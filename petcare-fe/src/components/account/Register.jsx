import React, { useState, useEffect } from "react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { FaArrowCircleRight } from "react-icons/fa";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
    images.forEach((img) => {
      observer.observe(img);
    });

    images.forEach((img) => {
      if (img.getBoundingClientRect().top <= window.innerHeight * 0.5) {
        img.classList.add("in-view");
      }
    });

    return () => {
      images.forEach((img) => {
        observer.unobserve(img);
      });
    };
  }, []);

  return (
    <div className="bg-gradient-to-r flex items-center justify-center min-h-screen ">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row max-w-4xl w-full border p-6 relative hover:bg-white transition-all duration-300">
        <div className="p-10 flex items-center justify-center w-full lg:w-1/2 rounded-lg load-img">
          <img
            src="https://placehold.co/600x600"
            alt="Logo with petcare"
            className="w-full h-auto z-10 hidden md:inline rounded-full shadow-lg"
          />
        </div>

        <div className="p-10 w-full lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-yellow-500 mb-6 text-center">
            Đăng ký
          </h2>

          <form>
            {/* Input Họ và tên */}
            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input
                  type="text"
                  id="fullname"
                  placeholder="Họ và tên"
                  className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Họ và tên
                </span>
              </div>
            </div>

            {/* Input Email */}
            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Email
                </span>
              </div>
            </div>

            {/* Input Password */}
            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Mật khẩu"
                  className="peer outline-none border pl-2 py-2 pr-10 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md w-full rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Mật khẩu
                </span>
                <i
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 transform -translate-y-1/4 cursor-pointer bg-white p-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[#FBB321]" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#FBB321]" />
                  )}
                </i>
              </div>
            </div>

            {/* Input Confirm Password */}
            <div className="mb-6">
              <div className="flex flex-col-reverse relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  placeholder="Xác nhận mật khẩu"
                  className="peer outline-none border pl-2 py-2 pr-10 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md w-full rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Xác nhận mật khẩu
                </span>
                <i
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 transform -translate-y-1/4 cursor-pointer bg-white p-1"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[#FBB321]" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#FBB321]" />
                  )}
                </i>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between mb-6">
              <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg flex items-center group space-x-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300">
                <span className="relative overflow-hidden">
                  <span className="absolute inset-0 transform translate-x-[-100%] group-hover:translate-x-0 transition-all duration-300"></span>
                  <span className="relative z-10">Đăng ký</span>
                </span>
                <FaArrowCircleRight className="h-5 w-5 transform transition-all duration-300 group-hover:text-yellow-300 group-hover:translate-x-2" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-gray-500">
                Bạn đã có tài khoản?{" "}
                <a href="/login" className="text-yellow-500 hover:underline">
                  Đăng nhập ngay
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
