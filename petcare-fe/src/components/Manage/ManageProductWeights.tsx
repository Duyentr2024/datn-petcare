import React, { useEffect, useState } from "react";
import ProductWeightService from "../../service/manageService/ProductWeightsService.js";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const ManageProductWeights = () => {
    const [weights, setWeights] = useState([]);
    const [weightInput, setWeightInput] = useState("");
    const [editingWeight, setEditingWeight] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    // Validation state
    const [weightInputError, setWeightInputError] = useState("");

    // New states for search and pagination
    const [searchQuery, setSearchQuery] = useState(""); // Search query state
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const [itemsPerPage] = useState(10); // Items per page

    useEffect(() => {
        fetchWeights();
    }, [currentPage, searchQuery]); // Fetch weights when searchQuery or currentPage changes

    const fetchWeights = async () => {
        try {
            const response = await ProductWeightService.getAllProductWeights();
            // Filter weights by search query
            const filteredWeights = response.filter((weight) =>
                weight.weightValue.toString().includes(searchQuery) // Searching by weight value
            );
            setWeights(filteredWeights);
        } catch (error) {
            console.error("Error fetching weights:", error);
        }
    };

    const validateWeight = (weight) => {
        if (isNaN(weight) || weight <= 0) {
            return "Trọng lượng phải là số dương hợp lệ";
        }
        return "";
    };

    const handleAddOrEditWeight = async () => {
        if (!weightInput.trim()) return;

        const error = validateWeight(weightInput);
        if (error) {
            setWeightInputError(error);
            return;
        } else {
            setWeightInputError("");
        }

        try {
            if (editingWeight) {
                await ProductWeightService.updateProductWeight(editingWeight.weightId, {
                    ...editingWeight,
                    weightValue: weightInput,
                });
                setSuccessMessage("✅ Cập nhật trọng lượng thành công!");
                setEditingWeight(null);
            } else {
                await ProductWeightService.createProductWeight({ weightValue: weightInput, status: true });
                setSuccessMessage("✅ Thêm trọng lượng thành công!");
            }

            setWeightInput("");
            fetchWeights();
        } catch (error) {
            console.error("❌ Lỗi khi thêm/sửa trọng lượng:", error);
        }

        // Ẩn thông báo sau 3 giây
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleChangeWeightStatus = async (weight) => {
        const updatedWeight = { ...weight, status: !weight.status };
        try {
            await ProductWeightService.updateProductWeight(weight.weightId, updatedWeight);
            setSuccessMessage("✅ Trạng thái trọng lượng đã được cập nhật!");
            fetchWeights();

            // Ẩn thông báo sau 3 giây
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái trọng lượng:", error);
        }
    };


    // Handle pagination
    const paginateWeights = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return weights.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(weights.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            {successMessage && (
                <div className="p-1 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Quản lý trọng lượng sản phẩm</h2>
            {/* Form thêm hoặc sửa trọng lượng */}
            <div className="flex gap-2 mb-4">
                <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Nhập trọng lượng..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleAddOrEditWeight}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    {editingWeight ? "Lưu" : "Thêm"}
                </button>
            </div>
            {/* Error message */}
            {weightInputError && <div className="text-red-600 text-sm">{weightInputError}</div>}

            {/* Search input */}
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo trọng lượng..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            {/* Danh sách trọng lượng */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Trọng lượng</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateWeights().map((weight) => (
                        <tr key={weight.weightId} className="border">
                            <td className="border p-2">{weight.weightId}</td>
                            <td className="border p-2">
                                {editingWeight && editingWeight.weightId === weight.weightId ? (
                                    weightInput
                                ) : (
                                    weight.weightValue
                                )}
                            </td>
                            <td className="border p-2">
                                {weight.status ? (
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
                                {editingWeight && editingWeight.weightId === weight.weightId ? (
                                    <button
                                        onClick={() => setEditingWeight(null)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingWeight(weight);
                                            setWeightInput(weight.weightValue); // Pre-fill input for editing
                                        }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeWeightStatus(weight)}
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

export default ManageProductWeights;
