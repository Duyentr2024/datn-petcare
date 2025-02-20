import axios from "axios";

const API_URL = "http://localhost:8080/api/brands"; // Adjust URL as needed

const ProductBrandService = {
    // Get list of all brands
    getAllBrands: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAllBrand`);
            return response.data;
        } catch (error) {
            console.error("Error fetching brands:", error);
            throw error;
        }
    },

    // Get list of active brands
    getActiveBrands: async () => {
        try {
            const response = await axios.get(`${API_URL}/activeBrand`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active brands:", error);
            throw error;
        }
    },

    // Get a brand by its ID
    getBrandById: async (brandId) => {
        try {
            const response = await axios.get(`${API_URL}/getByBrandId/${brandId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching brand by ID ${brandId}:`, error);
            throw error;
        }
    },

    // Create a new brand
    createBrand: async (brand) => {
        try {
            const response = await axios.post(`${API_URL}/create`, brand);
            return response.data;
        } catch (error) {
            console.error("Error creating brand:", error);
            throw error;
        }
    },

    // Update a brand by its ID
    updateBrand: async (brandId, brandDetails) => {
        try {
            const response = await axios.put(`${API_URL}/update/${brandId}`, brandDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating brand ID ${brandId}:`, error);
            throw error;
        }
    },

    // Delete a brand by its ID
    deleteBrand: async (brandId) => {
        try {
            await axios.delete(`${API_URL}/delete/${brandId}`);
        } catch (error) {
            console.error(`Error deleting brand ID ${brandId}:`, error);
            throw error;
        }
    },
};

export default ProductBrandService;
