import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import {
  FaPhoneAlt,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/jwt"; // Hàm decodeToken đã viết
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import { useAuth } from "../../context/AuthContext"; // Import hook useAuth từ context

export default function Header() {
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
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    registration_date: "",
    role: "",
    totalSpent: "",
  });

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
          <div className="flex items-center space-x-4 w-[164px] pt-2">
            <img
              src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/nongsan-logo.png"
              alt="Honey The Mona logo"
              className="h-auto w-full"
            />
          </div>
          <div className="items-center">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-start space-x-8 ">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center space-x-4 relative w-[800px] max-w-lg hidden sm:block">
                  <input
                    type="text"
                    placeholder="Nhập từ khoá tìm kiếm..."
                    className="border border-yellow-500 rounded-2xl px-4 py-2 pl-4 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500">
                    <FaSearch size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                {/* Hotline */}

                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-3 rounded-full flex items-center justify-center">
                    <FaPhoneAlt className="text-yellow-500 text-xl" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-700">Hotline</span>
                    <br />
                    <span className="font-bold text-yellow-500">
                      0313728397
                    </span>
                  </div>
                </div>

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
                      <span className="text-sm text-gray-700  truncate  max-w-[100px]">{fullName}</span>
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
                <Link to="/shoppingCart" className="flex items-center space-x-3 cursor-pointer">
                  <div className="bg-green-100 p-3 rounded-full flex items-center justify-center">
                    <FaShoppingCart className="text-green-700 text-xl" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-700">Giỏ hàng</span>
                    <br />
                    <span className="font-bold text-green-700">0 Sản phẩm</span>
                  </div>
                </Link>


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
                className="  container pt-7 h-[40px] items-center mx-auto flex justify-center gap-8 text-[#444444] text-[16px] font-sans sticky top-0 z-50"
              >
                <Link
                  to="/"
                  className="menu-item font-bold flex items-center space-x-1 relative"
                >
                  Trang chủ <i className="fas fa-home text-yellow-500"></i>
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <a className="menu-item font-bold relative">
                  Giới thiệu
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </a>
                <Link
                  to="/productPage"
                  className="menu-item font-bold relative"
                >
                  Sản phẩm
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <a className="menu-item font-bold relative">
                  Dịch vụ doanh nghiệp
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </a>
                <Link to="/newsPage" className="menu-item font-bold relative">
                  Tin tức
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </Link>
                <a className="menu-item font-bold relative" href="#policy">
                  Chính sách
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </a>
                <a className="menu-item font-bold relative" href="#guides">
                  Hướng dẫn mua hàng
                  <span className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                </a>
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
        className={`fixed z-50 top-0 left-0 w-[250px] h-full bg-white transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
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
              className={`menu-item text-sm relative ${activeMenuItem === "home" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "about" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "products" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "services" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "news" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "policy" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "guides" ? "text-yellow-500" : ""
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
              className={`menu-item text-sm relative ${activeMenuItem === "contact" ? "text-yellow-500" : ""
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
