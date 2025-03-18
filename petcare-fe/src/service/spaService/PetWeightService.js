import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/pet-weights`
  : 'http://localhost:8080/api/pet-weights';

const PetWeightService = {
  getAllPetWeights: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu khoảng cân nặng: ' + error.message);
    }
  },

  createPetWeight: async (petWeight) => {
    try {
      const response = await axios.post(API_BASE_URL, petWeight);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi thêm khoảng cân nặng: ' + error.message);
    }
  },

  updatePetWeight: async (id, petWeight) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, petWeight);
      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật khoảng cân nặng: ' + error.message);
    }
  },

  deactivatePetWeight: async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}/deactivate`);
    } catch (error) {
      throw new Error('Lỗi khi vô hiệu hóa khoảng cân nặng: ' + error.message);
    }
  },

  activatePetWeight: async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}/activate`);
    } catch (error) {
      throw new Error('Lỗi khi kích hoạt khoảng cân nặng: ' + error.message);
    }
  },
};

export default PetWeightService;