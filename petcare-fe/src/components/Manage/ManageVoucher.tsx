import React, { useEffect, useState } from "react";
import VoucherService from "../../service/voucherService/VoucherService";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ManageVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    quantity: "",
    percents: "",
    condition: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const data = await VoucherService.getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
    }
  };

  const handleDelete = async (voucherId) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa voucher này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await VoucherService.deleteVoucher(voucherId);
          Swal.fire("Đã xóa!", "Voucher đã được xóa.", "success");
          fetchVouchers();
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa voucher!", "error");
        }
      }
    });
  };

  const openEditModal = (voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      name: voucher.name,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      quantity: voucher.quantity,
      percents: voucher.percents,
      condition: voucher.condition,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      Swal.fire("Lỗi!", "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!", "error");
      return;
    }

    if (formData.quantity < 1) {
      Swal.fire("Lỗi!", "Số lượng phải lớn hơn hoặc bằng 1!", "error");
      return;
    }

    if (formData.percents < 0 || formData.percents > 70) {
      Swal.fire("Lỗi!", "Giảm giá phải từ 0% đến 70%", "error");
      return;
    }

    if (formData.condition < 0) {
      Swal.fire("Lỗi!", "Điều kiện không được là số âm!", "error");
      return;
    }

    try {
      await VoucherService.updateVoucher(selectedVoucher.voucherId, formData);
      Swal.fire("Thành công!", "Voucher đã được cập nhật.", "success");
      setIsEditModalOpen(false);
      fetchVouchers();
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể cập nhật voucher!", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Quản lý Voucher</h2>
        <Link
          to="/admin/voucher-management-create"
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
        >
          + Thêm Voucher
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Ngày BĐ</th>
            <th className="border p-2">Ngày KT</th>
            <th className="border p-2">Số lượng</th>
            <th className="border p-2">Giảm giá</th>
            <th className="border p-2">Điều kiện</th>
            <th className="border p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher.voucherId} className="text-center">
              <td className="border p-2">{voucher.voucherId}</td>
              <td className="border p-2">{voucher.name}</td>
              <td className="border p-2">{voucher.startDate}</td>
              <td className="border p-2">{voucher.endDate}</td>
              <td className="border p-2">{voucher.quantity}</td>
              <td className="border p-2">{voucher.percents}%</td>
              <td className="border p-2">
                {formatCurrency(voucher.condition)}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => openEditModal(voucher)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Cập nhật
                </button>
                <button
                  onClick={() => handleDelete(voucher.voucherId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal cập nhật voucher */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[600px]">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
              Cập nhật Voucher
            </h2>

            {/* Form nhập liệu theo dạng ngang */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tên voucher */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Tên Voucher
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Ngày kết thúc */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Giảm giá */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Giảm giá (%)
                </label>
                <input
                  type="number"
                  value={formData.percents}
                  onChange={(e) =>
                    setFormData({ ...formData, percents: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Điều kiện */}
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Điều kiện
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={new Intl.NumberFormat("vi-VN").format(
                      formData.condition
                    )}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Loại bỏ tất cả ký tự không phải số
                      setFormData({ ...formData, condition: rawValue });
                    }}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVoucher;
