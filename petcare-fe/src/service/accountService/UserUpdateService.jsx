import axios from "axios";
import API_BASE_URL from "../../config"; // Import BASE_URL từ config.js

const UserUpdateService = {
  updateUser: async (userId, formData) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/users/update/${userId}`, // Sử dụng biến từ config.js
        {
          fullName: formData.fullName,
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      throw error;
    }
  },
};

export default UserUpdateService;
