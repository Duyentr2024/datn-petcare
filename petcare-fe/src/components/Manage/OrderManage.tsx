import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderManageService from "../../service/orderManageService/OrderManageService.jsx";
import VoucherService from "../../service/voucherService/VoucherService.jsx";
import { FaEye, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "waiting", label: "Chờ giao hàng" },
  { key: "completed", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "returned", label: "Trả hàng" },
];

const ITEMS_PER_PAGE = 7;

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

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
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
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

  const getStatusDotColor = (statusId) => {
    switch (statusId) {
      case statusMap["cancelled"]:
        return "bg-red-500";
      case statusMap["completed"]:
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    return paymentStatus === "Đã thanh toán" ? "Đã thanh toán" : "Chưa thanh toán";
  };

  const getPaymentStatusDotColor = (paymentStatus) => {
    return paymentStatus === "Đã thanh toán" ? "bg-green-500" : "bg-gray-400";
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
      if (searchTerm && !order.orderId.toString().includes(searchTerm)) return false;
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
        return new Date(b.orderDate) - new Date(a.orderDate);
      } else {
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
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Quản lý đơn hàng (Admin)</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-300 ease-in-out ${
              activeTab === tab.key
                ? "border-blue-300 bg-blue-50 text-blue-600"
                : "border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400" size={16} />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 pl-10 border border-gray-300 rounded-lg w-full max-w-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
        />
      </div>

      {/* Order Table with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="shadow-sm"
        >
          <table className="w-full">
            <thead className="bg-blue-400 text-white text-xs">
              <tr>
                <th className="py-3 px-4 text-left uppercase font-medium">Mã đơn hàng</th>
                <th className="py-3 px-4 text-left uppercase font-medium">Tổng tiền</th>
                <th className="py-3 px-4 text-left uppercase font-medium">Ngày đặt</th>
                <th className="py-3 px-4 text-left uppercase font-medium">Trạng thái</th>
                <th className="py-3 px-4 text-left uppercase font-medium">Trạng thái thanh toán</th>
                <th className="py-3 px-4 text-left uppercase font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => (
                  <motion.tr
                    key={order.orderId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-700">{order.orderId}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.totalAmount.toLocaleString()} đ</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(order.orderDate).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusDotColor(order.statusId)}`}></span>
                      <span className="text-gray-700">{getStatusLabel(order.statusId)}</span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPaymentStatusDotColor(order.paymentStatus)}`}></span>
                      <span className="text-gray-700">{getPaymentStatusLabel(order.paymentStatus)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <FaEye size={16} />
                      </button>
                      {activeTab === "pending" && order.statusId === statusMap["pending"] && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(order.orderId, statusMap["shipping"])
                            }
                            className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs transition-colors duration-200"
                            disabled={isLoading}
                          >
                            Đang vận chuyển
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(order.orderId, statusMap["cancelled"])
                            }
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200"
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
                          className="ml-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs transition-colors duration-200"
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
                          className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs transition-colors duration-200"
                          disabled={isLoading}
                        >
                          Đã giao
                        </button>
                      )}
                      {activeTab === "completed" && order.statusId === statusMap["completed"] && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.orderId, statusMap["returned"])
                          }
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200"
                          disabled={isLoading}
                        >
                          Trả hàng
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500 text-sm">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls with Page Transition */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 items-center space-x-4">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 text-sm transition-all duration-200 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            &lt;
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 text-sm transition-all duration-200 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Enhanced Order Details Modal with Animation */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-xl w-full max-w-md shadow-lg relative"
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl transition-colors duration-200"
              >
                ×
              </button>

              <h2 className="text-lg font-semibold mb-4 text-center text-blue-600">
                Chi tiết đơn hàng
              </h2>

              {(() => {
                const subtotalProducts =
                  selectedOrder.orderDetails?.reduce(
                    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                    0
                  ) || 0;

                return (
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Mã đơn hàng:</strong>{" "}
                        {selectedOrder.orderId || "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Khách hàng:</strong>{" "}
                        {selectedOrder.userName || "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Số điện thoại:</strong>{" "}
                        {selectedOrder.phone || "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Ngày đặt hàng:</strong>{" "}
                        {selectedOrder.orderDate
                          ? new Date(selectedOrder.orderDate).toLocaleString("vi-VN", {
                              timeZone: "Asia/Ho_Chi_Minh",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Không có"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Địa chỉ:</strong>{" "}
                        {selectedOrder.shippingAddress || "Không có"}
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Phí vận chuyển:</strong>
                        <span className="text-red-400">
                          {" "}
                          {selectedOrder.shippingCost !== undefined
                            ? selectedOrder.shippingCost.toLocaleString()
                            : "0"}{" "}
                          đ
                        </span>
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Voucher áp dụng:</strong>{" "}
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
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Tổng tiền sản phẩm:</strong>{" "}
                        <span className="text-red-400">
                          {subtotalProducts.toLocaleString()} đ
                        </span>
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium">Thành tiền:</strong>
                        <span className="text-red-600 font-semibold">
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

              <h3 className="text-base font-semibold mb-3 text-gray-700">
                Sản phẩm:
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                {selectedOrder.orderDetails &&
                selectedOrder.orderDetails.length > 0 ? (
                  selectedOrder.orderDetails.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center border p-3 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName || "Không có"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Màu sắc: {item.colorValue || "Không có"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Kích cỡ: {item.sizeValue || "Không có"}, Cân nặng:{" "}
                          {item.weightValue || "Không có"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Số lượng: {item.quantity || "0"}
                        </p>
                        <p className="text-xs text-gray-600">
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
                  <p className="text-sm text-gray-600">Không có sản phẩm trong đơn hàng</p>
                )}
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                  disabled={isLoading}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManage;