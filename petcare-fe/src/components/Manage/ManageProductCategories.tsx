import React, { useEffect, useState } from "react";
import ProductCategoriesService from "../../service/manageService/ProductCategoriesService";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const ManageProductCategories = () => {
    const [categories, setCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryInputError, setCategoryInputError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchCategories();
    }, [currentPage, searchQuery]); // Fetch categories when searchQuery or currentPage changes

    const fetchCategories = async () => {
        try {
            const response = await ProductCategoriesService.getAllCategories();
            // Filter categories by search query
            const filteredCategories = response.filter((category) =>
                category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setCategories(filteredCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const validateCategory = (category: string) => {
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
                setSuccessMessage("✅ Cập nhật danh mục thành công!");
                setEditingCategory(null);
            } else {
                await ProductCategoriesService.createCategory({ categoryName: categoryInput, status: true });
                setSuccessMessage("✅ Thêm danh mục thành công!");
            }

            setCategoryInput("");
            fetchCategories();
        } catch (error) {
            console.error("❌ Lỗi khi thêm/sửa danh mục:", error);
        }

        // Ẩn thông báo sau 3 giây
        setTimeout(() => setSuccessMessage(""), 3000);
    };


    const handleChangeCategoryStatus = async (category) => {
        const updatedCategory = { ...category, status: !category.status };
        try {
            await ProductCategoriesService.updateCategory(category.categoryId, updatedCategory);
            setSuccessMessage("✅ Trạng thái danh mục đã được cập nhật!");
            fetchCategories();

            // Ẩn thông báo sau 3 giây
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái danh mục:", error);
        }
    };


    // Handle pagination
    const paginateCategories = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return categories.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(categories.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            {successMessage && (
                <div className="p-1 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-4">Quản lý danh mục sản phẩm</h2>
            {/* Form thêm hoặc sửa danh mục */}
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
            {/* Error message */}
            {categoryInputError && <div className="text-red-600 text-sm">{categoryInputError}</div>}

            {/* Search input placed below and to the right */}
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên danh mục..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            {/* Danh sách danh mục */}
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
                                        className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeCategoryStatus(category)}
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

export default ManageProductCategories;
