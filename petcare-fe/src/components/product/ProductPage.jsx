import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Sidebar } from './siderBar/Sidebar.jsx';
import { ProductCard } from './ProductCard.jsx';

function ProductPage() {
    const products = [
        {
            id: 1,
            name: 'Mật Ong Hoa Nhãn 1L',
            price: 45000,
            oldPrice: 80000,
            image: 'https://placehold.co/300x300'
        },
        {
            id: 2,
            name: 'Mật Ong Rừng Đà Lạt 1L',
            price: 45000,
            oldPrice: 80000,
            image: 'https://placehold.co/300x300'
        },
        // Add more products here
    ];

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
                            <p className="text-sm text-gray-600">12 kết quả cho "Tất cả sản phẩm"</p>
                            <select className="border rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent">
                                <option>Mới nhất</option>
                                <option>Giá thấp đến cao</option>
                                <option>Giá cao đến thấp</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-2 mt-8">
                            {[1, 2, 3, 4, 5].map(page => (
                                <button
                                    key={page}
                                    className={`w-8 h-8 rounded-full ${
                                        page === 1
                                            ? 'bg-[#fbb321] text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                    } transition-colors`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;