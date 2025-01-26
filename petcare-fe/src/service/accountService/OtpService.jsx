import axios from "axios";
import API_BASE_URL from "../../config"; // Import từ file config.js

const otpService = {
  verifyOtp: async (email, otpCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: email, // Đảm bảo email được gửi đi cùng OTP
        otp: otpCode,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Lỗi xác thực OTP.";
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resend-otp`, { 
        email: email // Đảm bảo email được gửi khi yêu cầu gửi lại OTP
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Không thể gửi lại OTP.";
    }
  },
};

export default otpService;
