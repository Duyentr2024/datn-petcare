import axios from "axios";

const API_URL = "http://localhost:8080/api/categories"; // Adjust URL as needed

const ProductCategoriesService = {
    // Get list of all categories
    getAllCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAllCategories`);
            return response.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    },

    // Get list of active categories
    getActiveCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/activeProductCategories`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active categories:", error);
            throw error;
        }
    },

    // Get a category by its ID
    getCategoryById: async (categoryId) => {
        try {
            const response = await axios.get(`${API_URL}/getByIdCategories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching category by ID ${categoryId}:`, error);
            throw error;
        }
    },

    // Create a new category
    createCategory: async (category) => {
        try {
            const response = await axios.post(`${API_URL}/createCategories`, category);
            return response.data;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    },

    // Update a category by its ID
    updateCategory: async (categoryId, categoryDetails) => {
        try {
            const response = await axios.put(`${API_URL}/updateProductCategories/${categoryId}`, categoryDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating category ID ${categoryId}:`, error);
            throw error;
        }
    },

    // Delete a category by its ID
    deleteCategory: async (categoryId) => {
        try {
            await axios.delete(`${API_URL}/deleteCategories/${categoryId}`);
        } catch (error) {
            console.error(`Error deleting category ID ${categoryId}:`, error);
            throw error;
        }
    },
};

export default ProductCategoriesService;
