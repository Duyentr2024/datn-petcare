import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaClipboardList, 
  FaWarehouse,
  FaCut,
  FaReceipt,
  FaBars,
  FaChevronDown,
  FaUserCircle
} from 'react-icons/fa';
import HeaderStaff from "../components/header/HeaderStaff.jsx"; // Thay HeaderAdmin bằng HeaderStaff
import { useAuth } from "../context/AuthContext";

const StaffPage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [footerDropdownOpen, setFooterDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setDropdownOpen(false);
    setFooterDropdownOpen(false);
  }, [location]);

  const footerItems = [
    { icon: FaReceipt, name: "Hóa đơn offline", path: "/staff/orderOffline" },
    { icon: FaWarehouse, name: "Quản lý Spa", path: "/staff/manage-spa" },
    { icon: FaCut, name: "Spa/Grooming", path: "/staff/admin-spa" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
      if (footerDropdownOpen && !event.target.closest('.footer-dropdown')) {
        setFooterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, footerDropdownOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <HeaderStaff title="Staff Dashboard" />

      {/* Main content area */}
      <main className="flex-1 p-0 bg-gray-50 overflow-y-auto">
        <div className="h-full w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 flex justify-between items-center sticky bottom-0 z-10">
        <div className="text-sm text-gray-500">
          Làm việc cho chăm chỉ vào
        </div>
        <div className="relative footer-dropdown">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-[#fbb321] text-white hover:bg-[#e09a0d] transition-colors duration-200 focus:outline-none"
            onClick={() => setFooterDropdownOpen(!footerDropdownOpen)}
          >
            <span>Chức năng nhanh</span>
            <FaChevronDown size={12} />
          </button>
          {footerDropdownOpen && (
            <div className="absolute right-0 bottom-12 w-48 bg-white rounded-md shadow-lg py-1 z-30">
              {footerItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setFooterDropdownOpen(false)}
                >
                  <item.icon className="mr-2 text-[#fbb321]" size={16} />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default StaffPage;