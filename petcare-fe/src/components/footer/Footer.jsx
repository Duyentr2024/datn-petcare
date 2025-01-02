import React, { useState, useRef } from 'react';
import { FaFacebookSquare, FaInstagramSquare, FaTwitterSquare } from 'react-icons/fa';
import BannerFooter from './BannerFooter';

export default function RenderFooter() {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);

    const toggleCollapse = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <>
            <BannerFooter />
            <svg
                className="top-0 w-full bg-gradient-to-r from-[#dfebdc] to-[#ffffff]"
                height="50px"
                preserveAspectRatio="none"
                viewBox="0 0 1728 50"
                transform="scale(1, -1)"
            >
                <path
                    fill="#fef0d3"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1727.8 16.435v-92.103H-.203v92.103c15.8.2 24 6.173 31.9 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.2-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.5 5.974 17 12.048 33.8 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.503-.1 24.903-6.173 33.003-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.5 5.974 17 12.048 33.8 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h1c16.8 0 25.3-6.074 33.5-12.048 8.5-5.875 16.9-11.849 33.3-11.849z"
                />
            </svg >

            <div className="bg-[#fef0d3] text-gray-800 z-50">

                <div className="container pl-20 mx-auto px-6 py-10">



                    {/* Logo and Subscription */}
                    <div className="flex flex-col md:flex-row  justify-between items-center">
                        <div className="w-1/3 mb-6 md:mb-0 flex justify-center md:justify-start">
                            <img
                                alt="Honey logo"
                                className="w-40"
                                src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/nongsan-logo.png"
                            />
                        </div>
                        <div
                            className="w-full md:w-2/3 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0">
                            <h2 className="text-lg font-semibold size[32px] text-orange-500 mb-3 md:mb-0 md:mr-6">
                                Đăng ký nhận tin
                            </h2>
                            <div className="relative w-full md:w-1/2">
                                <input
                                    className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:border-orange-500"
                                    placeholder="Nhập email của bạn"
                                    type="email"
                                />
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                            strokeLinejoin="round" />
                                        <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pl-3 mt-10">
                        {/* About Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800">Về PetShop</h3>
                            <p className="text-sm text-gray-600 leading-6">
                                PetShop là cửa hàng chuyên cung cấp các sản phẩm chất lượng cho thú cưng, từ thực phẩm, đồ
                                chơi,
                                đến các phụ kiện chăm sóc sức khỏe cho thú cưng. Chúng tôi cam kết mang lại những sản phẩm
                                an toàn
                                và đáng tin cậy cho bạn và thú cưng yêu quý.
                            </p>
                            <p className="text-sm text-gray-600 leading-6">
                                Chứng nhận cửa hàng đạt tiêu chuẩn chất lượng do Bộ Nông Nghiệp và Phát Triển Nông Thôn cấp
                                ngày
                                15/08/2023.
                            </p>
                            <img
                                alt="Pet Shop Certificate"
                                className="mt-4 w-24"
                                src="http://nongsan.monamedia.net/wp-content/uploads/2023/09/bct-img-1.png" // Update this link to your actual image URL
                            />
                        </div>

                        {/* Contact Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800">Thông tin liên hệ</h3>
                            <p className="text-sm text-gray-600">
                                <i className="fas fa-store text-orange-500"></i> Hệ thống chi nhánh cửa hàng
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                                    onClick={toggleCollapse}
                                >
                                    Mona.Media
                                </button>
                                <button
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                                    onClick={toggleCollapse}
                                >
                                    Mona.Software
                                </button>
                            </div>

                            {/* Nội dung Collapse */}
                            <div
                                ref={contentRef}
                                className={`mt-4 space-y-2 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-screen' : 'max-h-0'
                                    }`}
                            >
                                <p className="text-sm text-gray-600">
                                    <i className="fas fa-map-marker-alt text-orange-500"></i> 1073/23 Cách Mạng Tháng 8,
                                    P.7, Q.Tân Bình, TP.HCM
                                </p>
                                <p className="text-sm text-gray-600">
                                    <i className="fas fa-phone text-orange-500"></i> 0313728397
                                </p>
                                <p className="text-sm text-gray-600">
                                    <i className="fas fa-envelope text-orange-500"></i> info@themona.global
                                </p>
                            </div>

                            <p className="text-sm text-gray-600">
                                <i className="fas fa-map-marker-alt text-orange-500"></i> 1073/23 Cách Mạng Tháng 8, P.7,
                                Q.Tân Bình, TP.HCM
                            </p>
                            <p className="text-sm text-gray-600">
                                <i className="fas fa-phone text-orange-500"></i> 0313728397
                            </p>
                            <p className="text-sm text-gray-600">
                                <i className="fas fa-envelope text-orange-500"></i> info@themona.global
                            </p>
                            <h3 className="font-semibold text-lg text-gray-800">Kết nối với chúng tôi</h3>
                            <div className="flex space-x-4">
                                <a className="text-orange-500 hover:text-orange-600" href="#" aria-label="Facebook">
                                    <FaFacebookSquare size={36} />
                                </a>
                                <a className="text-orange-500 hover:text-orange-600" href="#" aria-label="Instagram">
                                    <FaInstagramSquare size={36} />
                                </a>
                                <a className="text-orange-500 hover:text-orange-600" href="#" aria-label="Twitter">
                                    <FaTwitterSquare size={36} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4 justify-items-center">
                            <h3 className="font-semibold text-lg text-gray-800">Liên kết nhanh</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>
                                    <a className="hover:text-orange-500" href="#">Trang chủ</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Giới thiệu</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Dịch vụ doanh nghiệp</a>
                                </li>
                            </ul>
                        </div>

                        {/* Policies */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-800">Chính sách</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>
                                    <a className="hover:text-orange-500" href="#">Chính sách bảo hành</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Câu chuyện thương hiệu</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Chính sách thanh toán</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Chính sách giao hàng</a>
                                </li>
                                <li>
                                    <a className="hover:text-orange-500" href="#">Hướng dẫn mua hàng Online</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-[#FBB321] text-center py-2 text-white rounded-t-2xl px-4 w-full sm:w-full lg:w-full">
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg">
                        Giảm <span className="font-bold">25.000đ</span> phí ship cho đơn hàng trên
                        <span className="font-bold">600.000đ</span>
                    </span>
                </div>
            </div>

        </>
    );
}