import API_BASE_URL from "../../config";

const OrderHistoryService = {
  getOrdersByUserId: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order history");

      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching order history:", error);

      return [];
    }
  },
};

export default OrderHistoryService;
