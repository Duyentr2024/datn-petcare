import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaFacebookF, FaInstagram, FaPhoneAlt, FaMapMarkerAlt, FaArrowRight, FaInfoCircle, FaCommentDots } from 'react-icons/fa';
import './guide.css';

const Guide = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#FBB321] flex items-center">
          <FaHome className="mr-1" />
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#FBB321]">Hướng dẫn mua hàng Online</span>
      </nav>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FBB321] mb-2">Hướng dẫn mua hàng online Petcare</h1>
        <p className="text-gray-600">Khám phá các cách dễ dàng để mua sắm cho thú cưng của bạn</p>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-800 leading-relaxed">
          Petcare cung cấp nhiều phương thức mua hàng tiện lợi để bạn dễ dàng chăm sóc thú cưng. 
          Hãy chọn cách phù hợp nhất với bạn từ mua online, nhắn tin, gọi hotline, hoặc đến trực tiếp 
          cửa hàng tại Cái Răng, Cần Thơ.
        </p>
      </div>

      {/* Purchase Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeIn">

        {/* Method 1: Message via Facebook/Instagram */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-[#fff8e6] p-3 rounded-full mr-3">
                <FaFacebookF className="text-[#FBB321] text-xl" />
              </div>
              <h3 className="text-xl font-bold text-[#FBB321]">Nhắn tin qua Facebook/Instagram</h3>
            </div>
            
            <div className="space-y-3 mb-4 flex-grow">
              <p className="text-gray-700">
                Liên hệ với chúng tôi qua Messenger hoặc Instagram của Petcare. Gửi tin nhắn với sản phẩm bạn muốn mua, số lượng, và địa chỉ giao hàng.
              </p>
              <p className="text-gray-600 font-medium">
                Facebook: @PetcareOfficial | Instagram: @Petcare_VN
              </p>
              <div className="flex mt-2">
                <FaFacebookF className="text-[#FBB321] text-lg mr-2" />
                <FaInstagram className="text-[#FBB321] text-lg" />
              </div>
            </div>
            
            <a href="https://www.facebook.com/PetcareOfficial" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-2 px-4 rounded-md transition-colors">
              Nhắn tin ngay
            </a>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </div>

        {/* Method 2: Purchase on Website */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-[#fff8e6] p-3 rounded-full mr-3">
                <FaShoppingCart className="text-[#FBB321] text-xl" />
              </div>
              <h3 className="text-xl font-bold text-[#FBB321]">Mua hàng trên Website</h3>
            </div>
            
            <div className="space-y-3 mb-4 flex-grow">
              <p className="text-gray-700">
                Truy cập www.petcare.vn, chọn sản phẩm, thêm vào giỏ hàng, và thanh toán online bằng thẻ tín dụng, ví điện tử, hoặc COD.
              </p>
              <p className="text-[#FBB321] font-medium">
                Nhận ưu đãi giảm giá khi mua online!
              </p>
            </div>
            
            <Link to="/productPage/*" className="inline-block bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-2 px-4 rounded-md transition-colors">
              Mua ngay
            </Link>
          </div>
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
        </div>

        {/* Method 3: Call Hotline */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-[#fff8e6] p-3 rounded-full mr-3">
                <FaPhoneAlt className="text-[#FBB321] text-xl" />
              </div>
              <h3 className="text-xl font-bold text-[#FBB321]">Gọi hotline 0844 233 799</h3>
            </div>
            
            <div className="space-y-3 mb-4 flex-grow">
              <p className="text-gray-700">
                Liên hệ số hotline 0844 233 799 để đặt hàng hoặc được tư vấn. Nhân viên sẽ hỗ trợ bạn chọn sản phẩm và sắp xếp giao hàng.
              </p>
              <p className="text-gray-600 font-medium">
                Hoạt động từ 9:00 - 20:00 hàng ngày.
              </p>
            </div>
            
            <a href="tel:0844233799" className="inline-block bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-2 px-4 rounded-md transition-colors">
              Gọi ngay
            </a>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-400 to-cyan-500"></div>
        </div>

        {/* Method 4: Buy at Store */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="bg-[#fff8e6] p-3 rounded-full mr-3">
                <FaMapMarkerAlt className="text-[#FBB321] text-xl" />
              </div>
              <h3 className="text-xl font-bold text-[#FBB321]">Mua tại cửa hàng</h3>
            </div>
            
            <div className="space-y-3 mb-4 flex-grow">
              <p className="text-gray-700">
                Ghé thăm cửa hàng Petcare tại Cái Răng, Cần Thơ để mua sắm trực tiếp. Nhân viên sẽ tư vấn và hỗ trợ bạn chọn sản phẩm phù hợp.
              </p>
              <p className="text-gray-600 font-medium">
                Địa chỉ: PetCare, Cái Răng, Cần Thơ.
              </p>
            </div>
            
            <a href="https://maps.google.com/?q=Cái+Răng,+Cần+Thơ" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-2 px-4 rounded-md transition-colors">
              Xem bản đồ
            </a>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-[#FBB321]">
        <div className="flex items-start">
          <FaInfoCircle className="text-[#FBB321] text-xl mr-4 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-[#FBB321] mb-2">Lưu ý</h3>
            <p className="text-gray-700 italic">
              Vui lòng kiểm tra kỹ sản phẩm trước khi nhận hàng. Thời gian giao hàng dự kiến: 2-5 ngày tùy khu vực. 
              Đối với các sản phẩm thức ăn và vật dụng có kích thước lớn, có thể phát sinh phí vận chuyển tùy theo khu vực và khối lượng.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Guide */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fadeIn">
        <h3 className="text-xl font-bold text-[#FBB321] mb-6 text-center">Quy trình đặt hàng online</h3>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 shopping-steps">
          <div className="flex flex-col items-center text-center w-full md:w-1/4 shopping-step">
            <div className="w-16 h-16 rounded-full bg-[#fff8e6] flex items-center justify-center mb-3 process-circle">
              <span className="text-[#FBB321] text-xl font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Chọn sản phẩm</h4>
            <p className="text-sm text-gray-600">Duyệt qua danh mục sản phẩm và chọn mặt hàng bạn cần</p>
          </div>
          
          <div className="hidden md:block text-[#FBB321]"><FaArrowRight /></div>
          <div className="block md:hidden text-[#FBB321] rotate-90"><FaArrowRight /></div>
          
          <div className="flex flex-col items-center text-center w-full md:w-1/4 shopping-step">
            <div className="w-16 h-16 rounded-full bg-[#fff8e6] flex items-center justify-center mb-3 process-circle">
              <span className="text-[#FBB321] text-xl font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Thêm vào giỏ</h4>
            <p className="text-sm text-gray-600">Thêm sản phẩm vào giỏ hàng và điều chỉnh số lượng</p>
          </div>
          
          <div className="hidden md:block text-[#FBB321]"><FaArrowRight /></div>
          <div className="block md:hidden text-[#FBB321] rotate-90"><FaArrowRight /></div>
          
          <div className="flex flex-col items-center text-center w-full md:w-1/4 shopping-step">
            <div className="w-16 h-16 rounded-full bg-[#fff8e6] flex items-center justify-center mb-3 process-circle">
              <span className="text-[#FBB321] text-xl font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Thanh toán</h4>
            <p className="text-sm text-gray-600">Chọn phương thức thanh toán và điền thông tin giao hàng</p>
          </div>
          
          <div className="hidden md:block text-[#FBB321]"><FaArrowRight /></div>
          <div className="block md:hidden text-[#FBB321] rotate-90"><FaArrowRight /></div>
          
          <div className="flex flex-col items-center text-center w-full md:w-1/4 shopping-step">
            <div className="w-16 h-16 rounded-full bg-[#fff8e6] flex items-center justify-center mb-3 process-circle">
              <span className="text-[#FBB321] text-xl font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Nhận hàng</h4>
            <p className="text-sm text-gray-600">Theo dõi đơn hàng và nhận sản phẩm tại nhà</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <Link to="/productPage/*" className="bg-[#FBB321] hover:bg-[#e09a0d] text-white font-bold py-3 px-8 rounded-md transition-colors flex items-center justify-center w-full md:w-auto">
          <FaShoppingCart className="mr-2" />
          Bắt đầu mua sắm
        </Link>
        <Link to="/contact" className="bg-white hover:bg-gray-100 text-[#FBB321] font-bold py-3 px-8 rounded-md border border-[#FBB321] transition-colors flex items-center justify-center w-full md:w-auto">
          <FaCommentDots className="mr-2" />
          Hỗ trợ thêm
        </Link>
      </div>
      
    </div>
  );
};

export default Guide;
