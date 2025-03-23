import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/pet-services`
  : 'http://localhost:8080/api/pet-services';

const PetServiceService = {
  getAllServices: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu dịch vụ: ' + error.message);
    }
  },

  getServicesByPetType: async (petType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-pet-type?petType=${petType}`);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi lấy dịch vụ theo loại thú cưng: ' + error.message);
    }
  },

  createService: async (service) => {
    try {
      const response = await axios.post(API_BASE_URL, service);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi thêm dịch vụ: ' + error.message);
    }
  },

  updateService: async (id, service) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, service);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật dịch vụ: ' + error.message);
    }
  },

  deleteService: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
      throw new Error('Lỗi khi xóa dịch vụ: ' + error.message);
    }
  },
};

export default PetServiceService;