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

// Debug log
console.log('Environment API URL:', envApiUrl);

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

// Final debug log
console.log('Final API_BASE_URL:', API_BASE_URL);

const BookingService = {
  getPetsByAppointmentId: async (appointmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}/pets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pets for appointment:', error);
      throw error;
    }
  },
  
  getEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      console.log('Employees API response:', response.data);
      const activeEmployees = response.data
        .filter(emp => emp.status === 'active')
        .map(emp => ({
          value: emp.employeeId.toString(),
          label: emp.fullName,
        }));
      return activeEmployees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy danh sách nhân viên';
      throw new Error(errorMessage);
    }
  },
  validateAppointment: async (payload) => {
    try {
      // Đảm bảo payload có appointmentSlots thay vì selectedSlots
      const modifiedPayload = { ...payload };
      
      // Nếu payload có selectedSlots nhưng không có appointmentSlots
      if (modifiedPayload.selectedSlots && !modifiedPayload.appointmentSlots) {
        // Chuyển đổi từ selectedSlots thành appointmentSlots
        modifiedPayload.appointmentSlots = modifiedPayload.selectedSlots.map(slotId => {
          const parts = slotId.split('-');
          const time = parts[0];
          const slotIndex = parts.length > 1 ? parseInt(parts[1], 10) : 0;
          return {
            time: time,
            slotIndex: slotIndex
          };
        });
        
        // Xóa selectedSlots để không gửi dữ liệu thừa
        delete modifiedPayload.selectedSlots;
      }
      
      console.log("Sending validation data to backend:", modifiedPayload);
      
      // Thêm kiểm tra và định dạng lại time nếu cần
      if (modifiedPayload.time && typeof modifiedPayload.time === 'string') {
        // Đảm bảo time ở định dạng "HH:MM"
        if (!/^\d{2}:\d{2}$/.test(modifiedPayload.time)) {
          const [hours, minutes] = modifiedPayload.time.split(':').map(Number);
          modifiedPayload.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      // Trước khi validate, thực hiện kiểm tra xem slot có đang được đặt bởi ai đó không
      const slotIndexes = modifiedPayload.appointmentSlots.map(slot => slot.slotIndex);
      const slotTime = modifiedPayload.time;
      const slotDate = modifiedPayload.date;
      
      // Force refresh booked slots từ server trước khi tiếp tục, đảm bảo dữ liệu mới nhất
      try {
        await BookingService.getBookedSlots(slotDate);
      } catch (refreshError) {
        console.error("Error refreshing booked slots before validation:", refreshError);
        // Vẫn tiếp tục, không dừng lại ở đây
      }
      
      // Kiểm tra tính khả dụng của slot
      const slotsAvailable = await BookingService.checkSlotAvailability(
        slotDate, slotTime, slotIndexes
      );
      
      if (!slotsAvailable) {
        throw new Error("Một hoặc nhiều slot đã được đặt. Vui lòng chọn slot khác hoặc làm mới trang.");
      }
      
      const response = await axios.post(`${API_BASE_URL}/appointments/validate`, modifiedPayload);
      console.log("Backend validation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Full validation error:", error);
      
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error validating appointment:', errorMessage);
      
      if (error.response && error.response.data) {
        console.error("Detailed validation error data:", error.response.data);
      }
      
      throw new Error(errorMessage);
    }
  },

  bookAppointment: async (payload) => {
    try {
      // Log dữ liệu để debug
      console.log("Sending appointment data to backend:", payload);
  
      // Thêm kiểm tra và định dạng lại time nếu cần
      if (payload.time && typeof payload.time === 'string') {
        // Đảm bảo time ở định dạng "HH:MM"
        if (!/^\d{2}:\d{2}$/.test(payload.time)) {
          const [hours, minutes] = payload.time.split(':').map(Number);
          payload.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
  
      const response = await axios.post(`${API_BASE_URL}/appointments/create`, payload, {
        params: { paymentStatus: payload.paymentStatus || '' },
      });
  
      console.log("Backend appointment response:", response.data);
      
      // Lưu thông tin appointment vào localStorage để có thể truy cập sau khi reload
      if (response.data && response.data.data) {
        const appointmentData = response.data.data;
        
        // Lưu thông tin appointmentId để truy xuất thông tin khi cần
        localStorage.setItem('lastAppointmentId', appointmentData.appointmentId);
        localStorage.setItem('lastAppointmentData', JSON.stringify(appointmentData));
        
        // Lưu thông tin về slot đã đặt
        saveBookedSlotsFromAppointment(appointmentData);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return null;
    }
  }, 

  getBookingStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking-enabled`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching booking status:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getAvailableSlots: async (date) => {
    try {
        console.log('Fetching available slots for date:', date);
        console.log('Using API URL:', `${API_BASE_URL}/time-slots?date=${date}`);
        
        const response = await axios.get(`${API_BASE_URL}/time-slots`, { 
            params: { date },
            // Add timeout to prevent hanging requests
            timeout: 10000
        });
        
        console.log('Time slots API response data:', JSON.stringify(response.data, null, 2));
        
        // Log chi tiết khung giờ 18:00
        const afternoonSlots = response.data?.afternoon || [];
        const slot1800 = afternoonSlots.find(slot => slot.hour === "18:00");
        if (slot1800) {
            console.log('Slot 18:00 details:', slot1800);
        } else {
            console.log('Slot 18:00 not found in afternoon slots');
        }

        return response.data || { morning: [], afternoon: [] };
    } catch (error) {
        console.error('Error fetching available slots:', error);
        // Log more detailed error information
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        
        return { morning: [], afternoon: [] };
    }
},

  getBookedSlots: async (date) => {
    try {
      // Khởi tạo mảng lưu trữ slots
      let bookedSlots = [];
      let apiSuccess = false;
      
      // Gọi API lấy danh sách slot đã đặt
      try {
        const response = await axios.get(`${API_BASE_URL}/appointments/slots`, { params: { date } });
        // Log dữ liệu để debug
        console.log('Booked slots API response:', response.data);

        // Kiểm tra cấu trúc dữ liệu trả về
        if (response.data) {
          apiSuccess = true;
          
          // Chuyển đổi định dạng để phù hợp với frontend
          // Xử lý trường hợp dữ liệu là mảng
          if (Array.isArray(response.data)) {
            bookedSlots = response.data.map(slot => ({
              time: slot.time || slot.hour || "",
              slotIndex: slot.slotIndex || slot.index || 0,
              isCurrentUser: !!slot.isCurrentUser
            }));
          }
          // Xử lý trường hợp dữ liệu có cấu trúc { userBookedSlots, allBookedSlots }
          else if (response.data.userBookedSlots || response.data.allBookedSlots) {
            // Các slot của user hiện tại
            if (Array.isArray(response.data.userBookedSlots)) {
              bookedSlots = [
                ...bookedSlots,
                ...response.data.userBookedSlots.map(slot => ({
                  time: slot.time || slot.hour || "",
                  slotIndex: slot.slotIndex || slot.index || 0,
                  isCurrentUser: true
                }))
              ];
            }

            // Các slot khác đã được đặt
            if (Array.isArray(response.data.allBookedSlots)) {
              bookedSlots = [
                ...bookedSlots,
                ...response.data.allBookedSlots
                  .filter(slot => !bookedSlots.some(bs =>
                    bs.time === (slot.time || slot.hour || "") &&
                    bs.slotIndex === (slot.slotIndex || slot.index || 0)
                  ))
                  .map(slot => ({
                    time: slot.time || slot.hour || "",
                    slotIndex: slot.slotIndex || slot.index || 0,
                    isCurrentUser: false
                  }))
              ];
            }
          }
        }
      } catch (apiError) {
        console.error('Error calling /appointments/slots API:', apiError);
        // Không return ở đây, thử phương án dự phòng
      }
      
      // Phương án dự phòng: Nếu API không thành công, thử sử dụng time-slots API
      if (!apiSuccess) {
        try {
          console.log("Trying to use time-slots API as backup for booked slots");
          const timeSlotResponse = await axios.get(`${API_BASE_URL}/time-slots`, {
            params: { date }
          });
          
          if (timeSlotResponse.data) {
            console.log("Time slots data for getting booked slots:", timeSlotResponse.data);
            
            // Kết hợp cả sáng và chiều
            const allSlots = [
              ...(timeSlotResponse.data.morning || []),
              ...(timeSlotResponse.data.afternoon || [])
            ];
            
            // Xử lý trạng thái booked
            allSlots.forEach(timeBlock => {
              if (timeBlock.bookedSlots && timeBlock.bookedSlots > 0) {
                // Tạo các slot đã đặt dựa trên thông tin bookedSlots
                // Giả định rằng các slotIndex bắt đầu từ 0 và tăng dần
                for (let i = 0; i < timeBlock.bookedSlots; i++) {
                  bookedSlots.push({
                    time: timeBlock.hour,
                    slotIndex: i,
                    isCurrentUser: false // Không thể biết slot thuộc về ai, coi như không phải user hiện tại
                  });
                }
              }
            });
          }
        } catch (backupError) {
          console.error("Error using time-slots as backup:", backupError);
        }
      }
      
      // Thêm các slot từ localStorage nếu là cùng ngày và chưa có trong API response
      const localDate = localStorage.getItem('lastAppointmentDate');
      if (localDate === date) {
        const localSlots = JSON.parse(localStorage.getItem('lastBookedSlots') || '[]');
        
        localSlots.forEach(localSlot => {
          // Kiểm tra xem slot đã có trong danh sách chưa
          const existingSlot = bookedSlots.find(
            slot => slot.time === localSlot.time && slot.slotIndex === localSlot.slotIndex
          );
          
          // Nếu chưa có, thêm vào danh sách với isCurrentUser=true
          if (!existingSlot) {
            bookedSlots.push({
              ...localSlot,
              isCurrentUser: true
            });
          }
        });
      }

      console.log("Final processed booked slots:", bookedSlots);
      return { bookedSlots };
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      return { bookedSlots: [] };
    }
  },

  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, null, {
        params: { reason },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error canceling appointment:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching appointment:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getCustomerAppointments: async (customerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/${customerId}/appointments`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error fetching customer appointments:', errorMessage);
      throw new Error(errorMessage);
    }
  },
  
  // Hàm lưu thông tin slot đã đặt vào localStorage
  saveBookedSlots: (selectedSlots, date) => {
    if (!selectedSlots || !selectedSlots.length || !date) return;
    
    // Chuyển đổi từ định dạng "HH:MM-index" sang object
    const formattedSlots = selectedSlots.map(slotId => {
      const [time, index] = slotId.split('-');
      return {
        time: time,
        slotIndex: parseInt(index, 10)
      };
    });
    
    // Lưu vào localStorage để duy trì sau khi trang được tải lại
    localStorage.setItem('lastBookedSlots', JSON.stringify(formattedSlots));
    localStorage.setItem('lastAppointmentDate', date);
    
    console.log('Saved booked slots to localStorage:', formattedSlots);
  },

  // Thêm hàm reserveSlots để "giữ chỗ" ngay khi bắt đầu thanh toán
  reserveSlots: async (slots, date, customerId = null) => {
    try {
      if (!slots || !slots.length || !date) {
        console.error('Missing required data for slot reservation');
        return false;
      }
      
      console.log('Reserving slots:', slots, 'for date:', date);
      
      // Chuyển đổi từ định dạng "HH:MM-index" sang object
      const formattedSlots = Array.isArray(slots) ? slots.map(slotId => {
        const [time, index] = slotId.split('-');
        return {
          time: time,
          slotIndex: parseInt(index, 10)
        };
      }) : slots;
      
      // Gửi thông tin lên server để đánh dấu slot đang được thanh toán
      const response = await axios.post(`${API_BASE_URL}/time-slots/reserve`, {
        date,
        slots: formattedSlots,
        customerId, // Có thể null nếu chưa đăng nhập
        reservationTime: new Date().toISOString(),
      });
      
      console.log('Slot reservation response:', response.data);
      return response.data.success || false;
    } catch (error) {
      console.error('Error reserving slots:', error);
      return false;
    }
  },
  
  // Hàm để giải phóng slots nếu người dùng hủy thanh toán
  releaseSlots: async (slots, date) => {
    try {
      if (!slots || !slots.length || !date) return false;
      
      // Chuyển đổi định dạng slot nếu cần
      const formattedSlots = Array.isArray(slots) ? slots.map(slotId => {
        if (typeof slotId === 'string' && slotId.includes('-')) {
          const [time, index] = slotId.split('-');
          return {
            time: time,
            slotIndex: parseInt(index, 10)
          };
        }
        return slotId;
      }) : slots;
      
      // Gọi API để giải phóng slot
      const response = await axios.post(`${API_BASE_URL}/time-slots/release`, {
        date,
        slots: formattedSlots
      });
      
      return response.data.success || false;
    } catch (error) {
      console.error('Error releasing slots:', error);
      return false;
    }
  },

  // Kiểm tra xem slot có available không trước khi đặt
  checkSlotAvailability: async (date, time, slotIndexes) => {
    try {
      console.log(`Checking availability for date: ${date}, time: ${time}, slots: ${slotIndexes.join(',')}`);
      
      // Trước tiên, kiểm tra xem API endpoint có tồn tại không
      try {
        // Sử dụng API của SlotController thay vì AppointmentController
        const response = await axios.get(`${API_BASE_URL}/slots/available`, {
          params: {
            date: date,
            time: time
          }
        });
        
        console.log("Slot availability check response:", response.data);
        
        // Kiểm tra số lượng slot còn trống so với số slot cần đặt
        if (response.data && typeof response.data.availableSlots !== 'undefined') {
          const availableSlots = response.data.availableSlots || 0;
          return availableSlots >= slotIndexes.length;
        }
      } catch (apiError) {
        console.error("Error calling /slots/available:", apiError);
        // Không return false ở đây
      }
      
      // Backup plan: Sử dụng dữ liệu từ API time-slots
      console.log("Trying to use time-slots data for availability check");
      const timeSlotResponse = await axios.get(`${API_BASE_URL}/time-slots`, { 
        params: { date: date } 
      });
      
      if (timeSlotResponse.data) {
        console.log("Time slots data for availability check:", timeSlotResponse.data);
        
        // Tìm thời gian block phù hợp (sáng/chiều)
        const allSlots = [
          ...(timeSlotResponse.data.morning || []),
          ...(timeSlotResponse.data.afternoon || [])
        ];
        
        // Tìm block thời gian matching với time
        const timeBlock = allSlots.find(slot => slot.hour === time);
        
        if (timeBlock) {
          console.log("Found matching time block:", timeBlock);
          // Kiểm tra xem có đủ slot trống không
          return (timeBlock.availableSlots || (timeBlock.totalSlots - timeBlock.bookedSlots)) >= slotIndexes.length;
        }
      }
      
      // Nếu không có cách nào kiểm tra được, tạm thời cho phép đặt
      console.log("No way to check availability, assuming slots are available");
      return true;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      // Tạm thời trả về true để cho phép đặt lịch
      console.log("Due to error, assuming slots are available");
      return true;
    }
  },
  
  // Tạo lịch hẹn tạm thời để "giữ chỗ" trong quá trình thanh toán
  createTempAppointment: async (data) => {
    try {
      // Chuẩn bị dữ liệu
      const tempData = { 
        ...data,
        isTemporary: true,  // Đánh dấu đây là lịch hẹn tạm thời
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()  // 10 phút sau
      };
      
      console.log("Creating temporary appointment:", tempData);
      
      // Gọi API để tạo lịch hẹn tạm thời
      const response = await axios.post(`${API_BASE_URL}/appointments/reserve`, tempData);
      console.log("Temporary appointment response:", response.data);
      
      // Lưu ID lịch hẹn tạm thời vào sessionStorage
      if (response.data && response.data.reservationId) {
        sessionStorage.setItem('tempAppointmentId', response.data.reservationId);
      }
      
      return response.data.success;
    } catch (error) {
      console.error("Error creating temporary appointment:", error);
      return false;
    }
  },
  
  // Hủy lịch hẹn tạm thời nếu người dùng không tiếp tục thanh toán
  cancelTempAppointment: async () => {
    try {
      const tempId = sessionStorage.getItem('tempAppointmentId');
      if (!tempId) {
        console.log("No temporary appointment ID found");
        return false;
      }
      
      console.log(`Cancelling temporary appointment: ${tempId}`);
      
      // Gọi API để hủy lịch hẹn tạm thời
      const response = await axios.post(`${API_BASE_URL}/appointments/cancel-reservation`, {
        reservationId: tempId
      });
      
      // Xóa ID lịch hẹn tạm thời khỏi sessionStorage
      sessionStorage.removeItem('tempAppointmentId');
      
      console.log("Cancel temporary appointment response:", response.data);
      return response.data.success;
    } catch (error) {
      console.error("Error cancelling temporary appointment:", error);
      return false;
    }
  },

  getPendingAppointments: async () => {
    let retries = 0;
    const maxRetries = 5;
    const timeout = 10000;
    const retryDelay = 2000;

    const fetchWithRetry = async () => {
      try {
        console.log(`Fetching PAID appointments (attempt ${retries + 1}/${maxRetries})`);
        const response = await axios.get(`${API_BASE_URL}/appointments`, {
          params: { status: 'PAID' },
          timeout,
        });
        console.log('PAID appointments response:', response.data);

        // Kiểm tra response.data có phải là mảng không
        if (Array.isArray(response.data)) {
          return { data: response.data };
        } else if (response.data && Array.isArray(response.data.data)) {
          return response.data;
        } else {
          console.warn('Response is not an array:', response.data);
          throw new Error('Dữ liệu trả về không đúng định dạng (không phải mảng)');
        }
      } catch (error) {
        console.error(`Error fetching PAID appointments (attempt ${retries + 1}/${maxRetries}):`, error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }

        retries++;
        if (retries < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchWithRetry();
        }

        // Nếu hết số lần retry, trả về mảng rỗng
        console.warn('All retries failed, returning empty array...');
        return { data: [] };
      }
    };

    return fetchWithRetry();
  },

  confirmAppointment: async (appointmentId, staffId) => {
    try {
      console.log(`Confirming appointment ${appointmentId} with staff ${staffId}`);
      
      // First assign staff to the appointment
      await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/assign-staff`, null, {
        params: { staffId }
      });
      
      // Then update status from PAID to CONFIRMED
      const response = await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/update-status`, null, {
        params: { newStatus: 'CONFIRMED' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error confirming appointment:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi xác nhận lịch hẹn';
      throw new Error(errorMessage);
    }
  },

  checkSlotAvailabilityByDate: async (date, requiredSlots = 1) => {
    try {
      const availableSlots = await BookingService.getAvailableSlots(date);
      
      // Check all slots for the day and return those that are available
      const allSlots = [...(availableSlots.morning || []), ...(availableSlots.afternoon || [])];
      const availableTimesWithCount = allSlots.map(slot => ({
        time: slot.hour,
        availableCount: slot.availableSlots,
        isAvailable: slot.availableSlots >= requiredSlots && slot.active
      }));
      
      return availableTimesWithCount;
    } catch (error) {
      console.error('Error checking slot availability by date:', error);
      return [];
    }
  },

  updateAppointment: async (appointmentData) => {
    try {
      console.log('Updating appointment:', appointmentData);
      
      // First update the appointment details
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentData.appointmentId}`, 
        appointmentData
      );
      
      // If there's a status change, update that separately
      if (appointmentData.status) {
        await axios.post(
          `${API_BASE_URL}/appointments/${appointmentData.appointmentId}/update-status`, 
          null, 
          { params: { newStatus: appointmentData.status } }
        );
      }
      
      // Update staff assignments if provided
      if (appointmentData.pets && appointmentData.pets.length > 0) {
        await Promise.all(
          appointmentData.pets.map(pet => {
            if (pet.petId && pet.staffId) {
              return axios.put(
                `${API_BASE_URL}/pets/${pet.petId}/assign-staff`,
                null,
                { params: { staffId: pet.staffId } }
              );
            }
            return Promise.resolve();
          })
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật lịch hẹn';
      throw new Error(errorMessage);
    }
  },
  getConfirmedAppointmentsByDate: async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`, {
        params: { date, status: 'CONFIRMED' },
      });
      console.log('Confirmed appointments response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching confirmed appointments:', error);
      return [];
    }
  },
  removePetFromAppointment: async (appointmentId, petId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}/pets/${petId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
        : error.message || 'Unknown error';
      console.error('Error removing pet from appointment:', errorMessage);
      throw new Error(errorMessage);
    }
  },
  
  updatePetName: async (petId, name) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pets/${petId}/update-name`, null, { 
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pet name:', error);
      throw error;
    }
  },
};

export default BookingService;