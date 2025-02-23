import React, { useEffect, useState } from "react";
import ProductColorService from "../../service/manageService/ProductColorService";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const ManageProductColor = () => {
    const [colors, setColors] = useState([]);
    const [colorInput, setColorInput] = useState("");
    const [editingColor, setEditingColor] = useState(null);
    const [colorInputError, setColorInputError] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchColors();
    }, [currentPage, searchQuery]); // Fetch colors when searchQuery or currentPage changes

    const fetchColors = async () => {
        try {
            const response = await ProductColorService.getAllProductColors();
            // Filter colors by search query
            const filteredColors = response.filter((color) =>
                color.colorValue.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setColors(filteredColors);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu:", error);
        }
    };

    const validateColor = (color) => {
        // Regex kiểm tra chỉ chứa các ký tự chữ cái (bao gồm cả dấu tiếng Việt) và khoảng trắng
        const invalidColorPattern = /[^a-zA-ZÀ-ỹ\s]/;
        if (invalidColorPattern.test(color)) {
            return "Tên màu không được chứa ký tự đặc biệt hoặc số";
        }

        // Kiểm tra độ dài tên màu
        if (color.length < 3 || color.length > 50) {
            return "Tên màu phải có từ 3 đến 50 ký tự";
        }

        return "";
    };

    const handleAddOrEditColor = async () => {
        if (!colorInput.trim()) return;

        const error = validateColor(colorInput);
        if (error) {
            setColorInputError(error);
            return;
        } else {
            setColorInputError("");
        }

        try {
            if (editingColor) {
                await ProductColorService.updateProductColor(editingColor.productColorId, {
                    ...editingColor,
                    colorValue: colorInput,
                });
                setSuccessMessage("✅ Cập nhật màu thành công!");
                setEditingColor(null);
            } else {
                await ProductColorService.createProductColor({ colorValue: colorInput, status: true });
                setSuccessMessage("✅ Thêm màu mới thành công!");
            }

            setColorInput("");
            fetchColors();
        } catch (error) {
            console.error("❌ Lỗi khi thêm/sửa màu:", error);
        }

        // Ẩn thông báo sau 3 giây
        setTimeout(() => setSuccessMessage(""), 3000);
    };


    const handleChangeColorStatus = async (color) => {
        const updatedColor = { ...color, status: !color.status };
        try {
            await ProductColorService.updateProductColor(color.productColorId, updatedColor);
            setSuccessMessage("✅ Trạng thái màu đã được cập nhật!");
            fetchColors();

            // Ẩn thông báo sau 3 giây
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái màu:", error);
        }
    };


    // Handle pagination
    const paginateColors = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return colors.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(colors.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            {successMessage && (
                <div className="p-1 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-4">Quản lý màu sắc</h2>

            {/* Form thêm hoặc sửa màu */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Nhập tên màu..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleAddOrEditColor}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    {editingColor ? "Lưu" : "Thêm"}
                </button>
            </div>
            {/* Error message */}
            {colorInputError && <div className="text-red-600 text-sm">{colorInputError}</div>}

            {/* Search input placed below and to the right */}
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên màu..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            {/* Danh sách màu sắc */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Tên màu</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateColors().map((color) => (
                        <tr key={color.productColorId} className="border">
                            <td className="border p-2">{color.productColorId}</td>
                            <td className="border p-2">
                                {editingColor && editingColor.productColorId === color.productColorId ? (
                                    colorInput
                                ) : (
                                    color.colorValue
                                )}
                            </td>
                            <td className="border p-2">
                                {color.status ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <FiCheck /> Hoạt động
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <FiX /> Không hoạt động
                                    </span>
                                )}
                            </td>
                            <td className="border p-2 flex gap-2">
                                {editingColor && editingColor.productColorId === color.productColorId ? (
                                    <button
                                        onClick={() => setEditingColor(null)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingColor(color);
                                            setColorInput(color.colorValue); // Pre-fill input for editing
                                        }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeColorStatus(color)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Thay đổi trạng thái
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination controls */}
            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                >
                    Trước
                </button>
                <span>
                    Trang {currentPage} của {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default ManageProductColor;
