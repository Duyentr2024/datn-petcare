import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import VoucherService from "../../../../service/voucherService/VoucherService";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa"; // Import icon

const CreateVoucher = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  const [voucher, setVoucher] = useState({
    name: "",
    startDate: "",
    endDate: "",
    quantity: "",
    percents: "",
    condition: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoucher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra không được bỏ trống
    if (!voucher.name.trim() || !voucher.startDate || !voucher.endDate) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }

    // Kiểm tra ngày bắt đầu phải nhỏ hơn ngày kết thúc
    if (new Date(voucher.startDate) >= new Date(voucher.endDate)) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!",
      });
      return;
    }

    // Kiểm tra số lượng không nhỏ hơn 1
    if (!voucher.quantity || voucher.quantity < 1) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Số lượng phải lớn hơn hoặc bằng 1!",
      });
      return;
    }

    // Kiểm tra giảm giá từ 0 - 70%
    if (voucher.percents < 0 || voucher.percents > 70) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Giảm giá phải từ 0% đến 70%!",
      });
      return;
    }

    // Kiểm tra điều kiện không được là số âm
    if (voucher.condition < 0) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Điều kiện không được là số âm!",
      });
      return;
    }

    try {
      await VoucherService.createVoucher(voucher);
      Swal.fire({
        title: "Thành công!",
        text: "Voucher đã được thêm!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/admin/voucher-management");
      }, 1500);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể thêm voucher!",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-1 rounded-lg shadow-lg">
      <div className="bg-white p-6 rounded-lg relative">
        {/* Nút Quay lại với icon */}
        <button
          onClick={() => navigate("/admin/voucher-management")}
          className="absolute top-2 left-2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full transition duration-200 shadow-md"
        >
          <FaArrowLeft size={18} /> {/* Icon mũi tên trái */}
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-4">
          🎉 Thêm Voucher 🎊
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Tên Voucher */}
          <div className="col-span-2">
            <label className="block font-medium text-red-500">
              Tên Voucher
            </label>
            <input
              type="text"
              name="name"
              value={voucher.name}
              onChange={handleChange}
              className="w-full p-2 border-2 border-red-400 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Ngày Bắt Đầu */}
          <div>
            <label className="block font-medium text-blue-500">
              Ngày Bắt Đầu
            </label>
            <input
              type="date"
              name="startDate"
              value={voucher.startDate}
              onChange={handleChange}
              className="w-full p-2 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ngày Kết Thúc */}
          <div>
            <label className="block font-medium text-green-500">
              Ngày Kết Thúc
            </label>
            <input
              type="date"
              name="endDate"
              value={voucher.endDate}
              onChange={handleChange}
              className="w-full p-2 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Số lượng */}
          <div>
            <label className="block font-medium text-purple-500">
              Số lượng
            </label>
            <input
              type="number"
              name="quantity"
              value={voucher.quantity}
              onChange={handleChange}
              className="w-full p-2 border-2 border-purple-400 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Giảm giá (%) */}
          <div>
            <label className="block font-medium text-orange-500">
              Giảm giá (%)
            </label>
            <input
              type="number"
              name="percents"
              value={voucher.percents}
              onChange={handleChange}
              className="w-full p-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Điều kiện (VNĐ) */}
          <div className="col-span-2">
            <label className="block font-medium text-pink-500">
              Điều kiện (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                name="condition"
                value={new Intl.NumberFormat("vi-VN").format(voucher.condition)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, ""); // Chỉ giữ lại số
                  handleChange({
                    target: { name: "condition", value: rawValue },
                  }); // Gọi handleChange với giá trị mới
                }}
                className="w-full p-2 border-2 border-pink-400 rounded-lg focus:ring-2 focus:ring-pink-500 pr-10"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                VNĐ
              </span>
            </div>
          </div>

          {/* Nút Thêm Voucher */}
          <div className="col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition duration-200 shadow-lg"
            >
              🎁 Thêm Voucher 🎁
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVoucher;
