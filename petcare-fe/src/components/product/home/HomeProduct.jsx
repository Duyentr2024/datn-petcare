import React, {useState, useEffect} from 'react';
import {ChevronRight} from 'lucide-react';
import {ProductCard} from '../ProductCard';
import ProductSkeleton from '../home/ProductSkeleton';

function App() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockProducts = [
                {
                    id: 1,
                    image: "https://placehold.co/250x250",
                    name: "Mật Ong Nguyên Chất",
                    price: 250000,
                    oldPrice: 300000
                },
                {
                    id: 2,
                    image: "https://placehold.co/250x250",
                    name: "Mật Ong Rừng Hoa",
                    price: 320000,
                    oldPrice: 400000
                },
                {
                    id: 3,
                    image: "https://placehold.co/250x250",
                    name: "Mật Ong Hoa Nhãn",
                    price: 280000,
                    oldPrice: 350000
                },
                {
                    id: 4,
                    image: "https://placehold.co/250x250",
                    name: "Mật Ong Đa Hoa",
                    price: 200000,
                    oldPrice: 250000
                }
            ];

            setProducts(mockProducts);
            setLoading(false);
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between gap-2 mb-8">
                    <h1 className="text-4xl font-bold text-[#fbb321]">Sản phẩm nhập khẩu</h1>
                    <button
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

                <div className="flex flex-wrap justify-center gap-8">
                    {loading ? (
                        [...Array(8)].map((_, index) => (
                            <ProductSkeleton key={index}/>
                        ))
                    ) : (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                image={product.image}
                                name={product.name}
                                price={product.price}
                                oldPrice={product.oldPrice}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;