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
            const payload = { 
                statusId: statusId
            };
            
            // Chỉ thêm paymentStatus khi chuyển sang trạng thái Hoàn thành
            if (statusId === 4) {
                payload.paymentStatus = "Đã thanh toán";
            }
            
            // Thêm lý do hủy nếu có
            if (reason) {
                payload.cancelReason = reason;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update order status: ${errorText}`);
            }

            return await response.json();
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
