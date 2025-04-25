import React, { useEffect, useState } from "react";
import ProductWeightService from "../../service/manageService/ProductWeightsService.js";
import { FiEdit, FiCheck, FiX, FiPlusCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductWeights = () => {
    const [weights, setWeights] = useState([]);
    const [weightInput, setWeightInput] = useState("");
    const [editingWeight, setEditingWeight] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchWeights();
    }, [currentPage, searchQuery]);

    const fetchWeights = async () => {
        try {
            const response = await ProductWeightService.getAllProductWeights();
            const filteredWeights = response.filter((weight) =>
                weight.weightValue.toString().includes(searchQuery)
            );
            setWeights(filteredWeights);
        } catch (error) {
            console.error("Error fetching weights:", error);
            toast.error("Lỗi khi tải danh sách trọng lượng!");
        }
    };

    const validateWeight = (weight) => {
        if (isNaN(weight) || weight <= 0) {
            return "Trọng lượng phải là số dương hợp lệ";
        }

        // Kiểm tra trùng lặp
        const isDuplicate = weights.some(
            (existingWeight) =>
                parseFloat(existingWeight.weightValue) === parseFloat(weight) &&
                (!editingWeight || editingWeight.weightId !== existingWeight.weightId)
        );
        if (isDuplicate) {
            return "Trọng lượng đã tồn tại";
        }

        return "";
    };

    const handleAddOrEditWeight = async () => {
        if (!weightInput.trim()) return;

        const error = validateWeight(weightInput);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editingWeight) {
                await ProductWeightService.updateProductWeight(editingWeight.weightId, {
                    ...editingWeight,
                    weightValue: weightInput,
                });
                toast.success("Cập nhật trọng lượng thành công!");
                setEditingWeight(null);
            } else {
                await ProductWeightService.createProductWeight({ weightValue: weightInput, status: true });
                toast.success("Thêm trọng lượng thành công!");
            }

            setWeightInput("");
            fetchWeights();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa trọng lượng:", error);
            toast.error("Lỗi khi thêm/sửa trọng lượng!");
        }
    };

    const handleChangeWeightStatus = async (weight) => {
        const updatedWeight = { ...weight, status: !weight.status };
        try {
            await ProductWeightService.updateProductWeight(weight.weightId, updatedWeight);
            toast.success("Trạng thái trọng lượng đã được cập nhật!");
            fetchWeights();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái trọng lượng:", error);
            toast.error("Lỗi khi cập nhật trạng thái trọng lượng!");
        }
    };

    const paginateWeights = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return weights.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(weights.length / itemsPerPage);

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

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý trọng lượng</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Nhập trọng lượng..."
                    className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={handleAddOrEditWeight}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    {editingWeight ? (
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
                    placeholder="Tìm kiếm theo trọng lượng..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[80px]">ID</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide">Trọng lượng</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[150px]">Trạng thái</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[200px] text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                        {paginateWeights().map((weight) => (
                            <tr key={weight.weightId} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-3">{weight.weightId}</td>
                                <td className="p-3">
                                    {editingWeight && editingWeight.weightId === weight.weightId ? (
                                        <input
                                            type="number"
                                            value={weightInput}
                                            onChange={(e) => setWeightInput(e.target.value)}
                                            className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        weight.weightValue
                                    )}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleChangeWeightStatus(weight)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${weight.status
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {weight.status ? (
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
                                        {editingWeight && editingWeight.weightId === weight.weightId ? (
                                            <button
                                                onClick={() => setEditingWeight(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                                            >
                                                Hủy
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingWeight(weight);
                                                    setWeightInput(weight.weightValue);
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

export default ManageProductWeights;