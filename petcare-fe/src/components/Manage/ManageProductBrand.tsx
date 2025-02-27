import React, { useEffect, useState } from "react";
import ProductBrandService from "../../service/manageService/ProductBrandService.js";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductBrand = () => {
    const [brands, setBrands] = useState([]);
    const [brandInput, setBrandInput] = useState("");
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandInputError, setBrandInputError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    // Removed successMessage state as it's no longer needed with toast

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchBrands();
    }, [currentPage, searchQuery]);

    const fetchBrands = async () => {
        try {
            const response = await ProductBrandService.getAllBrands();
            const filteredBrands = response.filter((brand) =>
                brand.brandName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setBrands(filteredBrands);
        } catch (error) {
            console.error("Error fetching brands:", error);
            toast.error("Lỗi khi tải danh sách thương hiệu!");
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
            toast.error(error);
            return;
        } else {
            setBrandInputError("");
        }

        try {
            if (editingBrand) {
                await ProductBrandService.updateBrand(editingBrand.brandId, {
                    ...editingBrand,
                    brandName: brandInput,
                });
                toast.success(" Cập nhật thương hiệu thành công!");
                setEditingBrand(null);
            } else {
                await ProductBrandService.createBrand({ brandName: brandInput, status: true });
                toast.success("Thêm thương hiệu thành công!");
            }

            setBrandInput("");
            fetchBrands();
        } catch (error) {
            console.error("Lỗi khi thêm/sửa thương hiệu:", error);
            toast.error("Lỗi khi thêm/sửa thương hiệu!");
        }
    };

    const handleChangeBrandStatus = async (brand) => {
        const updatedBrand = { ...brand, status: !brand.status };
        try {
            await ProductBrandService.updateBrand(brand.brandId, updatedBrand);
            toast.success("Trạng thái thương hiệu đã được cập nhật!");
            fetchBrands();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thương hiệu:", error);
            toast.error("Lỗi khi cập nhật trạng thái thương hiệu!");
        }
    };

    const paginateBrands = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return brands.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(brands.length / itemsPerPage);

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            {/* Add ToastContainer to display the toast notifications */}
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý thương hiệu sản phẩm</h2>

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
            {brandInputError && <div className="text-red-600 text-sm">{brandInputError}</div>}

            <div className="flex justify-end gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên thương hiệu..."
                    className="border p-2 rounded w-full max-w-xs"
                />
            </div>

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
                                            setBrandInput(brand.brandName);
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