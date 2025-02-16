import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/productDetails"; // Đổi nếu cần

const ProductDetailsService = {

    /**
     * Lấy toàn bộ danh sách ProductDetails (kèm hình ảnh).
     * @returns {Promise<Array>}
     */
    getAllProductDetails: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getAll`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ProductDetails:", error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết sản phẩm theo productDetailId.
     * @param {number} productDetailId
     * @returns {Promise<Object>}
     */
    getProductDetailsById: async (productDetailId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getById/${productDetailId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy ProductDetails ID=${productDetailId}:`, error);
            throw error;
        }
    },

    /**
     * Tìm productDetailId theo biến thể (color, size, weight).
     * @param {string} color
     * @param {string} size
     * @param {string} weight
     * @returns {Promise<number>}
     */
    findProductDetailId: async (color, size, weight) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/find`, {
                params: { colorValue: color, sizeValue: size, weightValue: weight },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tìm ProductDetailId:", error);
            throw error;
        }
    },

    /**
     * Lấy ProductDetails bằng productId.
     * @param {number} productId
     * @returns {Promise<Array>}
     */
    getProductDetailsByProductId: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/by-product/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy ProductDetails cho ProductID=${productId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách ProductDetailsDTO bằng productId (kèm ảnh).
     * @param {number} productId
     * @returns {Promise<Array>}
     */
    getProductDetailsDTOByProductId: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/dto/by-product/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy ProductDetailsDTO cho ProductID=${productId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy ProductDetailsDTO bằng nhiều cách: ID hoặc biến thể.
     * @param {Object} params { productDetailId, color, size, weight }
     * @returns {Promise<Object>}
     */
    getProductDetailsFlexible: async ({ productDetailId, color, size, weight }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getProductDetails`, {
                params: { productDetailId, color, size, weight },
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy ProductDetails linh hoạt:", error);
            throw error;
        }
    },
};

export default ProductDetailsService;
