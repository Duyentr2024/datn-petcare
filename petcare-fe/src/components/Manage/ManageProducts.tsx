import React, { useEffect, useState } from "react";
import ProductsService from "../../service/manageService/ProductsService";
import CategoriesService from "../../service/manageService/ProductCategoriesService";
import BrandService from "../../service/manageService/ProductBrandService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit, FiEye } from "react-icons/fi";

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Trạng thái cho modal xác nhận
    const [productToToggle, setProductToToggle] = useState(null); // Lưu sản phẩm cần đổi trạng thái
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
    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [isUpdatingLoading, setIsUpdatingLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, [currentPage, searchQuery]);

    const fetchProducts = async () => {
        try {
            const response = await ProductsService.getAllProducts();
            const sortedProducts = response.sort((a, b) => b.productId - a.productId);
            const filteredProducts = sortedProducts.filter((product) =>
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
        const filteredByStatus = products.filter((product) =>
            activeTab === "active" ? product.status : !product.status
        );
        const sortedProducts = [...filteredByStatus].sort((a, b) => b.productId - a.productId);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedProducts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(
        products.filter((product) => (activeTab === "active" ? product.status : !product.status)).length / itemsPerPage
    );

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
            setIsUpdatingLoading(true);
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
            toast.error("Đã xảy ra lỗi khi cập nhật sản phẩm!");
        } finally {
            setIsUpdatingLoading(false);
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
            setIsAddingLoading(true);
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
            toast.error("Đã xảy ra lỗi khi thêm sản phẩm!");
        } finally {
            setIsAddingLoading(false);
        }
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        if (currentStatus) {
            // Hiển thị modal xác nhận thay vì window.confirm
            setProductToToggle({ productId, currentStatus });
            setIsConfirmModalOpen(true);
        } else {
            // Nếu đang ngừng bán thì bật lại ngay không cần xác nhận
            try {
                const response = await ProductsService.toggleProductStatus(productId);
                toast.success(response);
                fetchProducts();
            } catch (error) {
                console.error(`Lỗi khi đổi trạng thái sản phẩm ${productId}:`, error);
                toast.error("Đã xảy ra lỗi khi đổi trạng thái!");
            }
        }
    };

    const confirmToggleStatus = async () => {
        if (!productToToggle) return;

        try {
            const response = await ProductsService.toggleProductStatus(productToToggle.productId);
            toast.success(response);
            fetchProducts();
        } catch (error) {
            console.error(`Lỗi khi đổi trạng thái sản phẩm ${productToToggle.productId}:`, error);
            toast.error("Đã xảy ra lỗi khi đổi trạng thái!");
        } finally {
            setIsConfirmModalOpen(false);
            setProductToToggle(null);
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
            <h2 className="text-2xl font-bold text-gray-800">
                Quản lý sản phẩm
            </h2>
            <div className="flex justify-between items-center gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="border border-gray-300 p-2 rounded-md w-full max-w-[250px] text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                    onClick={() => {
                        setIsModalOpen(true);
                        resetForm();
                    }}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    <i className="fas fa-plus mr-2"></i> Thêm
                </button>
            </div>

            <div className="flex border-b ">
                <button
                    className={`flex-1 py-2 text-center font-medium ${activeTab === "active"
                        ? "border-b-2 border-[#f0b040] text-[#f0b040]"
                        : "text-gray-500 hover:text-[#e0a030]"
                    } transition-colors`}
                    onClick={() => {
                        setActiveTab("active");
                        setCurrentPage(1);
                    }}
                >
                    Đang bán
                </button>
                <button
                    className={`flex-1 py-2 text-center font-medium ${activeTab === "inactive"
                        ? "border-b-2 border-[#f0b040] text-[#f0b040]"
                        : "text-gray-500 hover:text-[#e0a030]"
                    } transition-colors`}
                    onClick={() => {
                        setActiveTab("inactive");
                        setCurrentPage(1);
                    }}
                >
                    Ngừng bán
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left bg-white table-fixed">
                    <thead className="bg-[#f0b040] text-white text-sm">
                        <tr>
                            <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">ID</th>
                            <th className="w-[150px] py-3 px-5 text-xs uppercase tracking-wide">Tên sản phẩm</th>
                            <th className="w-[300px] py-3 px-5 text-xs uppercase tracking-wide">Mô tả</th>
                            <th className="w-[80px] py-3 px-5 text-xs uppercase tracking-wide">Thương hiệu</th>
                            <th className="w-[80px] py-3 px-5 text-xs uppercase tracking-wide">Danh mục</th>
                            <th className="w-[100px] py-3 px-5 text-xs uppercase tracking-wide text-center">Hình ảnh</th>
                            <th className="w-[80px] py-3 px-5 text-xs uppercase tracking-wide text-center">Trạng thái</th>
                            <th className="w-[150px] py-3 px-5 text-xs uppercase tracking-wide text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-xs divide-y divide-gray-200">
                        {products.length > 0 ? (
                            paginateProducts().map((product) => (
                                <tr
                                    key={product.productId}
                                    className="hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="p-3 font-medium truncate">{product.productId}</td>
                                    <td className="p-3 font-medium" title={product.productName}>
                                        {product.productName}
                                    </td>
                                    <td className="p-3 max-h-[40px] overflow-hidden" title={product.description}>
                                        {product.description.length > 150
                                            ? `${product.description.substring(0, 150)}...`
                                            : product.description}
                                    </td>
                                    <td className="p-3 truncate" title={product.brandName}>
                                        {product.brandName || "N/A"}
                                    </td>
                                    <td className="p-3 truncate" title={product.categoryName}>
                                        {product.categoryName || "N/A"}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-center">
                                            <img
                                                src={product.image}
                                                alt={product.productName}
                                                className="w-12 h-12 object-cover rounded-md shadow-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3 text-Bạn có chắc chắn muốn ngừng bán sản phẩm này không?">
                                        <button
                                            onClick={() => handleToggleStatus(product.productId, product.status)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${product.status ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'} transition duration-200`}
                                        >
                                            {product.status ? "Đang bán" : "Ngừng bán"}
                                        </button>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/admin/products-list/manage-product-details/${product.productId}`}
                                                className="p-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition duration-200 flex items-center gap-1 whitespace-nowrap"
                                                onClick={() => setSelectedProductId(product.productId)}
                                            >
                                                <FiEye />
                                            </Link>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600 transition duration-200 flex items-center gap-1 whitespace-nowrap"
                                            >
                                                <FiEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-4 text-center text-gray-500 text-sm">
                                    Không có sản phẩm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-between items-center text-sm">
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

            {/* Modal xác nhận ngừng bán */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 transform transition-all">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Xác nhận ngừng bán
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn ngừng bán sản phẩm này không?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition whitespace-nowrap"
                            >
                                Không
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className="px-4 py-2 bg-[#f0b040] text-white rounded-md hover:bg-[#e0a030] transition whitespace-nowrap"
                            >
                                Có
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center transition-opacity duration-200">
                    <div className="bg-white p-6 rounded-md shadow-xl w-3/4 max-w-4xl relative transform transition-all duration-200 scale-100">
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
                                        className="cursor-pointer bg-[#f0b040] text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-[#e0a030] transition"
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
                                disabled={isUpdatingLoading}
                                className={`px-5 py-2 bg-[#f0b040] text-white rounded-lg transition ${isUpdatingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e0a030]'}`}
                            >
                                {isUpdatingLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang cập nhật...
                                    </span>
                                ) : (
                                    'Cập nhật'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center transition-opacity duration-200">
                    <div className="bg-white p-6 rounded-md shadow-xl w-3/4 max-w-4xl relative transform transition-all duration-200 scale-100">
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
                                        className="cursor-pointer bg-[#f0b040] text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-[#e0a030] transition"
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
                                disabled={isAddingLoading}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleAddProduct}
                                disabled={isAddingLoading}
                                className={`px-5 py-2 bg-[#f0b040] text-white rounded-lg transition ${isAddingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e0a030]'}`}
                            >
                                {isAddingLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang tải sản phẩm lên...
                                    </span>
                                ) : (
                                    'Lưu'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;