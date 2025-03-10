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

  cancelOrder: async (orderId, reason) => {
    try {
      const url = `${API_BASE_URL}/api/orders/${orderId}/cancel`;
      console.log("Canceling order:", url, "with reason:", reason); // Debug
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể hủy đơn hàng: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      throw error;
    }
  },


};

export default OrderHistoryService;
