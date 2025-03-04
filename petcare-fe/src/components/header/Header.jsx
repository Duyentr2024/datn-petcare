import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import {
  FaPhoneAlt,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaBell,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/jwt"; // Hàm decodeToken đã viết
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/AuthContext"; // Import hook useAuth từ context
import logo from "../../assets/images/banner1.png";
import { motion } from "framer-motion";
import CartDetailsService from "../../service/CartDetailsService/CartDetailsService.jsx";
import axios from "axios"; // Thêm axios để gọi API

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const menuRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    registration_date: "",
    role: "",
    totalSpent: "",
  });
  const [isClickingNotification, setIsClickingNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    user,
    notifications,
    unreadCount,
    isShaking,
    logout,
    markNotificationAsRead, // Sử dụng markNotificationAsRead từ AuthContext
    handleViewNotification,
    setNotifications, // Thêm setNotifications từ AuthContext
    setUnreadCount, // Thêm setUnreadCount từ AuthContext
    setIsShaking, // Thêm setIsShaking từ AuthContext
    selectedNotification,
    setSelectedNotification, // Đảm bảo destructuring setSelectedNotification
  } = useAuth();
  // Xử lý tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Thêm log để debug selectedNotification
  useEffect(() => {
    console.log(
      "Selected notification updated in Header:",
      selectedNotification
    );
  }, [selectedNotification]);

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isClickingNotification
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen, isClickingNotification]);

  // Thêm hàm để đánh dấu tất cả đã đọc (sử dụng markNotificationAsRead từ AuthContext)
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notif) => !notif.isRead
      );

      await Promise.all(
        unreadNotifications.map(async (notif) => {
          await handleViewNotification(notifications.indexOf(notif)); // Sử dụng handleViewNotification từ AuthContext
        })
      );

      // Cập nhật local state sau khi đánh dấu tất cả
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      setIsShaking(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      if (error.response) {
        console.error(
          "Response status:",
          error.response.status,
          "Data:",
          error.response.data
        );
      }
    }
  };

  // Hàm xử lý chuyển hướng đến lịch sử đơn hàng và chọn tab
  const handleNavigateToOrderHistory = (orderId) => {
    if (!orderId || isNaN(orderId)) {
      console.error("Invalid Order ID:", orderId);
      alert("Không thể tìm thấy đơn hàng. Vui lòng kiểm tra lại thông báo!");
      return;
    }
    console.log("Navigating to order history for orderId - CLICKED:", orderId);
    setSelectedNotification(null); // Đóng modal trước khi chuyển hướng
    navigate(`/my-account/history?orderId=${orderId}`);
  };

  // Hàm trích xuất orderId từ message nếu orderId không có trong selectedNotification
  const extractOrderIdFromMessage = (message) => {
    const match = message.match(/Đơn hàng #(\d+)/);
    console.log("Extracting orderId from message:", message, "Result:", match);
    return match ? parseInt(match[1], 10) : null;
  };

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

  useEffect(() => {
    const token = cookies.accessToken; // Lấy token từ Cookie
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserId(decoded.userId);
        setFullName(decoded.fullName);
        setRole(decoded.roles?.[0]?.roleName || "Guest");
        setIsAuthenticated(true);
      }
    }
  }, [cookies.accessToken]); // Theo dõi sự thay đổi của token trong Cookie

  const handleLogout = () => {
    Cookies.remove("accessToken");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const menuItems = menuRef.current.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
      const underline = item.querySelector(".underline");

      item.addEventListener("mouseenter", () => {
        gsap.to(underline, {
          width: "100%",
          duration: 0.5,
          ease: "power4.out",
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(underline, { width: "0%", duration: 0.5, ease: "power4.in" });
      });
    });

    return () => {
      menuItems.forEach((item) => {
        const underline = item.querySelector(".underline");

        item.removeEventListener("mouseenter", () => {
          gsap.to(underline, {
            width: "100%",
            duration: 0.5,
            ease: "power4.out",
          });
        });

        item.removeEventListener("mouseleave", () => {
          gsap.to(underline, { width: "0%", duration: 0.5, ease: "power4.in" });
        });
      });
    };
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!userId) return;

      try {
        const cartItems = await CartDetailsService.getCartDetailsByUserId(
          userId
        );
        const totalItems = cartItems.length; // Chỉ đếm số mặt hàng khác nhau
        setCartCount(totalItems);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, [userId]);

  return (
    <>
      <div className="bg-[#FBB321] text-center py-2 text-white rounded-b-2xl px-4 w-full sm:w-full lg:w-full">
        <span className="text-xs sm:text-sm md:text-base lg:text-lg">
          Giảm <span className="font-bold">25.000đ</span> phí ship cho đơn hàng
          trên
          <span className="font-bold"> 600.000đ</span>
        </span>
      </div>

      <header className="sticky top-0 z-20 bg-white transition-all duration-300 ease-in-out shadow-md py-2">
        <div className=" flex items-center justify-between  w-auto mx-32 h-[120px] gap-5 ">
          <div className="flex items-center space-x-4 w-[230px] ">
            <img
              src={logo}
              alt="Honey The Mona logo"
              className="h-[250-px] w-[300px] cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="items-center w-[1000px]">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-start justify-center space-x-8 ">
              <div className="flex sm:w-auto">
                <div className="flex items-center space-x-4 relative w-[900px] max-w-lg hidden sm:block">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="border border-yellow-500 rounded-2xl px-4 py-2 pl-4 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                  />
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500"
                    onClick={handleSearch}
                  >
                    <FaSearch size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                {isAuthenticated ? (
                  // Khi đã đăng nhập
                  <div className="flex items-center space-x-3">
                    {/* Avatar - Nhấn để vào trang My Account */}
                    <Link
                      to="/my-account"
                      className=" flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={
                          user?.imageUrl ||
                          "https://i.pinimg.com/originals/9f/c2/12/9fc2126eec2c0a3876e3f2097af9b983.gif"
                        }
                        alt=""
                        className="rounded-full h-[50px] w-[50px] object-cover"
                      />
                    </Link>
                    <div className="hidden sm:block">
                      <span className="text-sm text-gray-700  truncate  max-w-[100px]">
                        {fullName}
                      </span>
                      <br />
                      {/* Nút Đăng xuất */}
                      <button
                        onClick={handleLogout}
                        className="font-bold text-red-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  // Khi chưa đăng nhập
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-200 p-3 rounded-full flex items-center justify-center">
                      <FaUser className="text-amber-100 text-xl" />
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-sm text-gray-700">Tài khoản</span>
                      <br />
                      <Link to="/login">
                        <span className="font-bold text-brown-700">
                          Đăng nhập
                        </span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Giỏ hàng */}
                <Link
                  to="/shoppingCart"
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <div className="bg-green-100 p-3 rounded-full flex items-center justify-center relative">
                    <FaShoppingCart className="text-green-700 text-xl" />
                    {/* {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {cartCount}
                    </span>
                    )} */}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-700">Giỏ hàng</span>
                    <br />
                    <span className="font-bold text-green-700">
                      {cartCount} Sản phẩm
                    </span>
                  </div>
                </Link>

                {/* Thông báo */}
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  ref={dropdownRef} // Đảm bảo ref được đặt đúng nếu cần
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="bg-yellow-100 p-3 rounded-full flex items-center justify-center relative">
                    <motion.div
                      initial={{ rotate: 0 }} // Định nghĩa trạng thái ban đầu (góc 0°)
                      animate={
                        isShaking
                          ? { rotate: [-10, 10, -10, 10, 0] } // Hiệu ứng lắc
                          : { rotate: 0 } // Quay về góc 0° khi isShaking là false
                      }
                      transition={{
                        duration: 0.5,
                        repeat: isShaking ? 3 : 0, // Chỉ lặp khi isShaking là true
                        ease: "easeInOut", // Thêm ease cho chuyển động mượt mà
                      }}
                    >
                      <FaBell className="text-yellow-500 text-xl" />
                    </motion.div>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dropdown thông báo */}
                {isOpen && (
                  <div
                    className="absolute top-20 right-[132px] w-80 bg-white shadow-2xl rounded-xl p-4 border border-gray-200 z-99 animate-slideDown"
                    ref={dropdownRef}
                  >
                    <div className="absolute -top-2 right-10 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-3 text-center flex items-center justify-center gap-2">
                      <FaBell className="text-yellow-500" /> Thông báo
                    </h3>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 custom-scrollbar">
                      <ul className="space-y-3">
                        {notifications.length > 0 ? (
                          [...notifications]
                            .sort((a, b) => a.isRead - b.isRead)
                            .map((notif, index) => (
                              <li
                                key={notif.id}
                                onClick={(e) => {
                                  console.log(
                                    "Click event triggered on notification, event:",
                                    e
                                  );
                                  console.log(
                                    "Clicked notification in Header, index:",
                                    index,
                                    "Notification:",
                                    notif
                                  );
                                  handleViewNotification(index);
                                  e.stopPropagation(); // Ngăn sự kiện bubbling lên parent
                                }}
                                className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:shadow-md ${
                                  notif.isRead
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-yellow-50 hover:bg-yellow-100 text-gray-800"
                                }`}
                              >
                                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow">
                                  <FaBell
                                    className={
                                      notif.isRead
                                        ? "text-gray-400"
                                        : "text-yellow-500"
                                    }
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      notif.timestamp || notif.id
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </li>
                            ))
                        ) : (
                          <li className="text-gray-500 p-4 text-center">
                            Không có thông báo nào
                          </li>
                        )}
                      </ul>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          console.log("Mark all as read clicked, event:", e);
                          handleMarkAllAsRead();
                          e.stopPropagation(); // Ngăn sự kiện bubbling lên parent
                        }}
                        className="mt-3 w-full py-2 bg-[#fbb321] text-white rounded-lg hover:bg-[#fbb321] transition-all duration-200 text-sm font-medium"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                )}

                {/* Modal xem chi tiết thông báo */}
                {selectedNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={(e) => {
                      console.log("Clicked modal background, target:", e.target, "currentTarget:", e.currentTarget);
                      if (e.target === e.currentTarget) {
                        setSelectedNotification(null);
                      }
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-white p-6 rounded-2xl shadow-2xl w-[28rem] max-w-full max-h-[80vh] overflow-y-auto"
                    >
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <FaBell className="text-yellow-500" /> Chi tiết thông
                          báo
                        </h2>
                        <button
                          onClick={() => {
                            console.log("Closing modal via close button");
                            setSelectedNotification(null);
                          }}
                          className="text-gray-500 hover:text-red-500 transition duration-200 text-xl"
                        >
                          ✖
                        </button>
                      </div>
                      <div className="space-y-4">
                        <p className="text-gray-700 text-base leading-relaxed line-clamp-4">
                          {selectedNotification.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          Thời gian:{" "}
                          {new Date(
                            selectedNotification.timestamp ||
                              selectedNotification.id
                          ).toLocaleString()}
                        </p>
                        {selectedNotification.orderId ? (
                          <button
                            onClick={() => {
                              console.log("Clicked 'Xem chi tiết đơn hàng' button, orderId:", selectedNotification.orderId);
                              handleNavigateToOrderHistory(selectedNotification.orderId);
                            }}
                            className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium"
                          >
                            Xem chi tiết đơn hàng
                          </button>
                        ) : (
                          <p className="text-red-500">Không tìm thấy ID đơn hàng trong thông báo.</p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center">
                  <button onClick={toggleMobileMenu}>
                    <FaBars size={24} className="text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden sm:block">
              <nav
                ref={menuRef}
                className="  container pt-4 h-[40px] items-center mx-auto flex justify-center gap-8 text-[#444444] text-[16px] font-sans sticky top-0 z-50"
              >
                <Link
                  to="/"
                  className="menu-item font-bold flex items-center space-x-1 relative"
                >
                  Trang chủ <i className="fas fa-home text-yellow-500"></i>
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <Link
                  to="/introduce"
                  className="menu-item font-bold flex items-center space-x-1 relative"
                >
                  <span className="menu-item font-bold relative">
                    Giới thiệu<i className="fas fa-home text-yellow-500"></i>
                    <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                  </span>
                </Link>

                <Link
                  to="/productPage"
                  className="menu-item font-bold relative"
                >
                  Sản phẩm
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>

                <Link to="/newsPage" className="menu-item font-bold relative">
                  Tin tức
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <Link to="/policy" className="menu-item font-bold relative">
                  Chính sách
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <Link to="/guide" className="menu-item font-bold relative">
                  Hướng dẫn mua hàng
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <Link
                  to="/contact"
                  className="menu-item font-bold relative"
                  href="#contact"
                >
                  Liên hệ
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed z-50 top-0 left-0 w-[250px] h-full bg-white transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out shadow-lg lg:hidden`}
      >
        <div className="flex justify-between items-center pl-3 mt-10">
          <span className="text-lg font-bold">Menu</span>
          <button
            className="text-xl font-bold text-gray-700"
            onClick={() => toggleMobileMenu()} // Close the menu when clicked
          >
            &times; {/* This is the "X" symbol */}
          </button>
        </div>
        <div className="flex flex-col items-start pl-3 mt-10 space-y-6">
          <div className="border-b w-full">
            <Link
              to="/login"
              className={`menu-item text-sm relative ${
                activeMenuItem === "home" ? "text-yellow-500" : ""
              }`}
              onClick={() => {
                setActiveMenuItem("home");
                toggleMobileMenu();
              }}
            >
              Trang chủ
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </Link>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "about" ? "text-yellow-500" : ""
              }`}
              href="#about"
              onClick={() => {
                setActiveMenuItem("about");
                toggleMobileMenu();
              }}
            >
              Giới thiệu
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "products" ? "text-yellow-500" : ""
              }`}
              href="#products"
              onClick={() => {
                setActiveMenuItem("products");
                toggleMobileMenu();
              }}
            >
              Sản phẩm
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "services" ? "text-yellow-500" : ""
              }`}
              href="#services"
              onClick={() => {
                setActiveMenuItem("services");
                toggleMobileMenu();
              }}
            >
              Dịch vụ doanh nghiệp
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "news" ? "text-yellow-500" : ""
              }`}
              href="#news"
              onClick={() => {
                setActiveMenuItem("news");
                toggleMobileMenu();
              }}
            >
              Tin tức
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "policy" ? "text-yellow-500" : ""
              }`}
              href="#policy"
              onClick={() => {
                setActiveMenuItem("policy");
                toggleMobileMenu();
              }}
            >
              Chính sách
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "guides" ? "text-yellow-500" : ""
              }`}
              href="#guides"
              onClick={() => {
                setActiveMenuItem("guides");
                toggleMobileMenu();
              }}
            >
              Hướng dẫn mua hàng
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
          <div className="border-b w-full">
            <a
              className={`menu-item text-sm relative ${
                activeMenuItem === "contact" ? "text-yellow-500" : ""
              }`}
              href="#contact"
              onClick={() => {
                setActiveMenuItem("contact");
                toggleMobileMenu();
              }}
            >
              Liên hệ
              <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
