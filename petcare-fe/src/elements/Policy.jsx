import React from 'react';
import { Link } from 'react-router-dom';

const Policy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#ffb321]">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-[#ffb321]">Chính sách bảo hành</span>
      </nav>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#ffb321] mb-8">
          Chính sách bảo hành
        </h1>

        {/* Kênh tiếp nhận */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#ffb321] mb-4">
            Kênh tiếp nhận đổi trả
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Tại cửa hàng đã mua sản phẩm
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Tại trang Facebook hoặc Instagram
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Thông qua Hotline  <a href="tel:0313728397" className="text-[#ffb321] font-medium"> 0313728397</a>  (8:00 – 21:00)
            </li>
          </ul>
        </section>

        {/* Phương thức đổi trả */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#ffb321] mb-4">
            Phương thức đổi trả
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Đổi sản phẩm mới
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Tặng voucher
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Hoàn tiền
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Phương thức đổi trả có thể linh động dựa vào mức độ lỗi của trái cây và nguyện vọng của khách hàng
            </li>
          </ul>
        </section>

        {/* Các trường hợp được đổi trả */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#ffb321] mb-4">
            Các trường hợp được đổi trả
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm giao sai hoặc giao thiếu theo đơn hàng
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm bị lỗi chất lượng, hư hỏng do lỗi của nhà sản phẩm
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm có dấu hiệu đã qua sử dụng hoặc hết hạn sử dụng tại thời điểm nhận hàng
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm bị hư hỏng, cấn dập trong quá trình vận chuyển tới khách hàng
            </li>
          </ul>
        </section>

        {/* Điều kiện đổi trả */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#ffb321] mb-4">
            Điều kiện đổi trả sản phẩm
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm được mua tại các hệ thống chính thức của PetCare (Khách hàng cung cấp số điện thoại có lịch sử mua hàng trên hệ thống)
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sản phẩm được bảo quản đúng cách, theo khuyến cáo của PetCare
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <div className="bg-gray-50 p-6 rounded-lg mt-8">
          <p className="text-gray-700">
            Để được hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua:
          </p>
          <div className="mt-4">
            <a 
              href="tel:0313728397" 
              className="inline-flex items-center text-[#ffb321] hover:underline"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              0313728397
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;
