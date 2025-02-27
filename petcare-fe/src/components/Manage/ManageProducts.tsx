import React, { useEffect, useState } from "react";
import ProductsService from "../../service/manageService/ProductsService";
import CategoriesService from "../../service/manageService/ProductCategoriesService";
import BrandService from "../../service/manageService/ProductBrandService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState({
        productId: null,
        productName: "",
        description: "",
        categoryId: "",
        brandId: "",
        image: null,
    });
    const [newProduct, setNewProduct] = useState({
        productName: "",
        description: "",
        categoryId: "",
        brandId: "",
        image: null,
    });
    const [errors, setErrors] = useState({
        productName: "",
        categoryId: "",
        brandId: "",
        image: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, [currentPage, searchQuery]);

    const fetchProducts = async () => {
        try {
            const response = await ProductsService.getAllProducts();
            const filteredProducts = response.filter((product) =>
                product.productName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setProducts(filteredProducts);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            setProducts([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await CategoriesService.getAllCategories();
            const activeCategories = response.filter(category => category.status);
            setCategories(activeCategories);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await BrandService.getAllBrands();
            const activeBrands = response.filter(brand => brand.status);
            setBrands(activeBrands);
        } catch (error) {
            console.error("Lỗi khi lấy thương hiệu:", error);
        }
    };

    const paginateProducts = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return products.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const openEditModal = (product) => {
        if (!product) {
            console.error("Không có dữ liệu sản phẩm để chỉnh sửa!");
            return;
        }

        const categoryId = categories.find(c => c.categoryName === product.categoryName)?.categoryId || 0;
        const brandId = brands.find(b => b.brandName === product.brandName)?.brandId || 0;
        const productData = {
            productId: product.productId,
            productName: product.productName,
            description: product.description,
            categoryId,
            brandId,
            image: product.image || null,
        };

        setEditProduct(productData);
        setErrors({
            productName: "",
            categoryId: "",
            brandId: "",
            image: "",
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async () => {
        setErrors({
            productName: "",
            categoryId: "",
            brandId: "",
            image: "",
        });

        let isValid = true;
        const newErrors = {};

        if (!editProduct.productName.trim()) {
            newErrors.productName = "Vui lòng nhập tên sản phẩm.";
            isValid = false;
        }

        if (!editProduct.image) {
            newErrors.image = "Vui lòng chọn hình ảnh.";
            isValid = false;
        }

        if (!editProduct.categoryId || isNaN(editProduct.categoryId)) {
            newErrors.categoryId = "Vui lòng chọn danh mục hợp lệ.";
            isValid = false;
        }

        if (!editProduct.brandId || isNaN(editProduct.brandId)) {
            newErrors.brandId = "Vui lòng chọn thương hiệu hợp lệ.";
            isValid = false;
        }

        setErrors(newErrors);
        if (!isValid) return;

        try {
            let imageUrl = editProduct.image;
            if (typeof editProduct.image === "object") {
                imageUrl = await uploadImageToFirebase(editProduct.image);
            }

            const updatedData = {
                productId: editProduct.productId,
                productName: editProduct.productName,
                description: editProduct.description,
                image: imageUrl,
                categories: { categoryId: parseInt(editProduct.categoryId, 10) },
                brand: { brandId: parseInt(editProduct.brandId, 10) },
            };

            await ProductsService.updateProduct(editProduct.productId, updatedData);
            toast.success("Sản phẩm đã được cập nhật thành công!");
            setIsEditModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
        }
    };

    const handleAddProduct = async () => {
        setErrors({
            productName: "",
            categoryId: "",
            brandId: "",
            image: "",
        });

        let isValid = true;
        const newErrors = {};

        if (!newProduct.productName) {
            newErrors.productName = "Vui lòng nhập tên sản phẩm.";
            isValid = false;
        }
        if (!newProduct.categoryId) {
            newErrors.categoryId = "Vui lòng chọn danh mục.";
            isValid = false;
        }
        if (!newProduct.brandId) {
            newErrors.brandId = "Vui lòng chọn thương hiệu.";
            isValid = false;
        }
        if (!newProduct.image) {
            newErrors.image = "Vui lòng chọn hình ảnh.";
            isValid = false;
        }

        setErrors(newErrors);
        if (!isValid) return;

        try {
            let imageUrl = "";
            if (newProduct.image) {
                imageUrl = await uploadImageToFirebase(newProduct.image);
            }

            const productData = {
                productName: newProduct.productName,
                description: newProduct.description,
                image: imageUrl,
                categories: { categoryId: parseInt(newProduct.categoryId, 10) },
                brand: { brandId: parseInt(newProduct.brandId, 10) },
            };

            await ProductsService.createProduct(productData);
            toast.success("Sản phẩm đã được thêm thành công!");
            setIsModalOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi tạo sản phẩm:", error.response?.data || error.message);
        }
    };

    const uploadImageToFirebase = async (file) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `product-images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => { },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const resetForm = () => {
        setNewProduct({
            productName: "",
            description: "",
            categoryId: "",
            brandId: "",
            image: null,
        });
        setErrors({
            productName: "",
            categoryId: "",
            brandId: "",
            image: "",
        });
    };

    return (
        <div className="p-4 bg-white shadow rounded-md">
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Quản lý sản phẩm
            </h2>
            <div className="flex justify-between items-center gap-2 mb-3">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="border p-2 rounded-md w-full max-w-[200px] text-sm focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={() => {
                        setIsModalOpen(true);
                        resetForm();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Thêm sản phẩm
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left bg-white rounded-md shadow-md">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wide">
                        <tr>
                            <th className="p-3 whitespace-nowrap">ID</th>
                            <th className="p-3 whitespace-nowrap">Tên sản phẩm</th>
                            <th className="p-3 whitespace-nowrap">Mô tả</th>
                            <th className="p-3 whitespace-nowrap">Thương hiệu</th>
                            <th className="p-3 whitespace-nowrap">Danh mục</th>
                            <th className="p-3 text-center whitespace-nowrap">Hình ảnh</th>
                            <th className="p-3 text-center whitespace-nowrap">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {products.length > 0 ? (
                            paginateProducts().map((product) => (
                                <tr
                                    key={product.productId}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="p-3 font-medium">{product.productId}</td>
                                    <td className="p-3 font-medium">{product.productName}</td>
                                    <td className="p-3">{product.description}</td>
                                    <td className="p-3">{product.brandName || "N/A"}</td>
                                    <td className="p-3">{product.categoryName || "N/A"}</td>
                                    <td className="p-3">
                                        <div className="flex justify-center">
                                            <img
                                                src={product.image}
                                                alt={product.productName}
                                                className="w-16 h-16 object-cover rounded-md shadow-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/admin/products-list/manage-product-details/${product.productId}`}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 shadow-sm flex items-center gap-1"
                                                onClick={() => setSelectedProductId(product.productId)}
                                            >
                                                <span>👁️</span> Xem
                                            </Link>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition duration-200 shadow-sm flex items-center gap-1"
                                            >
                                                <span>✏️</span> Sửa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500 text-sm">
                                    Không có sản phẩm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex justify-between items-center text-sm">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                >
                    Trước
                </button>
                <span className="text-gray-600">
                    Trang {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                >
                    Sau
                </button>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md shadow-xl w-3/4 max-w-4xl relative">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>

                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Sửa sản phẩm</h3>

                        <div className="flex flex-wrap gap-6">
                            <div className="flex-1 min-w-[300px]">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        value={editProduct.productName}
                                        onChange={(e) => setEditProduct({ ...editProduct, productName: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.productName && <span className="text-red-500 text-sm">{errors.productName}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <textarea
                                        value={editProduct.description}
                                        onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-[300px]">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                                    <select
                                        value={editProduct.categoryId}
                                        onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Thương hiệu</label>
                                    <select
                                        value={editProduct.brandId}
                                        onChange={(e) => setEditProduct({ ...editProduct, brandId: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn thương hiệu</option>
                                        {brands.map((brand) => (
                                            <option key={brand.brandId} value={brand.brandId}>
                                                {brand.brandName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.brandId && <span className="text-red-500 text-sm">{errors.brandId}</span>}
                                </div>
                            </div>

                            <div className="flex-1 min-w-[300px]">
                                <div className="border p-6 rounded-md bg-gray-50 border-dashed text-center">
                                    <label
                                        htmlFor="editFileInput"
                                        className="cursor-pointer bg-green-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition"
                                    >
                                        Chọn ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="editFileInput"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setEditProduct({ ...editProduct, image: file });
                                        }}
                                    />
                                    <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận JPG, PNG, JPEG</p>
                                    {errors.image && <span className="text-red-500 text-sm mt-2">{errors.image}</span>}
                                    <div
                                        className="mt-4 flex justify-center items-center"
                                        style={{ minHeight: "100px", maxHeight: "100px" }}
                                    >
                                        {editProduct.image && (
                                            <img
                                                src={typeof editProduct.image === "string" ? editProduct.image : URL.createObjectURL(editProduct.image)}
                                                alt="Ảnh sản phẩm"
                                                className="rounded-md shadow-lg"
                                                style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "contain" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={handleUpdateProduct}
                                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md shadow-xl w-3/4 max-w-4xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>

                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Thêm sản phẩm mới</h3>

                        <div className="flex flex-wrap gap-6">
                            <div className="flex-1 min-w-[300px]">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        value={newProduct.productName}
                                        onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.productName && <span className="text-red-500 text-sm">{errors.productName}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-[300px]">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                                    <select
                                        value={newProduct.categoryId}
                                        onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Thương hiệu</label>
                                    <select
                                        value={newProduct.brandId}
                                        onChange={(e) => setNewProduct({ ...newProduct, brandId: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn thương hiệu</option>
                                        {brands.map((brand) => (
                                            <option key={brand.brandId} value={brand.brandId}>
                                                {brand.brandName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.brandId && <span className="text-red-500 text-sm">{errors.brandId}</span>}
                                </div>
                            </div>

                            <div className="flex-1 min-w-[300px]">
                                <div className="border p-6 rounded-md bg-gray-50 border-dashed text-center">
                                    <label
                                        htmlFor="fileInput"
                                        className="cursor-pointer bg-green-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition"
                                    >
                                        Chọn ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setNewProduct({ ...newProduct, image: file });
                                        }}
                                    />
                                    <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận JPG, PNG, JPEG</p>
                                    {errors.image && <span className="text-red-500 text-sm mt-2">{errors.image}</span>}
                                    <div
                                        className="mt-4 flex justify-center items-center"
                                        style={{ minHeight: "100px", maxHeight: "100px" }}
                                    >
                                        {newProduct.image && (
                                            <img
                                                src={URL.createObjectURL(newProduct.image)}
                                                alt="Ảnh sản phẩm"
                                                className="rounded-md shadow-lg"
                                                style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "contain" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={resetForm}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleAddProduct}
                                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;