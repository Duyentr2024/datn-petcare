import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlineHistory,
  AiOutlineLock,
  AiOutlineHeart,
} from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const SidebarAccount = () => {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(location.pathname);
  const { user } = useAuth();

  useEffect(() => {
    setSelectedItem(location.pathname);
  }, [location]);

  const getRoleLabel = () => {
    if (user?.role === "ADMIN") {
      return "Quản trị viên";
    }
    if (user?.role === "STAFF") {
      return "Nhân viên";
    }
    return "";
  };

  return (
    <div className="w-full bg-[#FBB321] rounded-lg p-6 sticky top-[153px] h-[530px] right-full -translate-x-[40%] z-10 ">
      <div className="flex flex-col items-center">
        <img
          src={user?.imageUrl || "https://placehold.co/100x100"}
          alt="User avatar"
          className="rounded-full mb-4 w-[100px] h-[100px] object-cover"
        />
        <h2 className="text-white text-lg font-bold">
          {user?.fullName || "Guest"}
        </h2>
        {getRoleLabel() && (
          <Link
            to="/admin"
            className="text-white text-sm inline-table hover:underline cursor-pointer"
          >
            {getRoleLabel()}
          </Link>
        )}
      </div>

      <div className="mt-8">
        <Link
          to="/my-account/info"
          onClick={() => setSelectedItem("/my-account/info")}
          className={`flex items-center mb-4 p-2 rounded-full border-2 cursor-pointer transition-all duration-300 text-white border-transparent hover:border-white hover:border-dashed ${
            selectedItem === "/my-account/info"
              ? "border-white border-dashed"
              : ""
          }`}
          style={{
            boxSizing: "border-box",
            padding: "5px",
            margin: "7px 0",
          }}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center border-white border-[1px] border-dashed rounded-full transition-all duration-300 ${
              selectedItem === "/my-account/info"
                ? "bg-white text-[#FBB321] border-dashed"
                : ""
            }`}
          >
            <span
              className={`text-2xl ${
                selectedItem === "/my-account/info"
                  ? "text-[#FBB321]"
                  : "text-white"
              }`}
            >
              <AiOutlineUser />
            </span>
          </div>
          <span
            className={`ml-2 ${
              selectedItem === "/my-account/info" ? "text-white" : "text-white"
            }`}
          >
            Thông tin tài khoản
          </span>
        </Link>

        <Link
          to="/my-account/history"
          onClick={() => setSelectedItem("/my-account/history")}
          className={`flex items-center mb-4 p-2 rounded-full border-dashed cursor-pointer border-2 transition-all duration-300 text-white border-transparent hover:border-white hover:border-2 ${
            selectedItem === "/my-account/history"
              ? "border-white border-dashed"
              : ""
          }`}
          style={{
            boxSizing: "border-box",
            padding: "5px",
            margin: "7px 0",
          }}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center border-white border-[1px] border-dashed rounded-full transition-all duration-300 ${
              selectedItem === "/my-account/history"
                ? "bg-white text-[#FBB321]"
                : ""
            }`}
          >
            <span
              className={`text-2xl ${
                selectedItem === "/my-account/history"
                  ? "text-[#FBB321]"
                  : "text-white"
              }`}
            >
              <AiOutlineHistory />
            </span>
          </div>
          <span
            className={`ml-2 ${
              selectedItem === "/my-account/history"
                ? "text-white"
                : "text-white"
            }`}
          >
            Lịch sử đơn hàng
          </span>
        </Link>

        <Link
          to="/my-account/address"
          onClick={() => setSelectedItem("/my-account/address")}
          className={`flex items-center mb-4 p-2 rounded-full border-dashed cursor-pointer border-2 transition-all duration-300 text-white border-transparent hover:border-white hover:border-2 ${
            selectedItem === "/my-account/address"
              ? "border-white border-dashed"
              : ""
          }`}
          style={{
            boxSizing: "border-box",
            padding: "5px",
            margin: "7px 0",
          }}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center border-white border-[1px] border-dashed rounded-full transition-all duration-300 ${
              selectedItem === "/my-account/address"
                ? "bg-white text-[#FBB321]"
                : ""
            }`}
          >
            <span
              className={`text-2xl ${
                selectedItem === "/my-account/address"
                  ? "text-[#FBB321]"
                  : "text-white"
              }`}
            >
              <MdOutlineLocationOn />
            </span>
          </div>
          <span
            className={`ml-2 ${
              selectedItem === "/my-account/address"
                ? "text-white"
                : "text-white"
            }`}
          >
            Địa chỉ
          </span>
        </Link>

        <Link
          to="/my-account/change-password"
          onClick={() => setSelectedItem("/my-account/change-password")}
          className={`flex items-center mb-4 p-2 rounded-full border-dashed cursor-pointer border-2 transition-all duration-300 text-white border-transparent hover:border-white hover:border-2 ${
            selectedItem === "/my-account/change-password"
              ? "border-white border-dashed"
              : ""
          }`}
          style={{
            boxSizing: "border-box",
            padding: "5px",
            margin: "7px 0",
          }}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center border-white border-[1px] border-dashed rounded-full transition-all duration-300 ${
              selectedItem === "/my-account/change-password"
                ? "bg-white text-[#FBB321]"
                : ""
            }`}
          >
            <span
              className={`text-2xl ${
                selectedItem === "/my-account/change-password"
                  ? "text-[#FBB321]"
                  : "text-white"
              }`}
            >
              <AiOutlineLock />
            </span>
          </div>
          <span
            className={`ml-2 ${
              selectedItem === "/my-account/change-password"
                ? "text-white"
                : "text-white"
            }`}
          >
            Đổi mật khẩu
          </span>
        </Link>

        <Link
          to="/my-account/favorites"
          onClick={() => setSelectedItem("/my-account/favorites")}
          className={`flex items-center mb-4 p-2 rounded-full border-dashed cursor-pointer border-2 transition-all duration-300 text-white border-transparent hover:border-white hover:border-2 ${
            selectedItem === "/my-account/favorites"
              ? "border-white border-dashed"
              : ""
          }`}
          style={{
            boxSizing: "border-box",
            padding: "5px",
            margin: "7px 0",
          }}
        >
          <div
            className={`w-10 h-10 flex items-center justify-center border-white border-[1px] border-dashed rounded-full transition-all duration-300 ${
              selectedItem === "/my-account/favorites"
                ? "bg-white text-[#FBB321]"
                : ""
            }`}
          >
            <span
              className={`text-2xl ${
                selectedItem === "/my-account/favorites"
                  ? "text-[#FBB321]"
                  : "text-white"
              }`}
            >
              <AiOutlineHeart />
            </span>
          </div>
          <span
            className={`ml-2 ${
              selectedItem === "/my-account/favorites"
                ? "text-white"
                : "text-white"
            }`}
          >
            Yêu thích
          </span>
        </Link>
      </div>
    </div>
  );
};

export default SidebarAccount;