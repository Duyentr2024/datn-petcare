import API_BASE_URL from "../../config";

const FavoritesService = {
  // Lấy danh sách sản phẩm yêu thích của một người dùng
  getFavoriteProductsByUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites/user/${userId}`);
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách sản phẩm yêu thích");
      return await response.json();
    } catch (error) {
      console.error("Lỗi:", error);
      return [];
    }
  },

  // Lấy danh sách yêu thích của một sản phẩm
  getFavoritesByProduct: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites/product/${productId}`);
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách yêu thích của sản phẩm");
      return await response.json();
    } catch (error) {
      console.error("Lỗi:", error);
      return [];
    }
  },

  // Lấy một mục yêu thích theo người dùng và sản phẩm
  getFavoriteByUserAndProduct: async (userId, productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites/user/${userId}/product/${productId}`);
      if (!response.ok) return null; // Trả về null nếu không tìm thấy
      return await response.json();
    } catch (error) {
      console.error("Lỗi:", error);
      return null;
    }
  },
  

  // Thêm hoặc cập nhật mục yêu thích
  addOrUpdateFavorite: async (favoriteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(favoriteData),
      });
      if (!response.ok) throw new Error("Lỗi khi thêm/cập nhật mục yêu thích");
      return await response.json();
    } catch (error) {
      console.error("Lỗi:", error);
      return null;
    }
  },

  // Xóa một mục yêu thích theo ID
  removeFavorite: async (favoriteId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites/${favoriteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Lỗi khi xóa mục yêu thích");
      return true;
    } catch (error) {
      console.error("Lỗi:", error);
      return false;
    }
  },

  // Xóa một mục yêu thích theo userId và productId
  removeFavoriteByUserAndProduct: async (userId, productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/favourites/user/${userId}/product/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Lỗi khi xóa mục yêu thích theo user và product");
      return true;
    } catch (error) {
      console.error("Lỗi:", error);
      return false;
    }
  },
};

export default FavoritesService