import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiUser,
  FiBox,
  FiPackage,
  FiArchive,
  FiFileText,
  FiEdit,
} from "react-icons/fi";
import { FaGift } from "react-icons/fa";
import logo from "../../assets/images/banner1.png";

const SidebarMenu = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleProductDropdown = () => {
    setIsProductDropdownOpen(!isProductDropdownOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="flex flex-col z-10 h-screen bg-gradient-to-b from-[#B2EBF2] to-[#FFCCBC] text-[#4B5563] shadow-lg w-64">
        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-4 py-2"
          style={{
            scrollbarWidth: "none",
          }}
        >
          <style>
            {`
              nav::-webkit-scrollbar {
                  display: none;
              }
            `}
          </style>
          <div className="flex items-center justify-center w-full py-4">
            <img
              src={logo}
              alt="Honey The Mona logo"
              className="h-30 w-52 object-contain cursor-pointer rounded-full"
            />
          </div>
          <ul className="space-y-2">
            {/* Dashboard */}
            <li>
              <Link
                to="/admin"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiHome className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Trang tổng quan</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/invoice-management"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiFileText className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Hóa đơn offline</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/invoice-online"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiFileText className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Hóa đơn online</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/warehouse"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiArchive className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Kho hàng</span>
              </Link>
            </li>
            {/* User Management Dropdown */}
            <li>
              <div
                className="flex items-center justify-between p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] cursor-pointer transition duration-300"
                onClick={toggleUserDropdown}
              >
                <div className="flex items-center">
                  <FiUser className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3">Quản lý tài khoản</span>
                </div>
                {isUserDropdownOpen ? (
                  <FiChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </div>
              {isUserDropdownOpen && (
                <ul className="mt-2 ml-6 space-y-2">
                  <li>
                    <Link
                      to="/admin/employee"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Quản lý nhân viên
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/client"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Quản lý người dùng
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Product Management Dropdown */}
            <li>
              <div
                className="flex items-center justify-between p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] cursor-pointer transition duration-300"
                onClick={toggleProductDropdown}
              >
                <div className="flex items-center">
                  <FiBox className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3">Quản lý sản phẩm</span>
                </div>
                {isProductDropdownOpen ? (
                  <FiChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </div>
              {isProductDropdownOpen && (
                <ul className="mt-2 ml-6 space-y-2">
                  <li>
                    <Link
                      to="/admin/products-list"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Danh sách sản phẩm
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-brands"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Thương hiệu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-color"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Màu sắc
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-size"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Kích thước
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-weights"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Cân nặng
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-categories"
                      className="block p-2 rounded-lg hover:bg-[#80DEEA] transition duration-300"
                    >
                      Danh mục
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Order Management */}
            <li>
              <Link
                to="/admin/product-inventory"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiPackage className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Quản lý đơn hàng</span>
              </Link>
            </li>

            {/* Voucher Management */}
            <li>
              <Link
                to="/admin/voucher-management"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FaGift className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Quản lý Voucher</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/post-management"
                className="flex items-center p-3 bg-[#E0F7FA] text-[#4B5563] rounded-lg hover:bg-[#80DEEA] transition duration-300"
              >
                <FiEdit className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Quản lý bài viết</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 bg-[#FFCCBC]">
          <a
            href="/"
            className="block text-center text-[#4B5563] hover:underline"
          >
            Trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;