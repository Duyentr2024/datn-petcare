import axios from "axios";
import API_BASE_URL from "../../config"; // Import từ file config.js

const otpService = {

  // Gửi OTP cho đăng ký tài khoản mới
  sendRegistrationOtp: (email) => {
    return axios.post(`${API_BASE_URL}/api/otp/send-registration-otp`, { email });
  },

  // Xác minh OTP cho đăng ký tài khoản
  verifyRegistrationOtp: (email, otp) => {
    return axios.post(`${API_BASE_URL}/api/otp/verify-registration-otp`, { email, otp })
        .then(response => response.data);
  },

  // Gửi OTP cho quên mật khẩu
  sendResetPasswordOtp: (email) => {
    return axios.post(`${API_BASE_URL}/api/otp/send-reset-password-otp`, { email });
  },

  // **📌 Sửa lỗi: Thêm hàm xác minh OTP quên mật khẩu**
  verifyResetPasswordOtp: (email, otp) => {
    return axios.post(`${API_BASE_URL}/api/otp/verify-reset-password-otp`, { email, otp })
        .then(response => response.data);
  },

  // Gửi lại OTP (cho cả đăng ký và quên mật khẩu)
  resendOtp: (email, otpType) => {
    return axios.post(`${API_BASE_URL}/api/otp/resend-otp`, { email, otpType })
        .then(response => response.data);
  },

  // verifyOtp: async (email, otpCode) => {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/api/otp/verify-${otpType}-otp`, {
  //       email: email, // Đảm bảo email được gửi đi cùng OTP
  //       otp: otpCode,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || "Lỗi xác thực OTP.";
  //   }
  // },
  //
  // resendOtp: async (email) => {
  //   console.log(email);
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/api/otp/resend-otp`, {
  //       email: email // Đảm bảo email được gửi khi yêu cầu gửi lại OTP
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || "Không thể gửi lại OTP.";
  //   }
  // },
};

export default otpService;
