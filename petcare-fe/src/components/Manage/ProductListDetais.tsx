import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductDetailsService from "../../service/serviceProduct/ProductDetailsService";
import ProductsService from "../../service/manageService/ProductsService";
import ProductColorService from "../../service/manageService/ProductColorService";
import ProductSizeService from "../../service/manageService/ProductSizeService";
import ProductWeightsService from "../../service/manageService/ProductWeightsService";

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
    });



    const [editDetail, setEditDetail] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const openEditModal = (productDetails) => {
        if (!productDetails) {
            console.error("❌ Không có dữ liệu sản phẩm để chỉnh sửa!");
            return;
        }

        console.log("🔍 Dữ liệu gốc của sản phẩm khi sửa:", JSON.stringify(productDetails, null, 2));

        // Tìm ID của màu sắc, kích thước, cân nặng dựa vào value
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
            colorId
        };

        console.log("📝 Dữ liệu điền vào form khi chỉnh sửa:", JSON.stringify(productData, null, 2));

        setEditDetail(productData);
        setIsEditModalOpen(true);
    };



    const handleUpdateProductDetail = async () => {
        if (!editDetail || !editDetail.productDetailId) {
            console.error("❌ Thiếu dữ liệu cập nhật!");
            return;
        }

        let newErrors = {};

        // Kiểm tra giá (phải là số và lớn hơn 0)
        if (!editDetail.price || isNaN(editDetail.price) || Number(editDetail.price) <= 0) {
            newErrors.price = "Giá không được để trống và phải lớn hơn 0!";
        }

        // Kiểm tra số lượng (phải là số và lớn hơn 0)
        if (!editDetail.quantity || isNaN(editDetail.quantity) || Number(editDetail.quantity) <= 0) {
            newErrors.quantity = "Số lượng không được để trống và phải lớn hơn 0!";
        }

        // Nếu có lỗi, setErrors và dừng xử lý
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Xóa lỗi nếu dữ liệu hợp lệ
        setErrors({});

        // Format payload để gửi API
        const payload = {
            quantity: Number(editDetail.quantity),
            price: Number(editDetail.price),
            products: editDetail.productId ? { productId: Number(editDetail.productId) } : null,
            weights: editDetail.weightId ? { weightId: Number(editDetail.weightId) } : undefined,
            productSizes: editDetail.sizeId ? { productSizeId: Number(editDetail.sizeId) } : undefined,
            productColors: editDetail.colorId ? { productColorId: Number(editDetail.colorId) } : undefined,
        };

        console.log("📤 Dữ liệu gửi lên API:", JSON.stringify(payload, null, 2));

        try {
            const response = await ProductDetailsService.updateProductDetail(editDetail.productDetailId, payload);

            console.log("✅ Phản hồi từ server:", response);

            fetchProductDetails(); // Fetch updated product details
            setIsEditModalOpen(false);
            setSuccessMessage("Cập nhật thành công!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật biến thể:", error);

            if (error.response) {
                console.error("🔴 Phản hồi lỗi từ server:", error.response.data);
            }
        }
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
            const data = await ProductDetailsService.getProductDetailsDTOByProductId(productId);
            setProductDetails(data);
            console.log("Dữ liệu API:", data);
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

    // Mở modal và đặt danh sách ảnh
    const openModal = (images) => {
        setSelectedImages(images);
        setModalOpen(true);
    };

    // Đóng modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedImages([]);
    };



    if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;


    const handleAddProductDetail = async () => {
        let newErrors = {};

        // Kiểm tra từng field, nếu trống thì thêm vào `errors`
        if (!newDetail.productId) newErrors.productId = "Vui lòng chọn sản phẩm!";
        if (!newDetail.colorId) newErrors.colorId = "Vui lòng chọn màu!";
        if (!newDetail.sizeId) newErrors.sizeId = "Vui lòng chọn kích cỡ!";
        if (!newDetail.weightId) newErrors.weightId = "Vui lòng chọn cân nặng!";
        if (!newDetail.price || isNaN(newDetail.price) || Number(newDetail.price) <= 0)
            newErrors.price = "Giá không được để trống và phải lớn hơn 0!";
        if (!newDetail.quantity || isNaN(newDetail.quantity) || Number(newDetail.quantity) <= 0)
            newErrors.quantity = "Số lượng không được để trống và phải lớn hơn 0!";

        // Nếu có lỗi, setErrors và dừng xử lý
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Xóa lỗi nếu dữ liệu hợp lệ
        setErrors({});

        const payload = {
            quantity: Number(newDetail.quantity),
            price: Number(newDetail.price),
            products: { productId: Number(newDetail.productId) },
            weights: newDetail.weightId ? { weightId: Number(newDetail.weightId) } : null,
            productSizes: newDetail.sizeId ? { productSizeId: Number(newDetail.sizeId) } : null,
            productColors: newDetail.colorId ? { productColorId: Number(newDetail.colorId) } : null,
        };

        try {
            await ProductDetailsService.createProductDetail(payload);
            fetchProductDetails(); // Refresh danh sách sau khi thêm mới
            setSuccessMessage("Thêm biến thể thành công!");
            setTimeout(() => setSuccessMessage(""), 3000);

            // Reset form
            setNewDetail({
                productId: productId,
                price: "",
                colorId: "",
                sizeId: "",
                weightId: "",
                quantity: "",
            });

            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi thêm biến thể:", error);
        }

        console.log("Payload gửi lên API:", JSON.stringify(payload, null, 2));
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            {successMessage && (
                <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Chi tiết sản phẩm</h2>
            <div className="flex justify-between mb-4">
                <button
                    onClick={() => window.history.back()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    ← Quay về
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Thêm biến thể
                </button>
            </div>

            {productDetails.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">ID</th>
                            <th className="border border-gray-300 px-4 py-2">Tên sản phẩm</th>
                            <th className="border border-gray-300 px-4 py-2">Giá</th>
                            <th className="border border-gray-300 px-4 py-2">Màu</th>
                            <th className="border border-gray-300 px-4 py-2">Size</th>
                            <th className="border border-gray-300 px-4 py-2">Cân nặng</th>
                            <th className="border border-gray-300 px-4 py-2">Số lượng</th>
                            <th className="border border-gray-300 px-4 py-2">Hình ảnh</th>
                            <th className="border border-gray-300 px-4 py-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productDetails.map((product) => (
                            <tr key={product.productDetailId} className="text-center">
                                <td className="border border-gray-300 px-4 py-2">{product.productDetailId}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.productName}</td>
                                <td className="border border-gray-300 px-4 py-2 font-bold">
                                    {new Intl.NumberFormat("vi-VN",).format(product.price)} VND
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{product.colorValue}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.sizeValue}</td>
                                <td className="border border-gray-300 px-4 py-2">{product.weightValue} kg</td>
                                <td className="border border-gray-300 px-4 py-2">{product.quantity}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link
                                        to={`/admin/products-list/manage-product-details/:productId/product-image/${product.productDetailId}`}
                                        className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"

                                    >
                                        👁️ Xem ảnh
                                    </Link>

                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="px-3 py-1 bg-yellow-500 text-white rounded-md"
                                            onClick={() => openEditModal(product)}
                                        >
                                            ✏️ Sửa
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-500">Không có thông tin sản phẩm.</p>
            )}

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full text-center">
                        <h3 className="text-xl font-semibold mb-4">Hình ảnh sản phẩm</h3>

                        {selectedImages && selectedImages.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-300">
                                <tbody>
                                    {Array.from({ length: Math.ceil(selectedImages.length / 4) }, (_, rowIndex) => (
                                        <tr key={rowIndex} className="text-center">
                                            {selectedImages.slice(rowIndex * 4, rowIndex * 4 + 4).map((imgUrl, index) => (
                                                <td key={index} className="border border-gray-300 px-4 py-2">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Product Image ${index}`}
                                                            className="w-32 h-32 object-cover rounded-md mx-auto"
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <button className="px-3 py-1 bg-blue-500 text-white rounded-md">Sửa</button>
                                                            <button className="px-3 py-1 bg-red-500 text-white rounded-md">Xóa</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-lg italic">Không có ảnh</p>
                        )}
                        <button
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md w-full"

                        >
                            Thêm ảnh
                        </button>
                        <button
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md w-full"
                            onClick={closeModal}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="relative bg-white p-6 rounded-md shadow-lg w-1/3">
                        {/* Nút đóng ở góc trên bên phải */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            &times;
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Thêm Biến Thể Sản Phẩm</h3>

                        <p className="border p-2 rounded w-full mb-2 bg-gray-100">
                            {products.length > 0
                                ? products.find(p => p.productId.toString() === productId)?.productName || "Không tìm thấy sản phẩm"
                                : "Đang tải..."}
                        </p>

                        <select className={`border p-2 rounded w-full mb-2 ${errors.colorId ? 'border-red-500' : ''}`}
                            value={newDetail.colorId}
                            onChange={(e) => setNewDetail({ ...newDetail, colorId: e.target.value })}>
                            <option value="">Chọn Màu</option>
                            {colors.map((color) => (
                                <option key={color.productColorId} value={color.productColorId}>{color.colorValue}</option>
                            ))}
                        </select>
                        {errors.colorId && <p className="text-red-500 text-sm">{errors.colorId}</p>}

                        <select className={`border p-2 rounded w-full mb-2 ${errors.sizeId ? 'border-red-500' : ''}`}
                            value={newDetail.sizeId}
                            onChange={(e) => setNewDetail({ ...newDetail, sizeId: e.target.value })}>
                            <option value="">Chọn Kích Cỡ</option>
                            {sizes.map((size) => (
                                <option key={size.productSizeId} value={size.productSizeId}>{size.sizeValue}</option>
                            ))}
                        </select>
                        {errors.sizeId && <p className="text-red-500 text-sm">{errors.sizeId}</p>}

                        <select className={`border p-2 rounded w-full mb-2 ${errors.weightId ? 'border-red-500' : ''}`}
                            value={newDetail.weightId}
                            onChange={(e) => setNewDetail({ ...newDetail, weightId: e.target.value })}>
                            <option value="">Chọn Cân Nặng</option>
                            {weights.map((weight) => (
                                <option key={weight.weightId} value={weight.weightId}>{weight.weightValue} kg</option>
                            ))}
                        </select>
                        {errors.weightId && <p className="text-red-500 text-sm">{errors.weightId}</p>}

                        <input type="number" placeholder="Nhập Giá"
                            value={newDetail.price}
                            onChange={(e) => setNewDetail({ ...newDetail, price: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

                        <input type="number" placeholder="Nhập Số Lượng"
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
                            &times;
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Biến Thể</h3>
                        <p className="border p-2 rounded w-full mb-2 bg-gray-100">
                            {products.length > 0
                                ? products.find(p => p.productId.toString() === productId)?.productName || "Không tìm thấy sản phẩm"
                                : "Đang tải..."}
                        </p>

                        <select className="border p-2 rounded w-full mb-2"
                            value={editDetail?.colorId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, colorId: e.target.value })}>
                            {colors.map((color) => (
                                <option key={color.productColorId} value={color.productColorId}>{color.colorValue}</option>
                            ))}
                        </select>

                        <select className="border p-2 rounded w-full mb-2"
                            value={editDetail?.sizeId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, sizeId: e.target.value })}>
                            {sizes.map((size) => (
                                <option key={size.productSizeId} value={size.productSizeId}>{size.sizeValue}</option>
                            ))}
                        </select>

                        <select className="border p-2 rounded w-full mb-2"
                            value={editDetail?.weightId || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, weightId: e.target.value })}>
                            {weights.map((weight) => (
                                <option key={weight.weightId} value={weight.weightId}>{weight.weightValue} kg</option>
                            ))}
                        </select>

                        <input type="number" placeholder="Nhập Giá"
                            value={editDetail?.price || ""}
                            onChange={(e) => setEditDetail({ ...editDetail, price: e.target.value })}
                            className={`border p-2 rounded w-full mb-2 ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

                        <input type="number" placeholder="Nhập Số Lượng"
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
