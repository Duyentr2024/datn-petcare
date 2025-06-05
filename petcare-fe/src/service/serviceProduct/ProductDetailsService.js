import axios from "axios";
import Cookies from "js-cookie";
import API_BASE_URL from "../../config"; // Import từ file config.js

const ProductDetailsService = {

  getAllProductDetails: async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ProductDetails:", error);
      throw error;
    }
  },


  getProductDetailsById: async (productDetailId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/getById/${productDetailId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy ProductDetails ID=${productDetailId}:`, error);
      throw error;
    }
  },

  /**
   * Tìm productDetailId theo biến thể (color, size, weight).
   * @param {string} color
   * @param {string} size
   * @param {string} weight
   * @returns {Promise<number>}
   */
  findProductDetailId: async (color, size, weight) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/find`,
        {
          params: { colorValue: color, sizeValue: size, weightValue: weight },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm ProductDetailId:", error);
      throw error;
    }
  },

  /**
   * Lấy ProductDetails bằng productId.
   * @param {number} productId
   * @returns {Promise<Array>}
   */
  getProductDetailsByProductId: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/by-product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy ProductDetails cho ProductID=${productId}:`,
        error
      );
      throw error;
    }
  },


  getProductDetailsDTOByProductId: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/dto/by-product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy ProductDetailsDTO cho ProductID=${productId}:`,
        error
      );
      throw error;
    }
  },


  getProductDetailsFlexible: async ({
    productDetailId,
    color,
    size,
    weight,
  }) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/getProductDetails`,
        {
          params: { productDetailId, color, size, weight },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy ProductDetails linh hoạt:", error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm theo tên
  searchProducts: async (query) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/search?productName=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      return [];
    }
  },

  createProductDetail: async (data) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/productDetails/add`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product detail:", error);
      throw error;
    }
  },

  updateProductDetail: async (id, data) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.put(
        `${API_BASE_URL}/api/productDetails/update/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Phản hồi từ server:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      throw error;
    }
  },

  deleteProductDetail: async (id) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.delete(
        `${API_BASE_URL}/api/productDetails/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting product detail:", error);
      throw error;
    }
  },

  // hàm sửa
  toggleProductDetailStatus: async (id) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.put(
        `${API_BASE_URL}/api/productDetails/toggle-status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi thay đổi trạng thái ProductDetail ID=${id}:`,
        error
      );
      throw error;
    }
  },

  
  getAllProductDetailsDTOByProductId: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/productDetails/dto/all-by-product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy tất cả ProductDetailsDTO cho ProductID=${productId}:`,
        error
      );
      throw error;
    }
  },
};

export default ProductDetailsService;
