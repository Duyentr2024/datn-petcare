import axios from "axios";

const API_URL = "http://localhost:8080/api/products"; // Adjust URL as needed

const ProductsService = {
    // Get list of all products
    getAllProducts: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAllProductsList`);
            return response.data;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },

    // Get a product by its ID
    getProductById: async (productId) => {
        try {
            const response = await axios.get(`${API_URL}/getByIdProducts/${productId}`);
            return response.data;
        } catch (error) {z
            console.error(`Error fetching product by ID ${productId}:`, error);
            throw error;
        }
    },

    // Create a new product
    createProduct: async (product) => {
        try {
            const response = await axios.post(`${API_URL}/createProducts`, product);
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    },

    // Update a product by its ID
    updateProduct: async (productId, productDetails) => {
        try {
            const response = await axios.put(`${API_URL}/updateProducts/${productId}`, productDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ID ${productId}:`, error);
            throw error;
        }
    },

    // Delete a product by its ID
    deleteProduct: async (productId) => {
        try {
            await axios.delete(`${API_URL}/deleteProducts/${productId}`);
        } catch (error) {
            console.error(`Error deleting product ID ${productId}:`, error);
            throw error;
        }
    },

    // đổi trạng thái sản phẩm
    toggleProductStatus: async (productId) => {
        try {
            const response = await axios.put(`${API_URL}/toggle-status/${productId}`);
            return response.data; // Trả về thông báo từ server (ví dụ: "Trạng thái sản phẩm với ID 1 đã được cập nhật thành: Hoạt động")
        } catch (error) {
            console.error(`Error toggling status for product ID ${productId}:`, error);
            throw error;
        }
    }
};


export default ProductsService;
