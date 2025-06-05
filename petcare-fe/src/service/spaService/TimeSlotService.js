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

// Helper function to normalize time format
const normalizeTime = (timeStr) => {
    if (!timeStr) return '';
    // Convert to HH:mm format
    const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
    // Ensure leading zeros for single-digit hours
    if (formattedTime.length === 4) { // If format is like "8:00"
        return `0${formattedTime}`;
    }
    return formattedTime;
};

// Get environment variable
const envApiUrl = import.meta.env.VITE_API_BASE_URL;

// Debug log
console.log('Environment API URL:', envApiUrl);

// Determine the API base URL with fallbacks and validation
let API_BASE_URL;
if (envApiUrl && isValidUrl(envApiUrl)) {
    API_BASE_URL = `${envApiUrl}/api`;
} else if (envApiUrl && !isValidUrl(envApiUrl)) {
    if (envApiUrl === 'api') {
        API_BASE_URL = 'http://localhost:8080/api';
        console.warn('Warning: Fixed invalid API_BASE_URL "api" to "http://localhost:8080/api"');
    } else if (!envApiUrl.startsWith('http')) {
        API_BASE_URL = `http://${envApiUrl}/api`;
        console.warn(`Warning: Added missing protocol to API_BASE_URL: ${API_BASE_URL}`);
    } else {
        API_BASE_URL = 'http://localhost:8080/api';
        console.warn(`Warning: Invalid API_BASE_URL "${envApiUrl}", using default: ${API_BASE_URL}`);
    }
} else {
    API_BASE_URL = 'http://localhost:8080/api';
    console.warn(`Warning: No API_BASE_URL provided, using default: ${API_BASE_URL}`);
}

console.log('Final API_BASE_URL:', API_BASE_URL);

const TimeSlotService = {
    getTimeSlots: async (date) => {
        try {
            console.log('Fetching time slots for date:', date);
            const response = await axios.get(`${API_BASE_URL}/time-slots`, {
                params: { date },
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('Time slots response:', response.data);
            
            // Normalize and validate the data
            if (!response.data) {
                throw new Error('Dữ liệu khung giờ trống');
            }
            
            const result = response.data;
            
            // Initialize arrays if missing
            if (!result.morning || !Array.isArray(result.morning)) {
                result.morning = [];
            }
            if (!result.afternoon || !Array.isArray(result.afternoon)) {
                result.afternoon = [];
            }
            
            // Normalize time formats in morning slots
            result.morning = result.morning.map(slot => {
                return {
                    ...slot,
                    hour: normalizeTime(slot.time || slot.hour || ''),
                    time: normalizeTime(slot.time || slot.hour || '')
                };
            });
            
            // Normalize time formats in afternoon slots
            result.afternoon = result.afternoon.map(slot => {
                return {
                    ...slot,
                    hour: normalizeTime(slot.time || slot.hour || ''),
                    time: normalizeTime(slot.time || slot.hour || '')
                };
            });
            
            console.log('Normalized time slots:', result);
            return result;
        } catch (error) {
            let errorMessage = 'Unknown error';
            if (error.response) {
                try {
                    errorMessage = error.response.data?.message || error.response.statusText || 'Unknown server error';
                } catch (parseError) {
                    errorMessage = `Error ${error.response.status}: Server returned invalid response`;
                }
            } else {
                errorMessage = error.message || 'Unknown error';
            }
            console.error('Error fetching time slots:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    getBookingStatus: async () => {
        try {
            console.log('Fetching booking status');
            const response = await axios.get(`${API_BASE_URL}/booking-enabled`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('Booking status response:', response.data);
            return response.data; // true/false
        } catch (error) {
            let errorMessage = 'Unknown error';
            if (error.response) {
                try {
                    errorMessage = error.response.data?.message || error.response.statusText || 'Unknown server error';
                } catch (parseError) {
                    errorMessage = `Error ${error.response.status}: Server returned invalid response`;
                }
            } else {
                errorMessage = error.message || 'Unknown error';
            }
            console.error('Error fetching booking status:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    updateBookingStatus: async (status, token) => {
        try {
            console.log('Updating booking status to:', status);
            const response = await axios.put(
                `${API_BASE_URL}/staff/booking-enabled`,
                null,
                {
                    params: { status },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            console.log('Update booking status response:', response.data);
            return response.data;
        } catch (error) {
            let errorMessage = 'Unknown error';
            if (error.response) {
                try {
                    errorMessage = error.response.data?.message || error.response.statusText || 'Unknown server error';
                } catch (parseError) {
                    errorMessage = `Error ${error.response.status}: Server returned invalid response`;
                }
            } else {
                errorMessage = error.message || 'Unknown error';
            }
            console.error('Error updating booking status:', errorMessage);
            throw new Error(errorMessage);
        }
    }
};

export default TimeSlotService;