import React, { useEffect, useState } from "react";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import { FiEdit, FiCheck, FiX, FiPlusCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductSize = () => {
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState("");
    const [editingSize, setEditingSize] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchSizes();
    }, [currentPage, searchQuery]);

    const fetchSizes = async () => {
        try {
            const response = await ProductSizeService.getAllProductSizes();
            const filteredSizes = response.filter((size) =>
                size.sizeValue.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSizes(filteredSizes);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kích thước:", error);
            toast.error("Lỗi khi tải danh sách kích thước!");
        }
    };

    const validateSize = (size) => {
        if (size.length < 1 || size.length > 10) {
            return "Kích thước phải có từ 1 đến 10 ký tự";
        }

        // Kiểm tra trùng lặp (không phân biệt hoa thường)
        const isDuplicate = sizes.some(
            (existingSize) =>
                existingSize.sizeValue.toLowerCase() === size.trim().toLowerCase() &&
                (!editingSize || editingSize.productSizeId !== existingSize.productSizeId)
        );
        if (isDuplicate) {
            return "Kích thước đã tồn tại";
        }

        return "";
    };

    const handleAddOrEditSize = async () => {
        if (!sizeInput.trim()) return;

        const error = validateSize(sizeInput);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editingSize) {
                await ProductSizeService.updateProductSize(editingSize.productSizeId, {
                    ...editingSize,
                    sizeValue: sizeInput,
                });
                toast.success("Cập nhật kích thước thành công!");
                setEditingSize(null);
            } else {
                await ProductSizeService.createProductSize({ sizeValue: sizeInput, status: true });
                toast.success("Thêm kích thước mới thành công!");
            }

            setSizeInput("");
            fetchSizes();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa kích thước:", error);
            toast.error("Lỗi khi thêm/sửa kích thước!");
        }
    };

    const handleChangeSizeStatus = async (size) => {
        const updatedSize = { ...size, status: !size.status };
        try {
            await ProductSizeService.updateProductSize(size.productSizeId, updatedSize);
            toast.success("Trạng thái kích thước đã được cập nhật!");
            fetchSizes();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái kích thước:", error);
            toast.error("Lỗi khi cập nhật trạng thái kích thước!");
        }
    };

    const paginateSizes = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sizes.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(sizes.length / itemsPerPage);

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
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý kích thước</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Nhập kích thước..."
                    className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={handleAddOrEditSize}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                    >
                    {editingSize ? (
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
                    placeholder="Tìm kiếm theo kích thước..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[80px]">ID</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide">Kích thước</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[150px]">Trạng thái</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[200px] text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                        {paginateSizes().map((size) => (
                            <tr key={size.productSizeId} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-3">{size.productSizeId}</td>
                                <td className="p-3">
                                    {editingSize && editingSize.productSizeId === size.productSizeId ? (
                                        <input
                                            type="text"
                                            value={sizeInput}
                                            onChange={(e) => setSizeInput(e.target.value)}
                                            className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        size.sizeValue
                                    )}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleChangeSizeStatus(size)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            size.status 
                                                ? "bg-green-100 text-green-700" 
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {size.status ? (
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
                                        {editingSize && editingSize.productSizeId === size.productSizeId ? (
                                            <button
                                                onClick={() => setEditingSize(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                                            >
                                                Hủy
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingSize(size);
                                                    setSizeInput(size.sizeValue);
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

export default ManageProductSize;