import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";
const API_URL = `${API_BASE_URL}/api/categories`; // Điều chỉnh URL nếu cần

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

const ProductCategoriesService = {
    // Lấy danh sách tất cả danh mục
    getAllCategories: async () => {
        try {
            const response = await api.get("/getAllCategories");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
            throw error;
        }
    },

    // Lấy danh sách danh mục đang hoạt động
    getActiveCategories: async () => {
        try {
            const response = await api.get("/activeProductCategories");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh mục đang hoạt động:", error);
            throw error;
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/getByIdCategories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy danh mục theo ID ${categoryId}:`, error);
            throw error;
        }
    },

    // Tạo danh mục mới
    createCategory: async (category) => {
        try {
            const response = await api.post("/createCategories", category);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo danh mục:", error);
            throw error;
        }
    },

    // Cập nhật danh mục theo ID
    updateCategory: async (categoryId, categoryDetails) => {
        try {
            const response = await api.put(`/updateProductCategories/${categoryId}`, categoryDetails);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật danh mục ID ${categoryId}:`, error);
            throw error;
        }
    },

    // Xóa danh mục theo ID
    deleteCategory: async (categoryId) => {
        try {
            await api.delete(`/deleteCategories/${categoryId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa danh mục ID ${categoryId}:`, error);
            throw error;
        }
    },
};

export default ProductCategoriesService;