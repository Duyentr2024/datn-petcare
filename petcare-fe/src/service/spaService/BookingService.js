import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

const retryRequest = async (requestFn, maxRetries = 2, retryDelay = 1000) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);
            lastError = error;
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                throw error;
            }
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    throw lastError;
};

// Hàm lấy userId từ token JWT
const getCurrentUserId = () => {
    const token = Cookies.get('accessToken');
    if (!token) {
        throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
    }
    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        const userId = decoded.userId || decoded.sub || decoded.email;
        if (!userId) {
            throw new Error('Token không chứa userId, sub, hoặc email. Vui lòng kiểm tra cấu trúc token.');
        }
        return String(userId);
    } catch (error) {
        console.error('Lỗi giải mã token:', error);
        throw new Error('Lỗi giải mã token: ' + error.message);
    }
};

const envApiUrl = import.meta.env.VITE_API_BASE_URL;

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
            if (!response.data || response.data.length === 0) {
                console.warn('No employees found in response, using mock data');
                return [
                    { value: 1, label: "Nhân viên 1", phone: "0123456789", employeeType: "STAFF" },
                    { value: 2, label: "Nhân viên 2", phone: "0987654321", employeeType: "STAFF" }
                ];
            }
            const activeEmployees = response.data.filter(employee => 
                employee.status && employee.status.toLowerCase() === 'active'
            );
            if (activeEmployees.length === 0) {
                console.warn('No active employees found, using mock data');
                return [
                    { value: 1, label: "Nhân viên 1", phone: "0123456789", employeeType: "STAFF" },
                    { value: 2, label: "Nhân viên 2", phone: "0987654321", employeeType: "STAFF" }
                ];
            }
            return activeEmployees.map(employee => ({
                value: employee.employeeId,
                label: employee.fullName,
                phone: employee.phone,
                employeeType: employee.employeeType,
            }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            if (error.response) {
                console.error('API response error:', error.response.data);
                throw new Error(error.response.data?.message || 'Không có nhân viên khả dụng trong hệ thống');
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('Không thể kết nối đến máy chủ để lấy danh sách nhân viên');
            } else {
                console.error('Error setting up request:', error.message);
                throw new Error('Không thể tải danh sách nhân viên: ' + error.message);
            }
        }
    },

    getAvailableSlots: async (date) => {
        try {
            console.log('Fetching available slots for date:', date);
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
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
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
                    return `0${formattedTime}`;
                }
                return formattedTime;
            };
            
            const endpoint = `${API_BASE_URL}/time-slots/confirmed`;
            console.log(`Calling API endpoint: ${endpoint} with date=${date}`);
            
            const response = await retryRequest(async () => {
                try {
                    return await axios.get(endpoint, {
                        params: { date },
                        timeout: 15000,
                    });
                } catch (error) {
                    if (error.response) {
                        console.error(`API responded with error status ${error.response.status}:`, 
                            error.response.data || 'No response data');
                    } else if (error.request) {
                        console.error('No response received from API:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    throw error;
                }
            }, 3, 1500);
            
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
            result.morning = result.morning.map(slot => {
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            result.afternoon = result.afternoon.map(slot => {
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
            const errorMessage = error.response?.data?.message || 
                             error.response?.data || 
                             error.message || 
                             'Không thể tải danh sách khung giờ đã xác nhận';
            
            console.error(`Failed to fetch confirmed slots with date=${date}. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    },

    getInProgressSlots: async (date) => {
        try {
            console.log('Fetching in-progress slots for date:', date);
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
                    return `0${formattedTime}`;
                }
                return formattedTime;
            };
            
            const endpoint = `${API_BASE_URL}/time-slots/in-progress`;
            console.log(`Calling API endpoint: ${endpoint} with date=${date}`);
            
            const response = await retryRequest(async () => {
                try {
                    return await axios.get(endpoint, {
                        params: { date },
                        timeout: 15000,
                    });
                } catch (error) {
                    if (error.response) {
                        console.error(`API responded with error status ${error.response.status}:`, 
                            error.response.data || 'No response data');
                    } else if (error.request) {
                        console.error('No response received from API:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    throw error;
                }
            }, 3, 1500);
            
            console.log('In-progress slots response:', response.data);
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
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            result.afternoon = result.afternoon.map(slot => {
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            console.log('Processed in-progress slots result with normalized times:', result);
            return result;
        } catch (error) {
            console.error('Error fetching in-progress slots:', error);
            const errorMessage = error.response?.data?.message || 
                             error.response?.data || 
                             error.message || 
                             'Không thể tải danh sách khung giờ đang thực hiện';
            
            console.error(`Failed to fetch in-progress slots with date=${date}. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    },

    getCompletedSlots: async (date) => {
        try {
            console.log('Fetching completed slots for date:', date);
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
                    return `0${formattedTime}`;
                }
                return formattedTime;
            };
            
            const endpoint = `${API_BASE_URL}/time-slots/completed`;
            console.log(`Calling API endpoint: ${endpoint} with date=${date}`);
            
            const response = await retryRequest(async () => {
                try {
                    return await axios.get(endpoint, {
                        params: { date },
                        timeout: 15000,
                    });
                } catch (error) {
                    if (error.response) {
                        console.error(`API responded with error status ${error.response.status}:`, 
                            error.response.data || 'No response data');
                    } else if (error.request) {
                        console.error('No response received from API:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    throw error;
                }
            }, 3, 1500);
            
            console.log('Completed slots response:', response.data);
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
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            result.afternoon = result.afternoon.map(slot => {
                if (slot.time || slot.hour) {
                    const normalizedTime = normalizeTime(slot.time || slot.hour);
                    slot.hour = normalizedTime;
                    slot.time = normalizedTime;
                }
                return slot;
            });
            console.log('Processed completed slots result with normalized times:', result);
            return result;
        } catch (error) {
            console.error('Error fetching completed slots:', error);
            const errorMessage = error.response?.data?.message || 
                             error.response?.data || 
                             error.message || 
                             'Không thể tải danh sách khung giờ đã hoàn thành';
            
            console.error(`Failed to fetch completed slots with date=${date}. Error: ${errorMessage}`);
            throw new Error(errorMessage);
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
            console.log(`Fetching pets for appointment ID ${appointmentId}`);
            
            const rawData = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/appointments/${appointmentId}/pets`, {
                    timeout: 10000,
                })
            );
            
            console.log(`Raw pet data for appointment ${appointmentId}:`, rawData.data);
            
            if (!rawData.data) {
                console.warn(`No pet data returned for appointment ${appointmentId}`);
                return [];
            }
            
            if (!Array.isArray(rawData.data)) {
                console.error(`Invalid response format for pets (expected array):`, rawData.data);
                if (typeof rawData.data === 'object') {
                    console.log('Attempting to convert object to array');
                    return [rawData.data].filter(Boolean);
                }
                return [];
            }
            
            if (rawData.data.length === 0) {
                console.log(`No pets found for appointment ${appointmentId}`);
                return [];
            }
            
            const enhancedData = rawData.data.map(pet => {
                if (!pet) return null;
                
                const petWeightId = pet.petWeightId || pet.weightId || pet.weight_id;
                const weightRange = pet.weightRange || pet.weight_range || "Chưa xác định";
                const petName = pet.name || pet.petName || pet.namePet || pet.pet_name || `Thú cưng ${pet.id || 'không ID'}`;
                const petType = pet.petType || pet.type || "DOG";
                const petServiceId = pet.petServiceId || null;
                const serviceName = pet.serviceName || "Không xác định";
                
                return {
                    ...pet,
                    petWeightId: petWeightId,
                    weightRange: weightRange,
                    name: petName,
                    petType: petType,
                    petServiceId: petServiceId,
                    serviceName: serviceName,
                };
            }).filter(Boolean);
            
            console.log('Enhanced pet data:', enhancedData);
            return enhancedData;
        } catch (error) {
            console.error(`Error in getPetsByAppointmentId for appointment ${appointmentId}:`, error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                            error.response?.data || 
                            error.message || 
                            `Không thể tải thông tin thú cưng cho lịch hẹn #${appointmentId}`;
                            
            console.error(`Server error in getPetsByAppointmentId: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
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
                        petServiceId: petServiceId,
                        petWeightId: petWeightId,
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
                return formattedTime.split(':').slice(0, 2).join(':');
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
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
                    return `0${formattedTime}`;
                }
                return formattedTime;
            };
            const normalizedTime = normalizeTime(time);
            console.log(`Checking availability from state for normalized time: ${normalizedTime}`);
            const allSlots = [
                ...(timeSlotsState.morning || []),
                ...(timeSlotsState.afternoon || [])
            ];
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
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            console.log('Fetching confirmed appointments for date:', formattedDate);
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/appointments/confirmed`, {
                    params: { date: formattedDate },
                    timeout: 10000,
                })
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching confirmed appointments:', error);
            let errorMessage = 'Không thể tải danh sách lịch hẹn đã xác nhận';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },

    getConfirmedAppointmentsByDateAndTime: async (date, time) => {
        try {
            const normalizedTime = time.includes(':') ? time : `${time}:00`;
            const formattedTime = normalizedTime.length === 4 ? `0${normalizedTime}` : normalizedTime;
            console.log(`Fetching confirmed appointments for date: ${date}, time: ${formattedTime}`);
            
            const endpoint = `${API_BASE_URL}/appointments/confirmed-by-date-and-time`;
            console.log(`Calling API endpoint: ${endpoint} with date=${date}, time=${formattedTime}`);
            
            if (!date || !time) {
                console.error('Missing required parameters:', { date, time });
                throw new Error('Thiếu thông tin ngày hoặc giờ');
            }
            
            const response = await retryRequest(async () => {
                try {
                    return await axios.get(endpoint, {
                        params: { date, time: formattedTime },
                        timeout: 15000,
                    });
                } catch (error) {
                    if (error.response) {
                        console.error(`API responded with error status ${error.response.status}:`, 
                            error.response.data || 'No response data');
                    } else if (error.request) {
                        console.error('No response received from API:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    throw error;
                }
            }, 3, 1500);
            
            console.log('Confirmed appointments by date and time response:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching confirmed appointments by date and time:', error);
            const errorMessage = error.response?.data?.message || 
                             error.response?.data || 
                             error.message || 
                             'Không thể tải danh sách lịch hẹn đã xác nhận';
            
            console.error(`Failed to fetch confirmed appointments with date=${date}, time=${time}. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    },

    getActiveAppointmentsByDate: async (date) => {
        try {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            console.log('Fetching active appointments for date:', formattedDate);
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/appointments/active`, {
                    params: { date: formattedDate },
                    timeout: 10000,
                })
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching active appointments:', error);
            let errorMessage = 'Không thể tải danh sách lịch hẹn hoạt động';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },

    getActiveAppointmentsByDateAndTime: async (date, time) => {
        try {
            const normalizedTime = time.includes(':') ? time : `${time}:00`;
            const formattedTime = normalizedTime.length === 4 ? `0${normalizedTime}` : normalizedTime;
            console.log(`Fetching active appointments for date: ${date}, time: ${formattedTime}`);
            
            const endpoint = `${API_BASE_URL}/appointments/active-by-date-and-time`;
            console.log(`Calling API endpoint: ${endpoint} with date=${date}, time=${formattedTime}`);
            
            if (!date || !time) {
                console.error('Missing required parameters:', { date, time });
                throw new Error('Thiếu thông tin ngày hoặc giờ');
            }
            
            const response = await retryRequest(async () => {
                try {
                    return await axios.get(endpoint, {
                        params: { date, time: formattedTime },
                        timeout: 15000,
                    });
                } catch (error) {
                    if (error.response) {
                        console.error(`API responded with error status ${error.response.status}:`, 
                            error.response.data || 'No response data');
                    } else if (error.request) {
                        console.error('No response received from API:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    throw error;
                }
            }, 3, 1500);
            
            console.log('Active appointments by date and time response:', response.data);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching active appointments by date and time:', error);
            const errorMessage = error.response?.data?.message || 
                             error.response?.data || 
                             error.message || 
                             'Không thể tải danh sách lịch hẹn hoạt động';
            
            console.error(`Failed to fetch active appointments with date=${date}, time=${time}. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    },

    getAppointmentById: async (appointmentId) => {
        try {
            console.log(`Fetching appointment details for ID ${appointmentId}`);
            
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
                    timeout: 10000,
                })
            );
            
            console.log(`Appointment data for ID ${appointmentId}:`, response.data);
            
            if (!response.data) {
                throw new Error(`Không tìm thấy thông tin cho lịch hẹn #${appointmentId}`);
            }
            
            return response.data;
        } catch (error) {
            console.error(`Error in getAppointmentById for appointment ${appointmentId}:`, error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
            }
            
            if (error.response.status === 404) {
                throw new Error(`Không tìm thấy lịch hẹn #${appointmentId}`);
            }
            
            const errorMsg = error.response?.data?.message || 
                            error.response?.data || 
                            error.message || 
                            `Không thể tải thông tin cho lịch hẹn #${appointmentId}`;
                            
            console.error(`Server error in getAppointmentById: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
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
            const userId = getCurrentUserId();
            const requestPayload = {
                appointmentIds: payload.appointmentIds,
                reason: payload.reason,
                userId: userId
            };
            console.log('Sending request payload to backend:', requestPayload);
            
            const response = await axios.put(`${API_BASE_URL}/appointments/cancel`, requestPayload, {
                timeout: 15000,
            });
            console.log('Cancel appointments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in cancelAppointments:', error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Không thể hủy lịch hẹn';
            
            console.error(`Server error in cancelAppointments: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
        }
    },

    cancelPaidAppointments: async (payload) => {
        try {
            console.log('Canceling PAID appointments with payload:', payload);
            const userId = getCurrentUserId();
            const requestPayload = {
                appointmentIds: payload.appointmentIds,
                reason: payload.reason,
                userId: userId
            };
            console.log('Sending request payload to backend:', requestPayload);
            
            const response = await axios.put(`${API_BASE_URL}/appointments/cancel/paid`, requestPayload, {
                timeout: 15000,
            });
            console.log('Cancel PAID appointments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in cancelPaidAppointments:', error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Không thể hủy lịch hẹn';
            
            console.error(`Server error in cancelPaidAppointments: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
        }
    },

    cancelConfirmedAppointments: async (payload) => {
        try {
            console.log('Canceling CONFIRMED appointments with payload:', payload);
            const userId = getCurrentUserId();
            const requestPayload = {
                appointmentIds: payload.appointmentIds,
                reason: payload.reason,
                userId: userId
            };
            console.log('Sending request payload to backend:', requestPayload);
            
            const response = await axios.put(`${API_BASE_URL}/appointments/cancel/confirmed`, requestPayload, {
                timeout: 15000,
            });
            console.log('Cancel CONFIRMED appointments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in cancelConfirmedAppointments:', error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Không thể hủy lịch hẹn';
            
            console.error(`Server error in cancelConfirmedAppointments: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
        }
    },

    removePetFromAppointment: async (appointmentId, petId) => {
        try {
            console.log(`Removing pet ${petId} from appointment ${appointmentId}`);
            const userId = getCurrentUserId();
            const payload = { userId };
            
            console.log('Sending request payload to backend:', payload);
            
            const response = await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}/pets/${petId}`, {
                data: payload,
                timeout: 15000,
            });
            console.log('Remove pet response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error in removePetFromAppointment:`, error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Không thể xóa thú cưng khỏi lịch hẹn';
                          
            console.error(`Server error in removePetFromAppointment: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
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

    startService: async (appointmentId, petAssignments) => {
        try {
            const userId = getCurrentUserId();
            console.log(`Starting service for appointment ${appointmentId} with pet assignments:`, petAssignments);
            const response = await axios.post(
                `${API_BASE_URL}/appointments/${appointmentId}/start`,
                petAssignments,
                { params: { userId }, timeout: 10000 }
            );
            console.log('Start service response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error starting service:', error);
            throw new Error(error.response?.data?.message || 'Không thể bắt đầu dịch vụ');
        }
    },

    completeService: async (appointmentId, payload) => {
        try {
            const userId = getCurrentUserId();
            console.log(`Completing service for appointment ${appointmentId} with payload:`, payload);
            const response = await axios.post(
                `${API_BASE_URL}/appointments/${appointmentId}/complete`,
                payload,
                { params: { userId }, timeout: 10000 }
            );
            console.log('Complete service response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error completing service:', error);
            throw new Error(error.response?.data?.message || 'Không thể hoàn thành dịch vụ');
        }
    },

    confirmAppointments: async (appointmentIds) => {
        try {
            const userId = getCurrentUserId();
            const payload = {
                appointmentIds,
                userId,
            };
            console.log('Confirming appointments with payload:', payload);
            const response = await axios.post(`${API_BASE_URL}/appointments/confirm`, payload);
            return response.data;
        } catch (error) {
            console.error('Error confirming appointments:', error);
            let errorMessage = 'Không thể xác nhận lịch hẹn';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    },

    updateAppointment: async (payload) => {
        try {
            console.log('Updating appointment with payload:', payload);
            let attempts = 0;
            const maxAttempts = 3;
            const formatTimeString = (timeStr) => {
                if (!timeStr) return timeStr;
                return timeStr.includes(':') ? timeStr : `${timeStr}:00`;
            };
            const userId = getCurrentUserId();
            while (attempts < maxAttempts) {
                try {
                    const requestPayload = {
                        date: payload.date,
                        time: formatTimeString(payload.time),
                        currentDate: payload.currentDate,
                        currentTime: formatTimeString(payload.currentTime),
                        note: payload.note,
                        _requestId: payload._requestId || Math.random().toString(36).substring(2, 15) + Date.now(),
                        userId,
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

    debugCheckSlotAvailability: async (date, time, numPets = 1) => {
        try {
            const normalizeTime = (timeStr) => {
                if (!timeStr) return '';
                const formattedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
                if (formattedTime.length === 4) {
                    return `0${formattedTime}`;
                }
                return formattedTime;
            };
            const normalizedTime = normalizeTime(time);
            console.log(`Debug checking slot availability for date: ${date}, time: ${normalizedTime}, pets: ${numPets}`);
            try {
                const infoResponse = await axios.get(`${API_BASE_URL}/debug/slot-info`, {
                    params: { date, time: normalizedTime },
                    timeout: 10000,
                });
                console.log('Slot info response:', infoResponse.data);
                const resetResponse = await axios.post(`${API_BASE_URL}/debug/reset-slot`, null, {
                    params: { date, time: normalizedTime },
                    timeout: 10000,
                });
                console.log('Slot reset response:', resetResponse.data);
                return resetResponse.data.availableSlots >= numPets;
            } catch (error) {
                console.error('Error with debug endpoint, falling back to regular check:', error);
                return BookingService.checkSlotAvailability(date, normalizedTime, numPets);
            }
        } catch (error) {
            console.error('Error in debug check slot availability:', error);
            return false;
        }
    },

    getPetWeights: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pet-weights`, {
                timeout: 10000,
            });
            console.log('Pet weights fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pet weights:', error);
            throw new Error('Không thể tải danh sách cân nặng');
        }
    },

    getPetWeightsByType: async (petType) => {
        try {
            console.log(`Fetching weights for pet type: ${petType}`);
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/pet-weights/by-type/${petType}`, {
                    timeout: 10000,
                })
            );
            console.log(`Pet weights for ${petType} fetched:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching pet weights for ${petType}:`, error);
            try {
                console.log(`Falling back to fetching all weights and filtering by type: ${petType}`);
                const allWeightsResponse = await retryRequest(() => 
                    axios.get(`${API_BASE_URL}/pet-weights`, {
                        timeout: 10000,
                    })
                );
                const filteredWeights = allWeightsResponse.data.filter(weight => 
                    weight.petType.toLowerCase() === petType.toLowerCase()
                );
                console.log(`Filtered weights for ${petType}:`, filteredWeights);
                return filteredWeights;
            } catch (fallbackError) {
                console.error(`Fallback error fetching all pet weights:`, fallbackError);
                throw new Error(`Không thể tải danh sách cân nặng cho loại thú ${petType}`);
            }
        }
    },

    getPetServices: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pet-services`, {
                timeout: 10000,
            });
            console.log('Pet services fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pet services:', error);
            throw new Error('Không thể tải danh sách dịch vụ');
        }
    },

    getPetServicesByType: async (petType) => {
        try {
            console.log(`Fetching services for pet type: ${petType}`);
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/pet-services/by-type/${petType}`, {
                    timeout: 10000,
                })
            );
            console.log(`Pet services for ${petType} fetched:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching pet services for ${petType}:`, error);
            try {
                console.log(`Falling back to fetching all services and filtering by type: ${petType}`);
                const allServicesResponse = await retryRequest(() => 
                    axios.get(`${API_BASE_URL}/pet-services`, {
                        timeout: 10000,
                    })
                );
                const filteredServices = allServicesResponse.data.filter(service => 
                    service.petType.toLowerCase() === petType.toLowerCase()
                );
                console.log(`Filtered services for ${petType}:`, filteredServices);
                return filteredServices;
            } catch (fallbackError) {
                console.error(`Fallback error fetching all pet services:`, fallbackError);
                throw new Error(`Không thể tải danh sách dịch vụ cho loại thú ${petType}`);
            }
        }
    },

    getPetServicePrice: async (petServiceId, petWeightId) => {
        try {
            console.log(`Fetching price for petServiceId: ${petServiceId}, petWeightId: ${petWeightId}`);
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/pet-services/price`, {
                    params: { petServiceId, petWeightId },
                    timeout: 10000,
                })
            );
            console.log('Pet service price fetched:', response.data);
            return response.data.price || 0;
        } catch (error) {
            console.error('Error fetching pet service price:', error);
            throw new Error('Không thể tải giá dịch vụ');
        }
    },

    getRefundedAppointments: async (filter = 'pending') => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/refunded`, {
                params: { filter }, // Truyền filter vào query params
                timeout: 10000,
            });
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching refunded appointments:', error);
            throw new Error(error.message || 'Không thể tải danh sách lịch hẹn hoàn tiền');
        }
    },

    updateRefundStatus: async (appointmentId, payload) => {
        try {
            console.log(`Updating refund status for appointment ${appointmentId} with payload:`, payload);
            const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/refund`, payload);
            console.log('Update refund status response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating refund status:', error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái hoàn tiền');
        }
    },

    getAppointmentHistory: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/history`, {
                timeout: 10000,
            });
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching appointment history:', error);
            throw new Error(error.message || 'Không thể tải lịch sử lịch hẹn');
        }
    },

    searchHistoryByPhone: async (phone) => {
        try {
            console.log(`Searching appointment history for phone: ${phone}`);
            const response = await axios.get(`${API_BASE_URL}/appointments/history/search`, {
                params: { phone },
                timeout: 10000,
            });
            console.log('Appointment history search response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error searching appointment history by phone:', error);
            throw new Error(error.response?.data?.message || 'Không thể tìm kiếm lịch sử theo số điện thoại');
        }
    },

    getRefundedAppointmentsPendingCount: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointments/refunded/pending-count`, {
                timeout: 10000,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching refunded appointments pending count:', error);
            throw new Error(error.message || 'Không thể tải số lượng lịch hẹn hoàn tiền đang chờ');
        }
    },

    getTransactionsByAppointmentId: async (appointmentId) => {
        try {
            console.log(`Fetching transactions for appointment ID ${appointmentId}`);
            
            const response = await retryRequest(() => 
                axios.get(`${API_BASE_URL}/appointments/${appointmentId}/transactions`, {
                    timeout: 10000,
                })
            );
            
            console.log(`Transactions for appointment ${appointmentId}:`, response.data);
            
            if (!response.data) {
                console.warn(`No transactions returned for appointment ${appointmentId}`);
                return [];
            }
            
            if (!Array.isArray(response.data)) {
                console.error(`Invalid response format for transactions (expected array):`, response.data);
                if (typeof response.data === 'object') {
                    console.log('Attempting to convert object to array');
                    return [response.data].filter(Boolean);
                }
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error(`Error in getTransactionsByAppointmentId for appointment ${appointmentId}:`, error);
            
            if (!error.response) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            const errorMsg = error.response?.data?.message || 
                            error.response?.data || 
                            error.message || 
                            `Không thể tải danh sách giao dịch cho lịch hẹn #${appointmentId}`;
                            
            console.error(`Server error in getTransactionsByAppointmentId: ${errorMsg}`, error.response?.data);
            throw new Error(errorMsg);
        }
    },

    getRefundUserId: async (appointmentId) => {
        try {
            console.log(`Fetching refund userId for appointment ${appointmentId}`);
            const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}/refund-user`, {
                timeout: 10000,
            });
            console.log(`Refund userId for appointment ${appointmentId}:`, response.data);
            return response.data; // Trả về userId hoặc null nếu không tìm thấy
        } catch (error) {
            console.error(`Error fetching refund userId for appointment ${appointmentId}:`, error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin nhân viên thực hiện hoàn tiền');
        }
    },

    getCurrentUserId,
};

export default BookingService;