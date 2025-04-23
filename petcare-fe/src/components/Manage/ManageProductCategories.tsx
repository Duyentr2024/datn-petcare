import React, { useEffect, useState } from "react";
import ProductCategoriesService from "../../service/manageService/ProductCategoriesService";
import { FiEdit, FiCheck, FiX, FiPlusCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductCategories = () => {
    const [categories, setCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchCategories();
    }, [currentPage, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await ProductCategoriesService.getAllCategories();
            const filteredCategories = response.filter((category) =>
                category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setCategories(filteredCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Lỗi khi tải danh sách danh mục!");
        }
    };

    const validateCategory = (category) => {
        if (category.trim().length < 3) {
            return "Tên danh mục phải có ít nhất 3 ký tự";
        }
        // Kiểm tra trùng lặp (không phân biệt hoa thường)
        const isDuplicate = categories.some(
            (existingCategory) =>
                existingCategory.categoryName.toLowerCase() === category.trim().toLowerCase() &&
                (!editingCategory || editingCategory.categoryId !== existingCategory.categoryId)
        );
        if (isDuplicate) {
            return "Tên danh mục đã tồn tại";
        }
        return "";
    };

    const handleAddOrEditCategory = async () => {
        if (!categoryInput.trim()) return;

        const error = validateCategory(categoryInput);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editingCategory) {
                await ProductCategoriesService.updateCategory(editingCategory.categoryId, {
                    ...editingCategory,
                    categoryName: categoryInput,
                });
                toast.success("Cập nhật danh mục thành công!");
                setEditingCategory(null);
            } else {
                await ProductCategoriesService.createCategory({ categoryName: categoryInput, status: true });
                toast.success("Thêm danh mục thành công!");
            }

            setCategoryInput("");
            fetchCategories();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa danh mục:", error);
            toast.error("Lỗi khi thêm/sửa danh mục!");
        }
    };

    const handleChangeCategoryStatus = async (category) => {
        const updatedCategory = { ...category, status: !category.status };
        try {
            await ProductCategoriesService.updateCategory(category.categoryId, updatedCategory);
            toast.success("Trạng thái danh mục đã được cập nhật!");
            fetchCategories();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái danh mục:", error);
            toast.error("Lỗi khi cập nhật trạng thái danh mục!");
        }
    };

    const paginateCategories = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return categories.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(categories.length / itemsPerPage);

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

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý danh mục</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Nhập tên danh mục..."
                    className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={handleAddOrEditCategory}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    {editingCategory ? (
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
                    placeholder="Tìm kiếm theo tên danh mục..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-

200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[80px]">ID</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide">Tên danh mục</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[150px]">Trạng thái</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[200px] text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                        {paginateCategories().map((category) => (
                            <tr key={category.categoryId} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-3">{category.categoryId}</td>
                                <td className="p-3">
                                    {editingCategory && editingCategory.categoryId === category.categoryId ? (
                                        <input
                                            type="text"
                                            value={categoryInput}
                                            onChange={(e) => setCategoryInput(e.target.value)}
                                            className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        category.categoryName
                                    )}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleChangeCategoryStatus(category)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${category.status
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {category.status ? (
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
                                        {editingCategory && editingCategory.categoryId === category.categoryId ? (
                                            <button
                                                onClick={() => setEditingCategory(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                                            >
                                                Hủy
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(category);
                                                    setCategoryInput(category.categoryName);
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

export default ManageProductCategories;