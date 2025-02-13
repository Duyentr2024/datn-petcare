import React, { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Routes, Route } from "react-router-dom";

import {
  AiOutlineUser,
  AiOutlineHistory,
  AiOutlineLock,
  AiOutlineHeart,
} from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";
import SidebarAccount from "../account/SidebarAccount";
import AccountInfo from "../account/AccountInfo";
import OrderHistory from "../account/OrderHistory";
import Address from "../account/Address";
import ChangePassword from "../account/ChangePassword";
import Favorites from "../account/Favorites";
const MyAccount = () => {
 
  // const [selectedItem, setSelectedItem] = useState("Thông tin tài khoản"); // Mục mặc định

  const handleItemClick = (item) => {
    setSelectedItem(item); // Cập nhật trạng thái được chọn
  };



  return (
    <div className="flex justify-center items-center min-h-screen container">
      <div className="bg-white rounded-xl shadow-xl border-2 p-8 w-full max-w-5xl flex relative">
        {/* Sidebar */}
        <SidebarAccount />

        {/* Content */}
        <div className="left-full translate-x-1/3 w-3/4 h-[506px]">
          <h2 className="text-[#FBB321] text-2xl font-bold mb-6">
       
          </h2>
          <Routes>
          <Route path="/" element={<AccountInfo />} /> {/* Trang mặc định */}
          <Route path="info" element={<AccountInfo />} /> {/* Đảm bảo đường dẫn đúng */}
            <Route path="/history" element={<OrderHistory />} />
            <Route path="/address" element={<Address />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </div>

      </div>
    </div>
  );
};

export default MyAccount;
