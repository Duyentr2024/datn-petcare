import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/product-colors`; // Sử dụng API_BASE_URL từ config

// Tạo instance của Axios
const api = axios.create({
    baseURL: API_URL,
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

const ProductColorService = {
    // Lấy danh sách tất cả màu sắc
    getAllProductColors: async () => {
        try {
            const response = await api.get("");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu sắc:", error);
            throw error;
        }
    },

    // Lấy danh sách màu sắc đang hoạt động
    getActiveColors: async () => {
        try {
            const response = await api.get("/activeProductColor");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu sắc đang hoạt động:", error);
            throw error;
        }
    },

    // Lấy thông tin màu theo ID
    getProductColorById: async (productColorId) => {
        try {
            const response = await api.get(`/getByProductColorId/${productColorId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy màu ID ${productColorId}:`, error);
            throw error;
        }
    },

    // Thêm màu mới
    createProductColor: async (productColors) => {
        try {
            const response = await api.post("/createProductColor", productColors);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm màu:", error);
            throw error;
        }
    },

    // Cập nhật màu theo ID
    updateProductColor: async (productColorId, productColorDetails) => {
        try {
            const response = await api.put(`/updateProductColor/${productColorId}`, productColorDetails);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật màu ID ${productColorId}:`, error);
            throw error;
        }
    },

    // Xóa màu theo ID
    deleteProductColor: async (productColorId) => {
        try {
            await api.delete(`/deleteProductColor/${productColorId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa màu ID ${productColorId}:`, error);
            throw error;
        }
    },
};

export default ProductColorService;