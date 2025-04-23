import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard } from "../ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";
import ProductsService from "../../../service/serviceProduct/ProductsService.js";
import ProductDetailsService from "../../../service/serviceProduct/ProductDetailsService.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Hiệu ứng fade-in + slide-up + scale nhẹ
const fadeInUp = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

// Hiệu ứng stagger cho các khối
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

function HomeProduct() {
    const [loading, setLoading] = useState(true);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductsService.getAllProductsWithCategory();
                const groupedProducts = response.reduce((acc, product) => {
                    if (!acc[product.categoryName]) {
                        acc[product.categoryName] = new Map();
                    }
                    acc[product.categoryName].set(product.productId, product);
                    return acc;
                }, {});

                // Chuyển đổi Map thành mảng
                const formattedProducts = Object.keys(groupedProducts).reduce((acc, category) => {
                    acc[category] = [...groupedProducts[category].values()];
                    return acc;
                }, {});

                // Lấy ngẫu nhiên 2 danh mục
                const categories = Object.keys(formattedProducts);
                const randomCategories = categories
                    .sort(() => Math.random() - 0.5) // Xáo trộn ngẫu nhiên
                    .slice(0, 2); // Lấy 2 danh mục đầu tiên

                // Tạo object mới chỉ chứa 2 danh mục ngẫu nhiên
                const randomProductsByCategory = randomCategories.reduce((acc, category) => {
                    acc[category] = formattedProducts[category];
                    return acc;
                }, {});

                setProductsByCategory(randomProductsByCategory);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!selectedProductId) return;

            try {
                const details = await ProductDetailsService.getProductDetailsDTOByProductId(selectedProductId);
                setProductDetails(details);
            } catch (error) {
                console.error(`Lỗi khi lấy chi tiết sản phẩm ${selectedProductId}:`, error);
            }
        };

        fetchProductDetails();
    }, [selectedProductId]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="container mx-32 w-auto py-8">
            {loading ? (
                <div className="flex justify-center gap-8">
                    {[...Array(4)].map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <>
                    {Object.keys(productsByCategory).map((category, index) => (
                        <React.Fragment key={category}>
                            <div className="mb-12">
                                <div className="flex items-center justify-between mb-8">
                                    <h1 className="text-4xl font-bold text-[#FBB321]">{category}</h1>
                                </div>

                                <Slider {...settings} className="w-auto">
                                    {productsByCategory[category].map((product) => (
                                        <div key={product.productId} className="px-2">
                                            <Link
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
                                        </div>
                                    ))}
                                </Slider>
                            </div>

                            {/* Hiển thị hai banner sau danh mục đầu tiên */}
                            {index === 0 && (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    variants={fadeInUp}
                                    viewport={{ once: false, amount: 0.2 }}
                                    className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
                                >
                                    {/* Banner 1: Phụ kiện cho mèo */}
                                    <a
                                        href="#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block group"
                                    >
                                        <img
                                            src="https://theme.hstatic.net/200000263355/1001161916/14/home_collection_3_image.jpg?v=135"
                                            alt="Phụ kiện cho mèo - Mozzi Pet Shop"
                                            className="w-full max-w-full object-contain rounded-3xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                                            onError={(e) => (e.target.src = "https://via.placeholder.com/700x400")}
                                        />
                                    </a>

                                    {/* Banner 2: Phụ kiện cho chó */}
                                    <a
                                        href="#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block group"
                                    >
                                        <img
                                            src="https://theme.hstatic.net/200000263355/1001161916/14/home_collection_4_image.jpg?v=135"
                                            alt="Phụ kiện cho chó - Mozzi Pet Shop"
                                            className="w-full max-w-full object-contain rounded-3xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                                            onError={(e) => (e.target.src = "https://via.placeholder.com/700x400")}
                                        />
                                    </a>
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}

                    {/* Section Giới thiệu về chúng tôi */}
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeInUp}
                        viewport={{ once: false, amount: 0.2 }}
                        className="py-16 p-8 border-2 border-[#FBB321] rounded-3xl bg-gradient-to-b from-[#FDF0D1] to-[#FFF7E6]"
                    >
                        <h2 className="text-4xl font-bold text-[#FBB321] mb-12 text-center tracking-tight">
                            Giới thiệu về chúng tôi
                        </h2>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gradient-to-b from-[#FEF3D5] to-[#FFF7E6] rounded-3xl"
                        >
                            {/* Khối 1: Sản phẩm chất lượng */}
                            <motion.div
                                variants={fadeInUp}
                                className="bg-gradient-to-br from-[#FFF7E6] to-white rounded-3xl shadow-md p-6 text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border border-gray-100"
                            >
                                <i className="fas fa-star text-[#FBB321] text-4xl mb-4"></i>
                                <h3 className="text-xl font-semibold text-[#FBB321] mb-3">
                                    Sản phẩm chất lượng
                                </h3>
                                <p className="text-gray-700 text-base">
                                    Cung cấp các sản phẩm an toàn, chất lượng cao, được thiết kế đặc biệt cho thú cưng của bạn.
                                </p>
                            </motion.div>

                            {/* Khối 2: Dịch vụ tận tâm */}
                            <motion.div
                                variants={fadeInUp}
                                className="bg-gradient-to-br from-[#FFF7E6] to-white rounded-3xl shadow-md p-6 text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border border-gray-100"
                            >
                                <i className="fas fa-heart text-[#FBB321] text-4xl mb-4"></i>
                                <h3 className="text-xl font-semibold text-[#FBB321] mb-3">
                                    Dịch vụ tận tâm
                                </h3>
                                <p className="text-gray-700 text-base">
                                    Đội ngũ hỗ trợ 24/7, luôn sẵn sàng tư vấn và giải đáp mọi thắc mắc của bạn.
                                </p>
                            </motion.div>

                            {/* Khối 3: Giao hàng nhanh */}
                            <motion.div
                                variants={fadeInUp}
                                className="bg-gradient-to-br from-[#FFF7E6] to-white rounded-3xl shadow-md p-6 text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border border-gray-100"
                            >
                                <i className="fas fa-shipping-fast text-[#FBB321] text-4xl mb-4"></i>
                                <h3 className="text-xl font-semibold text-[#FBB321] mb-3">
                                    Giao hàng nhanh
                                </h3>
                                <p className="text-gray-700 text-base">
                                    Giao hàng toàn quốc, nhanh chóng, đảm bảo sản phẩm đến tay bạn đúng hẹn.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.section>
                </>
            )}
        </div>
    );
}
export default HomeProduct;