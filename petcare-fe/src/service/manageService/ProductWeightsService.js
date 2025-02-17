import axios from "axios";

const API_URL = "http://localhost:8080/api/product-weights"; // Adjust URL as needed

const ProductWeightService = {
    // Get list of all product weights
    getAllProductWeights: async () => {
        try {
            const response = await axios.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product weights:", error);
            throw error;
        }
    },

    // Get list of active product weights
    getActiveWeights: async () => {
        try {
            const response = await axios.get(`${API_URL}/activeProductWeights`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active product weights:", error);
            throw error;
        }
    },

    // Get a product weight by its ID
    getProductWeightById: async (weightId) => {
        try {
            const response = await axios.get(`${API_URL}/getProductWeight/${weightId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product weight by ID ${weightId}:`, error);
            throw error;
        }
    },

    // Create a new product weight
    createProductWeight: async (productWeight) => {
        try {
            const response = await axios.post(`${API_URL}/createProductWeight`, productWeight);
            return response.data;
        } catch (error) {
            console.error("Error creating product weight:", error);
            throw error;
        }
    },

    // Update a product weight by its ID
    updateProductWeight: async (weightId, productWeightDetails) => {
        try {
            const response = await axios.put(`${API_URL}/updateProductWeight/${weightId}`, productWeightDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating product weight ID ${weightId}:`, error);
            throw error;
        }
    },

    // Delete a product weight by its ID
    deleteProductWeight: async (weightId) => {
        try {
            await axios.delete(`${API_URL}/deleteProductWeight/${weightId}`);
        } catch (error) {
            console.error(`Error deleting product weight ID ${weightId}:`, error);
            throw error;
        }
    },
};

export default ProductWeightService;
