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
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null); // Ảnh hiển thị
  const [isModalOpen, setIsModalOpen] = useState(false); // Hiển thị modal chỉnh sửa
  const [crop, setCrop] = useState({ aspect: 1 }); // Tỉ lệ crop ảnh (1:1)
  const [completedCrop, setCompletedCrop] = useState(null); // Crop hoàn thành
  const imgRef = useRef(null); // Tham chiếu ảnh
  const [selectedItem, setSelectedItem] = useState("Thông tin tài khoản"); // Mục mặc định

  const handleItemClick = (item) => {
    setSelectedItem(item); // Cập nhật trạng thái được chọn
  };

  // Mở hộp thoại chọn file
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
      setIsModalOpen(true); // Mở modal chỉnh sửa
    }
  };

  // Xử lý crop hoàn thành
  const handleCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  // Lưu ảnh đã crop
  const handleCropOk = () => {
    if (completedCrop && imgRef.current) {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        const croppedImageURL = URL.createObjectURL(blob);
        setImageSrc(croppedImageURL);
        setIsModalOpen(false); // Đóng modal
      });
    }
  };

  const menuItems = [
    {
      label: "Thông tin tài khoản",
      icon: <AiOutlineUser />, // Icon người dùng
    },
    {
      label: "Lịch sử đơn hàng",
      icon: <AiOutlineHistory />, // Icon lịch sử
    },
    {
      label: "Địa chỉ",
      icon: <MdOutlineLocationOn />, // Icon địa chỉ
    },
    {
      label: "Đổi mật khẩu",
      icon: <AiOutlineLock />, // Icon khóa
    },
    {
      label: "Yêu thích",
      icon: <AiOutlineHeart />, // Icon trái tim
    },
  ];
  return (
    <div className="flex justify-center items-center min-h-screen container">
      <div className="bg-white rounded-xl shadow-xl border-2 p-8 w-full max-w-5xl flex relative">
        {/* Sidebar */}
        <SidebarAccount />

        {/* Content */}
        <div className="left-full translate-x-1/3 w-3/4 h-[506px]">
          <h2 className="text-[#FBB321] text-2xl font-bold mb-6">
            {selectedItem}
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
