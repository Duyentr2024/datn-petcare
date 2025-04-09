import React from "react";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom
import { PawPrint, Phone, MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PawPrint size={32} />
            <h1 className="text-2xl font-bold">Phòng Khám Thú Cưng</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/hospital/booking"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-500" 
                }`
              }
            >
              Quản lý Phòng Khám
            </Link>
            <Link
              to="/hospital/medical-records"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-500"
                }`
              }
            >
              Hồ Sơ Bệnh Án
            </Link>
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>Hotline: 0844233799</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Cái Răng - Cần Thơ</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;