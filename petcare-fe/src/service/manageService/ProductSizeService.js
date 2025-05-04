import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/product-sizes`; // Sử dụng API_BASE_URL từ config

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

const ProductSizeService = {
    // Lấy danh sách tất cả kích thước sản phẩm
    getAllProductSizes: async () => {
        try {
            const response = await api.get("");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kích thước sản phẩm:", error);
            throw error;
        }
    },

    // Lấy danh sách kích thước sản phẩm đang hoạt động
    getActiveSizes: async () => {
        try {
            const response = await api.get("/activeProductSizes");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kích thước sản phẩm đang hoạt động:", error);
            throw error;
        }
    },

    // Lấy kích thước sản phẩm theo ID
    getProductSizeById: async (productSizeId) => {
        try {
            const response = await api.get(`/getProductSize/${productSizeId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy kích thước sản phẩm theo ID ${productSizeId}:`, error);
            throw error;
        }
    },

    // Tạo kích thước sản phẩm mới
    createProductSize: async (productSize) => {
        try {
            const response = await api.post("/createProductSize", productSize);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo kích thước sản phẩm:", error);
            throw error;
        }
    },

    // Cập nhật kích thước sản phẩm theo ID
    updateProductSize: async (productSizeId, productSizeDetails) => {
        try {
            const response = await api.put(`/updateProductSize/${productSizeId}`, productSizeDetails);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật kích thước sản phẩm ID ${productSizeId}:`, error);
            throw error;
        }
    },

    // Xóa kích thước sản phẩm theo ID
    deleteProductSize: async (productSizeId) => {
        try {
            await api.delete(`/deleteProductSize/${productSizeId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa kích thước sản phẩm ID ${productSizeId}:`, error);
            throw error;
        }
    },
};

export default ProductSizeService;