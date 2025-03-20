import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSpa } from "react-icons/fa";
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
import { motion, AnimatePresence } from "framer-motion";

const SidebarMenu = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isSpaDropdownOpen, setIsSpaDropdownOpen] = useState(false);
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

  const toggleSpaDropdown = () => {

    setIsSpaDropdownOpen(!isSpaDropdownOpen);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  };

  return (
    <div className="flex flex-col w-64 h-screen bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 text-white shadow-lg">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex items-center space-x-4 w-[200px] ">
          <img
            src="http://localhost:5173/src/assets/images/banner1.png"
            alt="Honey The Mona logo"
            className="h-[200-px] w-[200px] cursor-pointer"
          />
        </div>
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <Link
              to="/admin"
              className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300">
              <FiHome className="w-5 h-5 mr-3" />
              <span>Trang tổng quan</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/invoice-management"
              className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300">
              <FiFileText className="w-5 h-5 mr-3" />
              <span>Hóa đơn</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/warehouse"
              className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300">
              <FiArchive className="w-5 h-5 mr-3" />
              <span>Kho hàng</span>
            </Link>
          </li>
          {/* User Management Dropdown */}
          <li>
            <div
              className="flex items-center justify-between p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300"
              onClick={toggleUserDropdown}>
              <div className="flex items-center">
                <FiUser className="w-5 h-5 mr-3" />
                <span>Quản lý tài khoản</span>
              </div>
              {isUserDropdownOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </div>
            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.ul
                  className="mt-2 ml-6 space-y-2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}>
                  <li>
                    <Link
                      to="/admin/employee"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Quản lý nhân viên
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="admin/client"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Quản lý người dùng
                    </Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {/* Product Management Dropdown */}
          <li>
            <div
              className="flex items-center justify-between p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300"
              onClick={toggleProductDropdown}>
              <div className="flex items-center">
                <FiBox className="w-5 h-5 mr-3" />
                <span>Quản lý sản phẩm</span>
              </div>
              {isProductDropdownOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </div>
            <AnimatePresence>
              {isProductDropdownOpen && (
                <motion.ul
                  className="mt-2 ml-6 space-y-2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}>
                  <li>
                    <Link
                      to="/admin/products-list"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Danh sách sản phẩm
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-brands"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Thương hiệu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-color"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Màu sắc
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-size"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Kích thước
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-weights"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Cân nặng
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/product-categories"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Danh mục
                    </Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {/* Spa Management Dropdown */}
          <li>
            <div
              className="flex items-center justify-between p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300"
              onClick={toggleSpaDropdown}>
              <div className="flex items-center">
                <FaSpa className="w-5 h-5 mr-3" />{" "}
                <span>Quản lý Spa</span>
              </div>
              {isSpaDropdownOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </div>
            <AnimatePresence>
              {isSpaDropdownOpen && (
                <motion.ul
                  className="mt-2 ml-6 space-y-2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}>
                  <li>
                    <Link
                      to=""
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Dịch vụ Spa
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/spa-appointments"
                      className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300">
                      Lịch hẹn
                    </Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {/* Voucher management */}
          <li>
            <Link
              to="/admin/voucher-management"
              className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300">
              <FaGift className="w-5 h-5 mr-3" />
              <span>Quản lý Voucher</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/post-management"
              className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300">
              <FiEdit className="w-5 h-5 mr-3" />
              <span>Quản lý bài viết</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 bg-gray-800">
        <a href="/" className="block text-center text-gray-400 hover:underline">
          Trang chủ
        </a>
      </div>
    </div>
  );
};

export default SidebarMenu;
