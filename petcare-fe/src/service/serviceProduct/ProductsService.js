import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/products"; // Đổi URL nếu cần

const ProductsService = {
    // Lấy danh sách tất cả sản phẩm
    getAllProducts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getAllProducts`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            throw error;
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getByIdProducts/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy sản phẩm ID ${productId}:`, error);
            throw error;
        }
    },

    // Tạo mới sản phẩm
    createProduct: async (productData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/createProducts`, productData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo sản phẩm:", error);
            throw error;
        }
    },

    // Cập nhật sản phẩm theo ID
    updateProduct: async (productId, updatedData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/updateProducts/${productId}`, updatedData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);
            throw error;
        }
    },

    // Xóa sản phẩm theo ID
    deleteProduct: async (productId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/deleteProducts/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách sản phẩm có thông tin danh mục và giá thấp nhất
    getAllProductsWithCategory: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getAllProductss`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm kèm danh mục:", error);
            throw error;
        }
    },

    // Lấy top 5 sản phẩm bán chạy
    getBestSellingProducts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/best-selling-products`);
            return response.data;
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            return [];
          }
    }

    
};

export default ProductsService;
