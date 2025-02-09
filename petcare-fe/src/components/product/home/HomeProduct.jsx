import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "../ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";
import ProductsService from "../../../service/ProductsService.js"; // Gọi API từ service
import ProductDetailsService from "../../../service/ProductDetailsService.js";

function HomeProduct() {
    const [loading, setLoading] = useState(true);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Gọi API lấy danh sách sản phẩm
                const response = await ProductsService.getAllProductsWithCategory();

                console.log("Dữ liệu API trả về:", response); // Debug API response

                if (!Array.isArray(response)) {
                    throw new Error("API trả về dữ liệu không hợp lệ.");
                }

                // Nhóm sản phẩm theo categoryName và loại bỏ sản phẩm trùng lặp theo productId
                const groupedProducts = response.reduce((acc, product) => {
                    if (!acc[product.categoryName]) {
                        acc[product.categoryName] = new Map(); // Sử dụng Map để loại bỏ trùng lặp
                    }
                    acc[product.categoryName].set(product.productId, product);
                    return acc;
                }, {});

                // Convert Map về Array
                const formattedProducts = Object.keys(groupedProducts).reduce((acc, category) => {
                    acc[category] = [...groupedProducts[category].values()];
                    return acc;
                }, {});

                console.log("Dữ liệu nhóm theo categoryName:", formattedProducts); // Debug dữ liệu nhóm

                setProductsByCategory(formattedProducts);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="">
            <div className="container mx-32 w-auto px-4 py-8">
                {/* Nếu đang loading, hiển thị skeleton */}
                {loading ? (
                    <div className="flex justify-center gap-8">
                        {[...Array(8)].map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    // Hiển thị sản phẩm theo từng categoryName
                    Object.keys(productsByCategory).map((category) => (
                        <div key={category} className="mb-12">
                            {/* Hiển thị tên danh mục */}
                            <div className="flex items-center justify-between gap-2 mb-8 w-[1200px]">
                                <h1 className="text-4xl mx-[70px] font-bold text-[#fbb321]">{category}</h1>
                                <button className="mx-[35px]"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            paddingRight: '0.75rem',
                                            backgroundColor: '#fef0d3',
                                            borderRadius: '9999px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                >
                                    {/* Nền trượt */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 80,
                                            height: '100%',
                                            width: isHovered ? '100%' : '0',
                                            backgroundColor: '#fbb321',
                                            borderRadius: '9999px',
                                            transition: 'width 0.5s ease-in-out',
                                            zIndex: 1,
                                        }}
                                    ></div>

                                    {/* Chữ "Xem thêm" */}
                                    <div
                                        style={{
                                            fontWeight: 500,
                                            borderRadius: '9999px',
                                            backgroundColor: '#fbb321',
                                            color: '#fff',
                                            padding: '0.625rem 1.5rem',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        <span>Xem thêm</span>
                                    </div>

                                    {/* ChevronRight */}
                                    <ChevronRight
                                        size={16}
                                        style={{
                                            zIndex: 3,
                                            borderRadius: '9999px',
                                            border: isHovered ? '1px solid #ffffff' : '1px solid #fbb321',
                                            color: isHovered ? '#fff' : '#fbb321',
                                            backgroundColor: isHovered ? '#fbb321' : 'transparent',
                                            transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out',
                                        }}
                                    />
                                </button>
                            </div>

                            <div className="flex justify-center gap-8">
                                {productsByCategory[category].map((product) => (
                                    <ProductCard
                                        key={product.productId}
                                        image={product.image}
                                        name={product.productName.length > 24
                                            ? product.productName.slice(0, 24) + "..."
                                            : product.productName}
                                        price={product.price}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default HomeProduct;
