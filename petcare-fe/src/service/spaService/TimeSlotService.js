import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

const TimeSlotService = {
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

  getBookingStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking-enabled`);
      return response.data.settingValue;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching booking status:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  updateBookingStatus: async (status, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/staff/booking-enabled`,
        null,
        {
          params: { status },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error updating booking status:', errorMessage, error);
      if (error.response?.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      }
      throw new Error(errorMessage);
    }
  },
};

export default TimeSlotService;