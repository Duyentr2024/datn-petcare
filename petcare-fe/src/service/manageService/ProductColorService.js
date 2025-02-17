import axios from "axios";

const API_URL = "http://localhost:8080/api/product-colors"; // Đổi URL nếu cần

const ProductColorService = {
    // Lấy danh sách tất cả màu sắc
    getAllProductColors: async () => {
        try {
            const response = await axios.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu sắc:", error);
            throw error;
        }
    },

    // Lấy danh sách màu sắc đang hoạt động
    getActiveColors: async () => {
        try {
            const response = await axios.get(`${API_URL}/activeProductColor`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu sắc đang hoạt động:", error);
            throw error;
        }
    },

    // Lấy thông tin màu theo ID
    getProductColorById: async (productColorId) => {
        try {
            const response = await axios.get(`${API_URL}/getByProductColorId/${productColorId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy màu ID ${productColorId}:`, error);
            throw error;
        }
    },

    // Thêm màu mới
    createProductColor: async (productColors) => {
        try {
            const response = await axios.post(`${API_URL}/createProductColor`, productColors);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm màu:", error);
            throw error;
        }
    },

    // Cập nhật màu theo ID
    updateProductColor: async (productColorId, productColorDetails) => {
        try {
            const response = await axios.put(`${API_URL}/updateProductColor/${productColorId}`, productColorDetails);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật màu ID ${productColorId}:`, error);
            throw error;
        }
    },

    // Xóa màu theo ID
    deleteProductColor: async (productColorId) => {
        try {
            await axios.delete(`${API_URL}/deleteProductColor/${productColorId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa màu ID ${productColorId}:`, error);
            throw error;
        }
    },
};

export default ProductColorService;
