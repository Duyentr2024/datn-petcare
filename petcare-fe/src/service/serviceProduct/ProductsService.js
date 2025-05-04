import axios from "axios";
import Cookies from "js-cookie";
import API_BASE_URL from "../../config"; // Import từ file config.js

const ProductsService = {
  // Lấy danh sách tất cả sản phẩm
  getAllProducts: async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/products/getAllProducts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      throw error;
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/products/getByIdProducts/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  // Tạo mới sản phẩm
  createProduct: async (productData) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/products/createProducts`,
        productData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      throw error;
    }
  },

  // Cập nhật sản phẩm theo ID
  updateProduct: async (productId, updatedData) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.put(
        `${API_BASE_URL}/api/products/updateProducts/${productId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm theo ID
  deleteProduct: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.delete(
        `${API_BASE_URL}/api/products/deleteProducts/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm có thông tin danh mục và giá thấp nhất
  getAllProductsWithCategory: async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/products/getAllProductss`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm kèm danh mục:", error);
      throw error;
    }
  },

  // Lấy top 5 sản phẩm bán chạy
  getBestSellingProducts: async () => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/products/best-selling-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      return [];
    }
  },

  getProductSummaryById: async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/products/products-summary/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy ProductSummary ID=${productId}:`, error);
      throw error;
    }
  },
};

export default ProductsService;
