import axios from "axios";

const API_URL = "http://localhost:8080/api/product-sizes"; // Adjust URL as needed

const ProductSizeService = {
    // Get list of all product sizes
    getAllProductSizes: async () => {
        try {
            const response = await axios.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product sizes:", error);
            throw error;
        }
    },

    // Get list of active product sizes
    getActiveSizes: async () => {
        try {
            const response = await axios.get(`${API_URL}/activeProductSizes`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active product sizes:", error);
            throw error;
        }
    },

    // Get a product size by its ID
    getProductSizeById: async (productSizeId) => {
        try {
            const response = await axios.get(`${API_URL}/getProductSize/${productSizeId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product size by ID ${productSizeId}:`, error);
            throw error;
        }
    },

    // Create a new product size
    createProductSize: async (productSize) => {
        try {
            const response = await axios.post(`${API_URL}/createProductSize`, productSize);
            return response.data;
        } catch (error) {
            console.error("Error creating product size:", error);
            throw error;
        }
    },

    // Update a product size by its ID
    updateProductSize: async (productSizeId, productSizeDetails) => {
        try {
            const response = await axios.put(`${API_URL}/updateProductSize/${productSizeId}`, productSizeDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating product size ID ${productSizeId}:`, error);
            throw error;
        }
    },

    // Delete a product size by its ID
    deleteProductSize: async (productSizeId) => {
        try {
            await axios.delete(`${API_URL}/deleteProductSize/${productSizeId}`);
        } catch (error) {
            console.error(`Error deleting product size ID ${productSizeId}:`, error);
            throw error;
        }
    },
};

export default ProductSizeService;
