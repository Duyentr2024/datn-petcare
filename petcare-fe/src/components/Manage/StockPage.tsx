import React, { useEffect, useState } from "react";
import StatisticsService from "../../service/manageService/StatisticsService";
import { Loader } from "lucide-react";

const ITEMS_PER_PAGE = 12; // Số sản phẩm mỗi trang

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
    const searchedProducts = filteredByCategory
        .filter((product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.totalStock - b.totalStock);


    // Cập nhật tổng số lượng tồn kho khi danh mục hoặc tìm kiếm thay đổi
    useEffect(() => {
        const total = searchedProducts.reduce((sum, item) => sum + item.totalStock, 0);
        setTotalStock(total);
    }, [searchedProducts]);

    // Phân trang
    const totalPages = Math.ceil(searchedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = searchedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="p-1 bg-gray-100 rounded-lg shadow-lg max-w-6xl mx-auto">
            <h1 className="text-xl font-bold mb-1 text-center">📦 Sản phẩm tồn kho</h1>
            {/* Bộ lọc danh mục + Tìm kiếm + Tổng số sản phẩm */}
            <div className="mb-2 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white p-2 rounded-lg shadow">
                <div className="flex items-center gap-1">
                    <label className="text-sm font-semibold">Danh mục:</label>
                    <select
                        className="p-1 border border-gray-300 rounded text-sm"
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

                    <input
                    type="text"
                    placeholder="🔍 Tìm kiếm..."
                    className="p-1 border border-gray-300 rounded text-sm w-full sm:w-auto"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset về trang đầu
                    }}
                />
                </div>


                <div className="text-sm font-semibold">
                    Tổng: <span className="text-blue-600">{totalStock} sản phẩm</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-20">
                    <Loader className="animate-spin w-6 h-6 text-gray-500" />
                </div>
            ) : error ? (
                <p className="text-red-500 text-sm text-center">{error}</p>
            ) : paginatedProducts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">Không có sản phẩm phù hợp.</p>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-1">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-1 text-left">Ảnh</th>
                                    <th className="border p-1 text-left">Tên</th>
                                    <th className="border p-1 text-center">Màu</th>
                                    <th className="border p-1 text-center">Size</th>
                                    <th className="border p-1 text-center">Trọng lượng</th>
                                    <th className="border p-1 text-center">Số lượng</th>
                                    <th className="border p-1 text-right">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="border p-1 text-left">
                                            <img src={item.image} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                                        </td>
                                        <td className="border p-1 text-left truncate">{item.productName}</td>
                                        <td className="border p-1 text-center">{item.colorValue}</td>
                                        <td className="border p-1 text-center">{item.sizeValue}</td>
                                        <td className="border p-1 text-center">{item.weightValue} kg</td>
                                        <td className="border p-1 text-center font-semibold">{item.totalStock}</td>
                                        <td className="border p-1 text-right font-semibold">{item.price.toLocaleString()} ₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="mt-2 flex justify-center items-center gap-1">
                            <button
                                className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300 text-xs"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                ⬅️ Trước
                            </button>
                            <span className="text-xs font-semibold">{currentPage} / {totalPages}</span>
                            <button
                                className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300 text-xs"
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