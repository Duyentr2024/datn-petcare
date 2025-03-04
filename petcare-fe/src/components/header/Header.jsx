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
export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const menuRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const { user, token, setUser, setToken } = useAuth(); // Lấy setUser từ context
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Thêm useRef

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    registration_date: "",
    role: "",
    totalSpent: "",
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Bạn có đơn hàng mới!", isRead: false },
    { id: 2, message: "Sản phẩm của bạn đã được duyệt.", isRead: false },
    { id: 3, message: "Khách hàng đã gửi tin nhắn.", isRead: false },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Xử lý tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShaking(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewNotification = (index) => {
    setSelectedNotification(notifications[index]);
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isRead: true } : n))
    );
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

  const [cartCount, setCartCount] = useState(0);

  // Hàm lấy userId từ token
  const getUserIdFromToken = () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      return payload.userId;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

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
                  ref={dropdownRef}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="bg-yellow-100 p-3 rounded-full flex items-center justify-center relative">
                    <motion.div
                      animate={
                        isShaking ? { rotate: [-10, 10, -10, 10, 0] } : {}
                      }
                      transition={{ duration: 0.5, repeat: 3 }}
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
                  <div className="absolute top-20 right-[132px] w-72 bg-white shadow-xl rounded-lg p-3 border border-gray-200 z-99">
                    <div className="absolute -top-2 right-10 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    <h3 className="font-semibold text-gray-700 mb-2 text-center">
                      🔔 Thông báo
                    </h3>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <ul className="space-y-2">
                        {notifications.length > 0 ? (
                          notifications.map((notif, index) => (
                            <li
                              key={notif.id}
                              onClick={() => handleViewNotification(index)}
                              className={`flex items-start space-x-2 p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${
                                notif.isRead
                                  ? "bg-gray-100"
                                  : "bg-yellow-50 hover:bg-yellow-100"
                              }`}
                            >
                              <div className="w-8 h-8 flex items-center justify-center text-white rounded-full">
                                🔔
                              </div>
                              <div className="text-gray-800 text-sm leading-relaxed">
                                {notif.message}
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 p-3 text-center">
                            Không có thông báo nào
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Modal xem chi tiết thông báo */}
                {selectedNotification && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-96 transform scale-95 animate-fadeIn">
                      {/* Header */}
                      <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">
                          Chi tiết thông báo
                        </h2>
                        <button
                          onClick={() => setSelectedNotification(null)}
                          className="text-gray-500 hover:text-red-500 transition duration-200"
                        >
                          ✖
                        </button>
                      </div>

                      {/* Nội dung thông báo */}
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {selectedNotification.message}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setSelectedNotification(null)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
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
