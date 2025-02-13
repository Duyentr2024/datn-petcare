import axios from "axios";

const BASE_URL = "http://localhost:8080/api/cart-details";

const CartDetailsService = {
    // Lấy tất cả chi tiết giỏ hàng
    getAllCartDetails: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/all`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all cart details:", error);
            throw error;
        }
    },

    // Lấy chi tiết giỏ hàng theo ID
    getCartDetailsById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching cart details for id ${id}:`, error);
            throw error;
        }
    },

    // Thêm chi tiết giỏ hàng
    addCartDetails: async (userId, productDetailId, quantityItem) => {
        try {
            const payload = {
                userId,
                productDetailId,
                quantityItem,
            };
            const response = await axios.post(`${BASE_URL}/add`, payload);
            return response.data;
        } catch (error) {
            console.error("Error adding cart details:", error);
            throw error;
        }
    },

    // Cập nhật số lượng trong giỏ hàng
    updateCartDetails: async (id, quantityItem) => {
        try {
            const payload = {
                quantityItem,
            };
            const response = await axios.put(`${BASE_URL}/update/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating cart details for id ${id}:`, error);
            throw error;
        }
    },

    // Xóa chi tiết giỏ hàng theo ID
    deleteCartDetails: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/delete/${id}`);
        } catch (error) {
            console.error(`Error deleting cart details for id ${id}:`, error);
            throw error;
        }
    },

    // Lấy giỏ hàng theo userId
    getCartDetailsByUserId: async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/findByCart/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching cart details for userId ${userId}:`, error);
            throw error;
        }
    },
};

export default CartDetailsService;
