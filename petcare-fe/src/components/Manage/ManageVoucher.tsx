import React, { useEffect, useState } from "react";
import VoucherService from "../../service/voucherService/VoucherService";
import OrderManageService from "../../service/orderManageService/OrderManageService";
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
    status: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVoucherOrders, setSelectedVoucherOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const data = await VoucherService.getAllVouchers();
      setVouchers(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
      setVouchers([]);
    }
  };

  const openEditModal = (voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      name: voucher.name || "",
      startDate: voucher.startDate || "",
      endDate: voucher.endDate || "",
      quantity: voucher.quantity || "",
      percents: voucher.percents || "",
      condition: voucher.condition || "",
      status:
        voucher.status !== null && voucher.status !== undefined ? voucher.status : true,
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

  const openDetailModal = async (voucher) => {
    try {
      const orders = await OrderManageService.getOrdersByVoucherId(voucher.voucherId);
      setSelectedVoucherOrders(orders || []);
      setSelectedVoucher(voucher);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      Swal.fire("Lỗi!", "Không thể tải danh sách đơn hàng!", "error");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0) + " VNĐ";
  };

  const getStatusText = (status) => {
    return status ? "Hoạt động" : "Không hoạt động";
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = (voucher.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const voucherStatusStr =
      voucher.status === null || voucher.status === undefined
        ? "false" // Giả định null/undefined là "Không hoạt động"
        : voucher.status.toString();
    const matchesStatus = filterStatus === "all" || voucherStatusStr === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Quản lý Voucher</h2>
        <Link
          to="/admin/voucher-management-create"
          className="bg-[#f0b040] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0a030] transition duration-200"
        >
          <i className="fas fa-plus mr-2"></i> Thêm Voucher
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên voucher..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">Tất cả</option>
          <option value="true">Hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300 table-auto">
      <thead className="bg-[#f0b040] text-white text-sm">
          <tr>
            <th className="py-3 px-5 min-w-[120px]">Tên</th>
            <th className="py-3 px-5 min-w-[100px]">Ngày BĐ</th>
            <th className="py-3 px-5 min-w-[100px]">Ngày KT</th>
            <th className="py-3 px-5 min-w-[80px]">Số lượng</th>
            <th className="py-3 px-5 min-w-[80px]">Giảm giá</th>
            <th className="py-3 px-5 min-w-[120px]">Điều kiện</th>
            <th className="py-3 px-5 min-w-[100px]">Trạng thái</th>
            <th className="py-3 px-5 min-w-[150px]">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentVouchers.length > 0 ? (
            currentVouchers.map((voucher) => (
              <tr key={voucher.voucherId} className="text-center border">
                <td className="py-3 px-5">{voucher.name || "N/A"}</td>
                <td className="py-3 px-5">{voucher.startDate || "N/A"}</td>
                <td className="py-3 px-5">{voucher.endDate || "N/A"}</td>
                <td className="py-3 px-5">{voucher.quantity || 0}</td>
                <td className="py-3 px-5">{voucher.percents || 0}%</td>
                <td className="py-3 px-5">{formatCurrency(voucher.condition)}</td>
                <td
                  className={`py-3 px-5 ${
                    voucher.status ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {getStatusText(voucher.status)}
                </td>
                <td className="py-3 px-5 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(voucher)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={() => openDetailModal(voucher)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="border p-2 text-center text-gray-600">
                Không tìm thấy voucher nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {filteredVouchers.length > vouchersPerPage && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition duration-200`}
          >
            Trang trước
          </button>
          <span className="text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition duration-200`}
          >
            Trang sau
          </button>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[600px]">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
              Cập nhật Voucher
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Điều kiện
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={new Intl.NumberFormat("vi-VN").format(formData.condition)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, condition: rawValue });
                    }}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                    VNĐ
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 font-medium mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value === "true" })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            </div>
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

      {isDetailModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[800px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
              Chi tiết Voucher: {selectedVoucher?.name}
            </h2>
            {selectedVoucherOrders.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Mã đơn hàng</th>
                    <th className="border p-2">Ngày đặt</th>
                    <th className="border p-2">Tổng tiền</th>
                    <th className="border p-2">Loại</th>
                    <th className="border p-2">Trạng thái thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVoucherOrders
                    .slice()
                    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                    .map((order) => (
                      <tr key={order.orderId} className="text-center">
                        <td className="border p-2">{order.orderId}</td>
                        <td className="border p-2">
                          {new Intl.DateTimeFormat("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZone: "Asia/Ho_Chi_Minh",
                          }).format(new Date(order.orderDate))}
                        </td>
                        <td className="border p-2">{formatCurrency(order.totalAmount)}</td>
                        <td className="border p-2">{order.type}</td>
                        <td className="border p-2">{order.paymentStatus}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-600">
                Không có đơn hàng nào áp dụng voucher này.
              </p>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVoucher;