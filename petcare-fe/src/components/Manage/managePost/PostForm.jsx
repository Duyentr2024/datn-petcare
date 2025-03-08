import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PostForm = () => {
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

    const [nextId, setNextId] = useState(null);

    // Lấy tổng số bài viết hiện tại để tạo ID mới
    useEffect(() => {
        const fetchPostCount = async () => {
            try {
                const response = await axios.get(
                    "https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json"
                );
                const posts = response.data || {};
                const count = Object.keys(posts).length;
                setNextId(count + 1); // ID mới = số bài viết hiện có + 1
            } catch (error) {
                console.error("Lỗi khi lấy số lượng bài viết:", error);
            }
        };

        fetchPostCount();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPost({ ...post, [name]: value });
    };

    const handleImageChange = (index, field, value) => {
        const newImages = [...post.images];
        newImages[index][field] = value;
        setPost({ ...post, images: newImages });
    };

    const addImageField = () => {
        setPost({ ...post, images: [...post.images, { url: "", caption: "" }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (nextId === null) {
            alert("Đang tải ID, vui lòng thử lại...");
            return;
        }

        try {
            const formattedPost = {
                ...post,
                id: nextId, // Gán ID số
                tags: post.tags.split(",").map((tag) => tag.trim()),
                related_posts: [],
            };

            await axios.put(
                `https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${nextId}.json`,
                formattedPost
            );

            alert("Bài viết đã được lưu thành công!");
            setPost({
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

            setNextId((prevId) => prevId + 1); // Tăng ID cho bài viết tiếp theo
        } catch (error) {
            console.error("Lỗi khi lưu bài viết:", error);
            alert("Đã xảy ra lỗi khi lưu bài viết.");
        }
    };

    return (
        <div className="w-full flex justify-center bg-gray-100 min-h-screen p-6">
            <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Tạo Bài Viết Mới</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-gray-700">Tiêu đề</label>
                            <input
                                type="text"
                                name="title"
                                value={post.title}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Tác giả</label>
                            <input
                                type="text"
                                name="author"
                                value={post.author}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-gray-700">Danh mục</label>
                            <input
                                type="text"
                                name="category"
                                value={post.category}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={post.tags}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700">Nội dung</label>
                        <textarea
                            name="content"
                            value={post.content}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none h-40"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700">Tóm tắt</label>
                        <textarea
                            name="summary"
                            value={post.summary}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none h-24"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700">Hình ảnh</label>
                        {post.images.map((img, index) => (
                            <div key={index} className="flex gap-4 mb-3">
                                <input
                                    type="text"
                                    placeholder="URL hình ảnh"
                                    value={img.url}
                                    onChange={(e) => handleImageChange(index, "url", e.target.value)}
                                    className="w-3/4 p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Chú thích"
                                    value={img.caption}
                                    onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                                    className="w-1/4 p-3 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addImageField}
                            className="text-blue-500 hover:underline font-semibold"
                        >
                            + Thêm hình ảnh
                        </button>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Link
                            to="/admin/post-management"
                            className="px-5 py-3 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-200 transition font-semibold"
                        >
                            ← Quay về
                        </Link>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                            Lưu bài viết
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostForm;
