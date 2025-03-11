import React, { useEffect, useState } from "react";
import OrderHistoryService from "../../service/accountService/OrderHistoryService";
import ReviewService from "../../service/reviewService/ReviewService";
import { useAuth } from "../../context/AuthContext";
import { decodeToken } from "../utils/jwt";
import { useCookies } from "react-cookie";
import Swal from "sweetalert2";
import { FaEye, FaTimes, FaStar } from "react-icons/fa";
import { useLocation } from "react-router-dom";
const TABS = ["Chờ xác nhận", "Đang vận chuyển", "Chờ giao hàng", "Hoàn thành", "Đã hủy", "Trả hàng"];
const ITEMS_PER_PAGE = 5;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderReview, setselectedOrderReview] = useState(null);
  const [activeTab, setActiveTab] = useState("Chờ xác nhận");
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const location = useLocation(); // Thêm để đọc URL
  const [cookies] = useCookies(["accessToken"]);
  const { setUser, setToken, user } = useAuth();
  const [expandedProducts, setExpandedProducts] = useState({});
  const [selectedProductReview, setSelectedProductReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setReviewText] = useState("");

  useEffect(() => {
    if (userId) return;
    const token = cookies.accessToken;
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.userId) {
        setUserId(decoded.userId);
      }
    }
  }, [cookies.accessToken, userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      try {
        const data = await OrderHistoryService.getOrdersByUserId(userId);
        // Sắp xếp tất cả đơn hàng theo orderDate ban đầu
        const sortedOrders = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sortedOrders);
        // Xử lý orderId từ URL
        const params = new URLSearchParams(location.search);
        const orderId = params.get("orderId");
        if (orderId) {
          const order = sortedOrders.find((o) => o.orderId === parseInt(orderId, 10));
          if (order) {
            setActiveTab(order.statusName); // Chọn tab theo trạng thái
            setSelectedOrder(order); // Mở modal chi tiết đơn hàng
            setCurrentPage(1); // Reset về trang đầu
          } else {
            console.warn("Không tìm thấy đơn hàng với ID:", orderId);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    };
    fetchOrders();
  }, [userId, location.search]);

  const handleCancelOrder = async (orderId) => {
    const { value: reason, dismiss } = await Swal.fire({
      title: "Bạn có chắc chắn muốn hủy đơn hàng?",
      text: "Vui lòng chọn lý do hủy đơn hàng:",
      icon: "warning",
      input: "select",
      inputOptions: {
        "Không muốn mua nữa": "Không muốn mua nữa",
        "Đổi ý đặt hàng khác": "Đổi ý đặt hàng khác",
        "Sản phẩm không còn nhu cầu": "Sản phẩm không còn nhu cầu",
        "Lý do khác": "Lý do khác",
      },
      inputPlaceholder: "Chọn lý do",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xác nhận hủy",
      cancelButtonText: "Giữ lại",
      inputValidator: (value) => {
        if (!value) {
          return "Bạn phải chọn một lý do!";
        }
      },
    });

    if (dismiss === Swal.DismissReason.cancel || !reason) {
      return;
    }

    try {
      const result = await OrderHistoryService.cancelOrder(orderId, reason);
      const updatedOrders = orders.map(order =>
        order.orderId === orderId
          ? { ...order, statusName: result.status, cancelDate: new Date().toISOString() } // Thêm cancelDate
          : order
      );
      const sortedOrders = updatedOrders.sort((a, b) => {
        if (a.statusName === "Đã hủy" && b.statusName === "Đã hủy") {
          // Sắp xếp đơn hàng "Đã hủy" theo cancelDate (nếu có) hoặc orderDate
          return new Date(b.cancelDate || b.orderDate) - new Date(a.cancelDate || a.orderDate);
        }
        return new Date(b.orderDate) - new Date(a.orderDate); // Các trạng thái khác theo orderDate
      });
      setOrders(sortedOrders);

      Swal.fire({
        title: "Đã hủy!",
        text: "Đơn hàng đã được hủy thành công.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error.message,
        icon: "error",
      });
    }
  };

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter(order => order.statusName === activeTab);

  // Tính toán số trang
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Cắt danh sách đơn hàng theo trang hiện tại
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const displayedProducts = selectedOrder?.orderDetails || [];
  const displayedProductsReview = selectedOrderReview?.orderDetails || [];

  const openReviewModal = (order) => {
    setselectedOrderReview(order);
  };

  const toggleProductName = (id) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleProductReview = (product) => {
    setSelectedProductReview(product);
    setReviewText("");
    setRating(5);
  };

  const submitReview = async (orderDetailsId, rating, comment) => {
    try {
      if (!user || !user?.userId) {
        Swal.fire({
          icon: "warning",
          title: "Bạn chưa đăng nhập!",
          text: "Vui lòng đăng nhập để gửi đánh giá.",
        });
        return;
      }

      const reviewData = {
        rating,
        comment,
        reviewDate: new Date().toISOString().split("T")[0],
        user: { userId: user.userId },
        orderDetails: { orderDetailsId },
      };

      await ReviewService.addReview(reviewData);
      Swal.fire({
        icon: "success",
        title: "Cảm ơn bạn!",
        text: "Đánh giá của bạn đã được gửi thành công.",
        confirmButtonColor: "#3085d6",
        timer: 1000,
        showConfirmButton: false,
      }).then(() => {
        setSelectedProductReview(null);
      });
    } catch (error) {
      console.error("Gửi đánh giá thất bại:", error);
      Swal.fire({
        icon: "error",
        title: "Gửi đánh giá thất bại",
        text: "Vui lòng thử lại sau.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex border-b mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-600"}`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border border-gray-200">Ngày đặt hàng</th>
            <th className="p-3 border border-gray-200">Tổng tiền</th>
            <th className="p-3 border border-gray-200">Trạng thái</th>
            <th className="p-3 border border-gray-200 text-center">Chi tiết</th>
            {activeTab === "Chờ xác nhận" && (
              <th className="p-3 border border-gray-200 text-center">Hủy hàng</th>
            )}
            {activeTab === "Hoàn thành" && (
              <th className="p-3 border border-gray-200 text-center">Đánh giá</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayedOrders.length === 0 ? (
            <tr>
              <td colSpan={activeTab === "Chờ xác nhận" ? "6" : "5"} className="text-center p-4 text-gray-500">
                Không có đơn hàng nào.
              </td>
            </tr>
          ) : (
            displayedOrders.map((order) => (
              <tr key={order.orderId} className="border border-gray-200">
                <td className="p-3 border border-gray-200">
                  {new Date(order.orderDate).toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className="p-3 border border-gray-200 text-red-500">{formatCurrency(order.totalAmount)}</td>
                <td className="p-3 border border-gray-200 text-orange-500 font-semibold">{order.statusName}</td>
                <td className="p-3 border border-gray-200 text-center">
                  <button className="text-blue-500 hover:text-blue-700" onClick={() => setSelectedOrder(order)}>
                    <FaEye className="text-xl" />
                  </button>
                </td>
                {activeTab === "Chờ xác nhận" && (
                  <td className="p-3 border border-gray-200 text-center">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleCancelOrder(order.orderId)}
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </td>
                )}
                {activeTab === "Hoàn thành" && (
                  <td className="p-3 border border-gray-200 text-center">
                    <button
                      className="text-yellow-500 hover:text-yellow-700"
                      onClick={() => openReviewModal(order)}
                    >
                      <FaStar className="text-xl" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 mx-1 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </button>
          <span className="px-4 py-2">{currentPage} / {totalPages}</span>
          <button
            className={`px-4 py-2 mx-1 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
              onClick={() => setSelectedOrder(null)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              🛒 Chi tiết đơn hàng #{selectedOrder.orderId}
            </h2>
            <div className="mb-6 space-y-2 text-gray-700">
              <p>
                <strong className="text-gray-800">📅 Ngày đặt hàng:</strong>{" "}
                {new Date(selectedOrder.orderDate).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </p>
              <p>
                <strong className="text-gray-800">💰 Tổng tiền:</strong>{" "}
                <span className="text-red-500 font-semibold">{formatCurrency(selectedOrder.totalAmount)}</span>
              </p>
              <p>
                <strong className="text-gray-800">📦 Trạng thái:</strong>{" "}
                <span className="font-medium">{selectedOrder.statusName}</span>
              </p>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🛍️ Danh sách sản phẩm:</h3>
            <div className="overflow-x-auto pr-2">
              <ul className="flex gap-6">
                {displayedProducts.map((item) => {
                  const isExpanded = expandedProducts[item.orderDetailId];
                  const truncatedName = item.productName.length > 15 ? item.productName.substring(0, 15) + "..." : item.productName;
                  return (
                    <li key={item.orderDetailId} className="flex-shrink-0 w-[280px] p-4 bg-gray-50 rounded-lg shadow-lg">
                      <div className="flex items-center gap-6">
                        <img src={item.imageUrl} alt={item.productName} className="w-24 h-24 object-cover rounded-lg border" />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 text-lg">
                            {isExpanded ? item.productName : truncatedName}
                            {item.productName.length > 15 && (
                              <button onClick={() => toggleProductName(item.orderDetailId)} className="text-blue-500 text-sm ml-2">
                                {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                              </button>
                            )}
                          </p>
                          <p>Số lượng: {item.quantity}</p>
                          <p className="text-red-500 font-bold">Giá: {formatCurrency(item.price)}</p>
                          <p><strong className="text-gray-800">Kích thước:</strong> {item.sizeValue || "N/A"}</p>
                          <p><strong className="text-gray-800">Trọng lượng:</strong> {item.weightValue || "N/A"}</p>
                          <p><strong className="text-gray-800">Màu sắc:</strong> {item.colorValue || "N/A"}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedOrderReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
              onClick={() => setselectedOrderReview(null)}
            >
              ✖
            </button>
            <h3 className="text-xl mb-4 text-center font-bold text-gray-800">🛍️ DANH SÁCH SẢN PHẨM ĐÃ MUA</h3>
            <div className="overflow-y-auto max-h-[70vh]">
              <ul className="flex flex-col gap-6">
                {displayedProductsReview.map((item) => (
                  <li key={item.orderDetailId} className="flex flex-col p-4 bg-gray-50 rounded-lg shadow-lg">
                    <div className="flex items-start gap-6">
                      <img src={item.imageUrl} alt={item.productName} className="w-24 h-24 object-cover rounded-lg border" />
                      <div className="flex flex-col gap-2 flex-1 text-left">
                        <p className="font-semibold text-gray-900 text-lg">{item.productName}</p>
                        <p className="inline-flex gap-x-4">
                          <span><strong className="text-gray-800">Số lượng:</strong> {item.quantity}</span> |
                          <span className="text-red-500 font-bold"><strong>Giá:</strong> {formatCurrency(item.price)}</span>
                        </p>
                        <div className="flex gap-x-4">
                          <span><strong className="text-gray-800">Kích thước:</strong> {item.sizeValue || "N/A"}</span>
                          <span><strong className="text-gray-800">Trọng lượng:</strong> {item.weightValue || "N/A"}</span>
                          <span><strong className="text-gray-800">Màu sắc:</strong> {item.colorValue || "N/A"}</span>
                        </div>
                        <button
                          onClick={() => handleProductReview(item)}
                          className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                        >
                          Đánh giá sản phẩm
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedProductReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
              onClick={() => setSelectedProductReview(null)}
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
              ⭐ Đánh giá sản phẩm
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedProductReview.imageUrl} alt={selectedProductReview.productName} className="w-16 h-16 object-cover rounded-lg border" />
              <p className="font-semibold text-gray-900">{selectedProductReview.productName}</p>
              <p className="font-semibold text-gray-900">{selectedProductReview.orderDetailId}</p>
            </div>
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="w-full p-2 border rounded-lg focus:ring focus:ring-yellow-300"
              rows="3"
              placeholder="Nhập đánh giá của bạn..."
              value={comment}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button
              onClick={() => submitReview(selectedProductReview.orderDetailId, rating, comment)}
              className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
            >
              Gửi đánh giá
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;