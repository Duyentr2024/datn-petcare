import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/offline"; 

// Lấy tất cả hóa đơn
export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/all-orders`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        throw error;
    }
};

// Cập nhật hóa đơn
export const updateOrder = async (orderId, orderData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}`, orderData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật hóa đơn ${orderId}:`, error);
        throw error;
    }
};
