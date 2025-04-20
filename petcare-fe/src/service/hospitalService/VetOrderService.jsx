import axios from 'axios';

// Base URL của backend API
const API_BASE_URL = 'http://localhost:8080/api/vet-orders';

// Tạo instance của axios với base URL
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
};

export default VetOrderService;