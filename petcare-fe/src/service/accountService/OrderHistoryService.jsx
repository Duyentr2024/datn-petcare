import API_BASE_URL from "../../config";

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

  cancelOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/cancel/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể hủy đơn hàng");
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      throw error;
    }
  },


  
};

export default OrderHistoryService;
