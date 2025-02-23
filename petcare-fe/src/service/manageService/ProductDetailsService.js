import axios from "axios";

const API_URL = "http://localhost:8080/api/productDetails"; // Update with actual API endpoint

const ProductDetailsService = {
    getAllProductDetails: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAll`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product details:", error);
            throw error;
        }
    },

    getProductDetailById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product detail:", error);
            throw error;
        }
    },

    createProductDetail: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/add`, data);
            return response.data;
        } catch (error) {
            console.error("Error creating product detail:", error);
            throw error;
        }
    },

    updateProductDetail: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating product detail:", error);
            throw error;
        }
    },

    deleteProductDetail: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting product detail:", error);
            throw error;
        }
    }
};

export default ProductDetailsService;
