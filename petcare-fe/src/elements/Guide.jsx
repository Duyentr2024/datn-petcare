import React from 'react';
import { Link } from 'react-router-dom';

const Guide = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#ffb321]">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-[#ffb321]">Hướng dẫn mua hàng Online</span>
      </nav>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#ffb321] mb-8">
          Hướng dẫn mua hàng Online
        </h1>

        {/* Cách 1: Hotline */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#ffb321] mb-3">
            Cách 1: Hotline
          </h2>
          <p className="text-gray-700 mb-2">
            Gọi điện đến Hotline <a href="tel:0313728397" className="text-[#ffb321] font-medium">0313728397</a> từ 9h đến 20h tất cả các ngày trong tuần. Nhân viên bán hàng sẽ ghi nhận thông tin đặt hàng của bạn
          </p>
        </section>

        {/* Cách 2: Mạng xã hội */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#ffb321] mb-3">
            Cách 2: Mạng xã hội
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Truy cập vào trang Facebook hoặc Instagram chính thức của PetCare
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Chọn mục "Nhắn tin" để được nhân viên trực chat tư vấn về các loại sản phẩm và nhận đơn đặt hàng
            </li>
          </ul>
        </section>

        {/* Cách 3: Website */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[#ffb321] mb-3">
            Cách 3: Website
          </h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Truy cập vào website
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Tìm kiếm sản phẩm:
            </li>
          </ul>

          <div className="pl-6 space-y-3 mb-4">
            <p className="text-gray-700">+ Nhập loại trái cây bạn mong muốn vào ô tìm kiếm, bạn sẽ có kết quả ngay sau khi hoàn thành.</p>
            <p className="text-gray-700">+ Click vào từng danh mục sản phẩm để tìm kiếm</p>
          </div>

          <ul className="space-y-3 text-gray-700 mb-4">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Với mỗi sản phẩm ưng ý, bạn bấm nút CHỌN MUA, sản phẩm sẽ tự động được thêm vào GIỎ HÀNG
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Tại giỏ hàng, bạn có thể bấm nút "Xoá" nếu muốn huỷ sản phẩm đã chọn để mua sản phẩm khác
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sau khi đã chọn được các loại trái cây cần mua, bấm vào THANH TOÁN, và điền đầy đủ, chính xác thông tin cá nhân trong bảng thông tin
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Chọn hình thức thanh toán
            </li>
          </ul>

          <div className="pl-6 space-y-3 mb-4">
            <p className="text-gray-700">+ Thanh toán khi nhận hàng</p>
            <p className="text-gray-700">+ Thanh toán qua cổng Napas bằng thẻ ATM nội địa</p>
            <p className="text-gray-700">+ Thanh toán qua cổng Napas bằng thẻ Visa/ Master Card</p>
          </div>

          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              Sau khi điền đầy đủ thông tin và kiểm tra đơn hàng, giá tiền, bạn bấm vào nút HOÀN TẤT ĐƠN HÀNG gửi về cho PetCare
            </li>
            <li className="flex items-start">
              <span className="text-[#ffb321] mr-2">•</span>
              PetCare sẽ gửi cho bạn email hoặc gọi điện xác nhận đơn hàng.
            </li>
          </ul>
        </section>

        {/* Contact Box */}
        <div className="bg-gray-50 p-6 rounded-lg mt-8">
          <p className="text-gray-700 mb-3">
            Nếu cần hỗ trợ thêm, vui lòng liên hệ:
          </p>
          <a 
            href="tel:0313728397" 
            className="inline-flex items-center text-[#ffb321] hover:underline"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            0313728397 (9h - 20h)
          </a>
        </div>
      </div>
    </div>
  );
};

export default Guide;
