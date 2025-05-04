import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/product-weights`; // Sử dụng API_BASE_URL từ config

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

const ProductWeightService = {
    // Lấy danh sách tất cả trọng lượng sản phẩm
    getAllProductWeights: async () => {
        try {
            const response = await api.get("");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách trọng lượng sản phẩm:", error);
            throw error;
        }
    },

    // Lấy danh sách trọng lượng sản phẩm đang hoạt động
    getActiveWeights: async () => {
        try {
            const response = await api.get("/activeProductWeights");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách trọng lượng sản phẩm đang hoạt động:", error);
            throw error;
        }
    },

    // Lấy trọng lượng sản phẩm theo ID
    getProductWeightById: async (weightId) => {
        try {
            const response = await api.get(`/getProductWeight/${weightId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy trọng lượng sản phẩm theo ID ${weightId}:`, error);
            throw error;
        }
    },

    // Tạo trọng lượng sản phẩm mới
    createProductWeight: async (productWeight) => {
        try {
            const response = await api.post("/createProductWeight", productWeight);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo trọng lượng sản phẩm:", error);
            throw error;
        }
    },

    // Cập nhật trọng lượng sản phẩm theo ID
    updateProductWeight: async (weightId, productWeightDetails) => {
        try {
            const response = await api.put(`/updateProductWeight/${weightId}`, productWeightDetails);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trọng lượng sản phẩm ID ${weightId}:`, error);
            throw error;
        }
    },

    // Xóa trọng lượng sản phẩm theo ID
    deleteProductWeight: async (weightId) => {
        try {
            await api.delete(`/deleteProductWeight/${weightId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa trọng lượng sản phẩm ID ${weightId}:`, error);
            throw error;
        }
    },
};

export default ProductWeightService;