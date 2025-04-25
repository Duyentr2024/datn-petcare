import axios from "axios";
import API_BASE_URL from "../../config";
import Cookies from "js-cookie"; // Import js-cookie để lấy token

const api = axios.create({
  baseURL: API_BASE_URL,
});

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

// Gửi yêu cầu POST để toggle trạng thái yêu thích
export const toggleFavorite = async (userId, productId) => {
  try {
    const response = await api.post("/api/favorites/toggle", null, {
      params: { userId, productId }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật yêu thích:", error);
    throw error;
  }
};

// Gửi yêu cầu GET để lấy trạng thái yêu thích
export const getFavoriteStatus = async (userId, productId) => {
  try {
    const response = await api.get("/api/favorites/status", {
      params: { userId, productId }
    });
    return response.data; // Trả về true hoặc false
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái yêu thích:", error);
    throw error;
  }
};

// Gửi yêu cầu GET để lấy danh sách sản phẩm yêu thích
export const getFavoriteProductsByUser = async (userId) => {
  try {
    const response = await api.get(`/api/favorites/list/${userId}`);
    return response.data; // Trả về danh sách sản phẩm yêu thích
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
    throw error;
  }
};

// Xuất các hàm để sử dụng trong React components
export default { toggleFavorite, getFavoriteStatus, getFavoriteProductsByUser };