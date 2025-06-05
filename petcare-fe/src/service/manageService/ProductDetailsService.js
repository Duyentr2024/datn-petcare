import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/productDetails`; // Update with actual API endpoint

const ProductDetailsService = {
  getAllProductDetails: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(`${API_URL}/getAll`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  },

  getProductDetailById: async (id) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },

  createProductDetail: async (data) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.post(`${API_URL}/add`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product detail:", error);
      throw error;
    }
  },

  updateProductDetail: async (id, data) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product detail:", error);
      throw error;
    }
  },

  deleteProductDetail: async (id) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting product detail:", error);
      throw error;
    }
  },
};

export default ProductDetailsService;
