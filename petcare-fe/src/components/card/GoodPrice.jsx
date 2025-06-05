import React, { useState, useEffect } from "react";
import { FaPaw } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { ProductCard } from "../product/ProductCard";

// Hiệu ứng fade-in + slide-up
const fadeInUp = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

// Hiệu ứng stagger cho slider
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const GoodPrice = () => {
    const [products, setProducts] = useState([]);
    const [timeLeft, setTimeLeft] = useState(7200000); // 2 giờ

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

    const [hours, minutes, seconds] = formatTime(timeLeft);

    // Cấu hình cho react-slick
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: true,
        prevArrow: (
            <button className="slick-prev bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        ),
        nextArrow: (
            <button className="slick-next bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        ),
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: false, amount: 0.2 }}
            className="relative bg-gradient-to-br from-[#FFF3E0] to-[#FFD700] py-16"
        >
            {/* SVG Wave Top */}
            <svg
                className="absolute top-0 w-full z-0"
                height="80px"
                preserveAspectRatio="none"
                viewBox="0 0 1728 100"
            >
                <motion.path
                    fill="#FBB321"
                    initial={{ y: 20, opacity: 0.8 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    d="M1728 0H0v50c50 30 150 50 300 50s250-20 400 0 250 50 400 0 250-20 400 0 150-30 228-50V0z"
                />
            </svg>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header & Countdown */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-4xl font-bold text-[#4B2E1A]">Sản phẩm bán chạy</h1>
                        <FaPaw className="w-8 h-8 text-[#FBB321]" />
                    </div>
                    <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-lg">
                        <span className="text-lg font-semibold text-[#4B2E1A]">Kết thúc sau:</span>
                        <div className="flex space-x-2">
                            <div className="bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white rounded-lg px-4 py-2 font-bold">
                                {hours}
                            </div>
                            <span className="text-[#4B2E1A] font-bold">:</span>
                            <div className="bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white rounded-lg px-4 py-2 font-bold">
                                {minutes}
                            </div>
                            <span className="text-[#4B2E1A] font-bold">:</span>
                            <div className="bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white rounded-lg px-4 py-2 font-bold">
                                {seconds}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    className="relative z-20"
                >
                    <Slider {...sliderSettings} className="relative">
                        {products.map((product) => (
                            <motion.div
                                key={product.productId}
                                variants={fadeInUp}
                                className="px-2"
                            >
                                <Link
                                    to={`/productDetail/${product.productId}`}
                                    className="block transition-transform hover:scale-105 z-30"
                                >
                                    <div className="relative z-30">
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
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </Slider>
                </motion.div>
            </div>

            {/* SVG Wave Bottom */}
            <svg
                className="absolute bottom-0 w-full z-0"
                height="80px"
                preserveAspectRatio="none"
                viewBox="0 0 1728 100"
            >
                <motion.path
                    fill="#FBB321"
                    initial={{ y: -20, opacity: 0.8 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    d="M1728 100H0v-50c50-30 150-50 300-50s250 20 400 0 250-50 400 0 250 20 400 0 150 30 228 50v50z"
                />
            </svg>
        </motion.div>
    );
};

export default GoodPrice;