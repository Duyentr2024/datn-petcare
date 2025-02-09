import React, { useEffect, useState } from "react";
import OrderHistoryService from "../../service/accountService/OrderHistoryService";
import { useAuth } from "../../context/AuthContext";
import { decodeToken } from "../utils/jwt";
import { useCookies } from "react-cookie";
import { FiSearch } from "react-icons/fi"; // Icon tìm kiếm

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Lưu giá trị ô tìm kiếm
  const [cookies] = useCookies(["accessToken"]);
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const token = cookies.accessToken;
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.userId) {
        setUserId(decoded.userId);
        setUser(decoded.fullName);
        setToken(token);
      }
    }
  }, [cookies.accessToken]);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const data = await OrderHistoryService.getOrdersByUserId(userId);
        setOrders(data);
        console.log(data)
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    };

    fetchOrders();
  }, [userId]);

  // Lọc đơn hàng theo mã đơn hàng
  const filteredOrders = orders.filter((order) =>
    order.orderId.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Ô tìm kiếm */}
      <div className="flex items-center border rounded-lg px-4 py-2 mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Tìm theo mã đơn hàng"
          className="flex-1 outline-none text-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FiSearch className="text-orange-500 text-xl" />
      </div>

      {/* Bảng lịch sử đơn hàng */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border border-gray-200">Mã đơn hàng</th>
            <th className="p-3 border border-gray-200">Ngày đặt hàng</th>
            <th className="p-3 border border-gray-200">Tổng tiền</th>
            <th className="p-3 border border-gray-200">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                Không có đơn hàng nào.
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.id} className="border border-gray-200">
                <td className="p-3 border border-gray-200">#{order.orderId}</td>
                <td className="p-3 border border-gray-200">{order.orderDate}</td>
                <td className="p-3 border border-gray-200">{order.totalAmount}₫</td>
                <td className="p-3 border border-gray-200 text-orange-500 font-semibold">
                  {order.statusOrder.statusName}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;
