import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/productImages`; // Sử dụng API_BASE_URL từ config

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

const ProductImagesService = {
    // Lấy danh sách tất cả ảnh sản phẩm
    getAllProductImages: async () => {
        try {
            const response = await api.get("/getAllImage");
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ảnh sản phẩm:", error);
            throw error;
        }
    },

    // Lấy ảnh sản phẩm theo ID
    getProductImageById: async (imageId) => {
        try {
            const response = await api.get(`/${imageId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy ảnh sản phẩm theo ID ${imageId}:`, error);
            throw error;
        }
    },

    // Lấy tất cả ảnh theo chi tiết sản phẩm
    getAllImagesByProductDetails: async (productDetailId) => {
        try {
            const response = await api.get(`/getImages/${productDetailId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy ảnh theo chi tiết sản phẩm ID ${productDetailId}:`, error);
            throw error;
        }
    },

    // Thêm ảnh sản phẩm mới
    createProductImage: async (imageData) => {
        try {
            const response = await api.post("/addImage", {
                productDetailId: imageData.productDetailId,
                imageUrl: imageData.imageUrl,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm ảnh sản phẩm:", error.response?.data || error.message);
            throw error;
        }
    },

    // Cập nhật ảnh sản phẩm theo ID
    updateProductImage: async (id, imageData) => {
        try {
            const response = await api.put(`/updates/${id}`, imageData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật ảnh sản phẩm ID ${id}:`, error);
            throw error;
        }
    },

    // Xóa ảnh sản phẩm theo ID
    deleteProductImage: async (id) => {
        try {
            await api.delete(`/delete/${id}`);
        } catch (error) {
            console.error(`Lỗi khi xóa ảnh sản phẩm ID ${id}:`, error);
            throw error;
        }
    },
};

export default ProductImagesService;