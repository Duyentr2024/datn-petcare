import React, { useEffect, useState } from "react";
import ProductWeightService from "../../service/manageService/ProductWeightsService.js";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductWeights = () => {
    const [weights, setWeights] = useState([]);
    const [weightInput, setWeightInput] = useState("");
    const [editingWeight, setEditingWeight] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Removed unused setter

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

            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý trọng lượng sản phẩm</h2>
            
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
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo trọng lượng..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

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
                                            setWeightInput(weight.weightValue);
                                        }}
                                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeWeightStatus(weight)}
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

export default ManageProductWeights;