import { FaArrowCircleRight } from "react-icons/fa";
const BannerFooter = () => {
    return (
        <div className="bg-gradient-to-r from-[#dfebdc] to-[#ffffff] min-h-[50vh] flex flex-col items-center justify-center px-4 md:px-8">
            {/* Phần giữa chiếm toàn màn hình */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Nội dung bên trái */}
                <div className="space-y-6 text-center lg:text-left pt-4">
                    <p className="text-yellow-600 text-lg font-semibold uppercase tracking-wide">
                        Ưu đãi
                    </p>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800">
                        Giảm giá đến <span className="text-yellow-500">50%</span>
                    </h2>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                        Tài khoản mới
                    </h1>
                    <div className="flex items-center justify-center lg:justify-start">
                        <button className="bg-yellow-500 text-white px-6 py-3 flex items-center group space-x-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 rounded-full">
                            <span className="relative overflow-hidden">
                                <span className="absolute inset-0 transform translate-x-[-100%] group-hover:translate-x-0 transition-all duration-300"></span>
                                <span className="relative z-10">Đăng ký</span>
                            </span>
                            <FaArrowCircleRight className="h-5 w-5 transform transition-all duration-300 group-hover:text-yellow-300 group-hover:translate-x-2" />
                        </button>
                    </div>

                    {/* Các biểu tượng bên dưới */}
                    <div className="py-8 w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: "👍", text: "Chất lượng hảo hạng" },
                                { icon: "🏅", text: "Đảm bảo xuất xứ" },
                                { icon: "🚚", text: "Giao hàng siêu tốc" },
                                { icon: "🔄", text: "Đổi trả dễ dàng" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center space-y-2"
                                >
                                    <span className="text-4xl text-yellow-500">{item.icon}</span>
                                    <p className="text-gray-600 font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hình ảnh bên phải */}
                <div className="relative flex justify-end items-end">
                    {/* Chỉnh justify-end và items-end để căn chỉnh bên phải */}
                    <div
                        className="bg-yellow-500 w-96 h-72 md:w-[28rem] md:h-[23rem] absolute"
                        style={{
                            borderRadius: '200px 20px 20px 20px', // Góc trên trái (TL), trên phải (TR), dưới phải (BR), dưới trái (BL)
                        }}
                    ></div>
                    <img
                        src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/person.png"
                        alt=""
                        className="relative z-10 w-64 md:w-80 h-auto -translate-x-4 md:-translate-x-52"
                    /* Sử dụng translate-x để đẩy hình sang trái */
                    />

                    {/* Các thẻ nổi bật */}
                    <div className="z-10 absolute top-8 bg-white/80 backdrop-blur-md shadow-lg px-5 py-3 rounded-full flex items-center space-x-3 hover:shadow-xl hover:bg-yellow-50/80 transition duration-300 -translate-y-10">
                        <img
                            width="32"
                            height="32"
                            src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/con-ong.png"
                            alt="Đa dạng sản phẩm"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="text-gray-800 text-sm font-semibold">
                            Đa dạng sản phẩm
                        </span>
                    </div>

                    <div className="z-10 absolute bottom-0 right-0 bg-white/80 backdrop-blur-md shadow-lg px-5 py-3 rounded-full flex items-center space-x-3 hover:shadow-xl hover:bg-yellow-50/80 transition duration-300">
                        <img
                            width="32"
                            height="32"
                            src="http://nongsan.monamedia.net/wp-content/uploads/2023/09/ud-action-icon-3.svg"
                            alt="Khách hàng tin tưởng"
                            className="w-8 h-8 object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                        <span className="text-gray-800 text-sm font-semibold">
                            Khách hàng tin tưởng
                        </span>
                    </div>

                    <div className="z-10 absolute bottom-0 left-0 bg-white/80 backdrop-blur-md shadow-lg px-4 py-3 rounded-full flex items-center space-x-3 hover:shadow-xl hover:bg-yellow-50/80 transition duration-300 -translate-y-32 -translate-x-10">
                        <img
                            width="32"
                            height="32"
                            src="http://nongsan.monamedia.net/wp-content/uploads/2023/09/ud-action-icon-2.svg"
                            alt="Ưu đãi"
                            className="w-8 h-8 object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                        <span className="text-gray-800 text-sm font-semibold">
                            Vô vàn ưu đãi
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default BannerFooter
