import axios from "axios";
import Cookies from "js-cookie";
import API_BASE_URL from "../../config";

export const getAllOrders = async () => {
  try {
    const token = Cookies.get("accessToken"); // Lấy token từ cookie
    const response = await axios.get(`${API_BASE_URL}/api/offline/all-orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    throw error;
  }
};

// Lấy hóa đơn theo khoảng thời gian
export const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const token = Cookies.get("accessToken"); // Lấy token từ cookie
    const response = await axios.get(
      `${API_BASE_URL}/api/offline/orders-by-date`,
      {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy hóa đơn theo khoảng thời gian:", error);
    throw error;
  }
};

// Lấy tất cả hóa đơn online
export const getAllOrdersOnline = async () => {
  try {
    const token = Cookies.get("accessToken"); // Lấy token từ cookie
    const response = await axios.get(
      `${API_BASE_URL}/api/offline/all-orders-online`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    throw error;
  }
};
