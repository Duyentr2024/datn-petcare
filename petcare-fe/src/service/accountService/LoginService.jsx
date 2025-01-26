import Cookies from "js-cookie";
import API_BASE_URL from "../../config"; // Import từ file config.js

const LoginService = {

    //API đăng nhập
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data = await response.json();
      Cookies.set("accessToken", data.accessToken, { expires: 7 });

      return data;
    } catch (error) {
      throw error;
    }
  },

    //API đăng nhập bằng google
  googleLogin: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Đăng nhập Google thất bại");
      }

      const data = await response.json();
      Cookies.set("accessToken", data.accessToken, { expires: 7 });

      return data;
    } catch (error) {
      throw error;
    }
  },

    //API đăng nhập bằng facebook
  facebookLogin: async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/facebook-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập Facebook thất bại");
      }

      const data = await response.json();
      Cookies.set("accessToken", data.accessToken, { expires: 7 });

      return data;
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
