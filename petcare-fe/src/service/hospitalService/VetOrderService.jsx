import axios from 'axios';
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from '../../config';

// Tạo instance của axios với base URL
const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/vet-orders`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động thêm header Authorization vào mỗi yêu cầu
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Dịch vụ VetOrderService để gọi các API
const VetOrderService = {
    // Hàm tạo đơn hàng mới
    async createVetOrder(userId, medicalRecordDTOs, paymentMethod) {
        try {
            const response = await apiClient.post(`/create?userId=${userId}&paymentMethod=${paymentMethod}`, medicalRecordDTOs);
            return response.data;
        } catch (error) {
            console.error('Error creating vet order:', error.response?.data || error.message);
            throw error;
        }
    },

    // Hàm xử lý thanh toán
    async processPayment(orderId, paymentStatus) {
        try {
            const response = await apiClient.put(`/payment/${orderId}?paymentStatus=${paymentStatus}`);
            return response.data;
        } catch (error) {
            console.error('Error processing payment:', error.response?.data || error.message);
            throw error;
        }
    },

    // Hàm lấy thông tin đơn hàng theo ID
    async getOrderById(orderId) {
        try {
            const response = await apiClient.get(`/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order by ID:', error.response?.data || error.message);
            throw error;
        }
    },

    // Hàm lấy danh sách đơn hàng theo userId
    async getOrdersByUserId(userId) {
        try {
            const response = await apiClient.get(`/userDTO/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders by user ID:', error.response?.data || error.message);
            throw error;
        }
    },

    // Hàm lấy tất cả đơn hàng
    async getAllVetOrders() {
        try {
            const response = await apiClient.get(`/all-vet-service`);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error.response?.data || error.message);
            throw error;
        }
    },

    // Hàm lấy thông tin người dùng theo userId
    async getUserById(userId) {
        try {
            const response = await apiClient.get(`/getUserName/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by ID:', error.response?.data || error.message);
            throw error;
        }
    },
};

export default VetOrderService;