import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icon từ react-icons/fa

const ChangePassword = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex justify-between">
      {/* Left Section */}
      <div className="w-full max-w-md p-6 ">
        {/* Current Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
            />
            <i
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer`}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
            </i>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
            />
            <i
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer`}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEye /> : <FaEyeSlash />}
            </i>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
            />
            <i
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </i>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-start">
          <button className="w-1/3 py-2 px-4 text-white bg-[#FBB321] rounded-full hover:bg-[#e0a816] focus:outline-none focus:ring-2 focus:ring-[#FBB321] focus:ring-offset-2 shadow-md">
            Xác nhận
          </button>
        </div>
      </div>

      {/* Right Section */}
<div className="flex-1 -z-10 absolute bg-[#FBB321] right-[208px] top-0 translate-x-3/4 hidden lg:block w-[320px] rounded-custom h-[538px] shadow-lg">
  {/* Text Overlay */}
  <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-4">
    <h1 className="text-3xl font-bold text-white mb-4">*Lưu ý</h1>
    <ul className="text-white text-sm space-y-2 text-start">
      <li className="flex items-center">
        <span className="bg-white text-[#FBB321] font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2">1</span>
        Mật khẩu mới phải khác mật khẩu cũ.
      </li>
      <li className="flex items-center">
        <span className="bg-white text-[#FBB321] font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2">2</span>
        Độ dài mật khẩu tối thiểu 8 ký tự.
      </li>
      
    </ul>
  </div>
</div>

    </div>
  );
};

export default ChangePassword;
