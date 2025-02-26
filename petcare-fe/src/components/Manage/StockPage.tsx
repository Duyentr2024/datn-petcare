import React, { useEffect, useState } from "react";
import StatisticsService from "../../service/manageService/StatisticsService";
import { Loader } from "lucide-react";

const ITEMS_PER_PAGE = 8; // Số sản phẩm mỗi trang

const StockPage = () => {
    const [stockInfo, setStockInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedStock, setGroupedStock] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [totalStock, setTotalStock] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await StatisticsService.getStockInfo();
                console.log("API stock-info response:", response.data);

                if (!Array.isArray(response.data)) {
                    throw new Error("Dữ liệu sản phẩm không hợp lệ.");
                }

                setStockInfo(response.data);

                // Nhóm sản phẩm theo danh mục
                const grouped = response.data.reduce((acc, product) => {
                    if (!acc[product.categoryName]) {
                        acc[product.categoryName] = [];
                    }
                    acc[product.categoryName].push(product);
                    return acc;
                }, {});

                setGroupedStock(grouped);

                // Lấy danh sách danh mục
                const categoryList = ["Tất cả", ...new Set(response.data.map((product) => product.categoryName))];
                setCategories(categoryList);

                // Tính tổng sản phẩm tồn kho
                setTotalStock(response.data.reduce((sum, item) => sum + item.totalStock, 0));
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu tồn kho:", error);
                setError("Lỗi khi tải dữ liệu tồn kho, vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, []);

    // Lọc sản phẩm theo danh mục
    const filteredByCategory = selectedCategory === "Tất cả" ? stockInfo : groupedStock[selectedCategory] || [];

    // Tìm kiếm sản phẩm theo tên
    const searchedProducts = filteredByCategory.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Cập nhật tổng số lượng tồn kho khi danh mục hoặc tìm kiếm thay đổi
    useEffect(() => {
        const total = searchedProducts.reduce((sum, item) => sum + item.totalStock, 0);
        setTotalStock(total);
    }, [searchedProducts]);

    // Phân trang
    const totalPages = Math.ceil(searchedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = searchedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="p-2" >
            <h1 className="text-2xl font-bold mb-3">📦 Sản phẩm tồn kho</h1>
            {/* Bộ lọc danh mục + Tìm kiếm + Tổng số sản phẩm */}
            <div className="mb-4 flex flex-wrap items-center gap-6 justify-between bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold">Chọn danh mục:</label>
                    <select
                        className="p-2 border border-gray-300 rounded-lg"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1); // Reset về trang đầu
                        }}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm sản phẩm..."
                    className="p-2 border border-gray-300 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset về trang đầu
                    }}
                />

                <div className="text-lg font-semibold">
                    Tổng số sản phẩm: <span className="text-blue-600">{totalStock} sản phẩm</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader className="animate-spin w-8 h-8 text-gray-500" />
                </div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : paginatedProducts.length === 0 ? (
                <p className="text-gray-500 text-center">Không có sản phẩm phù hợp.</p>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-3 text-left">Ảnh</th>
                                    <th className="border p-3 text-left">Tên sản phẩm</th>
                                    <th className="border p-3 text-center">Màu sắc</th>
                                    <th className="border p-3 text-center">Size</th>
                                    <th className="border p-3 text-center">Trọng lượng (kg)</th>
                                    <th className="border p-3 text-center">Số lượng tồn</th>
                                    <th className="border p-3 text-right">Giá (VNĐ)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="border p-3 text-left">
                                            <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                                        </td>
                                        <td className="border p-3 text-left">{item.productName}</td>
                                        <td className="border p-3 text-center">{item.colorValue}</td>
                                        <td className="border p-3 text-center">{item.sizeValue}</td>
                                        <td className="border p-3 text-center">{item.weightValue} kg</td>
                                        <td className="border p-3 text-center font-semibold">{item.totalStock}</td>
                                        <td className="border p-3 text-right font-semibold">{item.price.toLocaleString()} ₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center items-center gap-2">
                            <button
                                className="px-3 py-2 border rounded bg-gray-200 hover:bg-gray-300"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                ⬅️ Trước
                            </button>
                            <span className="text-lg font-semibold">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                className="px-3 py-2 border rounded bg-gray-200 hover:bg-gray-300"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Tiếp ➡️
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StockPage;
