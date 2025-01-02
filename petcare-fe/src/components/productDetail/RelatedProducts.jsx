import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight, FaShoppingCart } from "react-icons/fa";

const RelatedProducts = () => {
    const products = [
        {
            id: 1,
            name: "Mật Ong Hoa Nhãn 1L",
            price: "45.000₫",
            isBestSeller: true,
            image: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-1.png",
        },
        {
            id: 2,
            name: "Mật Ong Rừng Đà Lạt 1L",
            price: "45.000₫",
            isBestSeller: true,
            image: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-2.png",
        },
        {
            id: 3,
            name: "Mật Ong Nguyên Chất 1L",
            price: "80.000₫",
            oldPrice: "85.000₫",
            isBestSeller: true,
            image: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-3.png",
        },
        {
            id: 4,
            name: "Mật Ong Nhập Khẩu 1L",
            price: "80.000₫",
            oldPrice: "85.000₫",
            isBestSeller: true,
            image: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-4.png",
        },
        {
            id: 5,
            name: "Mật Ong Hảo Hạng 4L",
            price: "65.000₫",
            isBestSeller: true,
            image: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-1.png",
        },
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    function NextArrow(props) {
        const { onClick } = props;
        return (
            <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white border border-yellow-500 text-yellow-500 p-2 rounded-full shadow hover:bg-yellow-500 hover:text-white transition z-10"
                onClick={onClick}
            >
                <FaArrowRight size={20} />
            </button>
        );
    }

    function PrevArrow(props) {
        const { onClick } = props;
        return (
            <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white border border-yellow-500 text-yellow-500 p-2 rounded-full shadow hover:bg-yellow-500 hover:text-white transition z-10"
                onClick={onClick}
            >
                <FaArrowLeft size={20} />
            </button>
        );
    }

    return (
        <div className="py-8 px-4 relative">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6">Sản phẩm liên quan</h2>
            <Slider {...settings}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition flex flex-col"
                        style={{
                            margin: "0 10px", // Adds 20px spacing between cards
                            height: "350px",
                        }}
                    >

                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-lg mb-4 hover:scale-105 transition-transform"
                        />
                        <h3 className="text-lg font-bold text-gray-800 flex-grow">{product.name}</h3>
                        {product.isBestSeller && (
                            <span className="inline-block bg-yellow-100 text-yellow-500 text-sm px-2 py-1 rounded mt-2">
                    Bán chạy
                </span>
                        )}
                        <div className="flex items-center mt-2">
                            <span className="text-yellow-500 font-bold text-lg">{product.price}</span>
                            {product.oldPrice && (
                                <span className="text-gray-400 line-through text-sm ml-2">
                        {product.oldPrice}
                    </span>
                            )}
                        </div>
                        <button
                            className="mt-4 w-full flex items-center justify-center text-yellow-500 border border-yellow-500 rounded-full p-2 hover:bg-yellow-500 hover:text-white transition">
                            <FaShoppingCart className="mr-2"/>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                ))}
            </Slider>


        </div>
    );
};

export default RelatedProducts;
