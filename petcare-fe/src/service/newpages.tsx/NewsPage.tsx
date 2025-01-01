import React, { useState, useEffect } from "react";

const NewsPage = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tin tức nổi bật */}
            <h1 className="text-4xl font-bold text-[#FBB321] mb-6 text-center lg:text-left">
                Tin tức nổi bật
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                <div className="lg:col-span-2">
                    <div className="relative overflow-hidden rounded-lg group">
                        <a href="#">
                            <img
                                src="https://file.hstatic.net/200000263355/article/xo_giun_cho_meo-2_c91339a8e53946cf8d7b0225ff0243fd_large.png"
                                alt="Pet shop with various pets"
                                className="w-full h-48 sm:h-64 lg:h-96 transition-transform duration-1000 group-hover:scale-110"
                            />
                        </a>
                    </div>
                    <div className="group mt-3">
                        <a
                            href="#"
                            className="text-xl font-bold mb-2 transition-colors duration-[1000ms] group-hover:text-[#FBB321]"
                        >
                            CHĂM SÓC THÚ CƯNG TẠI PETSHOP CỦA CHÚNG TÔI
                        </a>
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">
                        2023-09-20 09:56:24 • Petshop News
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Tại petshop của chúng tôi, bạn sẽ tìm thấy tất cả những gì cần thiết cho thú cưng của bạn...
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <a href="#" className="group flex-shrink-0">
                            <img
                                src="https://file.hstatic.net/200000263355/article/thuoc_xo_giun_cho_cho-1_0e28581982ec4ba58642c98b98406b1f_large.png"
                                alt="Cute puppies for sale"
                                className="rounded-lg w-32 h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </a>
                        <div className="flex-grow">
                            <a
                                href="#"
                                className="text-base sm:text-lg font-bold transition-colors duration-500 hover:text-[#FBB321]"
                            >
                                MUA CHÓ CẢNH VỚI GIÁ CẢ HỢP LÝ
                            </a>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                2023-09-20 09:55:38 • Petshop News
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <a href="#" className="group flex-shrink-0">
                            <img
                                src="https://file.hstatic.net/200000263355/article/vong_co_cho_meo-5_88e337a5810745129edea6e2b0e60385_large.png"
                                alt="Grooming pet services"
                                className="rounded-lg w-32 h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </a>
                        <div className="flex-grow">
                            <a
                                href="#"
                                className="text-base sm:text-lg font-bold transition-colors duration-500 hover:text-[#FBB321]"
                            >
                                DỊCH VỤ TẮM GỘI VÀ CHĂM SÓC CHO THÚ CƯNG
                            </a>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                2023-09-20 09:55:05 • Petshop News
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="#" className="group flex-shrink-0">
                            <img
                                src="https://file.hstatic.net/200000263355/article/quan_ao_cho_meo-1_570823559e9d4d248d88191af21c79a1_large.png"
                                alt="Pet food and accessories"
                                className="rounded-lg w-32 h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </a>
                        <div className="flex-grow">
                            <a
                                href="#"
                                className="text-base sm:text-lg font-bold transition-colors duration-500 hover:text-[#FBB321]"
                            >
                                CÁC SẢN PHẨM THỰC PHẨM VÀ PHỤ KIỆN CHO THÚ CƯNG
                            </a>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                2023-09-15 07:45:15 • Petshop News
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bài viết mới nhất */}
            <div className="container mx-auto mt-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#FBB321] mb-6 text-center lg:text-left">
                    Bài viết mới nhất
                </h1>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Phần bài viết bên trái */}
                    <div className="news-left flex-1">
                        <div className="news-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="news-item">
                                <div className="rounded-lg overflow-hidden shadow-md group">
                                    <div className="relative overflow-hidden">
                                        <a href="#">
                                            <img
                                                src="https://file.hstatic.net/200000263355/article/bang_ten_cho_meo-3_1caac8d380aa4f4e83d515ff6bc477a6_large.png" // Thay đổi URL hình ảnh
                                                alt="Pet shop products"
                                                className="w-full h-36 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </a>
                                    </div>
                                    <div className="content p-4">
                                        <a href="#">
                                            <h2 className="text-base sm:text-lg font-bold mb-2 transition-colors duration-500 hover:text-[#FBB321]">
                                                CHĂM SÓC THÚ CƯNG VÀ MUA SẮM SẢN PHẨM CHO PET
                                            </h2>
                                        </a>
                                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                            2023-09-20 09:56:24 • Petshop News
                                        </p>
                                        <p className="text-gray-700 text-xs sm:text-sm">
                                            Chúng tôi cung cấp các sản phẩm tốt nhất cho thú cưng của bạn. Hãy ghé thăm cửa hàng của chúng tôi ngay hôm nay...
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="news-item">
                                <div className="rounded-lg overflow-hidden shadow-md group">
                                    <div className="relative overflow-hidden">
                                        <a href="#">
                                            <img
                                                src="https://file.hstatic.net/200000263355/article/bang_ten_cho_meo-3_1caac8d380aa4f4e83d515ff6bc477a6_large.png" // Thay đổi URL hình ảnh
                                                alt="Pet shop products"
                                                className="w-full h-36 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </a>
                                    </div>
                                    <div className="content p-4">
                                        <a href="#">
                                            <h2 className="text-base sm:text-lg font-bold mb-2 transition-colors duration-500 hover:text-[#FBB321]">
                                                CHĂM SÓC THÚ CƯNG VÀ MUA SẮM SẢN PHẨM CHO PET
                                            </h2>
                                        </a>
                                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                            2023-09-20 09:56:24 • Petshop News
                                        </p>
                                        <p className="text-gray-700 text-xs sm:text-sm">
                                            Chúng tôi cung cấp các sản phẩm tốt nhất cho thú cưng của bạn. Hãy ghé thăm cửa hàng của chúng tôi ngay hôm nay...
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="news-item">
                                <div className="rounded-lg overflow-hidden shadow-md group">
                                    <div className="relative overflow-hidden">
                                        <a href="#">
                                            <img
                                                src="https://file.hstatic.net/200000263355/article/bang_ten_cho_meo-3_1caac8d380aa4f4e83d515ff6bc477a6_large.png" // Thay đổi URL hình ảnh
                                                alt="Pet shop products"
                                                className="w-full h-36 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </a>
                                    </div>
                                    <div className="content p-4">
                                        <a href="#">
                                            <h2 className="text-base sm:text-lg font-bold mb-2 transition-colors duration-500 hover:text-[#FBB321]">
                                                CHĂM SÓC THÚ CƯNG VÀ MUA SẮM SẢN PHẨM CHO PET
                                            </h2>
                                        </a>
                                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                            2023-09-20 09:56:24 • Petshop News
                                        </p>
                                        <p className="text-gray-700 text-xs sm:text-sm">
                                            Chúng tôi cung cấp các sản phẩm tốt nhất cho thú cưng của bạn. Hãy ghé thăm cửa hàng của chúng tôi ngay hôm nay...
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="news-item">
                                <div className="rounded-lg overflow-hidden shadow-md group">
                                    <div className="relative overflow-hidden">
                                        <a href="#">
                                            <img
                                                src="https://file.hstatic.net/200000263355/article/bang_ten_cho_meo-3_1caac8d380aa4f4e83d515ff6bc477a6_large.png" // Thay đổi URL hình ảnh
                                                alt="Pet shop products"
                                                className="w-full h-36 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </a>
                                    </div>
                                    <div className="content p-4">
                                        <a href="#">
                                            <h2 className="text-base sm:text-lg font-bold mb-2 transition-colors duration-500 hover:text-[#FBB321]">
                                                CHĂM SÓC THÚ CƯNG VÀ MUA SẮM SẢN PHẨM CHO PET
                                            </h2>
                                        </a>
                                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                            2023-09-20 09:56:24 • Petshop News
                                        </p>
                                        <p className="text-gray-700 text-xs sm:text-sm">
                                            Chúng tôi cung cấp các sản phẩm tốt nhất cho thú cưng của bạn. Hãy ghé thăm cửa hàng của chúng tôi ngay hôm nay...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phần danh mục bên phải */}
                    <div className="news-right flex-none md:w-1/3 lg:w-1/4">
                        <div className="news-right-block bg-white shadow-md rounded-lg p-4">
                            <h2 className="text-xl font-bold text-[#FBB321] mb-4 text-center">Danh mục sản phẩm</h2>
                            <ul className="space-y-2">
                                <li className="flex justify-between items-center">
                                    <a href="#" className="hover:text-[#FBB321] transition">
                                        Thú cưng
                                    </a>
                                </li>
                                <hr className="flex-grow border-t border-yellow-500" />
                                <li className="flex justify-between items-center">
                                    <a href="#" className="hover:text-[#FBB321] transition">
                                        Thức ăn cho thú cưng
                                    </a>
                                </li>
                                <hr className="flex-grow border-t border-yellow-500" />
                                <li className="flex justify-between items-center">
                                    <a href="#" className="hover:text-[#FBB321] transition">
                                        Phụ kiện thú cưng
                                    </a>
                                </li>
                                <hr className="flex-grow border-t border-yellow-500" />
                                <li className="flex justify-between items-center">
                                    <a href="#" className="hover:text-[#FBB321] transition">
                                        Dịch vụ chăm sóc thú cưng
                                    </a>
                                </li>
                                <hr className="flex-grow border-t border-yellow-500" />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
