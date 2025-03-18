import axios from 'axios';

// Sử dụng biến môi trường VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

const TimeSlotService = {
  // Lấy danh sách khung giờ
  getTimeSlots: async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/timeslots`, {
        params: { date },
      });
      if (!response.data || (!response.data.morning && !response.data.afternoon)) {
        throw new Error('Dữ liệu khung giờ không hợp lệ');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching time slots:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Đặt lịch hẹn
  bookAppointment: async (payload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/timeslots/book`, payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error booking appointment:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Lấy trạng thái đặt lịch (bật/tắt)
  getBookingStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking-enabled`);
      return response.data.settingValue; // Trả về true/false
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching booking status:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Cập nhật trạng thái đặt lịch (bật/tắt)
  updateBookingStatus: async (status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/booking-enabled`, null, {
        params: { status },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error updating booking status:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};

export default TimeSlotService;