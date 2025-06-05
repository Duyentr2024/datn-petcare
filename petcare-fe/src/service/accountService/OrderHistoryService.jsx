import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const OrderHistoryService = {
  getOrdersByUserId: async (userId) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(`${API_BASE_URL}/api/orders/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API lấy đơn hàng:", error);
      throw error;
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      // 1. Đầu tiên kiểm tra thông tin đơn hàng để xác định phương thức thanh toán
      const orderResponse = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const orderData = orderResponse.data;

      // 2. Nếu là thanh toán MoMo và có thông tin MoMo, thực hiện hoàn tiền MoMo trước
      let refundResult = null;
      if (orderData.paymentMethod === "MoMo" && orderData.momoTransId) {
        try {
          // In ra URL API sẽ gọi để kiểm tra
          const refundUrl = `${API_BASE_URL}/api/payment/momo/refund/order/${orderId}`;

          // Tạo đối tượng request body
          const refundRequestBody = {
            description: `Hoàn tiền cho đơn hàng #${orderId} - Lý do: ${reason}`
          };

          // Gọi API hoàn tiền MoMo
          const refundResponse = await axios.post(
            refundUrl,
            refundRequestBody,
            {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              timeout: 30000 // Tăng timeout lên 30 giây
            }
          );

          refundResult = refundResponse.data;

          // Ngay cả khi hoàn tiền thất bại, vẫn tiếp tục hủy đơn hàng
          if (!refundResult.success) {
            console.warn(`[FE] Hoàn tiền MoMo không thành công: ${refundResult.message}`);
          }
        } catch (refundError) {
          console.error(`[FE] Lỗi khi hoàn tiền MoMo:`, refundError);
          console.error(`[FE] Chi tiết lỗi:`, refundError?.response?.data || refundError.message);

          // Log ra error response nếu có
          if (refundError.response) {
            console.error(`[FE] Status: ${refundError.response.status}`);
            console.error(`[FE] Status Text: ${refundError.response.statusText}`);
            console.error(`[FE] Response Headers:`, refundError.response.headers);
          }

          // Vẫn tiếp tục hủy đơn hàng ngay cả khi hoàn tiền thất bại
        }
      }

      // 3. Hủy đơn hàng
      const url = `${API_BASE_URL}/api/orders/${orderId}/status`;
      // Thêm thông tin về kết quả hoàn tiền vào lý do hủy (nếu có)
      let cancelReason = reason;
      if (refundResult) {
        if (refundResult.success) {
          cancelReason += " - Đã gửi yêu cầu hoàn tiền MoMo";
        } else {
          cancelReason += ` - Hoàn tiền MoMo gặp vấn đề: ${refundResult.message || "Lỗi không xác định"}`;
        }
      }

      const response = await axios.put(
        url,
        {
          statusId: 5,
          paymentStatus: refundResult && refundResult.success ? "Đã hoàn tiền" : "Đã hủy thanh toán",
          cancelReason: cancelReason
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const result = response.data;

      // Thêm thông tin về hoàn tiền vào kết quả
      if (refundResult) {
        result.refundResult = refundResult;
      }

      return result;
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      throw error;
    }
  }
};

export default OrderHistoryService;