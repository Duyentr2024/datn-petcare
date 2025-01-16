import React, { useRef, useState } from "react";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
const AccountInfo = () => {
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

  return (
    <>
      <div className="flex justify-between">
        <form>
          <div className="flex flex-col gap-6 w-[500px]">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="text"
                className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                value="lsdads@gmail.com"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Ngày đăng ký 
              </label>
              <input
                type="date"
                className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                value="2023-01-01" // Bạn có thể load giá trị này từ API
                readOnly
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <input
                type="text"
                className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                value="Người dùng" // Mặc định là "Người dùng", không cho chỉnh sửa
                readOnly
              />
            </div>
          </div>
          <div className="mt-6 ml-[117px] flex justify-start">
            <button
              type="submit"
              className="bg-[#FBB321] text-white py-2 px-4 rounded-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBB321]"
            >
              Cập nhật thông tin
            </button>
          </div>
        </form>

        {/* Avatar upload section */}
        <div className="mt-6 flex justify-end">
          <div className="text-center">
            <img
              src="https://placehold.co/150x150"
              alt="Profile picture"
              className="rounded-full border-4 border-[#FBB321] mb-2 cursor-pointer"
              onClick={handleAvatarClick} // Click vào ảnh sẽ trigger mở hộp thoại
            />
            <p className="text-sm text-gray-500">
              Dung lượng file tối đa <span className="font-bold">1MB</span>
            </p>
            <p className="text-sm text-gray-500">Định dạng: JPEG, PNG</p>
          </div>
        </div>
      </div>

      {/* Thêm input file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange} // Xử lý sự kiện khi chọn ảnh
      />
    </>
  );
};

export default AccountInfo;
