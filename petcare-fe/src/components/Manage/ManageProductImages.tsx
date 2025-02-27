import React, { useEffect, useState } from "react";
import ProductImagesService from "../../service/manageService/ProductImagesService";
import ProductDetailsService from "../../service/manageService/ProductDetailsService";
import { storage } from "../../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify"; // Fixed: Added ToastContainer to the import
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";

const ManageProductImages = () => {
    const [images, setImages] = useState([]);
    const [productDetails, setProductDetails] = useState([]);
    const [productImageId, setProductImageId] = useState(null);
    const [selectedProductDetailId, setSelectedProductDetailId] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageInputKey, setImageInputKey] = useState(Date.now());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isUploading, setIsUploading] = useState(false);
    const { productDetailId } = useParams();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchImages(productDetailId);
        fetchProductDetails();
    }, [currentPage]);

    useEffect(() => {
        if (productDetailId) {
            setSelectedProductDetailId(productDetailId);
        }
    }, [productDetailId]);

    const fetchImages = async (productDetailId) => {
        try {
            const data = await ProductImagesService.getAllImagesByProductDetails(productDetailId);
            setImages([...data]);
            console.log("Danh sách ảnh đã cập nhật:", data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách ảnh:", error);
        }
    };

    const fetchProductDetails = async () => {
        try {
            const data = await ProductDetailsService.getAllProductDetails();
            setProductDetails(data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm chi tiết:", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setErrorMessage("❌ Vui lòng chọn một tệp ảnh.");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            setErrorMessage("❌ Chỉ chấp nhận hình ảnh định dạng JPG, PNG, JPEG.");
            return;
        }

        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            setErrorMessage("❌ Kích thước ảnh không được vượt quá 2MB.");
            return;
        }

        setErrorMessage("");
        setSelectedImage(file);
    };

    const handleSaveImage = async () => {
        if (!selectedProductDetailId || !selectedImage || isUploading) {
            setErrorMessage("❌ Vui lòng chọn ảnh trước khi lưu.");
            return;
        }

        setIsUploading(true);
        setErrorMessage("");

        const storageRef = ref(storage, `product-images/${Date.now()}-${selectedImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedImage);

        uploadTask.on(
            "state_changed",
            null,
            (error) => {
                console.error("❌ Lỗi khi tải ảnh lên Firebase:", error);
                setErrorMessage("❌ Lỗi khi tải ảnh lên, vui lòng thử lại.");
                setIsUploading(false);
            },
            async () => {
                try {
                    const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    const imageData = { productDetailId: selectedProductDetailId, imageUrl };

                    if (productImageId) {
                        await ProductImagesService.updateProductImage(productImageId, imageData);
                        toast.success("Ảnh đã được cập nhật thành công!");
                    } else {
                        await ProductImagesService.createProductImage(imageData);
                        toast.success("Ảnh đã được thêm thành công!");
                    }

                    fetchImages(selectedProductDetailId);
                    resetForm();
                } catch (error) {
                    console.error("❌ Lỗi khi lưu ảnh:", error);
                    setErrorMessage("❌ Lỗi khi lưu ảnh, vui lòng thử lại.");
                } finally {
                    setIsUploading(false);
                }
            }
        );
    };

    const handleEditImage = (image) => {
        setProductImageId(image.productImageId);
        setSelectedProductDetailId(image.productDetailId);
        setSelectedImage(null);
        setImageInputKey(Date.now());
        setIsModalOpen(true);
    };

    const handleDeleteImage = async (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await ProductImagesService.deleteProductImage(id);
                    fetchImages(productDetailId);
                    toast.success("Xóa ảnh thành công!");
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh:", error);
                } finally {
                    setIsUploading(false);
                }
            }
        });
    };

    const resetForm = () => {
        setSelectedImage(null);
        setProductImageId(null);
        setIsModalOpen(false);
        setErrorMessage(null);
        document.getElementById("fileInput").value = "";
    };

    const paginateImage = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return images.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(images.length / itemsPerPage);

    return (
        <div className="p-6">
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quản lý ảnh hình ảnh của biến thể</h2>
            <div className="mb-3">
                <div className="flex justify-between ">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        ← Quay về
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Thêm ảnh mới
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            {productImageId ? "Chỉnh sửa ảnh sản phẩm" : "Thêm ảnh sản phẩm"}
                        </h3>

                        {errorMessage && (
                            <p className="p-2 mb-2 text-red-700 bg-red-100 border border-red-400 rounded-md text-center">
                                {errorMessage}
                            </p>
                        )}
                        <select
                            value={selectedProductDetailId}
                            className="border p-2 rounded w-full mb-4 bg-gray-200 cursor-not-allowed"
                            disabled
                        >
                            {productDetails.map((detail) => (
                                <option key={detail.productDetailId} value={detail.productDetailId}>
                                    {detail.productDetailId} - {detail.productName} - {detail.colorValue} - {detail.sizeValue} - {detail.weightValue}
                                </option>
                            ))}
                        </select>

                        <div className="border p-4 rounded-md bg-gray-50 border-dashed text-center">
                            <label
                                htmlFor="fileInput"
                                className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600"
                            >
                                Chọn ảnh
                            </label>
                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận hình ảnh JPG, PNG, JPEG</p>
                        </div>

                        <div className="mt-4 flex justify-center items-center" style={{ minHeight: '200px', maxHeight: '200px' }}>
                            {selectedImage && (
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Ảnh xem trước"
                                    className="rounded-md shadow-lg"
                                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                                />
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleSaveImage}
                                className={`px-4 py-2 rounded text-white ${productImageId ? "bg-yellow-500" : "bg-green-500"} hover:opacity-90 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={isUploading}
                            >
                                {isUploading ? "Đang lưu..." : productImageId ? "Cập nhật ảnh" : "Thêm ảnh"}
                            </button>

                            <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:opacity-90">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Sản phẩm chi tiết</th>
                        <th className="border p-2">Ảnh</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateImage().map((image) => (
                        <tr key={image.productImageId} className="border">
                            <td className="border p-2">{image.productImageId}</td>
                            <td className="border p-2">{image.productDetailId} - Tên sản phẩm: {image.productName} <br />
                                Màu: {image.colorValue} <br />
                                Size: {image.sizeValue} <br />
                                Cân nặng: {image.weightValue}</td>
                            <td className="border p-2">
                                <img src={image.imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-lg shadow-md mx-auto" />
                            </td>
                            <td className="border p-2">
                                <button onClick={() => handleEditImage(image)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                                    <FiEdit size={16} /> Sửa
                                </button>
                                <button onClick={() => handleDeleteImage(image.productImageId)} className="bg-red-500 text-white px-3 py-1 rounded ml-2">
                                    <FiTrash2 size={16} /> Xóa
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

export default ManageProductImages;