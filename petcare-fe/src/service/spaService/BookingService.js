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
            result.morning = result.morning.map(slot => {
                if (slot.time && !slot.hour) {
                    if (typeof slot.time === 'object' && slot.time.toString) {
                        slot.hour = slot.time.toString();
                    } else if (typeof slot.time === 'string') {
                        slot.hour = slot.time;
                    }
                }
                return slot;
            });
            result.afternoon = result.afternoon.map(slot => {
                if (slot.time && !slot.hour) {
                    if (typeof slot.time === 'object' && slot.time.toString) {
                        slot.hour = slot.time.toString();
                    } else if (typeof slot.time === 'string') {
                        slot.hour = slot.time;
                    }
                }
                return slot;
            });
            console.log('Processed available slots result:', result);
            return result;
        } catch (error) {
            console.error('Error fetching available slots:', error);
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
            const formattedPayload = {
                date: payload.date,
                time: payload.time,
                customerName: payload.customerName,
                phone: payload.phone,
                depositAmount: payload.depositAmount,
                totalAmount: payload.totalAmount,
                pets: payload.pets.map(pet => ({
                    name: pet.name,
                    petType: pet.petType,
                    petServiceId: parseInt(pet.petService.id),
                    petWeightId: parseInt(pet.petWeight.petWeightId),
                    note: pet.note,
                    price: pet.price
                }))
            };
            const response = await axios.post(`${API_BASE_URL}/appointments`, formattedPayload);
            console.log('Book appointment response:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error booking appointment:', error);
            return { success: false, message: error.response?.data || error.message };
        }
    },

    checkSlotAvailability: async (date, time, requiredSlots) => {
        try {
            const slots = await BookingService.getAvailableSlots(date);
            const allSlots = [...(slots.morning || []), ...(slots.afternoon || [])];
            const slot = allSlots.find(s => s.time === time);
            return slot && slot.availableSlots >= requiredSlots;
        } catch (error) {
            console.error('Error checking slot availability:', error);
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
            const response = await axios.get(`${API_BASE_URL}/appointments/confirmed-by-date-and-time`, {
                params: { date, time },
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
};

export default BookingService;