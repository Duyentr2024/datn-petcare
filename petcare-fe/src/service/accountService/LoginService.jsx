import Cookies from "js-cookie";
import API_BASE_URL from "../../config"; // Import từ file config.js

const LoginService = {
  // Hàm xử lý lỗi chung
  async handleResponse(response, defaultErrorMsg) {
    if (!response.ok) {
      // Kiểm tra nội dung phản hồi
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        // Nếu là JSON, parse nó
        const errorData = await response.json();
        throw new Error(errorData.message || defaultErrorMsg);
      } else {
        // Nếu không phải JSON, đọc text
        const errorText = await response.text();
        throw new Error(errorText || defaultErrorMsg);
      }
    }
    
    const data = await response.json();
    Cookies.set("accessToken", data.accessToken, { expires: 7 });
    return data;
  },

  //API đăng nhập
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      return await LoginService.handleResponse(response, "Đăng nhập thất bại");
    } catch (error) {
      throw error;
    }
  },

  //API đăng nhập bằng google
  googleLogin: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      return await LoginService.handleResponse(response, "Đăng nhập Google thất bại");
    } catch (error) {
      throw error;
    }
  },

  //API đăng nhập bằng facebook
  facebookLogin: async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/facebook-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      
      return await LoginService.handleResponse(response, "Đăng nhập Facebook thất bại");
    } catch (error) {
      throw error;
    }
  },

  //Hàm đăng xuất
  logout: () => {
    Cookies.remove("accessToken");
  },
};

export default LoginService;
