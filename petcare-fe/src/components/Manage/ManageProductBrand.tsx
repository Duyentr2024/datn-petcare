import React, { useEffect, useState } from "react";
import ProductBrandService from "../../service/manageService/ProductBrandService.js";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";

const ManageProductBrand = () => {
    const [brands, setBrands] = useState([]);
    const [brandInput, setBrandInput] = useState("");
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandInputError, setBrandInputError] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchBrands();
    }, [currentPage, searchQuery]); // Fetch brands when searchQuery or currentPage changes

    const fetchBrands = async () => {
        try {
            const response = await ProductBrandService.getAllBrands();
            // Filter brands by search query
            const filteredBrands = response.filter((brand) =>
                brand.brandName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setBrands(filteredBrands);
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const validateBrand = (brand) => {
        if (brand.trim().length < 3) {
            return "Tên thương hiệu phải có ít nhất 3 ký tự";
        }
        return "";
    };

    const handleAddOrEditBrand = async () => {
        if (!brandInput.trim()) return;

        const error = validateBrand(brandInput);
        if (error) {
            setBrandInputError(error);
            return;
        } else {
            setBrandInputError("");
        }

        if (editingBrand) {
            try {
                await ProductBrandService.updateBrand(editingBrand.brandId, {
                    ...editingBrand,
                    brandName: brandInput,
                });
                setEditingBrand(null);
                setBrandInput("");
            } catch (error) {
                console.error("Error updating brand:", error);
            }
        } else {
            try {
                await ProductBrandService.createBrand({ brandName: brandInput, status: true });
                setBrandInput("");
            } catch (error) {
                console.error("Error adding brand:", error);
            }
        }

        fetchBrands();
    };

    const handleChangeBrandStatus = async (brand) => {
        const updatedBrand = { ...brand, status: !brand.status };
        try {
            await ProductBrandService.updateBrand(brand.brandId, updatedBrand);
            fetchBrands();
        } catch (error) {
            console.error("Error updating brand status:", error);
        }
    };

    // Handle pagination
    const paginateBrands = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return brands.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(brands.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Quản lý thương hiệu sản phẩm</h2>

            {/* Form thêm hoặc sửa thương hiệu */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="Nhập tên thương hiệu..."
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleAddOrEditBrand}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    {editingBrand ? "Lưu" : "Thêm"}
                </button>
            </div>
            {/* Error message */}
            {brandInputError && <div className="text-red-600 text-sm">{brandInputError}</div>}

            {/* Search input placed below and to the right */}
            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên thương hiệu..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

            {/* Danh sách thương hiệu */}
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Tên thương hiệu</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateBrands().map((brand) => (
                        <tr key={brand.brandId} className="border">
                            <td className="border p-2">{brand.brandId}</td>
                            <td className="border p-2">
                                {editingBrand && editingBrand.brandId === brand.brandId ? (
                                    brandInput
                                ) : (
                                    brand.brandName
                                )}
                            </td>
                            <td className="border p-2">
                                {brand.status ? (
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
                                {editingBrand && editingBrand.brandId === brand.brandId ? (
                                    <button
                                        onClick={() => setEditingBrand(null)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingBrand(brand);
                                            setBrandInput(brand.brandName); // Pre-fill input for editing
                                        }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-600"
                                    >
                                        <FiEdit /> Sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleChangeBrandStatus(brand)}
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

export default ManageProductBrand;
