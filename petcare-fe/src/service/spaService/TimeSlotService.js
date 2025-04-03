import axios from 'axios';

// Function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Get environment variable
const envApiUrl = import.meta.env.VITE_API_BASE_URL;

// Determine the API base URL with fallbacks and validation
let API_BASE_URL;
if (envApiUrl && isValidUrl(envApiUrl)) {
  // Use environment variable if valid
  API_BASE_URL = `${envApiUrl}/api`;
} else if (envApiUrl && !isValidUrl(envApiUrl)) {
  // Try to fix common issues if URL is not valid
  if (envApiUrl === 'api') {
    // Correct the missing protocol and host
    API_BASE_URL = 'http://localhost:8080/api';
    console.warn('Warning: Fixed invalid API_BASE_URL "api" to "http://localhost:8080/api"');
  } else if (!envApiUrl.startsWith('http')) {
    // Add protocol if missing
    API_BASE_URL = `http://${envApiUrl}/api`;
    console.warn(`Warning: Added missing protocol to API_BASE_URL: ${API_BASE_URL}`);
  } else {
    // Use default if we can't fix it
    API_BASE_URL = 'http://localhost:8080/api';
    console.warn(`Warning: Invalid API_BASE_URL "${envApiUrl}", using default: ${API_BASE_URL}`);
  }
} else {
  // Default fallback
  API_BASE_URL = 'http://localhost:8080/api';
  console.warn(`Warning: No API_BASE_URL provided, using default: ${API_BASE_URL}`);
}

const TimeSlotService = {
  getTimeSlots: async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-slots`, {
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

  getAllSlotAdjustmentsInMonth: async (year, month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/time-slots/adjustments`, {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching slot adjustments:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  addSlots: async (date, time, quantity) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/time-slots/add`, null, {
        params: { date, time, quantity },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error adding slots:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  removeSlots: async (date, time, quantity) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/time-slots/remove`, null, {
        params: { date, time, quantity },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error removing slots:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  resetToDefault: async (date, time) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/time-slots/reset`, null, {
        params: { date, time },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error resetting slot to default:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  toggleSlotVisibility: async (time, isActive) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/time-slots/toggle-visibility`, null, {
        params: { time, isActive },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error toggling slot visibility:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};

export default TimeSlotService;