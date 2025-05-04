import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/brands`; // Adjust URL as needed

// Create an Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor to include token in headers
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

const ProductBrandService = {
    // Get list of all brands
    getAllBrands: async () => {
        try {
            const response = await api.get("/getAllBrand");
            return response.data;
        } catch (error) {
            console.error("Error fetching brands:", error);
            throw error;
        }
    },

    // Get list of active brands
    getActiveBrands: async () => {
        try {
            const response = await api.get("/activeBrand");
            return response.data;
        } catch (error) {
            console.error("Error fetching active brands:", error);
            throw error;
        }
    },

    // Get a brand by its ID
    getBrandById: async (brandId) => {
        try {
            const response = await api.get(`/getByBrandId/${brandId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching brand by ID ${brandId}:`, error);
            throw error;
        }
    },

    // Create a new brand
    createBrand: async (brand) => {
        try {
            const response = await api.post("/create", brand);
            return response.data;
        } catch (error) {
            console.error("Error creating brand:", error);
            throw error;
        }
    },

    // Update a brand by its ID
    updateBrand: async (brandId, brandDetails) => {
        try {
            const response = await api.put(`/update/${brandId}`, brandDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating brand ID ${brandId}:`, error);
            throw error;
        }
    },

    // Delete a brand by its ID
    deleteBrand: async (brandId) => {
        try {
            await api.delete(`/delete/${brandId}`);
        } catch (error) {
            console.error(`Error deleting brand ID ${brandId}:`, error);
            throw error;
        }
    },
};

export default ProductBrandService;