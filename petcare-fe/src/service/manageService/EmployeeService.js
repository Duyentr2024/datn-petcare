import axios from "axios";
import API_BASE_URL from "../../config"; // Import BASE_URL từ config.js

const EmployeeService = {
  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/staff`);
      console.log("Danh sách nhân viên:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      return [];
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/create-staff`, employeeData);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo nhân viên:", error.response?.data || error.message);
      throw error.response?.data || { error: "Đã xảy ra lỗi." };
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      // Đảm bảo luôn gửi isStatus, nếu không có thì mặc định giữ nguyên giá trị hiện tại từ backend
      const response = await axios.put(`${API_BASE_URL}/api/users/update-staff/${id}`, {
        ...employeeData,
        isStatus: employeeData.isStatus !== undefined ? employeeData.isStatus : true, // Mặc định true nếu không gửi
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error.response?.data || error.message);
      throw error.response?.data || { error: "Đã xảy ra lỗi." };
    }
  },
};

export default EmployeeService;