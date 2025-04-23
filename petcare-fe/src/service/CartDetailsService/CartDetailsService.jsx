import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token

const BASE_URL = "http://localhost:8080/api/cart-details";

const api = axios.create({
    baseURL: BASE_URL,
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie với tên "accessToken"
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const CartDetailsService = {
    getAllCartDetails: async () => {
        try {
            const response = await api.get("/all");
            return response.data;
        } catch (error) {
            console.error("Error fetching all cart details:", error);
            throw error;
        }
    },

    getCartDetailsById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching cart details for id ${id}:`, error);
            throw error;
        }
    },

    addCartDetails: async (userId, productDetailId, quantityItem) => {
        try {
            const payload = {
                userId,
                productDetailId,
                quantityItem,
            };
            const response = await api.post("/add", payload);
            return response.data;
        } catch (error) {
            console.error("Error adding cart details:", error);
            throw error;
        }
    },

    updateCartDetails: async (id, quantityItem) => {
        try {
            const payload = {
                quantityItem,
            };
            const response = await api.put(`/update/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating cart details for id ${id}:`, error);
            throw error;
        }
    },

    deleteCartDetails: async (id) => {
        try {
            await api.delete(`/delete/${id}`);
        } catch (error) {
            console.error(`Error deleting cart details for id ${id}:`, error);
            throw error;
        }
    },

    getCartDetailsByUserId: async (userId) => {
        try {
            const response = await api.get(`/findByCart/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching cart details for userId ${userId}:`, error);
            throw error;
        }
    },
};

export default CartDetailsService;