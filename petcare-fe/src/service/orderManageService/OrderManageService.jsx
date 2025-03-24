import API_BASE_URL from "../../config";

const OrderManageService = {
    getAllOrders: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, statusId, reason = null) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/${statusId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: reason ? JSON.stringify({ reason }) : null, // Gửi reason nếu có
            });

            const textResponse = await response.text();
            console.log("Raw API Response:", textResponse);

            if (!response.ok) {
                throw new Error(`Failed to update order status: ${response.status}`);
            }

            try {
                return JSON.parse(textResponse);
            } catch (jsonError) {
                console.error("API trả về dữ liệu không phải JSON hợp lệ:", textResponse);
                throw new Error("Invalid JSON response from server");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/cancel/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Hủy đơn hàng thất bại!");
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            throw error;
        }
    },

    // Thêm phương thức mới để lấy đơn hàng theo voucherId
    getOrdersByVoucherId: async (voucherId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/by-voucher/${voucherId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch orders by voucherId");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching orders by voucherId:", error);
            throw error;
        }
    },


};

export default OrderManageService;
