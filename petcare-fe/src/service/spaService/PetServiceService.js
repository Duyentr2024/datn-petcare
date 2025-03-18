import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/pet-services`  
  : 'http://localhost:8080/api/pet-services';

const PetServiceService = {
  // Lấy danh sách tất cả dịch vụ
  getAllServices: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu dịch vụ: ' + error.message);
    }
  },

  // Thêm dịch vụ mới
  createService: async (service) => {
    try {
      const response = await axios.post(API_BASE_URL, service);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi thêm dịch vụ: ' + error.message);
    }
  },

  // Cập nhật dịch vụ
  updateService: async (id, service) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, service);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật dịch vụ: ' + error.message);
    }
  },

  // Xóa dịch vụ
  deleteService: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
      throw new Error('Lỗi khi xóa dịch vụ: ' + error.message);
    }
  },
};

export default PetServiceService;