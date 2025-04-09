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

const ITEMS_PER_PAGE = 10;

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
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

  const fetchOrders = async () => {
    try {
      const data = await OrderManageService.getAllOrders();
      const sortedOrders = data
        .filter((order) => order && order.orderId)
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Mặc định sắp xếp theo orderDate
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    }
  };

  const getVoucherPercents = (voucherId) => {
    const voucher = vouchers.find((v) => v.voucherId === voucherId);
    return voucher ? voucher.percents : 0;
  };

  const statusMap = {
    pending: 1,
    shipping: 2,
    waiting: 3,
    completed: 4,
    cancelled: 5,
    returned: 6,
  };

  const getStatusLabel = (statusId) => {
    const tab = TABS.find((t) => statusMap[t.key] === statusId);
    return tab ? tab.label : "Không xác định";
  };

  const handleStatusChange = async (orderId, newStatus, reason = null) => {
    try {
      const result = await Swal.fire({
        title: newStatus === statusMap["cancelled"] ? "Hủy đơn hàng" : "Xác nhận thay đổi?",
        text: newStatus === statusMap["cancelled"]
          ? "Vui lòng nhập lý do hủy đơn hàng:"
          : "Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?",
        icon: "question",
        input: newStatus === statusMap["cancelled"] ? "textarea" : null,
        inputPlaceholder: newStatus === statusMap["cancelled"] ? "Nhập lý do hủy..." : null,
        inputValidator: (value) => {
          if (newStatus === statusMap["cancelled"] && (!value || value.trim() === "")) {
            return "Lý do hủy không được để trống!";
          }
        },
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        const reasonText = newStatus === statusMap["cancelled"] ? result.value : reason;

        if (newStatus === statusMap["cancelled"]) {
          setIsLoading(true);
          Swal.fire({
            title: "Đang xử lý...",
            html: "Vui lòng chờ trong khi hủy đơn hàng và gửi email thông báo.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
        }

        await OrderManageService.updateOrderStatus(orderId, newStatus, reasonText);

        // Cập nhật danh sách đơn hàng và thêm thời gian cập nhật trạng thái
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  statusId: parseInt(newStatus),
                  statusUpdateDate: new Date().toISOString(),
                  paymentStatus:
                    parseInt(newStatus) === statusMap["completed"]
                      ? "Đã thanh toán"
                      : order.paymentStatus,
                }
              : order
          )
        );

        // Nếu là hủy đơn hàng, chuyển sang tab "Đã hủy"
        if (newStatus === statusMap["cancelled"]) {
          setActiveTab("cancelled");
        }

        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          text: newStatus === statusMap["cancelled"]
            ? "Đơn hàng đã được hủy và email thông báo đã được gửi đến khách hàng."
            : "Trạng thái đơn hàng đã được cập nhật.",
        });
      }
    } catch (error) {
      console.error("Cập nhật trạng thái thất bại", error);
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể cập nhật trạng thái đơn hàng.",
      });
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return order.statusId === statusMap["pending"];
      if (activeTab === "shipping") return order.statusId === statusMap["shipping"];
      if (activeTab === "waiting") return order.statusId === statusMap["waiting"];
      if (activeTab === "completed") return order.statusId === statusMap["completed"];
      if (activeTab === "cancelled") return order.statusId === statusMap["cancelled"];
      if (activeTab === "returned") return order.statusId === statusMap["returned"];
      return false;
    })
    .sort((a, b) => {
      if (activeTab === "all" || activeTab === "pending") {
        // Sắp xếp theo ngày đặt hàng (mới nhất lên đầu)
        return new Date(b.orderDate) - new Date(a.orderDate);
      } else {
        // Sắp xếp theo thời gian cập nhật trạng thái (mới nhất lên đầu)
        const dateA = a.statusUpdateDate ? new Date(a.statusUpdateDate) : new Date(a.orderDate);
        const dateB = b.statusUpdateDate ? new Date(b.statusUpdateDate) : new Date(b.orderDate);
        return dateB - dateA;
      }
    });

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
              {activeTab === "all" && <th className="p-3 border">Trạng thái</th>}
              <th className="p-3 border">Thao tác</th>
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
                    {order.totalAmount.toLocaleString()} đ
                  </td>
                  {activeTab === "all" && (
                    <td className="p-3 border">{getStatusLabel(order.statusId)}</td>
                  )}
                  <td className="p-3 border flex justify-center space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Xem chi tiết"
                    >
                      <FaEye size={20} />
                    </button>
                    {activeTab === "pending" && order.statusId === statusMap["pending"] && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(order.orderId, statusMap["shipping"])
                          }
                          className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          disabled={isLoading}
                        >
                          Đang vận chuyển
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(order.orderId, statusMap["cancelled"])
                          }
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={isLoading}
                        >
                          Hủy hàng
                        </button>
                      </>
                    )}
                    {activeTab === "shipping" && order.statusId === statusMap["shipping"] && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.orderId, statusMap["waiting"])
                        }
                        className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                        disabled={isLoading}
                      >
                        Chờ giao hàng
                      </button>
                    )}
                    {activeTab === "waiting" && order.statusId === statusMap["waiting"] && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.orderId, statusMap["completed"])
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={isLoading}
                      >
                        Hoàn thành
                      </button>
                    )}
                    {activeTab === "completed" && order.statusId === statusMap["completed"] && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.orderId, statusMap["returned"])
                        }
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        disabled={isLoading}
                      >
                        Trả hàng
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === "all" ? "6" : "5"} className="p-4 text-center text-gray-500">
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
            disabled={currentPage === 1 || isLoading}
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
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

            {(() => {
              const subtotalProducts =
                selectedOrder.orderDetails?.reduce(
                  (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                  0
                ) || 0;

              return (
                <div className="flex flex-col md:flex-row gap-6 mb-4">
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
                    <p className="text-lg">
                      <strong>Địa chỉ:</strong>{" "}
                      {selectedOrder.shippingAddress || "Không có"}
                    </p>
                  </div>

                  <div className="flex-1 border-b pb-4">
                    <p className="text-lg pb-4">
                      <strong>Phí vận chuyển:</strong>
                      <span className="text-red-400">
                        {" "}
                        {selectedOrder.shippingCost !== undefined
                          ? selectedOrder.shippingCost.toLocaleString()
                          : "0"}{" "}
                        đ
                      </span>
                    </p>
                    <p className="text-lg pb-4">
                      <strong>Voucher áp dụng:</strong>{" "}
                      <span className="text-green-600">
                        {selectedOrder.voucherId
                          ? `${(
                              ((subtotalProducts +
                                (selectedOrder.shippingCost || 0)) *
                                getVoucherPercents(selectedOrder.voucherId)) /
                              100
                            ).toLocaleString()} đ`
                          : "Không có"}
                      </span>
                    </p>
                    <p className="text-lg pb-4">
                      <strong>Tổng tiền sản phẩm:</strong>{" "}
                      <span className="text-red-400 font-normal">
                        {subtotalProducts.toLocaleString()} đ
                      </span>
                    </p>
                    <p className="text-lg">
                      <strong>Thành tiền:</strong>
                      <span className="text-red-600 font-bold">
                        {" "}
                        {selectedOrder.totalAmount !== undefined
                          ? selectedOrder.totalAmount.toLocaleString()
                          : "0"}{" "}
                        đ
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}

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
                      <p className="text-sm text-gray-700">
                        Giá:{" "}
                        {item.price !== undefined
                          ? item.price.toLocaleString()
                          : "0"}{" "}
                        đ
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
                disabled={isLoading}
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