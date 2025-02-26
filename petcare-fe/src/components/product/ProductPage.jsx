import React, { useEffect, useState } from "react";
import { Home, ChevronRight } from "lucide-react";
import { Sidebar } from "./siderBar/Sidebar.jsx";
import { ProductCard } from "./ProductCard.jsx";
import ProductsService from "../../service/serviceProduct/ProductsService.js";
import { Link } from "react-router-dom";

function ProductPage() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Mới nhất");
    const [filters, setFilters] = useState({ priceRange: [0, 1000000], categories: [], brands: [] });
    const productsPerPage = 8;

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

                // Tạo danh sách category duy nhất
                const categoryMap = new Map();
                productData.forEach((product) => {
                    if (product.categoryName && !categoryMap.has(product.categoryName)) {
                        categoryMap.set(product.categoryName, {
                            id: categoryMap.size + 1,
                            name: product.categoryName,
                        });
                    }
                });
                const uniqueCategories = Array.from(categoryMap.values());
                setCategories(uniqueCategories);

                // Tạo danh sách brand duy nhất
                const brandMap = new Map();
                productData.forEach((product) => {
                    if (product.brandName && !brandMap.has(product.brandName)) {
                        brandMap.set(product.brandName, {
                            id: brandMap.size + 1,
                            name: product.brandName,
                        });
                    }
                });
                const uniqueBrands = Array.from(brandMap.values());
                setBrands(uniqueBrands);

                if (uniqueCategories.length === 0) {
                    console.warn("Không tìm thấy danh sách category từ dữ liệu sản phẩm.");
                }
                if (uniqueBrands.length === 0) {
                    console.warn("Không tìm thấy danh sách brand từ dữ liệu sản phẩm.");
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFilterChange = (filter) => {
        if (filter.type === "price") {
            setFilters((prev) => ({ ...prev, priceRange: filter.value }));
        } else if (filter.type === "category") {
            setFilters((prev) => ({ ...prev, categories: filter.value }));
        } else if (filter.type === "brand") {
            setFilters((prev) => ({ ...prev, brands: filter.value }));
        }
    };

    const handleResetFilters = () => {
        setFilters({ priceRange: [0, 1000000], categories: [], brands: [] });
        setSearchQuery("");
        setSortOption("Mới nhất");
        setCurrentPage(1);
    };

    const filteredProducts = products
        .filter((product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((product) => product.rawPrice >= filters.priceRange[0] && product.rawPrice <= filters.priceRange[1])
        .filter((product) =>
            filters.categories.length === 0 || filters.categories.includes(product.categoryName)
        )
        .filter((product) =>
            filters.brands.length === 0 || filters.brands.includes(product.brandName)
        );

    const sortProducts = (products) => {
        let sortedProducts = [...products];
        if (sortOption === "Giá thấp đến cao") {
            sortedProducts.sort((a, b) => a.rawPrice - b.rawPrice);
        } else if (sortOption === "Giá cao đến thấp") {
            sortedProducts.sort((a, b) => b.rawPrice - a.rawPrice);
        } else if (sortOption === "Mới nhất") {
            sortedProducts.sort((a, b) => b.productId - a.productId);
        }
        return sortedProducts;
    };

    const sortedProducts = sortProducts(filteredProducts);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const displayedProducts = sortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
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
                        selectedFilters={filters} // Truyền filters để đồng bộ
                    />

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <p className="text-sm text-gray-600 whitespace-nowrap w-20">{sortedProducts.length} kết quả</p>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-500 px-4 py-2 rounded-lg w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-[#F7941D]"
                            />
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="border rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent"
                            >
                                <option value="Mới nhất">Mới nhất</option>
                                <option value="Giá thấp đến cao">Giá thấp đến cao</option>
                                <option value="Giá cao đến thấp">Giá cao đến thấp</option>
                            </select>
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {displayedProducts.map((product) => (
                                    <Link key={product.productId} to={`/productDetail/${product.productId}`} className="block">
                                        <ProductCard
                                            image={product.image}
                                            name={product.productName.length > 24 ? product.productName.slice(0, 24) + "..." : product.productName}
                                            price={product.price}
                                            productId={product.productId}
                                            className="p-6 bg-white shadow-lg rounded-lg m-3 min-h-[350px]"
                                        />
                                    </Link>
                                ))}
                            </div>
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
                                    className={`w-8 h-8 rounded-full ${currentPage === index + 1 ? "bg-[#fbb321] text-white" : "bg-white text-gray-600 hover:bg-gray-50"} transition-colors`}
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

      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} kết quả cho "Tất cả sản phẩm"
              </p>

              {/* Ô input căn giữa và dài hơn */}
              <div className="flex-1 flex justify-center">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-500 px-4 py-2 rounded-lg w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-[#F7941D]"
                />
              </div>

              <select className="border rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent">
                <option>Mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/productDetail/${product.productId}`}
                    className="block"
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
                      className="p-6 bg-white shadow-lg rounded-lg m-3 min-h-[350px]"
                    />
                  </Link>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-2 mt-8 mb-4">
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
                      ? "bg-[#fbb321] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
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