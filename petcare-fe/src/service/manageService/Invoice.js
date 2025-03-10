// manageService/Invoice.js
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

// Lấy hóa đơn theo khoảng thời gian
export const getOrdersByDateRange = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders-by-date`, {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy hóa đơn theo khoảng thời gian:", error);
        throw error;
    }
};