import React, { useEffect, useState } from "react";
import ProductsService from "../../service/manageService/ProductsService";
import CategoriesService from "../../service/manageService/ProductCategoriesService";
import BrandService from "../../service/manageService/ProductBrandService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [editProduct, setEditProduct] = useState({
        productId: null,
        productName: "",
        description: "",
        categoryId: "",
        brandId: "",
        image: null,
    });

    const openEditModal = (product) => {
        if (!product) {
            console.error("❌ Không có dữ liệu sản phẩm để chỉnh sửa!");
            return;
        }

        console.log("🔍 Dữ liệu gốc của sản phẩm khi sửa:", JSON.stringify(product, null, 2));

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

        console.log("📝 Dữ liệu sản phẩm khi mở modal sửa:", JSON.stringify(productData, null, 2));

        setEditProduct(productData);
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
            setSuccessMessage("Sản phẩm đã được cập nhật thành công!");

            setTimeout(() => setSuccessMessage(""), 3000);
            setIsEditModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
        }
    };






    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // New state for search and pagination
    const [searchQuery, setSearchQuery] = useState(""); // Search query state
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const [itemsPerPage] = useState(5); // Items per page

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();

    }, [currentPage, searchQuery]); // Fetch products when searchQuery or currentPage changes

    const fetchProducts = async () => {
        try {
            const response = await ProductsService.getAllProducts();
            const filteredProducts = response.filter((product) =>
                product.productName.toLowerCase().includes(searchQuery.toLowerCase()) // Searching by product name
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


    // Handle pagination
    const paginateProducts = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return products.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(products.length / itemsPerPage);

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
            setSuccessMessage("Sản phẩm đã được thêm thành công!");

            setTimeout(() => setSuccessMessage(""), 3000); // Ẩn sau 3 giây
            setIsModalOpen(false);
            setNewProduct({
                productName: "",
                description: "",
                categoryId: "",
                brandId: "",
                image: null,
            });
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

    // Reset form
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
        <div className="p-6 bg-white shadow-md rounded-md">
            {successMessage && (
                <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Quản lý sản phẩm</h2>
            <div className="flex justify-between gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    className="border p-2 rounded w-full max-w-xs"
                />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Thêm sản phẩm
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border bg-white shadow-md">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="border p-4 text-left">ID</th>
                            <th className="border p-4 text-left">Tên sản phẩm</th>
                            <th className="border p-4 text-left">Mô tả</th>
                            <th className="border p-4 text-left">Thương hiệu</th>
                            <th className="border p-4 text-left">Danh mục</th>
                            <th className="border p-4 text-left">Hình ảnh</th>
                            <th className="border p-4 text-left">Thêm biến thể</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {products.length > 0 ? (
                            paginateProducts().map((product) => (
                                <tr key={product.productId} className="border-b hover:bg-gray-50 transition">
                                    <td className="border p-2 font-medium">{product.productId}</td>
                                    <td className="border p-2 font-medium">{product.productName}</td>
                                    <td className="border p-2 font-medium">{product.description}</td>
                                    <td className="border p-2 font-medium">{product.brandName || "Không có thương hiệu"}</td>
                                    <td className="border p-2 font-medium">{product.categoryName || "Không có danh mục"}</td>
                                    <td className="border p-2 flex justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.productName}
                                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <div className="flex flex-col items-center gap-1">

                                            <Link
                                                to={`/admin/products-list/manage-product-details/${product.productId}`}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm w-full text-center hover:bg-blue-600 transition"
                                                onClick={() => setSelectedProductId(product.productId)}
                                            >
                                                👁️ Xem chi tiết
                                            </Link>

                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm w-full text-center hover:bg-yellow-600 transition"
                                            >
                                                ✏️ Sửa
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-6 text-gray-500">Không có sản phẩm nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md shadow-xl w-1/4 max-w-lg relative">
                        {/* Dấu "X" để đóng modal */}
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-xl font-bold text-gray-500"
                        >
                            &times;
                        </button>

                        <h3 className="text-2xl font-semibold mb-4">Sửa sản phẩm</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                <input
                                    type="text"
                                    value={editProduct.productName}
                                    onChange={(e) =>
                                        setEditProduct({ ...editProduct, productName: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                />
                                {errors.productName && <span className="text-red-500 text-sm">{errors.productName}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea
                                    value={editProduct.description}
                                    onChange={(e) =>
                                        setEditProduct({ ...editProduct, description: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    rows="4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                                <select value={editProduct.categoryId} onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })} className="border p-2 rounded w-full">
                                    {categories.map((category) => (
                                        <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId}</span>}

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700">Thương hiệu</label>
                                <select value={editProduct.brandId} onChange={(e) => setEditProduct({ ...editProduct, brandId: e.target.value })} className="border p-2 rounded w-full">
                                    {brands.map((brand) => (
                                        <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
                                    ))}
                                </select>
                                {errors.brandId && <span className="text-red-500 text-sm">{errors.brandId}</span>}
                            </div>

                            {/* Chọn ảnh */}
                            <div className="border p-6 rounded-md bg-gray-50 border-dashed text-center mb-6">
                                <label
                                    htmlFor="editFileInput"
                                    className="cursor-pointer bg-green-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-600"
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
                                <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận hình ảnh JPG, PNG, JPEG</p>
                                {errors.image && <span className="text-red-500 text-sm mt-2">{errors.image}</span>}
                                {/* Hiển thị ảnh preview */}
                                <div className="mt-4 flex justify-center items-center" style={{ minHeight: '100px', maxHeight: '100px' }}>
                                    {editProduct.image && (
                                        <img
                                            src={typeof editProduct.image === "string" ? editProduct.image : URL.createObjectURL(editProduct.image)}
                                            alt="Ảnh sản phẩm"
                                            className="rounded-md shadow-lg"
                                            style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nút lưu & hủy */}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleUpdateProduct}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md shadow-xl w-1/4 max-w-lg  relative">
                        {/* Dấu "X" để đóng modal */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-xl font-bold text-gray-500"
                        >
                            &times;
                        </button>

                        <h3 className="text-2xl font-semibold mb-4">Thêm sản phẩm mới</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                <input
                                    type="text"
                                    value={newProduct.productName}
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, productName: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                />
                                {errors.productName && <span className="text-red-500 text-sm">{errors.productName}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, description: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
                                    rows="4"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                                <select
                                    value={newProduct.categoryId}
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, categoryId: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
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
                                    onChange={(e) =>
                                        setNewProduct({ ...newProduct, brandId: e.target.value })
                                    }
                                    className="border p-2 rounded w-full"
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
                            <div className="border p-6 rounded-md bg-gray-50 border-dashed text-center mb-6">
                                <label
                                    htmlFor="fileInput"
                                    className="cursor-pointer bg-green-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-600"
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
                                <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận hình ảnh JPG, PNG, JPEG</p>
                                {errors.image && <span className="text-red-500 text-sm mt-2">{errors.image}</span>}
                                {/* Khu vực chứa ảnh với kích thước lớn hơn */}
                                <div
                                    className="mt-4 flex justify-center items-center"
                                    style={{ minHeight: '100px', maxHeight: '100px' }}  // Đặt khu vực chứa ảnh cố định
                                >
                                    {newProduct.image && (
                                        <img
                                            src={URL.createObjectURL(newProduct.image)}
                                            alt="Ảnh sản phẩm"
                                            className="rounded-md shadow-lg"
                                            style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}  // Duy trì tỷ lệ ảnh và không bị cắt xén
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={resetForm}
                                className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleAddProduct}
                                className="bg-green-500 text-white px-4 py-2 rounded"
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




