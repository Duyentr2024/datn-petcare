import { FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; 

const HeaderStaff = ({ title = "PetCare" }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const [user, setUser] = useState({
    name: "Staff",
    avatar: "https://via.placeholder.com/40",
  });

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Thông tin user từ token:", decoded);
        setUser({
          name: decoded.fullName || "Staff",
          avatar: decoded.imageUrl || "https://via.placeholder.com/40",
        });
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("accessToken"); 
    logout(); 
    navigate("/login"); 
  };

  return (
    <div className="flex justify-between items-center bg-gradient-to-b from-blue-600 to-blue-800 px-6 py-3 text-white shadow-md top-0">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
          <span className="font-medium">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderStaff;