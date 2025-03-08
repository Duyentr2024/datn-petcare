import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

const PostManage = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json")
            .then((response) => {
                if (response.data) {
                    const postArray = Object.keys(response.data).map((key) => ({
                        id: key,
                        ...response.data[key],
                    }));
                    setPosts(postArray);
                    setFilteredPosts(postArray);
                }
            })
            .catch((error) => console.error("Lỗi khi lấy dữ liệu bài viết:", error));
    }, []);

    useEffect(() => {
        const result = posts.filter(
            (post) =>
                (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (post.author && post.author.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredPosts(result);
        setCurrentPage(1);
    }, [searchQuery, posts]);

    const handleSort = (field) => {
        const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);

        const sortedPosts = [...filteredPosts].sort((a, b) => {
            const aValue = a[field] || "";
            const bValue = b[field] || "";
            if (aValue < bValue) return newOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredPosts(sortedPosts);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const handleShowDetails = (postId) => {
        navigate(`/admin/post-management/detail/${postId}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý bài viết</h1>
            <Link to="/admin/post-management/postform" className="bg-green-600 text-white px-3 py-1 rounded-lg mb-3">Thêm bài biết</Link>


            <input
                type="text"
                placeholder="🔍 Tìm theo tiêu đề hoặc tác giả..."
                className="p-2 border border-gray-300 rounded w-full mb-4 mt-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-blue-500 text-white uppercase text-sm">
                        <th className="p-4 cursor-pointer" onClick={() => handleSort("title")}>
                            Tiêu đề {sortField === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-4 cursor-pointer" onClick={() => handleSort("author")}>
                            Tác giả {sortField === "author" && (sortOrder === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-4">Danh mục</th>
                        <th className="p-4 cursor-pointer" onClick={() => handleSort("views")}>
                            Lượt xem {sortField === "views" && (sortOrder === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-4 cursor-pointer" onClick={() => handleSort("likes")}>
                            Lượt thích {sortField === "likes" && (sortOrder === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-4 cursor-pointer" onClick={() => handleSort("date")}>
                            Ngày đăng {sortField === "date" && (sortOrder === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-4 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {currentPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-100 transition">
                            <td className="p-4">{post.title || "Không có tiêu đề"}</td>
                            <td className="p-4">{post.author || "Không rõ tác giả"}</td>
                            <td className="p-4">{post.category || "Không có danh mục"}</td>
                            <td className="p-4">{post.views || 0}</td>
                            <td className="p-4">❤️ {post.likes || 0}</td>
                            <td className="p-4">{post.date || "Không rõ ngày"}</td>
                            <td className="p-4 text-center">
                                <button
                                    className="px-3 py-1 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition mr-3"
                                    onClick={() => handleShowDetails(post.id)}
                                >
                                    📖 Xem chi tiết
                                </button>
                                <button className="text-blue-500 hover:text-blue-700 mr-3">
                                    <FiEdit size={18} />
                                </button>
                                <button className="text-red-500 hover:text-red-700">
                                    <FiTrash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-4">
                <button
                    className={`px-3 py-1 mx-1 ${
                        currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                    } rounded`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ◀️ Trang trước
                </button>
                <span className="px-3">
                    Trang {currentPage} / {Math.ceil(filteredPosts.length / postsPerPage)}
                </span>
                <button
                    className={`px-3 py-1 mx-1 ${
                        indexOfLastPost >= filteredPosts.length
                            ? "bg-gray-300"
                            : "bg-blue-500 text-white"
                    } rounded`}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={indexOfLastPost >= filteredPosts.length}
                >
                    Trang sau ▶️
                </button>
            </div>
        </div>
    );
};

export default PostManage;