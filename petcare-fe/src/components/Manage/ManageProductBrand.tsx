import React, { useEffect, useState } from "react";
import ProductBrandService from "../../service/manageService/ProductBrandService.js";
import { FiEdit, FiCheck, FiX, FiPlusCircle, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProductBrand = () => {
    const [brands, setBrands] = useState([]);
    const [brandInput, setBrandInput] = useState("");
    const [editingBrand, setEditingBrand] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

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
        // Kiểm tra trùng lặp (không phân biệt hoa thường)
        const isDuplicate = brands.some(
            (existingBrand) =>
                existingBrand.brandName.toLowerCase() === brand.trim().toLowerCase() &&
                (!editingBrand || editingBrand.brandId !== existingBrand.brandId)
        );
        if (isDuplicate) {
            return "Tên thương hiệu đã tồn tại";
        }
        return "";
    };

    const handleAddOrEditBrand = async () => {
        if (!brandInput.trim()) return;

        const error = validateBrand(brandInput);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editingBrand) {
                await ProductBrandService.updateBrand(editingBrand.brandId, {
                    ...editingBrand,
                    brandName: brandInput,
                });
                toast.success("Cập nhật thương hiệu thành công!");
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

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý thương hiệu</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="Nhập tên thương hiệu..."
                    className="border border-gray-300 p-2 rounded-md flex-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={handleAddOrEditBrand}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    {editingBrand ? (
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
                    placeholder="Tìm kiếm theo tên thương hiệu..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left bg-white">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[80px]">ID</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide">Tên thương hiệu</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[150px]">Trạng thái</th>
                            <th className="py-3 px-5 text-xs uppercase tracking-wide w-[200px] text-center">Hành động</th>
                    </tr>
                </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                    {paginateBrands().map((brand) => (
                            <tr key={brand.brandId} className="hover:bg-gray-50 transition duration-150">
                                <td className="p-3">{brand.brandId}</td>
                                <td className="p-3">
                                {editingBrand && editingBrand.brandId === brand.brandId ? (
                                        <input
                                            type="text"
                                            value={brandInput}
                                            onChange={(e) => setBrandInput(e.target.value)}
                                            className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                ) : (
                                    brand.brandName
                                )}
                            </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleChangeBrandStatus(brand)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            brand.status 
                                                ? "bg-green-100 text-green-700" 
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                {brand.status ? (
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
                                {editingBrand && editingBrand.brandId === brand.brandId ? (
                                    <button
                                        onClick={() => setEditingBrand(null)}
                                                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingBrand(brand);
                                            setBrandInput(brand.brandName);
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

export default ManageProductBrand;