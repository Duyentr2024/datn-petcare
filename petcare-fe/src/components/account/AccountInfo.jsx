import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Import hook useAuth từ context
import "react-image-crop/dist/ReactCrop.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie"; // Import useCookies
import Swal from "sweetalert2";
import { storage, ref, uploadBytesResumable, getDownloadURL } from "../../firebaseConfig"; 
import { decodeToken } from "../utils/jwt"; // Hàm decodeToken đã viết
import UserUpdateService from "../../service/accountService/UserUpdateService";
const AccountInfo = () => {
  const [selectedItem, setSelectedItem] = useState("Thông tin tài khoản"); // Mục mặc định
  const [cookies, setCookie] = useCookies(["accessToken"]); // Lấy setCookie
  const { user, token, setUser, setToken } = useAuth(); // Lấy setUser từ context
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    setSelectedItem(item); // Cập nhật trạng thái được chọn
  };

  useEffect(() => {
    const token = cookies.accessToken; // Lấy token từ Cookie
  
    if (!token) {
      console.log("Không có token, chuyển hướng về login...");
      navigate("/login"); // Chuyển hướng về trang đăng nhập
      return;
    }
  
    const decoded = decodeToken(token);
    if (decoded) {
      setIsAuthenticated(true);
    } else {
      console.log("Token không hợp lệ, chuyển hướng về login...");
      navigate("/login");
    }
  }, [cookies.accessToken, navigate]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    registration_date: "",
    imageUrl: "",
    role: "",
    totalSpent: "",
  });
  console.log(formData);
  // Cập nhật state khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        registration_date: user.registration_date || "",
        role: user.role || "",
        totalSpent: user.totalSpent || "",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [user]);

  // Hàm xử lý khi nhập dữ liệu
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // Hàm gửi yêu cầu cập nhật thông tin người dùng
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(?:\+84|0)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào trước khi gửi request
    if (!formData.phone || !validatePhoneNumber(formData.phone)) {
      return Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Số điện thoại không hợp lệ. Hãy nhập đúng định dạng!",
      });
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/update/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const { user: updatedUser, token: newToken } = result;

        // Cập nhật token và user mới
        setToken(newToken);
        setCookie("accessToken", newToken, { path: "/" });
        setUser(updatedUser);

        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Cập nhật thông tin thành công.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Xử lý lỗi cụ thể từ server
        if (result.errors) {
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: result.errors.join("\n"),
          });
        } else {
          throw new Error(result.error || "Cập nhật thông tin thất bại");
        }
      }
    } catch (error) {
      console.error("Cập nhật thông tin thất bại:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Có lỗi xảy ra khi cập nhật thông tin.",
      });
    }
  };

  // Hàm xử lý upload avatar
 
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const updatedUser = await UserUpdateService.uploadAvatar(user.userId, file, token);
      setUser(updatedUser);
  
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật avatar thành công.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message,
      });
    }
  };
  

  return (
    <>
      <div className="flex justify-between">
        <form>
          {user ? (
            <div className="flex flex-col gap-6 w-[500px]">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="mt-1 w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                  value={formData.fullName}
                  onChange={handleChange} // Thêm onChange để chỉnh sửa
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                  value={formData.phone}
                  onChange={handleChange} // Thêm onChange để chỉnh sửa
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                  value={formData.email}
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Ngày đăng ký
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                  value={formData.registration_date}
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Điểm tích lũy
                </label>
                <input
                  type="text"
                  name="role"
                  className="mt-1 block w-full sm:w-96 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                  value={formData.totalSpent}
                  readOnly
                />
              </div>
            </div>
          ) : (
            <Link to="/login"></Link>
          )}
          <div className="mt-6 ml-[117px] flex justify-start">
            <button
              type="button"
              onClick={handleSubmit} // Xử lý submit ở đây
              className="bg-[#FBB321] text-white py-2 px-4 rounded-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBB321]"
            >
              Cập nhật thông tin
            </button>
          </div>
        </form>

        {/* Avatar upload section */}
        <div className="mt-6 flex justify-end">
          <div className="text-center">
            <img
              src={user?.imageUrl || "https://i.pinimg.com/originals/9f/c2/12/9fc2126eec2c0a3876e3f2097af9b983.gif"}
              className="rounded-full object-cover border-4 border-[#FBB321] mb-2 cursor-pointer h-[150px] w-[150px]"
              onClick={() => document.getElementById("avatarInput").click()}
            />
            <input
              type="file"
              id="avatarInput"
              className="hidden"
              accept="image/jpeg, image/png"
              onChange={handleAvatarUpload}
            />
            <p className="text-sm text-gray-500">
              Dung lượng file tối đa <span className="font-bold">1MB</span>
            </p>
            <p className="text-sm text-gray-500">Định dạng: JPEG, PNG</p>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default AccountInfo;
