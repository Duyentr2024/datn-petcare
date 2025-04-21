import React, { useEffect, useState } from "react";
import { Home, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Sidebar } from "./siderBar/Sidebar.jsx";
import { ProductCard } from "./ProductCard.jsx";
import ProductsService from "../../service/serviceProduct/ProductsService.js";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageSearchLoading, setImageSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Mới nhất");
    const [filters, setFilters] = useState({ priceRange: [0, 1000000], categories: [], brands: [] });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Trạng thái để hiển thị hình ảnh tìm kiếm
    const [imageResults, setImageResults] = useState([]);
    const productsPerPage = 8;
    const FLASK_API_URL = "http://127.0.0.1:5000/search_similar";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await ProductsService.getAllProductsWithCategory();
                const formattedProducts = productData.map((product) => ({
                    productId: product.productId,
                    productName: product.productName,
                    description: product.description,
                    image: product.image,
                    price: product.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                    rawPrice: product.price,
                    categoryName: product.categoryName,
                    brandName: product.brandName,
                }));
                setProducts(formattedProducts);

                const categoryMap = new Map();
                productData.forEach((product) => {
                    if (product.categoryName && !categoryMap.has(product.categoryName)) {
                        categoryMap.set(product.categoryName, { id: categoryMap.size + 1, name: product.categoryName });
                    }
                });
                setCategories(Array.from(categoryMap.values()));

                const brandMap = new Map();
                productData.forEach((product) => {
                    if (product.brandName && !brandMap.has(product.brandName)) {
                        brandMap.set(product.brandName, { id: brandMap.size + 1, name: product.brandName });
                    }
                });
                setBrands(Array.from(brandMap.values()));
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, []);

    const handleFilterChange = (filter) => {
        if (filter.type === "price") setFilters((prev) => ({ ...prev, priceRange: filter.value }));
        else if (filter.type === "category") setFilters((prev) => ({ ...prev, categories: filter.value }));
        else if (filter.type === "brand") setFilters((prev) => ({ ...prev, brands: filter.value }));
    };

    const handleResetFilters = () => {
        setFilters({ priceRange: [0, 1000000], categories: [], brands: [] });
        setSearchQuery("");
        setSortOption("Mới nhất");
        setCurrentPage(1);
        setImageFile(null);
        setImagePreview(null); // Reset hình ảnh preview
        setImageResults([]);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setSearchQuery("");
            setImageResults([]);
            setCurrentPage(1);
            // Tạo URL tạm thời để hiển thị hình ảnh
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            handleImageSearch(file);
        }
    };

    const handleImageSearch = async (file = imageFile) => {
        if (!file) return;

        setImageSearchLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const [response] = await Promise.all([
                axios.post(FLASK_API_URL, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
                new Promise((resolve) => setTimeout(resolve, 3000)),
            ]);

            const results = response.data.results.map((result) => ({
                productId: products.find((p) => p.productName === result.product)?.productId || null,
                productName: result.product,
                image: result.imageUrls[0],
                price: products.find((p) => p.productName === result.product)?.price || "N/A",
                rawPrice: products.find((p) => p.productName === result.product)?.rawPrice || 0,
                categoryName: products.find((p) => p.productName === result.product)?.categoryName || "Unknown",
                brandName: products.find((p) => p.productName === result.product)?.brandName || "Unknown",
                similarity: result.similarity,
            }));
            setImageResults(results);
            if (response.data.message) alert(response.data.message);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm bằng hình ảnh:", error);
            alert("Có lỗi xảy ra khi tìm kiếm bằng hình ảnh!");
            setImageResults([]);
        } finally {
            setImageSearchLoading(false);
        }
    };

    const filteredProducts = imageResults.length > 0
        ? imageResults
        : products
            .filter((product) => product.productName.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter((product) => product.rawPrice >= filters.priceRange[0] && product.rawPrice <= filters.priceRange[1])
            .filter((product) => filters.categories.length === 0 || filters.categories.includes(product.categoryName))
            .filter((product) => filters.brands.length === 0 || filters.brands.includes(product.brandName));

    const sortProducts = (products) => {
        let sortedProducts = [...products];
        if (imageResults.length > 0) {
            sortedProducts.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        } else {
            if (sortOption === "Giá thấp đến cao") sortedProducts.sort((a, b) => a.rawPrice - b.rawPrice);
            else if (sortOption === "Giá cao đến thấp") sortedProducts.sort((a, b) => b.rawPrice - a.rawPrice);
            else if (sortOption === "Mới nhất") sortedProducts.sort((a, b) => b.productId - a.productId);
        }
        return sortedProducts;
    };

    const sortedProducts = sortProducts(filteredProducts);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const displayedProducts = sortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    // Hiệu ứng animation cho danh sách sản phẩm
    const productListVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeInOut", staggerChildren: 0.1 },
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    const productItemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    };

    // Hiệu ứng animation cho spinner
    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: { duration: 1, repeat: Infinity, ease: "linear" },
        },
    };

    // Hiệu ứng animation cho modal
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    return (
        <div className="min-h-screen mx-27 w-auto">
            <div className="container mx-auto px-4">
                <div className="border border-yellow-500 mt-4 rounded-full px-4 py-2 inline-flex items-center bg-yellow-50 text-gray-600">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                        <Home size={19} className="w-5 h-5 mr-1" />
                    </Link>
                    <ChevronRight size={19} className="mx-2 text-gray-600" />
                    <span className="text-yellow-600 font-medium">Sản phẩm</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-8">
                    <Sidebar
                        onFilterChange={handleFilterChange}
                        categories={categories}
                        brands={brands}
                        onReset={handleResetFilters}
                        selectedFilters={filters}
                    />

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <p className="text-sm text-gray-600 whitespace-nowrap w-20">{sortedProducts.length} kết quả</p>
                            <div className="relative w-full max-w-lg flex items-center gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-[#F7941D] pr-10"
                                    />
                                    <label className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <ImageIcon size={20} className="text-gray-500 hover:text-[#F7941D] transition-colors" />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded-lg shadow-md"
                                    />
                                )}
                            </div>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="border rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent"
                            >
                                <option value="Mới nhất">Mới nhất</option>
                                <option value="Giá thấp đến cao">Giá thấp đến cao</option>
                                <option value="Giá cao đến thấp">Giá cao đến thấp</option>
                                {imageResults.length > 0 && <option value="Tương đồng hình ảnh">Tương đồng hình ảnh</option>}
                            </select>
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
                        ) : (
                            <motion.div
                                key={currentPage}
                                variants={productListVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {displayedProducts.map((product) => (
                                    <motion.div key={product.productId || product.productName} variants={productItemVariants}>
                                        <Link to={`/productDetail/${product.productId}`} className="block relative">
                                            <ProductCard
                                                image={product.image}
                                                name={
                                                    product.productName.length > 24
                                                        ? product.productName.slice(0, 24) + "..."
                                                        : product.productName
                                                }
                                                price={product.price}
                                                productId={product.productId}
                                                className="p-6 bg-white shadow-lg rounded-lg m-3 min-h-[350px]"
                                            />
                                            {product.similarity && (
                                                <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
                                                    Tương đồng: {Math.round(product.similarity * 100)}%
                                                </span>
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Modal loading */}
                        {imageSearchLoading && (
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                            >
                                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                                    <motion.div
                                        variants={spinnerVariants}
                                        animate="animate"
                                        className="w-12 h-12 border-4 border-t-4 border-[#F7941D] border-gray-200 rounded-full mb-4"
                                    />
                                    <p className="text-gray-600">Đang tìm kiếm hình ảnh...</p>
                                </div>
                            </motion.div>
                        )}

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
                                        currentPage === index + 1 ? "bg-[#fbb321] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
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