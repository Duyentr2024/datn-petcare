import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductDetailsService from "../../service/serviceProduct/ProductDetailsService";
import ProductsService from "../../service/manageService/ProductsService";
import ProductColorService from "../../service/manageService/ProductColorService";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import ProductWeightsService from "../../service/manageService/ProductWeightsService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit, FiEye } from "react-icons/fi";

const ProductListDetails = () => {
    const { productId } = useParams();
    const [productDetails, setProductDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState({});

    const [products, setProducts] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [weights, setWeights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDetail, setNewDetail] = useState({
        productId: "",
        price: "",
        colorId: "",
        sizeId: "",
        weightId: "",
        quantity: "",
        status: true
    });

    const [editDetail, setEditDetail] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedProductDetailId, setSelectedProductDetailId] = useState(null);

    // Trạng thái phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); // Số lượng sản phẩm mỗi trang

    const openEditModal = (productDetails) => {
        if (!productDetails) {
            console.error("Không có dữ liệu sản phẩm để chỉnh sửa!");
            return;
        }

        const colorId = colors.find(c => c.colorValue === productDetails.colorValue)?.productColorId || 0;
        const sizeId = sizes.find(s => s.sizeValue === productDetails.sizeValue)?.productSizeId || 0;
        const weightId = weights.find(w => w.weightValue === productDetails.weightValue)?.weightId || 0;

        const productData = {
            productDetailId: productDetails.productDetailId,
            quantity: productDetails.quantity ?? 0,
            price: productDetails.price ?? 0,
            productId: productId ?? 0,
            weightId,
            sizeId,
            colorId,
            status: productDetails.status
        };

        setEditDetail(productData);
        setIsEditModalOpen(true);
    };

    const handleUpdateProductDetail = async () => {
        if (!editDetail || !editDetail.productDetailId) {
            console.error("Thiếu dữ liệu cập nhật!");
            return;
        }

        let newErrors = {};

        if (!editDetail.price || isNaN(editDetail.price) || Number(editDetail.price) <= 0) {
            newErrors.price = "Giá không được để trống và phải lớn hơn 0!";
        }

        if (!editDetail.quantity || isNaN(editDetail.quantity) || Number(editDetail.quantity) <= 0) {
            newErrors.quantity = "Số lượng không được để trống và phải lớn hơn 0!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const payload = {
            quantity: Number(editDetail.quantity),
            price: Number(editDetail.price),
            products: editDetail.productId ? { productId: Number(editDetail.productId) } : null,
            weights: editDetail.weightId ? { weightId: Number(editDetail.weightId) } : undefined,
            productSizes: editDetail.sizeId ? { productSizeId: Number(editDetail.sizeId) } : undefined,
            productColors: editDetail.colorId ? { productColorId: Number(editDetail.colorId) } : undefined,
            status: editDetail.status
        };

        try {
            const response = await ProductDetailsService.updateProductDetail(editDetail.productDetailId, payload);
            fetchProductDetails();
            setIsEditModalOpen(false);
            toast.success("Cập nhật thành công!");
            setCurrentPage(1); // Reset về trang đầu sau khi cập nhật
        } catch (error) {
            console.error("Lỗi khi cập nhật biến thể:", error);
        }
    };

    const handleToggleStatus = async (productDetailId, currentStatus) => {
        if (currentStatus) {
            setSelectedProductDetailId(productDetailId);
            setShowConfirmModal(true);
        } else {
            try {
                await ProductDetailsService.toggleProductDetailStatus(productDetailId);
                toast.success("Đã tiếp tục bán sản phẩm!");
                fetchProductDetails();
                setCurrentPage(1); // Reset về trang đầu sau khi thay đổi trạng thái
            } catch (error) {
                toast.error("Lỗi khi thay đổi trạng thái!");
                console.error("Lỗi khi toggle status:", error);
            }
        }
    };

    const confirmToggleStatus = async () => {
        try {
            await ProductDetailsService.toggleProductDetailStatus(selectedProductDetailId);
            toast.success("Đã ngừng bán sản phẩm!");
            fetchProductDetails();
            setShowConfirmModal(false);
            setSelectedProductDetailId(null);
            setCurrentPage(1); // Reset về trang đầu sau khi thay đổi trạng thái
        } catch (error) {
            toast.error("Lỗi khi thay đổi trạng thái!");
            console.error("Lỗi khi toggle status:", error);
            setShowConfirmModal(false);
        }
    };

    const cancelToggleStatus = () => {
        setShowConfirmModal(false);
        setSelectedProductDetailId(null);
    };

    useEffect(() => {
        fetchProductDetails();
        fetchProducts();
        fetchColors();
        fetchSizes();
        fetchWeights();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await ProductsService.getAllProducts();
            setProducts(response);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchColors = async () => {
        try {
            const response = await ProductColorService.getAllProductColors();
            const activeColors = response.filter(color => color.status);
            setColors(activeColors);
        } catch (error) {
            console.error("Error fetching colors:", error);
        }
    };

    const fetchSizes = async () => {
        try {
            const response = await ProductSizeService.getAllProductSizes();
            const activeSizes = response.filter(size => size.status);
            setSizes(activeSizes);
        } catch (error) {
            console.error("Error fetching sizes:", error);
        }
    };

    const fetchWeights = async () => {
        try {
            const response = await ProductWeightsService.getAllProductWeights();
            const activeWeights = response.filter(weight => weight.status);
            setWeights(activeWeights);
        } catch (error) {
            console.error("Error fetching weights:", error);
        }
    };

    const fetchProductDetails = async () => {
        if (!productId) return;

        try {
            const data = await ProductDetailsService.getAllProductDetailsDTOByProductId(productId);
            setProductDetails(data);
            console.log("Dữ liệu productDetails từ API:", data); // Kiểm tra cấu trúc dữ liệu
        } catch (err) {
            setError("Lỗi khi tải dữ liệu sản phẩm.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen && productId) {
            setNewDetail((prev) => ({ ...prev, productId }));
        }
    }, [isModalOpen, productId]);

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const openModal = (images) => {
        setSelectedImages(images);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedImages([]);
    };

    const handleAddProductDetail = async () => {
        let newErrors = {};

        // Kiểm tra các trường bắt buộc
        if (!newDetail.productId) newErrors.productId = "Vui lòng chọn sản phẩm!";

        if (!newDetail.price || isNaN(newDetail.price) || Number(newDetail.price) <= 0)
            newErrors.price = "Giá không được để trống và phải lớn hơn 0!";
        if (!newDetail.quantity || isNaN(newDetail.quantity) || Number(newDetail.quantity) <= 0)
            newErrors.quantity = "Số lượng không được để trống và phải lớn hơn 0!";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Chuyển đổi các giá trị sang Number để so sánh chính xác
        const newColorId = Number(newDetail.colorId);
        const newSizeId = Number(newDetail.sizeId);
        const newWeightId = Number(newDetail.weightId);
        const newProductId = Number(newDetail.productId);

        // Ánh xạ các giá trị hiển thị từ danh sách colors, sizes, weights
        const selectedColor = colors.find(c => c.productColorId === newColorId);
        const selectedSize = sizes.find(s => s.productSizeId === newSizeId);
        const selectedWeight = weights.find(w => w.weightId === newWeightId);

        // Kiểm tra trùng lặp dựa trên ID hoặc giá trị hiển thị
        const isDuplicate = productDetails.some((detail) => {
            const detailColorId = colors.find(c => c.colorValue === detail.colorValue)?.productColorId;
            const detailSizeId = sizes.find(s => s.sizeValue === detail.sizeValue)?.productSizeId;
            const detailWeightId = weights.find(w => w.weightValue === detail.weightValue)?.weightId;

            return (
                detailColorId === newColorId &&
                detailSizeId === newSizeId &&
                detailWeightId === newWeightId &&
                (detail.productId ? detail.productId === newProductId : true) // Kiểm tra productId nếu có
            );
        });

        if (isDuplicate) {
            toast.error("Biến thể với màu, kích cỡ và cân nặng này đã tồn tại!");
            return;
        }

        setErrors({});

        const payload = {
            quantity: Number(newDetail.quantity),
            price: Number(newDetail.price),
            products: { productId: newProductId },
            weights: newWeightId ? { weightId: newWeightId } : null,
            productSizes: newSizeId ? { productSizeId: newSizeId } : null,
            productColors: newColorId ? { productColorId: newColorId } : null,
            status: newDetail.status
        };

        try {
            await ProductDetailsService.createProductDetail(payload);
            fetchProductDetails(); // Cập nhật danh sách
            toast.success("Thêm biến thể thành công!");
            setNewDetail({
                productId: productId,
                price: "",
                colorId: "",
                sizeId: "",
                weightId: "",
                quantity: "",
                status: true
            });
            setIsModalOpen(false);
            setCurrentPage(1); // Reset về trang đầu
        } catch (error) {
            console.error("Lỗi khi thêm biến thể:", error);
            toast.error("Lỗi khi thêm biến thể!");
        }
    };

    // Lọc dữ liệu theo tab
    const filteredProductDetails = productDetails.filter((product) =>
        activeTab === "active" ? product.status : !product.status
    );

    // Tính toán phân trang
    const totalItems = filteredProductDetails.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredProductDetails.slice(startIndex, endIndex);

    // Xử lý chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xử lý nút Previous và Next
    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Reset trang khi chuyển tab
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

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
            {successMessage && (
                <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Chi tiết sản phẩm</h2>
            <div className="flex justify-between mb-4">
                <button
                    onClick={() => window.history.back()}
                    className="bg-[#f0b040] text-white px-4 py-2 rounded hover:bg-[#e0a030]"
                >
                    ← Quay về
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                >
                    <i className="fas fa-plus mr-2"></i> Thêm
                </button>
            </div>

            <div className="flex border-b">
                <button
                    className={`flex-1 py-2 text-center font-medium ${activeTab === "active"
                        ? "border-b-2 border-[#f0b040] text-[#f0b040]"
                        : "text-gray-500 hover:text-[#e0a030]"
                        } transition-colors`}
                    onClick={() => setActiveTab("active")}
                >
                    Đang bán
                </button>
                <button
                    className={`flex-1 py-2 text-center font-medium ${activeTab === "inactive"
                        ? "border-b-2 border-[#f0b040] text-[#f0b040]"
                        : "text-gray-500 hover:text-[#e0a030]"
                        } transition-colors`}
                    onClick={() => setActiveTab("inactive")}
                >
                    Ngừng bán
                </button>
            </div>

            {filteredProductDetails.length > 0 ? (
                <div className="">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-sm">
                            <thead className="bg-[#f0b040] text-white text-sm">
                                <tr>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">ID</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Tên sản phẩm</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Giá</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Màu</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Size</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Cân nặng</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Số lượng</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Trạng thái</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Hình ảnh</th>
                                    <th className="w-[60px] py-3 px-5 text-xs uppercase tracking-wide">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((product) => (
                                    <tr
                                        key={product.productDetailId}
                                        className="text-center text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="border border-gray-200 px-3 py-2">{product.productDetailId}</td>
                                        <td className="border border-gray-200 px-3 py-2">{product.productName}</td>
                                        <td className="border border-gray-200 px-3 py-2 font-semibold">
                                            {new Intl.NumberFormat("vi-VN").format(product.price)} VND
                                        </td>
                                        <td className="border border-gray-200 px-3 py-2">{product.colorValue}</td>
                                        <td className="border border-gray-200 px-3 py-2">{product.sizeValue}</td>
                                        <td className="border border-gray-200 px-3 py-2">{product.weightValue} kg</td>
                                        <td className="border border-gray-200 px-3 py-2">{product.quantity}</td>
                                        <td className="border border-gray-200 px-3 py-2">
                                            <button
                                                className={`px-2 py-1 rounded-full text-xs font-medium  ${product.status ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                                onClick={() => handleToggleStatus(product.productDetailId, product.status)}
                                            >
                                                {product.status ? 'Đang bán' : 'Ngừng bán'}
                                            </button>
                                        </td>
                                        <td className="border border-gray-200 px-3 py-2">
                                            <div className="flex gap-1 justify-center">
                                                <Link
                                                    to={`/admin/products-list/manage-product-details/:productId/product-image/${product.productDetailId}`}
                                                    className="p-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition duration-200 flex items-center gap-2 whitespace-nowrap"     >
                                                    <FiEye />
                                                </Link>
                                            </div>

                                        </td>
                                        <td className="border border-gray-200 px-3 py-2">
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    className="p-2 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600 transition duration-200 flex items-center gap-1 whitespace-nowrap"

                                                    onClick={() => openEditModal(product)}
                                                >
                                                    <FiEdit />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                        >
                            Trước
                        </button>

                        <div className="text-sm text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-4">Không có thông tin sản phẩm.</p>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận ngừng bán</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn ngừng bán sản phẩm này không?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cancelToggleStatus}
                                className="px-4 py-2 bg-gray-300 text-black rounded-md"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="relative bg-white p-6 rounded-md shadow-lg w-1/3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Thêm Biến Thể Sản Phẩm</h3>

                        <p className="border p-2 rounded w-full mb-2 bg-gray-100">
                            {products.length > 0
                                ? products.find(p => p.productId.toString() === productId)?.productName || "Không tìm thấy sản phẩm"
                                : "Đang tải..."}
                        </p>

                        <select
                            className={`border p-2 rounded w-full mb-2 ${errors.colorId ? 'border-red-500' : ''}`}
                            value={newDetail.colorId}
                            onChange={(e) => setNewDetail({ ...newDetail, colorId: e.target.value })}
                        >
                            <option value="">Chọn Màu</option>
                            {colors.map((color) => (
                                <option key={color.productColorId} value={color.productColorId}>{color.colorValue}</option>
                            ))}
                        </select>
                        {errors.colorId && <p className="text-red-500 text-sm">{errors.colorId}</p>}

                        <select
                            className={`border p-2 rounded w-full mb-2 ${errors.sizeId ? 'border-red-500' : ''}`}
                            value={newDetail.sizeId}
                            onChange={(e) => setNewDetail({ ...newDetail, sizeId: e.target.value })}
                        >
                            <option value="">Chọn Kích Cỡ</option>
                            {sizes.map((size) => (
                                <option key={size.productSizeId} value={size.productSizeId}>{size.sizeValue}</option>
                            ))}
                        </select>
                        {errors.sizeId && <p className="text-red-500 text-sm">{errors.sizeId}</p>}

                        <select
                            className={`border p-2 rounded w-full mb-2 ${errors.weightId ? 'border-red-500' : ''}`}
                            value={newDetail.weightId}
                            onChange={(e) => setNewDetail({ ...newDetail, weightId: e.target.value })}
                        >
                            <option value="">Chọn Cân Nặng</option>
                            {weights.map((weight) => (
                                <option key={weight.weightId} value={weight.weightId}>{weight.weightValue} kg</option>
                            ))}
                        </select>
                        {errors.weightId && <p className="text-red-500 text-sm">{errors.weightId}</p>}

                        <input
                            type="number"
                            placeholder="Nhập Giá"
                            value={newDetail.price}
                            onChange={(e) => setNewDetail({ ...newDetail, price: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

                        <input
                            type="number"
                            placeholder="Nhập Số Lượng"
                            value={newDetail.quantity}
                            onChange={(e) => setNewDetail({ ...newDetail, quantity: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.quantity ? 'border-red-500' : ''}`}
                        />
                        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}

                        <div className="flex justify-end space-x-2">
                            <button onClick={handleAddProductDetail} className="p-2 bg-green-500 text-white rounded">Thêm biến thể</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="relative bg-white p-6 rounded-md shadow-lg w-1/3">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Biến Thể</h3>
                        <p className="border p-2 rounded w-full mb-2 bg-gray-100">
                            {products.length > 0
                                ? products.find(p => p.productId.toString() === productId)?.productName || "Không tìm thấy sản phẩm"
                                : "Đang tải..."}
                        </p>

                        <select
                            className="border p-2 rounded w-full mb-2"
                            value={editDetail?.colorId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, colorId: e.target.value })}
                        >
                            {colors.map((color) => (
                                <option key={color.productColorId} value={color.productColorId}>{color.colorValue}</option>
                            ))}
                        </select>

                        <select
                            className="border p-2 rounded w-full mb-2"
                            value={editDetail?.sizeId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, sizeId: e.target.value })}
                        >
                            {sizes.map((size) => (
                                <option key={size.productSizeId} value={size.productSizeId}>{size.sizeValue}</option>
                            ))}
                        </select>

                        <select
                            className="border p-2 rounded w-full mb-2"
                            value={editDetail?.weightId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, weightId: e.target.value })}
                        >
                            {weights.map((weight) => (
                                <option key={weight.weightId} value={weight.weightId}>{weight.weightValue} kg</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Nhập Giá"
                            value={editDetail?.price || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, price: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

                        <input
                            type="number"
                            placeholder="Nhập Số Lượng"
                            value={editDetail?.quantity || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, quantity: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.quantity ? 'border-red-500' : ''}`}
                        />
                        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}

                        <div className="flex justify-end space-x-2">
                            <button onClick={handleUpdateProductDetail} className="p-2 bg-blue-500 text-white rounded">Cập nhật</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListDetails;