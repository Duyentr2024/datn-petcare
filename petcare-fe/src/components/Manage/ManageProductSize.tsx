import React, { useEffect, useState } from "react";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductSize = () => {
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState("");
    const [editingSize, setEditingSize] = useState(null);
    const [newSizeError, setNewSizeError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Removed setItemsPerPage as it's not used

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
            setNewSizeError(error);
            toast.error(error);
            return;
        } else {
            setNewSizeError("");
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
                toast.success("Thêm kích thước thành công!");
            }

            setSizeInput("");
            fetchSizes();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa kích thước:", error);
            toast.error("Lỗi khi thêm/sửa kích thước!");
        }
    };

    const handleChangeSizeStatus = async (size) => {
        try {
            const updatedSize = { ...size, status: !size.status };
            await ProductSizeService.updateProductSize(size.productSizeId, updatedSize);
            toast.success("Đã cập nhật trạng thái kích thước!");
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
        <div className="p-6 bg-white shadow-md rounded-md">
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
            
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý kích thước sản phẩm</h2>
            
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

            {newSizeError && <div className="text-red-600 text-sm">{newSizeError}</div>}

            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên kích thước..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

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
                                            setSizeInput(size.sizeValue);
                                        }}
                                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeSizeStatus(size)}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Thay đổi trạng thái
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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