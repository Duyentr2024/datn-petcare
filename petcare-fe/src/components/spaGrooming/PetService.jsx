import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const PetService = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8EA]">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-center mb-8" style={{color: '#039aff'}}>
          PET GROOMING DÀNH CHO MÈO
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">COMBO THƯ GIÃN</h2>
            </div>
            <div className="p-4 ">
              <p>B1: Vệ sinh tai</p>
              <p>B2: Kiểm tra tình trạng lông và da</p>
              <p>B3: Vắt tuyến hôi</p>
              <p>B4: Tắm sữa tắm cao cấp</p>
              <p>B5: Massage thư giãn </p>
              <p>B6: Sấy khô bằng máy sấy chuyên dụng</p>
              <p>B7: Chải lông</p>
              <p>B8: Xịt nước hoa, dưỡng lông</p>
              <p>B9: Chải lông chết</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t">
              <p className="text-xl text-red-500 text-right">79.000 VNĐ</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">COMBO MỀM MƯỢT</h2>
            </div>
            <div className="p-4">
              <p>B1: Cắt móng, mài móng</p>
              <p>B2: Vệ sinh tai</p>
              <p>B3: Tỉa đệm chân</p>
              <p>B4: Cạo lông vùng hậu môn</p>
              <p>B5: Kiểm tra tình trạng lông và da</p>
              <p>B6: Vắt tuyến hôi</p>
              <p>B7: Ủ tinh chất dưỡng lông</p>
              <p>B8: Tắm sữa tắm cao cấp</p>
              <p>B9: Sấy khô bằng máy sấy chuyên dụng</p>
              <p>B10: Chải lông</p>
              <p>B11: Xịt nước hoa, dưỡng lông</p>
              <p>B12: Chải lông chết</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t">
              <p className="text-xl text-red-500 text-right">99.000 VNĐ</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">COMBO GIẢM VE, RẬN</h2>
            </div>
            <div className="p-4">
            <p>B1: Cắt móng, mài móng</p>
              <p>B2: Vệ sinh tai</p>
              <p>B3: Tỉa đệm chân</p>
              <p>B4: Cạo lông vùng hậu môn</p>
              <p>B5: Kiểm tra tình trạng lông và da</p>
              <p>B6: Vắt tuyến hôi</p>
              <p>B7: Ủ tinh chất trị ve, rận</p>
              <p>B8: Tắm sữa tắm trị ve rận cao cấp</p>
              <p>B9: Sấy khô bằng máy sấy chuyên dụng</p>
              <p>B10: Chải lông</p>
              <p>B11: Xịt nước hoa, dưỡng lông</p>
              <p>B12: Chải lông chết</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t">
              <p className="text-xl text-red-500 text-right">119.000 VNĐ</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">COMBO GIẢM NẤM</h2>
            </div>
            <div className="p-4">
            <p>B1: Cắt móng, mài móng</p>
              <p>B2: Vệ sinh tai</p>
              <p>B3: Tỉa đệm chân</p>
              <p>B4: Cạo lông vùng hậu môn</p>
              <p>B5: Kiểm tra tình trạng lông và da</p>
              <p>B6: Vắt tuyến hôi</p>
              <p>B7: Ủ tinh chất dưỡng lông</p>
              <p>B8: Tắm sữa tắm trị nấm cao cấp</p>
              <p>B9: Sấy khô bằng máy sấy chuyên dụng</p>
              <p>B10: Chải lông</p>
              <p>B11: Xịt nước hoa, dưỡng lông</p>
              <p>B12: Chải lông chết</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t">
              <p className="text-xl text-red-500 text-right">129.000 VNĐ</p>
            </div>
          </div>
        </div>

        {/* Nút đặt lịch cho mèo */}
        <div className="text-center mb-12">
        <Link to="/appointment">
            <button
              className={`group px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isHovered 
                ? 'bg-white text-green-500 border-2 border-green-500' 
                : 'bg-green-500 text-white'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="flex items-center">
                ĐẶT LỊCH
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </span>
            </button>
          </Link>
        </div>

        {/* Phần dành cho chó */}
        <h2 className="text-4xl font-bold text-center mb-8" style={{color: '#039aff'}}>
          PET GROOMING DÀNH CHO CÚN
        </h2>

        {/* Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-[#039aff] text-white">
              <tr>
                <th className="px-6 py-3 text-left">CÂN NẶNG</th>
                <th className="px-6 py-3 text-center">TẮM CƠ BẢN</th>
                <th className="px-6 py-3 text-center">TẮM VỆ SINH CAO CẤP</th>
                <th className="px-6 py-3 text-center">TẮM, CẮT TỈA CAO CẤP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-xl text-red-500"> Dưới 1kg</td>
                <td className="px-6 py-4 text-center">55.000 VNĐ</td>
                <td className="px-6 py-4 text-center">85.000 VNĐ</td>
                <td className="px-6 py-4 text-center">195.000 VNĐ</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-xl text-red-500">1 - 3kg</td>
                <td className="px-6 py-4 text-center">70.000 VNĐ</td>
                <td className="px-6 py-4 text-center">100.000 VNĐ</td>
                <td className="px-6 py-4 text-center">250.000VNĐ</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-xl text-red-500">3 - 6kg</td>
                <td className="px-6 py-4 text-center">95.000 VNĐ</td>
                <td className="px-6 py-4 text-center">125.000VNĐ</td>
                <td className="px-6 py-4 text-center">280.000 VNĐ</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-xl text-red-500">6 - 10kg</td>
                <td className="px-6 py-4 text-center">120.000 VNĐ</td>
                <td className="px-6 py-4 text-center">155.000 VNĐ</td>
                <td className="px-6 py-4 text-center">315.000 VNĐ</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-xl text-red-500">10 - 15kg</td>
                <td className="px-6 py-4 text-center">150.000 VNĐ</td>
                <td className="px-6 py-4 text-center">185.000 VNĐ</td>
                <td className="px-6 py-4 text-center">350.000 VNĐ</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-xl text-red-500">15 - 20kg</td>
                <td className="px-6 py-4 text-center">180.000 VNĐ</td>
                <td className="px-6 py-4 text-center">215.000 VNĐ</td>
                <td className="px-6 py-4 text-center">400.000 VNĐ</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-xl text-red-500">20 - 30kg</td>
                <td className="px-6 py-4 text-center">210.000 VNĐ</td>
                <td className="px-6 py-4 text-center">245.000 VNĐ</td>
                <td className="px-6 py-4 text-center">450.000 VNĐ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">DỊCH VỤ THÊM</h2>
            </div>
            <div className="p-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Tắm nấm: 30.000 VNĐ</li>
                <li>Tắm trị ve: 30.000 VNĐ</li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#039aff] text-white text-center px-4 py-3">
              <h2 className="text-xl font-semibold">PHỤ THU THÊM</h2>
            </div>
            <div className="p-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Gỡ rối: tùy tình trạng sẽ báo trước khi làm.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nút đặt lịch cho chó */}
        <div className="text-center">
          <Link to="/appointment">
            <button
              className={`group px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isHovered 
                ? 'bg-white text-green-500 border-2 border-green-500' 
                : 'bg-green-500 text-white'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="flex items-center">
                ĐẶT LỊCH
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetService;
