import React, { useState, useEffect } from "react";
import { FaPlus, FaPaw } from "react-icons/fa";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const GoodPrice = () => {
  const [products, setProducts] = useState([
    {
      name: "Bát ăn đôi hình con ếch cho chó mèo",
      price: "60.000₫",
      imgUrl: "https://placehold.co/300x300",
    },
    {
      name: "Gel dinh dưỡng cho chó mèo NUTRI-PLUS GEL",
      price: "45.000₫",
      imgUrl: "https://placehold.co/300x300",
    },
    {
      name: "Đồ chơi nhồi bông chút chít cho chó",
      price: "80.000₫",
      imgUrl:
        "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-4.png",
    },
    {
      name: "Thức ăn Chim cút sấy khô cho chó mèo",
      price: "80.000₫",
      imgUrl: "https://placehold.co/300x300",
    },
    {
      name: "Sữa tắm hoa trà CAMELLIA dạng gel cho chó mèo",
      price: "100.000₫",
      imgUrl: "https://placehold.co/300x300",
    },
  ]);

  const [timeLeft, setTimeLeft] = useState(7200000);

  const nextProduct = () => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts.push(updatedProducts.shift());
      return updatedProducts;
    });
  };

  const prevProduct = () => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts.unshift(updatedProducts.pop());
      return updatedProducts;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ];
  };
  // countdownTimer
  const [hours, minutes, seconds] = formatTime(timeLeft);
  //hiệu ứng js
  useEffect(() => {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        size: {
          value: 3,
        },
        move: {
          speed: 3,
        },
      },
    });
  }, []);

  return (
    <>
      <svg
        className="top-0 w-full"
        height="100px"
        preserveAspectRatio="none"
        viewBox="0 0 1728 200"
        transform="scale(1, -1)"
      >
        <path
          fill="#FBB321"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1727.8 16.435v-92.103H-.203v92.103c15.8.2 24 6.173 31.9 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.2-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.2-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.5 12.048h.5c16.503-.1 24.903-6.173 33.003-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.5 5.974 17 12.048 33.8 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h1c16.8 0 25.3-6.074 33.5-12.048 8.5-5.875 16.9-11.849 33.3-11.849z"
        />
      </svg>
      <div className="relative">
        <div
          id="particles-js"
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
          style={{ clipPath: "inset(0 0 20% 0)" }} // Chỉ hiển thị hiệu ứng trong vùng cụ thể
        ></div>
        <div className="container mx-auto p-4 bg-[#FBB321] relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-white text-2xl font-bold">
                Sản phẩm khuyến mãi
              </h1>
              <FaPaw className="w-6 h-6 mr-2 text-white" />
            </div>
            <div className="flex space-x-2">
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-lg border-4 border-[#FBB321] text-2xl font-bold shadow-2xl shadow-white">
                {hours}
              </div>
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-lg border-4 border-[#FBB321] text-2xl font-bold shadow-2xl shadow-white">
                {minutes}
              </div>
              <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-lg border-4 border-[#FBB321] text-2xl font-bold shadow-2xl shadow-white">
                {seconds}
              </div>
            </div>
          </div>

          <h2 className="text-white text-4xl font-bold mb-6">
            Giá tốt mỗi ngày
          </h2>

          <div className="flex justify-center relative">
            <button
              onClick={nextProduct}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#FBB321] font-bold text-white border-2 rounded-full p-2"
            >
              <BsArrowLeft />
            </button>

            <div className="flex overflow-hidden">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-4 w-64 transition-all duration-500 ease-in-out mx-2 group relative"
                >
                  <div className="relative group overflow-hidden rounded-lg">
                    <img
                      alt={product.name}
                      className="w-full h-50 object-cover rounded-lg transform transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-125"
                      src={product.imgUrl}
                    />
                    {/* Hiệu ứng overlay */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"></div>
                  </div>

                  <h3 className="text-gray-800 text-lg font-semibold mt-4">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-yellow-500 text-xl font-bold">
                      {product.price}
                    </span>
                    <button className="bg-white text-[#FBB321] p-2 rounded-full border-2 border-[#FBB321] relative group">
                      <FaPlus className="transform group-hover:rotate-45 transition-all duration-300" />
                      <div className="tooltip absolute right-full top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 bg-[#FBB321] text-white text-sm px-2 py-2 whitespace-nowrap rounded transition-all duration-300 ease-in-out">
                        Xem sản phẩm
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevProduct}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#FBB321] font-bold text-white border-2 rounded-full p-2"
            >
              <BsArrowRight />
            </button>
          </div>

          {/* Hiệu ứng gợn sóng */}
          {/* <svg
          className="absolute bottom-0 left-0 w-full"
          height="200px"
          preserveAspectRatio="none"
          viewBox="0 0 1728 200"
        >
          <path
            fill="#F36F3F"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1727.8 16.435v-92.103H-.203v92.103c15.8.2 24 6.173 31.9 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.5 12.048h.5c16.503-.1 24.903-6.173 33.003-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849z"
          />
        </svg> */}
        </div>
      </div>

      <svg
        className="top-0 w-full"
        height="100px"
        preserveAspectRatio="none"
        viewBox="0 0 1728 200"
      >
        <path
          fill="#FBB321"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1727.8 16.435v-92.103H-.203v92.103c15.8.2 24 6.173 31.9 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.2-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.6 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.974 16.7 12.048 33.5 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.2-5.875 16.5-11.849 33-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.3 5.974 16.8 12.048 33.5 12.048h.5c16.503-.1 24.903-6.173 33.003-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.7 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.5 5.974 17 12.048 33.8 12.048h.5c16.4-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h.5c16.5-.1 24.9-6.173 33-12.048 8.1-5.875 16.5-11.849 32.9-11.849h.5c16.1.1 24.4 6.074 32.4 11.849 8.2 5.875 16.8 12.048 33.5 12.048h1c16.8 0 25.3-6.074 33.5-12.048 8.5-5.875 16.9-11.849 33.3-11.849z"
        />
      </svg>
    </>
  );
};

export default GoodPrice;
