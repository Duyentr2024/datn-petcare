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

const BookingService = {
    getEmployees: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/employees`, {
                timeout: 10000,
            });
            console.log('Employees fetched:', response.data);
            return response.data
                .filter(employee => employee.status === 'active')
                .map(employee => ({
                    value: employee.employeeId,
                    label: employee.fullName,
                    phone: employee.phone,
                    employeeType: employee.employeeType,
                }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw new Error('Không thể tải danh sách nhân viên');
        }
    },

    getAvailableSlots: async (date) => {
        try {
            console.log('Fetching available slots for date:', date);
            
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
            
            const response = await axios.get(`${API_BASE_URL}/time-slots`, {
                params: { date },
                timeout: 10000,
            });
            console.log('Available slots response:', response.data);
            const result = response.data || { morning: [], afternoon: [] };
            if (!Array.isArray(result.morning)) {
                console.warn('Response morning slots is not an array, using empty array instead');
                result.morning = [];
            }
            if (!Array.isArray(result.afternoon)) {
                console.warn('Response afternoon slots is not an array, using empty array instead');
                result.afternoon = [];
            }
            
            // Process morning slots
            result.morning = result.morning.map(slot => {
                const normalizedTime = normalizeTime(slot.time || slot.hour || '');
                return {
                    hour: normalizedTime,
                    time: normalizedTime,
                    totalSlots: slot.totalSlots !== undefined ? slot.totalSlots : 4,
                    bookedSlots: slot.bookedSlots !== undefined ? slot.bookedSlots : 0,
                    availableSlots: slot.availableSlots !== undefined ? slot.availableSlots : (slot.totalSlots || 4) - (slot.bookedSlots || 0),
                    active: slot.active !== undefined ? slot.active : true,
                    isMorning: slot.isMorning !== undefined ? slot.isMorning : true
                };
            });
            
            // Process afternoon slots
            result.afternoon = result.afternoon.map(slot => {
                const normalizedTime = normalizeTime(slot.time || slot.hour || '');
                return {
                    hour: normalizedTime,
                    time: normalizedTime,
                    totalSlots: slot.totalSlots !== undefined ? slot.totalSlots : 4,
                    bookedSlots: slot.bookedSlots !== undefined ? slot.bookedSlots : 0,
                    availableSlots: slot.availableSlots !== undefined ? slot.availableSlots : (slot.totalSlots || 4) - (slot.bookedSlots || 0),
                    active: slot.active !== undefined ? slot.active : true,
                    isMorning: slot.isMorning !== undefined ? slot.isMorning : false
                };
            });
            
            console.log('Processed available slots result with normalized times:', result);
            return result;
        } catch (error) {
            console.error('Error fetching available slots:', error);
            return { morning: [], afternoon: [] };
        }
    },

    getConfirmedSlots: async (date) => {
        try {
            console.log('Fetching confirmed slots for date:', date);
            
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
            
            const response = await axios.get(`${API_BASE_URL}/time-slots/confirmed`, {
                params: { date },
                timeout: 10000,
            });
            console.log('Confirmed slots response:', response.data);
            const result = response.data || { morning: [], afternoon: [] };
            if (!Array.isArray(result.morning)) {
                console.warn('Response morning slots is not an array, using empty array instead');
                result.morning = [];
            }
            if (!Array.isArray(result.afternoon)) {
                console.warn('Response afternoon slots is not an array, using empty array instead');
                result.afternoon = [];
            }
            
            // Process and normalize morning slots
            result.morning = result.morning.map(slot => {
                // Normalize time format
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            
            // Process and normalize afternoon slots
            result.afternoon = result.afternoon.map(slot => {
                // Normalize time format
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            
            console.log('Processed confirmed slots result with normalized times:', result);
            return result;
        } catch (error) {
            console.error('Error fetching confirmed slots:', error);
            return { morning: [], afternoon: [] };
        }
    },

    getPendingAppointments: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/pending`, {
                timeout: 10000,
            });
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
            throw new Error(error.message || 'Không thể tải danh sách lịch hẹn');
        }
    },

    getPetsByAppointmentId: async (appointmentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}/pets`, {
                timeout: 10000,
            });
            console.log('Pets fetched for appointment ID', appointmentId, ':', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pets by appointment ID:', error);
            throw new Error(error.message || 'Không thể tải thông tin thú cưng');
        }
    },

    clearStaleBookings: () => {
        try {
            const localDate = localStorage.getItem('lastAppointmentDate');
            const localSlots = localStorage.getItem('lastBookedSlots');
            if (localDate && localSlots) {
                const storedDate = new Date(localDate);
                storedDate.setHours(23, 59, 59, 999);
                const now = new Date();
                if (now > storedDate) {
                    console.log('Clearing expired appointment data from localStorage');
                    localStorage.removeItem('lastAppointmentDate');
                    localStorage.removeItem('lastBookedSlots');
                    localStorage.removeItem('lastAppointmentId');
                    localStorage.removeItem('lastAppointmentData');
                }
            }
            return true;
        } catch (error) {
            console.error('Error clearing stale bookings:', error);
            return false;
        }
    },

    bookAppointment: async (payload) => {
        try {
          console.log('Booking appointment with payload:', payload);
      
          let formattedTime = payload.time;
          if (formattedTime && !formattedTime.includes(':')) {
            formattedTime = `${formattedTime}:00`;
          }
      
          const formattedPayload = {
            date: payload.date,
            time: formattedTime,
            customerName: payload.customerName,
            phone: payload.phone,
            paymentType: payload.paymentType,
            depositAmount: payload.depositAmount,
            totalAmount: payload.totalAmount,
            paidAmount: payload.paidAmount,
            pets: payload.pets.map(pet => {
              const petServiceId = parseInt(pet.petService?.id || pet.petServiceId, 10);
              const petWeightId = parseInt(pet.petWeight?.petWeightId || pet.petWeightId, 10);
      
              if (!petServiceId || !petWeightId) {
                throw new Error("Dữ liệu dịch vụ hoặc cân nặng không hợp lệ");
              }
      
              return {
                name: pet.name,
                petType: pet.petType,
                petServiceId: petServiceId, // Sử dụng petServiceId thay vì petService
                petWeightId: petWeightId,   // Sử dụng petWeightId thay vì petWeight
                note: pet.note,
                price: pet.price
              };
            }),
            paymentStatus: payload.paymentStatus,
            paymentMethod: payload.paymentMethod,
            paymentChannel: payload.paymentChannel,
          };
      
          console.log('Formatted payload being sent to backend:', formattedPayload);
          const response = await axios.post(`${API_BASE_URL}/appointments`, formattedPayload);
          console.log('Book appointment response:', response.data);
          return { success: true, data: response.data };
        } catch (error) {
          console.error('Error booking appointment:', error);
          let errorMessage = 'Không thể đặt lịch hẹn';
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return { success: false, message: errorMessage };
        }
      },

    checkSlotAvailability: async (date, time, requiredSlots) => {
        try {
          const normalizeTime = (timeStr) => {
            if (!timeStr) return '';
            const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
            if (formattedTime.length === 4) {
              return `0${formattedTime}`;
            }
            return formattedTime.split(':').slice(0, 2).join(':'); // Chỉ lấy HH:mm
          };
      
          const normalizedTime = normalizeTime(time);
          console.log(`Checking availability for normalized time: ${normalizedTime}`);
      
          const slots = await BookingService.getAvailableSlots(date);
          const allSlots = [...(slots.morning || []), ...(slots.afternoon || [])];
      
          const slot = allSlots.find(s => {
            const slotTime = normalizeTime(s.time || s.hour);
            return slotTime === normalizedTime;
          });
      
          console.log(`Slot found for ${normalizedTime}:`, slot);
          return slot && slot.availableSlots >= requiredSlots;
        } catch (error) {
          console.error('Error checking slot availability:', error);
          return false;
        }
      },

    checkSlotAvailabilityFromState: async (date, time, requiredSlots, timeSlotsState, selectedSession) => {
        try {
            // Normalize time format for consistent comparison
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

            // Get the normalized time string for comparison
            const normalizedTime = normalizeTime(time);
            console.log(`Checking availability from state for normalized time: ${normalizedTime}`);
            
            const allSlots = [
                ...(timeSlotsState.morning || []),
                ...(timeSlotsState.afternoon || [])
            ];
            
            // Find matching slot using normalized time comparisons
            const slot = allSlots.find(s => {
                const slotTime = normalizeTime(s.time || s.hour);
                return slotTime === normalizedTime;
            });
            
            console.log(`Slot found from state for ${normalizedTime}:`, slot);
            return slot && slot.availableSlots >= requiredSlots;
        } catch (error) {
            console.error('Error checking slot availability from state:', error);
            return false;
        }
    },

    getConfirmedAppointmentsByDate: async (date) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/confirmed`, {
                params: { date },
                timeout: 10000,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching confirmed appointments:', error);
            throw new Error('Không thể tải danh sách lịch hẹn đã xác nhận');
        }
    },

    getConfirmedAppointmentsByDateAndTime: async (date, time) => {
        try {
            // Normalize time format
            const normalizedTime = time.includes(':') ? time : `${time}:00`;
            // Add leading zero if needed
            const formattedTime = normalizedTime.length === 4 ? `0${normalizedTime}` : normalizedTime;
            
            console.log(`Fetching confirmed appointments for date: ${date}, time: ${formattedTime}`);
            
            const response = await axios.get(`${API_BASE_URL}/appointments/confirmed-by-date-and-time`, {
                params: { date, time: formattedTime },
                timeout: 10000,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching confirmed appointments by date and time:', error);
            throw new Error('Không thể tải danh sách lịch hẹn đã xác nhận');
        }
    },

    getAppointmentById: async (appointmentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
                timeout: 10000,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment by ID:', error);
            throw new Error('Không thể tải chi tiết lịch hẹn');
        }
    },

    cancelAppointment: async (appointmentId, reason) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error('Error canceling appointment:', error);
            throw new Error('Không thể hủy lịch hẹn');
        }
    },

    cancelAppointments: async (payload) => {
        try {
            console.log('Canceling appointments with payload:', payload);
            const response = await axios.put(`${API_BASE_URL}/appointments/cancel`, payload);
            console.log('Cancel appointments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error canceling appointments:', error);
            throw new Error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
        }
    },

    removePetFromAppointment: async (appointmentId, petId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}/pets/${petId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing pet from appointment:', error);
            throw new Error('Không thể xóa thú cưng khỏi lịch hẹn');
        }
    },

    updatePetName: async (petId, name) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/pets/${petId}/name`, { name });
            return response.data;
        } catch (error) {
            console.error('Error updating pet name:', error);
            throw new Error('Không thể cập nhật tên thú cưng');
        }
    },

    confirmAppointments: async (appointmentIds) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/appointments/confirm`, appointmentIds);
            return response.data;
        } catch (error) {
            console.error('Error confirming appointments:', error);
            throw new Error(error.message || 'Không thể xác nhận lịch hẹn');
        }
    },

    updateAppointment: async (payload) => {
        try {
            console.log('Updating appointment with payload:', payload);
            let attempts = 0;
            const maxAttempts = 3;
            
            // Ensure time format is HH:mm
            const formatTimeString = (timeStr) => {
                if (!timeStr) return timeStr;
                return timeStr.includes(':') ? timeStr : `${timeStr}:00`;
            };
            
            while (attempts < maxAttempts) {
                try {
                    const requestPayload = {
                        date: payload.date,
                        time: formatTimeString(payload.time),
                        currentDate: payload.currentDate,
                        currentTime: formatTimeString(payload.currentTime),
                        note: payload.note,
                        _requestId: payload._requestId || Math.random().toString(36).substring(2, 15) + Date.now()
                    };
                    
                    console.log('Formatted update payload:', requestPayload);
                    const response = await axios.put(`${API_BASE_URL}/appointments/${payload.appointmentId}`, requestPayload);
                    console.log('Update appointment response:', response.data);
                    return response.data;
                } catch (error) {
                    attempts++;
                    console.error(`Error updating appointment (attempt ${attempts}/${maxAttempts}):`, error);
                    
                    if (!error.response?.data?.message?.includes('Duplicate entry') || attempts >= maxAttempts) {
                        throw error;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            console.error('Error updating appointment after all retries:', error);
            if (error.response && error.response.data) {
                console.error('Server response:', error.response.data);
                throw new Error(error.response.data.message || 'Không thể cập nhật lịch hẹn');
            }
            throw new Error(error.message || 'Không thể cập nhật lịch hẹn');
        }
    },

    // Add a new debug function that can be used to check if there's any issue with the server-side availability
    debugCheckSlotAvailability: async (date, time, numPets = 1) => {
        try {
            // Normalize time format
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
            
            const normalizedTime = normalizeTime(time);
            console.log(`Debug checking slot availability for date: ${date}, time: ${normalizedTime}, pets: ${numPets}`);
            
            // First check if we can get the slot by querying the debug endpoint
            try {
                const infoResponse = await axios.get(`${API_BASE_URL}/debug/slot-info`, {
                    params: { date, time: normalizedTime },
                    timeout: 10000,
                });
                console.log('Slot info response:', infoResponse.data);
                
                // Now try resetting the slot to ensure it's up to date
                const resetResponse = await axios.post(`${API_BASE_URL}/debug/reset-slot`, null, {
                    params: { date, time: normalizedTime },
                    timeout: 10000,
                });
                console.log('Slot reset response:', resetResponse.data);
                
                // Now check if the reset slot has enough availability
                return resetResponse.data.availableSlots >= numPets;
            } catch (error) {
                console.error('Error with debug endpoint, falling back to regular check:', error);
                // Fall back to regular availability check
                return BookingService.checkSlotAvailability(date, normalizedTime, numPets);
            }
        } catch (error) {
            console.error('Error in debug check slot availability:', error);
            return false;
        }
    },
};

export default BookingService;