import React, { useEffect, useState } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Sidebar } from './siderBar/Sidebar.jsx';
import { ProductCard } from './ProductCard.jsx';
import ProductsService from '../../service/ProductsService.js';
import { Link } from 'react-router-dom';

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8; // Số sản phẩm mỗi trang

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductsService.getAllProductsWithCategory();

                // Chuyển đổi giá tiền sang VND
                const formattedProducts = data.map(product => ({
                    ...product,
                    price: product.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                    oldPrice: product.oldPrice
                        ? product.oldPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                        : null
                }));

                setProducts(formattedProducts);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Tính tổng số trang
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Cắt danh sách sản phẩm theo trang
    const displayedProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    // Chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center text-sm">
                    <Home size={16} className="text-gray-600" />
                    <ChevronRight size={16} className="mx-2 text-gray-400" />
                    <span className="text-[#fbb321]">Sản phẩm</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-8">
                    <Sidebar />

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-gray-600">
                                {products.length} kết quả cho "Tất cả sản phẩm"
                            </p>
                            <select className="border rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent">
                                <option>Mới nhất</option>
                                <option>Giá thấp đến cao</option>
                                <option>Giá cao đến thấp</option>
                            </select>
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProducts.map(product => (
                                    <Link
                                        key={product.id}
                                        to={`/productDetail/${product.productId}`}
                                        className="transition-transform hover:scale-105 block"
                                    >
                                        <ProductCard {...product} />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Trước
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`w-8 h-8 rounded-full ${
                                        currentPage === index + 1
                                            ? 'bg-[#fbb321] text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                    } transition-colors`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
