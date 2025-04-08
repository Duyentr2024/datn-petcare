import React, { useEffect, useState } from "react";
import ProductCategoriesService from "../../service/manageService/ProductCategoriesService";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductCategories = () => {
    const [categories, setCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryInputError, setCategoryInputError] = useState("");
    // Removed successMessage state as it's no longer needed with toast

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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
        return "";
    };

    const handleAddOrEditCategory = async () => {
        if (!categoryInput.trim()) return;

        const error = validateCategory(categoryInput);
        if (error) {
            setCategoryInputError(error);
            toast.error(error);
            return;
        } else {
            setCategoryInputError("");
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
            
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý danh mục sản phẩm</h2>
            
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Nhập tên danh mục..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleAddOrEditCategory}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    {editingCategory ? "Lưu" : "Thêm"}
                </button>
            </div>
            {categoryInputError && <div className="text-red-600 text-sm">{categoryInputError}</div>}

            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên danh mục..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Tên danh mục</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateCategories().map((category) => (
                        <tr key={category.categoryId} className="border">
                            <td className="border p-2">{category.categoryId}</td>
                            <td className="border p-2">
                                {editingCategory && editingCategory.categoryId === category.categoryId ? (
                                    categoryInput
                                ) : (
                                    category.categoryName
                                )}
                            </td>
                            <td className="border p-2">
                                {category.status ? (
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
                                {editingCategory && editingCategory.categoryId === category.categoryId ? (
                                    <button
                                        onClick={() => setEditingCategory(null)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setCategoryInput(category.categoryName);
                                        }}
                                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeCategoryStatus(category)}
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

export default ManageProductCategories;