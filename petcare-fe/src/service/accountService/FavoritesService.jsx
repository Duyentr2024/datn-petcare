import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/favorites";

export const toggleFavorite = async (userId, productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/toggle`, null, {
      params: { userId, productId }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật yêu thích:", error);
    throw error;
  }
};

export default { toggleFavorite };  // Xuất mặc định object chứa function
export class getFavoriteStatus {
}