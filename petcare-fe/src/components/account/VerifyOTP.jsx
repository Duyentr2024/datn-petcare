import React, { useState, useEffect } from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import otpService from "../../service/accountService/OtpService"; // Đảm bảo đúng đường dẫn tới otpService.js
import Swal from "sweetalert2"; // Import sweetalert2
const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate for redirect

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Chỉ chấp nhận số từ 0-9
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      document.getElementById("otp-5").focus(); // Chuyển focus đến ô cuối
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Swal.fire({
        icon: "error",
        title: "Vui lòng nhập đầy đủ mã OTP.",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await otpService.verifyOtp(email, otpCode);

      console.log("API Response:", response); // Kiểm tra dữ liệu trả về

      // Chấp nhận cả hai response từ API
      if (
        response === "OTP xác nhận thành công!" ||
        response === "Account created successfully!"
      ) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Bạn sẽ được chuyển đến trang đăng nhập.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: response, // Hiển thị lỗi từ server
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message || "Đã xảy ra lỗi.",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await otpService.resendOtp(email);
      Swal.fire({
        icon: "info",
        title: "Mã OTP mới đã được gửi!",
        showConfirmButton: true,
      });

      localStorage.setItem("otpSentTime", Date.now().toString()); // Lưu thời gian gửi OTP mới
      setCountdown(60); // Reset đếm ngược
      setCanResend(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message || "Đã xảy ra lỗi.",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromUrl = queryParams.get("email");
    const otpFromUrl = queryParams.get("otp");

    // Kiểm tra email từ URL trước
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else {
      // Fallback về email từ localStorage hoặc state nếu có
      const emailFromState = location.state?.email;
      if (emailFromState) {
        setEmail(emailFromState);
      } else {
        const savedEmail = localStorage.getItem("email"); // Nếu không có trong state, kiểm tra localStorage
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
    }

    // Log email để kiểm tra
    console.log(
      "Email received:",
      emailFromUrl || location.state?.email || "No email found"
    );

    // Kiểm tra mã OTP từ URL và set vào state nếu hợp lệ
    if (otpFromUrl && otpFromUrl.length === 6) {
      setOtp(otpFromUrl.split(""));
    }

    // IntersectionObserver để lazy load hình ảnh
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.5 }
    );

    const images = document.querySelectorAll(".load-img");
    images.forEach((img) => {
      observer.observe(img);
    });

    images.forEach((img) => {
      if (img.getBoundingClientRect().top <= window.innerHeight * 0.5) {
        img.classList.add("in-view");
      }
    });

    return () => {
      images.forEach((img) => {
        observer.unobserve(img);
      });
    };
  }, [location.search, location.state]); // Phụ thuộc vào search params và state

  useEffect(() => {
    const lastSentTime = localStorage.getItem("otpSentTime");

    if (lastSentTime) {
      const elapsedTime = Math.floor(
        (Date.now() - parseInt(lastSentTime, 10)) / 1000
      );
      const remainingTime = 60 - elapsedTime;

      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setCanResend(false);
      } else {
        setCountdown(0);
        setCanResend(true);
      }
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 0) return prev - 1;
        setCanResend(true);
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r flex items-center justify-center min-h-screen ">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row max-w-4xl w-full border p-6 relative hover:bg-white transition-all duration-300">
        {/* Hình bên trái */}
        <div className="p-10 items-center justify-center w-full lg:w-1/2 rounded-lg load-img hidden lg:flex">
          <img
            src="https://placehold.co/600x600"
            alt="Logo with petcare"
            className="w-full h-auto z-10 hidden md:inline rounded-full shadow-lg"
          />
        </div>

        <div className="p-10 w-full lg:w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-yellow-500 mb-6 text-center">
            Xác nhận OTP
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Nhập mã OTP 6 số được gửi đến email của bạn.
          </p>

          <div className="flex justify-center space-x-2 mb-6">
            {otp.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste} // Xử lý dán mã
                className="w-12 h-12 text-xl text-center border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
            ))}
          </div>

          {message && (
            <p className="text-center text-red-500 mb-4">{message}</p>
          )}

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg flex items-center group space-x-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
            >
              <span>{loading ? "Đang xử lý..." : "Xác nhận"}</span>
              <FaArrowCircleRight className="h-5 w-5 transform transition-all duration-300 group-hover:text-yellow-300 group-hover:translate-x-2" />
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-500">
              Bạn chưa nhận được mã?{" "}
              <button
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className={`font-bold ml-1 ${
                  canResend
                    ? "text-yellow-500 hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {canResend ? "Gửi lại OTP" : `Gửi lại sau ${countdown}s`}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
