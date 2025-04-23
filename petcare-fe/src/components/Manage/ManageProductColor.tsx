import React, { useEffect, useState } from "react";
import ProductColorService from "../../service/manageService/ProductColorService";
import { FiEdit, FiCheck, FiX, FiPlusCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductColor = () => {
    const [colors, setColors] = useState([]);
    const [colorInput, setColorInput] = useState("");
    const [editingColor, setEditingColor] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchColors();
    }, [currentPage, searchQuery]);

    const fetchColors = async () => {
        try {
            const response = await ProductColorService.getAllProductColors();
            const filteredColors = response.filter((color) =>
                color.colorValue.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setColors(filteredColors);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách màu:", error);
            toast.error("Lỗi khi tải danh sách màu!");
        }
    };

    const validateColor = (color) => {
        const invalidColorPattern = /[^a-zA-ZÀ-ỹ\s]/;
        if (invalidColorPattern.test(color)) {
            return "Tên màu không được chứa ký tự đặc biệt hoặc số";
        }

        if (color.length < 2 || color.length > 50) {
            return "Tên màu phải có từ 3 đến 50 ký tự";
        }

        // Kiểm tra trùng lặp (không phân biệt hoa thường)
        const isDuplicate = colors.some(
            (existingColor) =>
                existingColor.colorValue.toLowerCase() === color.trim().toLowerCase() &&
                (!editingColor || editingColor.productColorId !== existingColor.productColorId)
        );
        if (isDuplicate) {
            return "Tên màu đã tồn tại";
        }

        return "";
    };

    const handleAddOrEditColor = async () => {
        if (!colorInput.trim()) return;

        const error = validateColor(colorInput);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editingColor) {
                await ProductColorService.updateProductColor(editingColor.productColorId, {
                    ...editingColor,
                    colorValue: colorInput,
                });
                toast.success("Cập nhật màu thành công!");
                setEditingColor(null);
            } else {
                await ProductColorService.createProductColor({ colorValue: colorInput, status: true });
                toast.success("Thêm màu mới thành công!");
            }

            setColorInput("");
            fetchColors();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa màu:", error);
            toast.error("Lỗi khi thêm/sửa màu!");
        }
    };

    const handleChangeColorStatus = async (color) => {
        const updatedColor = { ...color, status: !color.status };
        try {
            await ProductColorService.updateProductColor(color.productColorId, updatedColor);
            toast.success("Trạng thái màu đã được cập nhật!");
            fetchColors();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái màu:", error);
            toast.error("Lỗi khi cập nhật trạng thái màu!");
        }
    };

    const paginateColors = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return colors.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(colors.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý màu sắc</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Nhập tên màu..."
                    className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={handleAddOrEditColor}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    {editingColor ? (
                        <>
                            Lưu
                        </>
                    ) : (
                        <>
                            <i className="fas fa-plus mr-2"></i> Thêm
                        </>
                    )}
                </button>
            </div>

            <div className="flex justify-end mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên màu..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[80px]">ID</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide">Tên màu</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[150px]">Trạng thái</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[200px] text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                        {paginateColors().map((color) => (
                            <tr key={color.productColorId} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-3">{color.productColorId}</td>
                                <td className="p-3">
                                    {editingColor && editingColor.productColorId === color.productColorId ? (
                                        <input
                                            type="text"
                                            value={colorInput}
                                            onChange={(e) => setColorInput(e.target.value)}
                                            className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        color.colorValue
                                    )}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleChangeColorStatus(color)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${color.status
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {color.status ? (
                                            <>
                                                Đang hoạt động
                                            </>
                                        ) : (
                                            <>
                                                Tạm ngưng
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-center gap-2">
                                        {editingColor && editingColor.productColorId === color.productColorId ? (
                                            <button
                                                onClick={() => setEditingColor(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                                            >
                                                Hủy
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingColor(color);
                                                    setColorInput(color.colorValue);
                                                }}
                                                className="px-2 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <FiEdit />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                >
                    Trước
                </button>
                <span className="text-gray-600">
                    Trang {currentPage} / {totalPages || 1}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default ManageProductColor;