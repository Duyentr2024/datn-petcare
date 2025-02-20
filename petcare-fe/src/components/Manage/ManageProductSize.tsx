import React, { useEffect, useState } from "react";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const ManageProductSize = () => {
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState("");
    const [editingSize, setEditingSize] = useState(null);
    const [newSizeError, setNewSizeError] = useState(""); // State for new size error
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page

    useEffect(() => {
        fetchSizes();
    }, [currentPage, searchQuery]); // Fetch sizes when searchQuery or currentPage changes

    const fetchSizes = async () => {
        try {
            const response = await ProductSizeService.getAllProductSizes();
            // Filter sizes by search query
            const filteredSizes = response.filter((size) =>
                size.sizeValue.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSizes(filteredSizes);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kích thước:", error);
        }
    };

    const validateSize = (size) => {
        if (!size.trim()) {
            return "Tên kích thước không được để trống";
        }
        const invalidSizePattern = /[^\w\s]/;
        if (invalidSizePattern.test(size)) {
            return "Tên kích thước không được chứa ký tự đặc biệt";
        }
        return "";
    };

    const handleAddOrEditSize = async () => {
        if (!sizeInput.trim()) return;

        const error = validateSize(sizeInput);
        if (error) {
            setNewSizeError(error); // Set error if validation fails
            return;
        } else {
            setNewSizeError(""); // Reset error if validation passes
        }

        if (editingSize) {
            try {
                await ProductSizeService.updateProductSize(editingSize.productSizeId, {
                    ...editingSize,
                    sizeValue: sizeInput,
                });
                setEditingSize(null);
                setSizeInput("");
            } catch (error) {
                console.error("Lỗi khi sửa tên kích thước:", error);
            }
        } else {
            try {
                await ProductSizeService.createProductSize({ sizeValue: sizeInput, status: true });
                setSizeInput("");
            } catch (error) {
                console.error("Lỗi khi thêm kích thước:", error);
            }
        }
        fetchSizes();
    };

    const handleChangeSizeStatus = async (size) => {
        const updatedSize = { ...size, status: !size.status };
        try {
            await ProductSizeService.updateProductSize(size.productSizeId, updatedSize);
            fetchSizes();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái kích thước:", error);
        }
    };

    // Handle pagination
    const paginateSizes = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sizes.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(sizes.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Quản lý kích thước sản phẩm</h2>

            {/* Form thêm hoặc sửa kích thước */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Nhập kích thước..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleAddOrEditSize}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    {editingSize ? "Lưu" : "Thêm"}
                </button>
            </div>

            {/* Error message for new size */}
            {newSizeError && <div className="text-red-600 text-sm">{newSizeError}</div>}

            {/* Search input */}
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên kích thước..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            {/* Danh sách kích thước */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Kích thước</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateSizes().map((size) => (
                        <tr key={size.productSizeId} className="border">
                            <td className="border p-2">{size.productSizeId}</td>
                            <td className="border p-2">
                                {editingSize && editingSize.productSizeId === size.productSizeId ? (
                                    <input
                                        type="text"
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        className="border p-1 rounded"
                                    />
                                ) : (
                                    size.sizeValue
                                )}
                            </td>
                            <td className="border p-2">
                                {size.status ? (
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
                                {editingSize && editingSize.productSizeId === size.productSizeId ? (
                                    <button
                                        onClick={() => setEditingSize(null)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingSize(size);
                                            setSizeInput(size.sizeValue); // Pre-fill input for editing
                                        }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeSizeStatus(size)}
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

export default ManageProductSize;
