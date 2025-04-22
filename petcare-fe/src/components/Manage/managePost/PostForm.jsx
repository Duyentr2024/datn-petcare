import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "../../../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const PostForm = () => {
    const { postId } = useParams();
    const isEditMode = !!postId;
    const navigate = useNavigate();

    const [post, setPost] = useState({
        title: "",
        author: "",
        category: "",
        content: "",
        tags: "",
        images: [{ url: "", caption: "" }],
        details: {
            benefits: [],
            tips: [],
            types: [],
            who_should_try: "",
        },
        date: new Date().toISOString().split("T")[0],
        views: 0,
        likes: 0,
        comments: 0,
        summary: "",
    });

    const [errors, setErrors] = useState({});
    const [imageFiles, setImageFiles] = useState([]); // Store selected image files
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            axios
                .get(`https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postId}.json`)
                .then((response) => {
                    if (response.data) {
                        setPost({
                            ...response.data,
                            tags: response.data.tags ? response.data.tags.join(", ") : "",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Lỗi khi lấy dữ liệu bài viết:", error);
                    toast.error("Không thể tải dữ liệu bài viết!");
                });
        }
    }, [postId, isEditMode]);

    const validateForm = () => {
        const newErrors = {};
        if (!post.title.trim()) newErrors.title = "Tiêu đề không được để trống";
        else if (post.title.length < 5) newErrors.title = "Tiêu đề phải ít nhất 5 ký tự";
        if (!post.author.trim()) newErrors.author = "Tác giả không được để trống";
        if (!post.category.trim()) newErrors.category = "Danh mục không được để trống";
        if (!post.content.trim()) newErrors.content = "Nội dung không được để trống";
        else if (post.content.length < 20) newErrors.content = "Nội dung phải ít nhất 20 ký tự";
        if (!post.summary.trim()) newErrors.summary = "Tóm tắt không được để trống";
        else if (post.summary.length < 10) newErrors.summary = "Tóm tắt phải ít nhất 10 ký tự";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPost({ ...post, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...post.images];
        newImages[index][field] = value;
        setPost({ ...post, images: newImages });
    };

    const handleImageFileChange = (index, e) => {
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
            const newImageFiles = [...imageFiles];
            newImageFiles[index] = file;
            setImageFiles(newImageFiles);
        }
    };

    const addImageField = () => {
        setPost({ ...post, images: [...post.images, { url: "", caption: "" }] });
        setImageFiles([...imageFiles, null]);
    };

    const removeImageField = (index) => {
        const newImages = post.images.filter((_, i) => i !== index);
        const newImageFiles = imageFiles.filter((_, i) => i !== index);
        setPost({ ...post, images: newImages });
        setImageFiles(newImageFiles);
    };

    const uploadImageToFirebase = async (file) => {
        if (!file) return null;
        const storageRef = ref(storage, `post-images/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => reject(error),
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin!");
            return;
        }

        setIsUploading(true);
        try {
            // Upload all new images to Firebase
            const uploadedImageUrls = await Promise.all(
                imageFiles.map((file, index) =>
                    file ? uploadImageToFirebase(file) : post.images[index].url
                )
            );

            // Update image URLs in post data
            const updatedImages = post.images.map((img, index) => ({
                url: uploadedImageUrls[index] || img.url,
                caption: img.caption || "Chưa có chú thích",
            }));

            const formattedPost = {
                ...post,
                id: isEditMode ? postId : Date.now(),
                tags: post.tags.split(",").map((tag) => tag.trim()).filter(tag => tag),
                images: updatedImages,
                related_posts: [],
            };

            if (isEditMode) {
                await axios.put(
                    `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${postId}.json`,
                    formattedPost
                );
                toast.success("Cập nhật bài viết thành công!");
            } else {
                await axios.put(
                    `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${formattedPost.id}.json`,
                    formattedPost
                );
                toast.success("Thêm bài viết thành công!");
            }

            navigate("/admin/post-management"); // Redirect back to post management
        } catch (error) {
            console.error("Lỗi khi lưu bài viết:", error);
            toast.error("Đã xảy ra lỗi khi lưu bài viết.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-2xl">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.title ? "border-red-500" : "border-gray-300 hover:border-blue-300"
                        }`}
                        placeholder="Nhập tiêu đề bài viết"
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Tác giả <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={post.author}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                errors.author ? "border-red-500" : "border-gray-300 hover:border-blue-300"
                            }`}
                            placeholder="Nhập tên tác giả"
                        />
                        {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={post.category}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                errors.category ? "border-red-500" : "border-gray-300 hover:border-blue-300"
                            }`}
                            placeholder="Nhập danh mục"
                        />
                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="content"
                        value={post.content}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.content ? "border-red-500" : "border-gray-300 hover:border-blue-300"
                        }`}
                        placeholder="Nhập nội dung bài viết"
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Tóm tắt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="summary"
                        value={post.summary}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.summary ? "border-red-500" : "border-gray-300 hover:border-blue-300"
                        }`}
                        placeholder="Nhập tóm tắt bài viết"
                    />
                    {errors.summary && <p className="text-sm text-red-500">{errors.summary}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Tags (cách nhau bằng dấu phẩy)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={post.tags}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all duration-200"
                        placeholder="Nhập tags, ví dụ: sức khỏe, dinh dưỡng"
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                        Hình ảnh
                    </label>
                    {post.images.map((img, index) => (
                        <div key={index} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div className="flex gap-4 items-center">
                                <div className="w-2/3">
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageFileChange(index, e)}
                                        className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept="image/jpeg,image/png,image/jpg"
                                    />
                                    {imageFiles[index] && (
                                        <img
                                            src={URL.createObjectURL(imageFiles[index])}
                                            alt="Preview"
                                            className="mt-2 w-24 h-24 object-cover rounded-md shadow-sm"
                                        />
                                    )}
                                    {img.url && !imageFiles[index] && (
                                        <img
                                            src={img.url}
                                            alt="Existing"
                                            className="mt-2 w-24 h-24 object-cover rounded-md shadow-sm"
                                        />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Chú thích ảnh"
                                    value={img.caption}
                                    onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                                    className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all duration-200"
                                />
                                {post.images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeImageField(index)}
                                        className="text-red-500 hover:text-red-700 font-semibold"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addImageField}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                        <span className="text-lg">+</span> Thêm hình ảnh
                    </button>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/post-management")}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`px-6 py-3 bg-[#f0b040] text-white rounded-lg shadow-md transition-all duration-200 ${
                            isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#e0a030]"
                        }`}
                    >
                        {isUploading
                            ? "Đang lưu..."
                            : isEditMode
                                ? "Cập nhật bài viết"
                                : "Lưu bài viết"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;