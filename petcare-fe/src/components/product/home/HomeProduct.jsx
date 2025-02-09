import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";
import ProductsService from "../../../service/ProductsService.js";
import ProductDetailsService from "../../../service/ProductDetailsService.js"; // Import service mới

function HomeProduct() {
    const [loading, setLoading] = useState(true);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [selectedProductId, setSelectedProductId] = useState(null); // State lưu productId
    const [productDetails, setProductDetails] = useState(null); // Lưu chi tiết sản phẩm

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await ProductsService.getAllProductsWithCategory();

                if (!Array.isArray(response)) {
                    throw new Error("API trả về dữ liệu không hợp lệ.");
                }

                // Nhóm sản phẩm theo categoryName và loại bỏ trùng lặp theo productId
                const groupedProducts = response.reduce((acc, product) => {
                    if (!acc[product.categoryName]) {
                        acc[product.categoryName] = new Map();
                    }
                    acc[product.categoryName].set(product.productId, product);
                    return acc;
                }, {});

                // Convert Map về Array
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

    // useEffect mới: Gọi API khi có selectedProductId
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!selectedProductId) return;

            try {
                const details = await ProductDetailsService.getProductDetailsDTOByProductId(selectedProductId);
                setProductDetails(details);
                console.log("Chi tiết sản phẩm:", details); // Debug dữ liệu
            } catch (error) {
                console.error(`Lỗi khi lấy chi tiết sản phẩm ${selectedProductId}:`, error);
            }
        };

        fetchProductDetails();
    }, [selectedProductId]); // Chạy khi selectedProductId thay đổi

    return (
        <div className="container mx-32 w-auto px-4 py-8">
            {loading ? (
                <div className="flex justify-center gap-8">
                    {[...Array(8)].map((_, index) => (
                        <ProductSkeleton key={index} />
                    ))}
                </div>
            ) : (
                Object.keys(productsByCategory).map((category) => (
                    <div key={category} className="mb-12">
                        <div className="flex items-center justify-between gap-2 mb-8 w-[1200px]">
                            <h1 className="text-4xl mx-[70px] font-bold text-[#fbb321]">{category}</h1>
                        </div>

                        <div className="flex justify-center gap-8">
                            {productsByCategory[category].map((product) => (
                                <Link
                                    key={product.productId}
                                    to={`/productDetail/${product.productId}`} // Điều hướng đến trang chi tiết
                                    className="hover:scale-105 transition-transform"
                                    onClick={() => setSelectedProductId(product.productId)} // Lưu productId khi click
                                >
                                    <ProductCard
                                        key={product.productId}
                                        image={product.image}
                                        name={product.productName.length > 24
                                            ? product.productName.slice(0, 24) + "..."
                                            : product.productName}
                                        price={product.price}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default HomeProduct;
