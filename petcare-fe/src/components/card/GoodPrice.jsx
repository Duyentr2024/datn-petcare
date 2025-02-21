import React, { useState, useEffect } from "react";
import { FaPlus, FaPaw } from "react-icons/fa";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import axios from "axios";
import { ProductCard } from "../product/ProductCard";
const GoodPrice = () => {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(7200000);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5; // Số sản phẩm hiển thị trên mỗi lần
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/statistics/best-selling-products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
      });
  }, []);

  // Hàm chuyển sản phẩm tiếp theo
  const nextProduct = () => {
    if (startIndex + visibleCount < products.length) {
      setStartIndex(startIndex + 1);
    }
  };

  // Hàm quay lại sản phẩm trước
  const prevProduct = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
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
  // useEffect(() => {
  //   particlesJS("particles-js", {
  //     particles: {
  //       number: {
  //         value: 80,
  //         density: {
  //           enable: true,
  //           value_area: 800,
  //         },
  //       },
  //       size: {
  //         value: 3,
  //       },
  //       move: {
  //         speed: 3,
  //       },
  //     },
  //   });
  // }, []);

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
      <div className="relative  ">
        <div
          id="particles-js"
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
          style={{ clipPath: "inset(0 0 20% 0)" }} // Chỉ hiển thị hiệu ứng trong vùng cụ thể
        ></div>
        <div className="container p-4 bg-[#FBB321] relative">
          <div className="flex justify-between w-auto mx-32 items-center mb-4  ">
            <div className="flex items-center space-x-2">
              <h1 className="text-white  text-4xl font-bold">
                Sản phẩm bán chạy
              </h1>
              <FaPaw className="w-6 h-6 mr-2 text-white" />
            </div>
         
          </div>

          <div className="relative w-full flex justify-center items-center px-15    ">
            {/* Nút bấm qua trái */}
            <button
              onClick={prevProduct}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#FBB321] font-bold text-white border-2 rounded-full p-2"
            >
              <BsArrowLeft />
            </button>

            {/* Danh sách sản phẩm */}
            <div className="overflow-hidden w-full">
              <div className="grid grid-cols-5 gap-8 transition-transform duration-500">
                {products
                  .slice(startIndex, startIndex + visibleCount)
                  .map((product) => (
                    <Link
                      key={product.productId}
                      to={`/productDetail/${product.productId}`}
                      className="transition-transform hover:scale-105"
                      onClick={() => setSelectedProductId(product.productId)}
                    >
                      <ProductCard
                        image={product.image}
                        name={
                          product.productName.length > 24
                            ? product.productName.slice(0, 24) + "..."
                            : product.productName
                        }
                        price={product.price}
                        productId={product.productId}
                      />
                    </Link>
                  ))}
              </div>
            </div>

            {/* Nút bấm qua phải */}
            <button
              onClick={nextProduct}
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
