import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "../../../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const PostManage = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [newImageCaption, setNewImageCaption] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [editImageIndex, setEditImageIndex] = useState(null);
    const [modalPage, setModalPage] = useState(1); // New state for modal pagination
    const postsPerPage = 8;
    const imagesPerPage = 2; // New constant for modal pagination
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        axios
            .get("https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json")
            .then((response) => {
                if (response.data) {
                    const postArray = Object.keys(response.data).map((key) => ({
                        id: key,
                        ...response.data[key],
                    }));
                    const sortedPosts = postArray.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setPosts(sortedPosts);
                    setFilteredPosts(sortedPosts);
                }
            })
            .catch((error) => console.error("Lỗi khi lấy dữ liệu bài viết:", error));
    };

    useEffect(() => {
        const result = posts.filter(
            (post) =>
                (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredPosts(result);
        setCurrentPage(1);
    }, [searchQuery, posts]);

    const handleDeletePost = async (postId) => {
        Swal.fire({
            title: "Bạn có chắc muốn xóa?",
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
                    await axios.delete(
                        `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postId}.json`
                    );
                    toast.success("Xóa bài viết thành công!");
                    fetchPosts();
                } catch (error) {
                    console.error("Lỗi khi xóa bài viết:", error);
                    toast.error("Đã xảy ra lỗi khi xóa bài viết.");
                }
            }
        });
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > Math.ceil(filteredPosts.length / postsPerPage)) return;
        setCurrentPage(page);
    };

    const handleModalPageChange = (page) => {
        if (page < 1 || page > Math.ceil(selectedImages.length / imagesPerPage)) return;
        setModalPage(page);
    };

    const handleViewImages = (images, postId) => {
        setSelectedImages(images || []);
        setSelectedPostId(postId);
        setIsModalOpen(true);
        setModalPage(1); // Reset to first page when opening modal
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Chỉ chấp nhận hình ảnh định dạng JPG, PNG, JPEG.");
                return;
            }
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                toast.error("Kích thước ảnh không được vượt quá 2MB.");
                return;
            }
            setNewImageFile(file);
        }
    };

    const handleAddOrUpdateImage = async () => {
        if (!newImageFile && editImageIndex === null) {
            toast.error("Vui lòng chọn ảnh để thêm hoặc chỉnh sửa.");
            return;
        }

        setIsUploading(true);
        let updatedImages = [...selectedImages];

        if (newImageFile) {
            const storageRef = ref(storage, `post-images/${Date.now()}-${newImageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, newImageFile);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.error("Lỗi khi tải ảnh lên Firebase:", error);
                    toast.error("Lỗi khi tải ảnh lên, vui lòng thử lại.");
                    setIsUploading(false);
                },
                async () => {
                    try {
                        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        const newImage = {
                            url: imageUrl,
                            caption: newImageCaption || "Chưa có chú thích"
                        };

                        if (editImageIndex !== null) {
                            updatedImages[editImageIndex] = newImage;
                        } else {
                            updatedImages.push(newImage);
                        }

                        await updatePostImages(updatedImages);
                        toast.success(editImageIndex !== null ? "Cập nhật ảnh thành công!" : "Thêm ảnh thành công!");
                        resetImageForm();
                    } catch (error) {
                        console.error("Lỗi khi lưu ảnh:", error);
                        toast.error("Lỗi khi lưu ảnh, vui lòng thử lại.");
                    } finally {
                        setIsUploading(false);
                    }
                }
            );
        } else if (editImageIndex !== null) {
            updatedImages[editImageIndex].caption = newImageCaption;
            await updatePostImages(updatedImages);
            toast.success("Cập nhật chú thích thành công!");
            resetImageForm();
            setIsUploading(false);
        }
    };

    const handleEditImage = (index) => {
        setEditImageIndex(index);
        setNewImageFile(null);
        setNewImageCaption(selectedImages[index].caption);
    };

    const handleDeleteImage = async (index) => {
        Swal.fire({
            title: "Bạn có chắc muốn xóa ảnh này?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedImages = selectedImages.filter((_, i) => i !== index);
                await updatePostImages(updatedImages);
                toast.success("Xóa ảnh thành công!");
                setSelectedImages(updatedImages);
                // Adjust page if necessary after deletion
                if (modalPage > Math.ceil(updatedImages.length / imagesPerPage)) {
                    setModalPage(Math.max(1, Math.ceil(updatedImages.length / imagesPerPage)));
                }
            }
        });
    };

    const updatePostImages = async (updatedImages) => {
        try {
            const imagesToUpdate = updatedImages.length > 0 ? updatedImages : [];
            await axios.put(
                `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${selectedPostId}/images.json`,
                imagesToUpdate
            );
            setSelectedImages(imagesToUpdate);
            fetchPosts();
        } catch (error) {
            console.error("Lỗi khi cập nhật ảnh:", error);
            toast.error("Lỗi khi cập nhật ảnh, vui lòng thử lại.");
            throw error;
        }
    };

    const resetImageForm = () => {
        setNewImageFile(null);
        setNewImageCaption("");
        setEditImageIndex(null);
        document.getElementById("imageInput").value = "";
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Modal pagination calculations
    const indexOfLastImage = modalPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = selectedImages.slice(indexOfFirstImage, indexOfLastImage);
    const totalModalPages = Math.ceil(selectedImages.length / imagesPerPage);

    return (
        <div className="p-6 w-full mx-auto">
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
            <h1 className="text-2xl font-bold mb-4 text-center">Quản lý bài viết</h1>
            <div className="flex justify-between items-center mb-4">
                <Link to="/admin/post-management/postform" className="bg-green-500 text-white px-4 py-2 rounded-lg">
                    + Thêm bài viết
                </Link>
                <input
                    type="text"
                    placeholder="🔍 Tìm bài viết..."
                    className="p-2 border border-gray-300 rounded w-1/2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="w-full text-sm text-gray-600">
                    <thead>
                    <tr className="bg-blue-500 text-white text-left">
                        <th className="p-3">Tiêu đề</th>
                        <th className="p-3">Tác giả</th>
                        <th className="p-3">Lượt xem</th>
                        <th className="p-3">Ngày đăng</th>
                        <th className="p-3 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentPosts.map((post) => (
                        <tr key={post.id} className="border-b hover:bg-gray-100">
                            <td className="p-3">{post.title || "(Không có tiêu đề)"}</td>
                            <td className="p-3">{post.author || "(Không rõ)"}</td>
                            <td className="p-3">{post.views || 0}</td>
                            <td className="p-3">{post.date || "N/A"}</td>
                            <td className="p-3 flex justify-center gap-3">
                                <button
                                    onClick={() => handleViewImages(post.images || [], post.id)}
                                    className="text-green-500"
                                >
                                    📷
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/post-management/detail/${post.id}`)}
                                    className="text-blue-500"
                                >
                                    📖
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/post-management/postform/${post.id}`)}
                                    className="text-yellow-500"
                                >
                                    <FiEdit size={18} />
                                </button>
                                <button onClick={() => handleDeletePost(post.id)} className="text-red-500">
                                    <FiTrash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center gap-2 mt-6">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                    Trước
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`w-8 h-8 rounded-full ${
                            currentPage === index + 1
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                    Sau
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-2/3">
                        <h2 className="text-xl font-bold mb-4">Quản lý hình ảnh bài viết</h2>

                        <div className="mb-4">
                            <div className="border p-4 rounded-md bg-gray-50 border-dashed text-center">
                                <label
                                    htmlFor="imageInput"
                                    className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600"
                                >
                                    Chọn ảnh
                                </label>
                                <input
                                    type="file"
                                    id="imageInput"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <p className="text-gray-500 text-sm mt-2">Chỉ chấp nhận JPG, PNG, JPEG (tối đa 2MB)</p>
                            </div>
                            {newImageFile && (
                                <div className="mt-4 flex justify-center">
                                    <img
                                        src={URL.createObjectURL(newImageFile)}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-md shadow-md"
                                    />
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Nhập chú thích ảnh"
                                className="w-full p-2 mt-2 border rounded"
                                value={newImageCaption}
                                onChange={(e) => setNewImageCaption(e.target.value)}
                            />
                            <button
                                onClick={handleAddOrUpdateImage}
                                className={`mt-2 px-4 py-2 rounded text-white ${
                                    editImageIndex !== null ? "bg-yellow-500" : "bg-green-500"
                                } hover:opacity-90 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={isUploading}
                            >
                                {isUploading
                                    ? "Đang xử lý..."
                                    : editImageIndex !== null
                                        ? "Cập nhật ảnh"
                                        : "Thêm ảnh"}
                            </button>
                        </div>

                        <table className="w-full border">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2">Ảnh</th>
                                <th className="p-2">Chú thích</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentImages.map((img, index) => (
                                <tr key={index} className="border-t">
                                    <td className="p-2">
                                        <img
                                            src={img.url}
                                            alt={img.caption}
                                            className="w-32 h-32 object-cover rounded-md"
                                        />
                                    </td>
                                    <td className="p-2">{img.caption}</td>
                                    <td className="p-2 flex gap-2">
                                        <button
                                            onClick={() => handleEditImage(indexOfFirstImage + index)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            <FiEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteImage(indexOfFirstImage + index)}
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Modal Pagination */}
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                onClick={() => handleModalPageChange(modalPage - 1)}
                                disabled={modalPage === 1}
                                className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            {[...Array(totalModalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handleModalPageChange(index + 1)}
                                    className={`w-6 h-6 rounded-full ${
                                        modalPage === index + 1
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handleModalPageChange(modalPage + 1)}
                                disabled={modalPage === totalModalPages}
                                className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManage;