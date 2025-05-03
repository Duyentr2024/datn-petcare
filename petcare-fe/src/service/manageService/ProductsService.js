import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/products`; // Adjust URL as needed

const ProductsService = {
  // Get list of all products
  getAllProducts: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(`${API_URL}/getAllProductsList`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get a product by its ID
  getProductById: async (productId) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_URL}/getByIdProducts/${productId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching product by ID ${productId}:`, error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (product) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.post(`${API_URL}/createProducts`, product, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update a product by its ID
  updateProduct: async (productId, productDetails) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.put(
        `${API_URL}/updateProducts/${productId}`,
        productDetails,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating product ID ${productId}:`, error);
      throw error;
    }
  },

  // Delete a product by its ID
  deleteProduct: async (productId) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      await axios.delete(`${API_URL}/deleteProducts/${productId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error(`Error deleting product ID ${productId}:`, error);
      throw error;
    }
  },

  // Đổi trạng thái sản phẩm
  toggleProductStatus: async (productId) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.put(
        `${API_URL}/toggle-status/${productId}`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      return response.data; // Trả về thông báo từ server (ví dụ: "Trạng thái sản phẩm với ID 1 đã được cập nhật thành: Hoạt động")
    } catch (error) {
      console.error(
        `Error toggling status for product ID ${productId}:`,
        error
      );
      throw error;
    }
  },
};

export default ProductsService;
