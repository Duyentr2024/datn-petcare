import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";
import ProductsService from "../../../service/serviceProduct/ProductsService.js";
import ProductDetailsService from "../../../service/serviceProduct/ProductDetailsService.js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
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

                const formattedProducts = Object.keys(groupedProducts).reduce((acc, category) => {
                    acc[category] = [...groupedProducts[category].values()];
                    return acc;
                }, {});

                setProductsByCategory(formattedProducts);
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

   
return (
    <div className="container mx-32 w-auto py-8">
        {loading ? (
            <div className="flex justify-center gap-8">
                {[...Array(4)].map((_, index) => (
                    <ProductSkeleton key={index} />
                ))}
            </div>
        ) : (
            Object.keys(productsByCategory).map((category) => (
                <div key={category} className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-[#fbb321]">{category}</h1>
                    </div>

                    {/* Swiper để hiển thị tối đa 4 sản phẩm và trượt khi có thêm sản phẩm */}
                    <Swiper
                        slidesPerView={1} // Mặc định hiển thị 1 sản phẩm
                        breakpoints={{
                            768: { slidesPerView: 2 }, // Màn hình trung bình hiển thị 2 sản phẩm
                            1024: { slidesPerView: 3 }, // Màn hình lớn hiển thị 3 sản phẩm
                            1280: { slidesPerView: 5 }, // Màn hình rất lớn hiển thị 5 sản phẩm
                        }}
                        spaceBetween={16} // Khoảng cách giữa các sản phẩm
                        navigation={true} // Nút điều hướng
                        modules={[Navigation]}
                        className="w-auto"
                    >
                        {productsByCategory[category].map((product) => (
                            <SwiperSlide key={product.productId} className="flex justify-center">
                                <Link
                                    to={`/productDetail/${product.productId}`}
                                    className="transition-transform hover:scale-105"
                                    onClick={() => setSelectedProductId(product.productId)}
                                >
                                    <ProductCard
                                        image={product.image}
                                        name={product.productName.length > 24
                                            ? product.productName.slice(0, 24) + "..."
                                            : product.productName}
                                        price={product.price}
                                        productId={product.productId}
                                    />
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            ))
        )}
    </div>
);
}

export default HomeProduct;
