import API_BASE_URL from "../../config";
import axios from 'axios';

const OrderHistoryService = {
  getOrdersByUserId: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi gọi API lấy đơn hàng:", error);
      throw error;
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      console.log(`[FE] Bắt đầu quy trình hủy đơn hàng với ID: ${orderId} và lý do: ${reason}`);
      
      // 1. Đầu tiên kiểm tra thông tin đơn hàng để xác định phương thức thanh toán
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (!orderResponse.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng");
      }
      
      const orderData = await orderResponse.json();
      console.log(`[FE] Thông tin đơn hàng:`, orderData);
      
      // 2. Nếu là thanh toán MoMo và có thông tin MoMo, thực hiện hoàn tiền MoMo trước
      let refundResult = null;
      if (orderData.paymentMethod === "MoMo" && orderData.momoTransId) {
        console.log(`[FE] Đơn hàng thanh toán qua MoMo, tiến hành hoàn tiền`);
        console.log(`[FE] Thông tin MoMo: momoTransId=${orderData.momoTransId}, momoOrderId=${orderData.momoOrderId}`);
        
        try {
          // In ra URL API sẽ gọi để kiểm tra
          const refundUrl = `${API_BASE_URL}/api/payment/momo/refund/order/${orderId}`;
          console.log(`[FE] Gọi API hoàn tiền MoMo: ${refundUrl}`);
          
          // Tạo đối tượng request body
          const refundRequestBody = { 
            description: `Hoàn tiền cho đơn hàng #${orderId} - Lý do: ${reason}` 
          };
          console.log(`[FE] Request body hoàn tiền MoMo:`, JSON.stringify(refundRequestBody));
          
          // Gọi API hoàn tiền MoMo
          const refundResponse = await axios.post(
            refundUrl,
            refundRequestBody,
            { 
              headers: { 
                "Content-Type": "application/json"
              },
              timeout: 30000 // Tăng timeout lên 30 giây
            }
          );
          
          refundResult = refundResponse.data;
          console.log(`[FE] Kết quả hoàn tiền MoMo: Status ${refundResponse.status}`, refundResult);
          
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
      } else {
        console.log(`[FE] Đơn hàng không phải thanh toán qua MoMo hoặc thiếu thông tin MoMo cần thiết`);
        console.log(`[FE] paymentMethod: ${orderData.paymentMethod}, momoTransId: ${orderData.momoTransId}`);
      }
      
      // 3. Hủy đơn hàng
      const url = `${API_BASE_URL}/api/orders/${orderId}/status`;
      console.log(`[FE] Hủy đơn hàng tại URL: ${url} với lý do: ${reason}`);
      
      // Thêm thông tin về kết quả hoàn tiền vào lý do hủy (nếu có)
      let cancelReason = reason;
      if (refundResult) {
        if (refundResult.success) {
          cancelReason += " - Đã gửi yêu cầu hoàn tiền MoMo";
        } else {
          cancelReason += ` - Hoàn tiền MoMo gặp vấn đề: ${refundResult.message || "Lỗi không xác định"}`;
        }
      }
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          statusId: 5,
          paymentStatus: refundResult && refundResult.success ? "Đã hoàn tiền" : "Đã hủy thanh toán",
          cancelReason: cancelReason
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể hủy đơn hàng: ${errorText}`);
      }

      const result = await response.json();
      console.log(`[FE] Kết quả hủy đơn hàng:`, result);
      
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
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Không thể lấy chi tiết đơn hàng");
      }
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      throw error;
    }
  }
};

export default OrderHistoryService;
