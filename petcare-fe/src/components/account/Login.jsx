import React, { useState, useEffect } from "react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { FaArrowCircleRight, FaFacebookF, FaGoogle } from "react-icons/fa";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ React Router

import LoginService from "../../service/accountService/LoginService";
const Login = () => {
  // khai báo các state cần thiết
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(""); // State lưu email
  const [password, setPassword] = useState(""); // State lưu password
  const [token, setToken] = useState(null); // Thêm state để lưu token

  const navigate = useNavigate();
  // Ẩn hiện mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Tạo observer để theo dõi khi phần tử vào view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view"); // Thêm lớp khi phần tử vào vùng nhìn thấy
          }
        });
      },
      {
        threshold: 0.5, // Khi phần tử có ít nhất 50% diện tích vào vùng nhìn thấy
      }
    );

    // Chọn tất cả các phần tử .load-img để theo dõi
    const images = document.querySelectorAll(".load-img");
    images.forEach((img) => {
      observer.observe(img); // Theo dõi phần tử khi vào view
    });

    // Đảm bảo hiệu ứng xảy ra ngay khi trang được tải
    images.forEach((img) => {
      // Kiểm tra nếu phần tử đã vào view khi tải trang
      if (img.getBoundingClientRect().top <= window.innerHeight * 0.5) {
        img.classList.add("in-view"); // Nếu có, áp dụng lớp in-view
      }
    });

    // Cleanup observer khi component bị unmount
    return () => {
      images.forEach((img) => {
        observer.unobserve(img);
      });
    };
  }, []);

  // Xử lý đăng nhập
  const handleLogin = async () => {
    try {
      const data = await LoginService.login(email, password);
      Swal.fire({
        title: "Đăng nhập thành công!",
        text: `Xin chào ${data.fullName}`,
        icon: "success",
        confirmButtonText: "OK",
      });

        
      if (data.roleName === "ADMIN") {
        navigate("/admin");
      } else if (data.roleName === "Nhân viên") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại!",
        text: error.message,
      });
    }
  };

  

  // Hàm xử lý đăng nhập bằng Google
  const handleGoogleLogin = async (response) => {
    if (response && response.credential) {
      try {
        const data = await LoginService.googleLogin(response.credential);
        Swal.fire({
          title: "Đăng nhập thành công!",
          text: `Xin chào ${data.fullName}`,
          icon: "success",
          confirmButtonText: "OK",
        });
  
        navigate("/");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Đăng nhập Google thất bại!",
          text: error.message,
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập!",
        text: "Không thể lấy token từ Google. Vui lòng thử lại.",
      });
    }
  };

  const handleFacebookLogin = (response) => {
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;
      window.FB.api(
        "/me",
        { fields: "id,name,email,picture" }, // Thêm 'picture' để lấy avatar
        async function (user) {
          try {
             console.log("Facebook Token:", accessToken); // Log token để kiểm tra
            const data = await LoginService.facebookLogin({
              id: user.id,
              name: user.name,
              email: user.email || "", // Đảm bảo email không bị `undefined`
              accessToken: response.authResponse.accessToken,
              imageUrl: user.picture?.data?.url || "", // 📌 Gửi ảnh đại diện lên BE
            });
  
            console.log("data", data);
  
            Swal.fire({
              title: "Đăng nhập thành công!",
              text: `Xin chào ${data.fullName}`,
              icon: "success",
              confirmButtonText: "OK",
            });
  
            navigate("/");
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Đăng nhập Facebook thất bại!",
              text: error.response?.data?.message || "Đã xảy ra lỗi!",
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: "warning",
        title: "Đã hủy đăng nhập!",
        text: "Vui lòng thử lại.",
      });
    }
  };
  
  

  useEffect(() => {
    // Khởi tạo Google Sign-In
    window.google.accounts.id.initialize({
      client_id:
        "854614351620-s8cmgi8ticqj4p2jlqedf4drbis3s7oj.apps.googleusercontent.com",
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"), // Thêm ID cho button
      { theme: "outline", size: "large" }
    );

    // Khởi tạo Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "536613939122715", // Thay thế bằng App ID của bạn
        cookie: true, // Enable cookies để server có thể truy cập phiên
        xfbml: true, // Parse các social plugin trên trang
        version: "v16.0", // Phiên bản API của Facebook
      });
    };

    // Tải SDK của Facebook
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);


  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="bg-gradient-to-r flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row max-w-4xl w-full border p-6 relative hover:bg-white transition-all duration-300">
        <div className="p-10 flex items-center justify-center w-full lg:w-1/2 rounded-lg load-img">
          {/* Ẩn logo trên các màn hình có chiều rộng nhỏ hơn 1024px */}
          <img
            src="https://placehold.co/600x600"
            alt="Logo with petcare"
            className="w-full h-auto z-10 hidden md:inline rounded-full shadow-lg"
          />
        </div>

        <div className="p-10 w-full lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-yellow-500 mb-6 text-center">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Input Email */}
            <div className="mb-4">
              <div className="flex flex-col-reverse relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer outline-none border pl-2 py-2 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Email
                </span>
              </div>
            </div>

            {/* Input Password */}
            <div className="mb-6">
              <div className="flex flex-col-reverse relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer outline-none border pl-2 py-2 pr-10 duration-500 border-gray-300 focus:border-dashed focus:ring-2 focus:ring-yellow-500 focus:rounded-md w-full rounded-lg shadow-md"
                />
                <span className="pl-2 text-gray-500 duration-500 opacity-0 peer-focus:opacity-100 -translate-y-5 peer-focus:translate-y-0">
                  Mật khẩu
                </span>
                <i
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 transform -translate-y-1/4 cursor-pointer bg-white p-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[#FBB321]" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#FBB321]" />
                  )}
                </i>
              </div>
            </div>

            {/* Other Form Elements */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="submit"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg flex items-center group space-x-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
              >
                <span className="relative overflow-hidden">
                  <span className="absolute inset-0 transform translate-x-[-100%] group-hover:translate-x-0 transition-all duration-300"></span>
                  <span className="relative z-10">Đăng nhập</span>
                </span>
                <FaArrowCircleRight className="h-5 w-5 transform transition-all duration-300 group-hover:text-yellow-300 group-hover:translate-x-2" />
              </button>
              {/* Ẩn link quên mật khẩu trên màn hình nhỏ */}
              <a
                href="/forgotPassword"
                className="text-yellow-500 hover:underline hidden md:inline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <div className="flex items-center justify-center mb-6">
              <span className="text-gray-500">Đăng nhập qua mạng xã hội</span>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* Ẩn các nút mạng xã hội trên màn hình nhỏ */}
              <button
               type="button"
               onClick={() =>
                   window.FB.login(handleFacebookLogin, {scope: "email"})
               } // Kích hoạt modal đăng nhập Facebook
              className="flex items-center justify-center gap-3 h-[40px] border border-gray-300 rounded-md font-medium hover:bg-gray-100 w-[219px] max-w-xs">
                <img
                  src="https://www.material-tailwind.com/logos/logo-facebook.png"
                  alt="facebook"
                  className="h-6 w-6"
              />
              Facebook
              </button>
              <button
                id="google-login-button"
                type="button"
                onClick={() => window.google.accounts.id.prompt()} // Kích hoạt modal đăng nhập Google

              >
                <FaGoogle className="text-white" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-gray-500">
                Bạn chưa có tài khoản?{" "}
                <a href="/register" className="text-yellow-500 hover:underline">
                  Đăng ký ngay
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );


};

export default Login;
