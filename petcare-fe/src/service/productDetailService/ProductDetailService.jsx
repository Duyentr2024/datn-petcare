import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/productDetails";

const ProductDetailService = {
    getAllProductDetails: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getAll`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all product details:", error);
            throw error;
        }
    },

    getProductDetailsById: async (productDetailId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getById/${productDetailId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product details by ID:", error);
            throw error;
        }
    },

    findProductDetailId: async (color, size, weight) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/find`, {
                params: { colorValue: color, sizeValue: size, weightValue: weight },
            });
            return response.data;
        } catch (error) {
            console.error("Error finding product detail ID:", error);
            throw error;
        }
    },

    getProductDetails: async (params) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getProductDetails`, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching product details:", error);
            throw error;
        }
    },

    getProductDetailsByProductId: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/by-product/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product details by product ID:", error);
            throw error;
        }
    },

    getProductDetailsDTOByProductId: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/dto/by-product/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product details DTO by product ID:", error);
            throw error;
        }
    },
};

export default ProductDetailService;
