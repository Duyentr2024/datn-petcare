import { NavLink } from "react-router-dom";
import { PawPrint, Phone, MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#7b4d2b] to-[#6a3f1e] text-white py-6 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-full shadow-md transform transition-transform duration-300 hover:scale-110">
              <PawPrint size={32} className="text-[#7b4d2b]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Phòng Khám Thú Cưng</h1>
          </div>

          {/* Navigation and Contact Section */}
          <div className="flex items-center space-x-6">
            <NavLink
              to="/hospital/clinic-management"
              className={({ isActive }) =>
                `px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? "bg-[#e8dfd7] text-[#7b4d2b] shadow-md"
                    : "text-white hover:bg-[#e8dfd7] hover:text-[#7b4d2b] hover:shadow-sm"
                }`
              }
            >
              Quản lý Phòng Khám
            </NavLink>
            <NavLink
              to="/hospital/medical-records"
              className={({ isActive }) =>
                `px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? "bg-[#e8dfd7] text-[#7b4d2b] shadow-md"
                    : "text-white hover:bg-[#e8dfd7] hover:text-[#7b4d2b] hover:shadow-sm"
                }`
              }
            >
              Hồ Sơ Bệnh Án
            </NavLink>
            <div className="flex items-center space-x-4">
              <div className="flex items-center group">
                <Phone className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm">Hotline: 0844233799</span>
              </div>
              <div className="flex items-center group">
                <MapPin className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-sm">Cái Răng - Cần Thơ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;