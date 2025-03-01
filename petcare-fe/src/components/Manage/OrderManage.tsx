import React, { useState, useEffect } from "react";
import OrderManageService from "../../service/orderManageService/OrderManageService.jsx";
import VoucherService from "../../service/voucherService/VoucherService.jsx";
import { FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "waiting", label: "Chờ giao hàng" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "returned", label: "Trả hàng" },
];

const ITEMS_PER_PAGE = 10; // Số đơn hàng trên mỗi trang

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentTab, setCurrentTab] = useState("all"); // Giá trị mặc định là "all"
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang đầu tiên khi đổi tab
  }, [activeTab, searchTerm, filterStatus]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await VoucherService.getAllVouchers();
        setVouchers(data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const data = await VoucherService.getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
      setVouchers([]);
    }
  };
  // Hàm lấy phần trăm giảm giá dựa trên voucherId
  const getVoucherPercents = (voucherId) => {
    const voucher = vouchers.find((v) => v.voucherId === voucherId);
    return voucher ? voucher.percents : 0; // Trả về 0 nếu không có voucher
  };

  // Trong modal, tìm voucher tương ứng

  const fetchOrders = async () => {
    try {
      const data = await OrderManageService.getAllOrders();
      const sortedOrders = data
        .filter((order) => order && order.orderId)
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    }
  };

  const statusMap = {
    pending: 1,
    shipping: 2,
    waiting: 3,
    completed: 4,
    cancelled: 5,
    returned: 6,
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    // Danh sách các trạng thái không thể thay đổi (Hoàn thành, Đã hủy, Trả hàng)
    const finalStatuses = [
      statusMap["completed"],
      statusMap["cancelled"],
      statusMap["returned"],
    ];

    // Kiểm tra nếu trạng thái hiện tại nằm trong danh sách không thể thay đổi
    if (finalStatuses.includes(order.statusId)) {
      Swal.fire({
        icon: "warning",
        title: "Không thể thay đổi!",
        text: "Đơn hàng ở trạng thái 'Hoàn thành', 'Đã hủy' hoặc 'Trả hàng' không thể cập nhật trạng thái.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // Kiểm tra nếu hủy đơn thì chỉ được khi trạng thái là "Chờ xác nhận"
    if (
      newStatus == statusMap["cancelled"] &&
      order.statusId !== statusMap["pending"]
    ) {
      Swal.fire({
        icon: "warning",
        title: "Không thể hủy đơn!",
        text: "Chỉ có thể hủy đơn khi trạng thái là 'Chờ xác nhận'.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      // Hiển thị hộp thoại xác nhận
      const result = await Swal.fire({
        title: "Xác nhận thay đổi?",
        text: "Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await OrderManageService.updateOrderStatus(orderId, newStatus);

        // Cập nhật danh sách đơn hàng sau khi thay đổi trạng thái
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  statusId: parseInt(newStatus),
                  paymentStatus:
                    parseInt(newStatus) === statusMap["completed"]
                      ? "Đã thanh toán"
                      : order.paymentStatus, // Cập nhật paymentStatus nếu trạng thái là "Hoàn thành"
                }
              : order
          )
        );

        // Hiển thị thông báo thành công
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          text: "Trạng thái đơn hàng đã được cập nhật.",
        });
      }
    } catch (error) {
      console.error("Cập nhật trạng thái thất bại", error);

      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể cập nhật trạng thái đơn hàng.",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    return (
      (activeTab === "all" || order.statusId === statusMap[activeTab]) &&
      (searchTerm === "" || order.orderId.toString().includes(searchTerm)) &&
      (filterStatus === "" || order.statusId === parseInt(filterStatus))
    );
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      {/* Search & Filter */}
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-1/3"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded w-1/4"
        >
          <option value="">Lọc theo trạng thái</option>
          {TABS.filter((tab) => tab.key !== "all").map((tab) => (
            <option key={tab.key} value={statusMap[tab.key]}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-lg font-medium border-b-2 transition duration-200 ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Table */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Mã đơn hàng</th>
              <th className="p-3 border">Khách hàng</th>
              <th className="p-3 border">Ngày đặt</th>
              <th className="p-3 border">Tổng tiền</th>
              <th className="p-3 border">Chi tiết</th>
              <th className="p-3 border">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.orderId} className="text-center">
                  <td className="p-3 border">{order.orderId}</td>
                  <td className="p-3 border">{order.userName}</td>
                  <td className="p-3 border">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 border">
                    {order.totalAmount.toLocaleString()} VNĐ
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEye size={20} />
                    </button>
                  </td>
                  <td className="p-3 border">
                    <select
                      value={order.statusId}
                      onChange={(e) =>
                        handleStatusChange(order.orderId, e.target.value)
                      }
                      className="p-2 border rounded bg-white"
                    >
                      {Object.entries(statusMap).map(([key, value]) => (
                        <option key={key} value={value}>
                          {TABS.find((tab) => tab.key === key)?.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 mx-1 border rounded ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          <span className="px-4 py-2 border rounded bg-white">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className={`px-4 py-2 mx-1 border rounded ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}

      {/* Model chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
              Chi tiết đơn hàng
            </h2>

            {/* Chia thành 2 cột ngang */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Cột trái */}
              <div className="flex-1 border-b pb-4">
                <p className="text-lg">
                  <strong>Mã đơn hàng:</strong>{" "}
                  {selectedOrder.orderId || "Không có"}
                </p>
                <p className="text-lg">
                  <strong>Khách hàng:</strong>{" "}
                  {selectedOrder.userName || "Không có"}
                </p>
                <p className="text-lg">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedOrder.phone || "Không có"}
                </p>
                <p className="text-lg">
                  <strong>Ngày đặt hàng:</strong>{" "}
                  {selectedOrder.orderDate
                    ? new Date(selectedOrder.orderDate).toLocaleString(
                        "vi-VN",
                        {
                          timeZone: "Asia/Ho_Chi_Minh",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )
                    : "Không có"}
                </p>
              </div>

              {/* Cột phải */}
              <div className="flex-1 border-b pb-4">
                <p className="text-lg">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedOrder.shippingAddress || "Không có"}
                </p>
                <p className="text-lg">
                  <strong>Phí ship:</strong>{" "}
                  {selectedOrder.shippingCost !== undefined
                    ? selectedOrder.shippingCost.toLocaleString()
                    : "0"}{" "}
                  VNĐ
                </p>
                <p className="text-lg">
                  <strong>Voucher áp dụng:</strong>{" "}
                  {selectedOrder.voucherId
                    ? `Giảm ${getVoucherPercents(
                        selectedOrder.voucherId
                      )}% từ voucher`
                    : "Không có"}
                </p>
                <p className="text-lg text-red-600 font-normal">
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedOrder.totalAmount !== undefined
                    ? selectedOrder.totalAmount.toLocaleString()
                    : "0"}{" "}
                  VNĐ
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm với chiều cao cố định và thanh cuộn */}
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              Sản phẩm:
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-4">
              {selectedOrder.orderDetails &&
              selectedOrder.orderDetails.length > 0 ? (
                selectedOrder.orderDetails.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center border p-3 rounded-lg shadow-sm bg-gray-50"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="ml-4 flex-1">
                      <p className="text-lg font-medium text-gray-900">
                        {item.productName || "Không có"}
                      </p>
                      <p className="text-sm">
                        Màu sắc: {item.colorValue || "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Kích cỡ: {item.sizeValue || "Không có"}, Cân nặng:{" "}
                        {item.weightValue || "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Số lượng: {item.quantity || "0"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm trong đơn hàng</p>
              )}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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

export default OrderManage;
