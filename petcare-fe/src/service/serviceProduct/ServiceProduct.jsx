import React, { useState, useEffect } from "react";

const ServiceProduct = () => {
    return (
        <div className="container mx-auto px-4 md:px-8 my-8">
            <div className="flex justify-center">
                <div className="w-full max-w-[1280px] h-[200px] relative overflow-hidden px-4 md:px-8"> {/* Added padding here */}
                    <div className="w-[25%] h-[200px] left-0 top-0 absolute overflow-hidden"> {/* Changed from fixed width to max-w-[1200px] */}
                        <div className="w-[95%] h-[200px] left-[6px] top-0 absolute opacity-20 bg-[#fbb321] rounded-2xl" /> {/* Adjusted width */}
                        <div className="w-[288px] h-[30px] left-[36px] top-[20px] absolute text-[#fbb321] text-[1.5rem] font-bold font-['Quicksand'] leading-normal whitespace-nowrap">Đăng nhập</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[60px] absolute text-[#444444] text-[15px] font-medium font-['Quicksand'] leading-snug whitespace-nowrap">Đăng nhập vào hệ thống để mua hàng</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[90px] absolute text-[#fbb321] text-sm font-bold font-['Quicksand'] leading-snug whitespace-nowrap">#PetShop</div>
                        <button className="w-[90px] h-[40px] left-[149.28px] top-[110px] absolute bg-[#fbb321] rounded-full hover:bg-[#d99a1f] transition-all duration-300 transform hover:scale-110"> {/* Hiệu ứng hover to ra */}
                            <a href="#" className="w-[44.44px] h-[18px] text-white text-sm font-bold font-['Quicksand'] leading-snug">Đăng Nhập</a>
                        </button>

                        {/* Vòng tròn bên trái */}
                        <div className="w-[45px] h-[45px] left-[-21.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên trái */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>

                        {/* Vòng tròn bên phải */}
                        <div className="w-[45px] h-[45px] left-[377.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên phải */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>
                    </div>

                    <div className="w-[25%] h-[200px] left-[25%] top-0 absolute overflow-hidden"> {/* Adjusted width and position */}
                        <div className="w-[95%] h-[200px] left-[6px] top-0 absolute opacity-20 bg-[#f2703e] rounded-2xl" />
                        <div className="w-[288px] h-[30px] left-[36px] top-[20px] absolute text-[#f2703e] text-[1.5rem] font-bold font-['Quicksand'] leading-normal whitespace-nowrap">Cửa hàng</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[60px] absolute text-[#444444] text-sm font-medium font-['Quicksand'] leading-snug whitespace-nowrap">Khám phá các sản phẩm cửa hàng chúng tôi</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[90px] absolute text-[#f2703e] text-sm font-bold font-['Quicksand'] leading-snug whitespace-nowrap">#PetShop</div>
                        <button className="w-[90px] h-[40px] left-[149.28px] top-[110px] absolute bg-[#f2703e] rounded-full hover:bg-[#d66a3c] transition-all duration-300 transform hover:scale-110">
                            <a href="#" className="w-[44.44px] h-[18px] text-white text-sm font-bold font-['Quicksand'] leading-snug">Đặt ngay</a>
                        </button>
                        {/* Vòng tròn bên trái */}
                        <div className="w-[45px] h-[45px] left-[-21.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên trái */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>

                        {/* Vòng tròn bên phải */}
                        <div className="w-[45px] h-[45px] left-[377.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên phải */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>
                    </div>

                    <div className="w-[25%] h-[200px] left-[75%] top-0 absolute overflow-hidden"> {/* Adjusted width and position */}
                        <div className="w-[95%] h-[200px] left-[6px] top-0 absolute opacity-20 bg-[#8a5e3b] rounded-2xl" />
                        <div className="w-[288px] h-[30px] left-[36px] top-[20px] absolute text-[#8a5e3b] text-[1.5rem] font-bold font-['Quicksand'] leading-normal whitespace-nowrap">Thăm khám</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[60px] absolute text-[#444444] text-sm font-medium font-['Quicksand'] leading-snug whitespace-nowrap ">Chăm sóc sức khỏe thú cưng của bạn</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[90px] absolute text-[#8a5e3b] text-sm font-bold font-['Quicksand'] leading-snug whitespace-nowrap">#PetHealth</div>
                        <button className="w-[90px] h-[40px] left-[149.28px] top-[110px] absolute bg-[#8a5e3b] rounded-full hover:bg-[#7b4d2b] transition-all duration-300 transform hover:scale-110">
                            <a href="#" className="w-[44.44px] h-[18px] text-white text-sm font-bold font-['Quicksand'] leading-snug">Đặt ngay</a>
                        </button>
                        {/* Vòng tròn bên trái */}
                        <div className="w-[45px] h-[45px] left-[-21.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên trái */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>

                        {/* Vòng tròn bên phải */}
                        <div className="w-[45px] h-[45px] left-[377.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên phải */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>
                    </div>

                    <div className="w-[25%] h-[200px] left-[50%] top-0 absolute overflow-hidden"> {/* Adjusted width and position */}
                        <div className="w-[95%] h-[200px] left-[6px] top-0 absolute opacity-20 bg-[#039aff] rounded-2xl" />
                        <div className="w-[288px] h-[30px] left-[36px] top-[20px] absolute text-[#039aff] text-[1.5rem] font-bold font-['Quicksand'] leading-normal whitespace-nowrap">Spa thú y</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[60px] absolute text-[#444444] text-sm font-medium font-['Quicksand'] leading-snug whitespace-nowrap">Đặt lịch hẹn chăm sóc thú cưng của bạn</div>
                        <div className="w-[288px] h-[20px] left-[36px] top-[90px] absolute text-[#039aff] text-sm font-bold font-['Quicksand'] leading-snug whitespace-nowrap">#Grooming</div>
                        <button className="w-[90px] h-[40px] left-[149.28px] top-[110px] absolute bg-[#039aff] rounded-full hover:bg-[#0273d8] transition-all duration-300 transform hover:scale-110">
                            <a href="/spa" className="w-[44.44px] h-[18px] text-white text-sm font-bold font-['Quicksand'] leading-snug">Đặt ngay</a>
                        </button>
                        {/* Vòng tròn bên trái */}
                        <div className="w-[45px] h-[45px] left-[-21.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên trái */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>

                        {/* Vòng tròn bên phải */}
                        <div className="w-[45px] h-[45px] left-[377.5px] top-[77.5px] absolute"> {/* Nửa vòng tròn bên phải */}
                            <div className="w-[45px] h-[45px] bg-white rounded-full shadow-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceProduct;


