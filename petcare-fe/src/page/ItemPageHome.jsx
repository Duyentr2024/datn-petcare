import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HomeProduct from "../components/product/home/HomeProduct.jsx";
import GoodPrice from "../components/card/GoodPrice.jsx";
import Banner from "../components/banner/banner.jsx";
import ServiceProduct from "../service/serviceProduct/ServiceProduct.jsx";
import PostService from "../service/postsService/PostService";

// Hiệu ứng fade-in + slide-up + scale nhẹ
const fadeInUp = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

// Hiệu ứng stagger cho các bài viết
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const ItemPageHome = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsData = await PostService.getAllPosts();
                if (Array.isArray(postsData) && postsData.length > 0) {
                    // Sắp xếp theo ngày giảm dần và lấy 6 bài mới nhất
                    const sortedPosts = postsData
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 6);
                    setPosts(sortedPosts);
                } else {
                    setError("Không tìm thấy bài viết nào!");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Không thể tải bài viết!");
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="space-y-10 font-poppins">
            {/* Banner */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
            >
                <Banner />
            </motion.div>

            {/* ServiceProduct */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.1 }}
            >
                <ServiceProduct />
            </motion.div>

            {/* HomeProduct */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.2 }}
            >
                <HomeProduct />
            </motion.div>

            {/* GoodPrice */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.3 }}
            >
                <GoodPrice />
            </motion.div>

            {/* News Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: 0.4 }}
                className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                <h2 className="text-4xl font-bold text-[#FBB321] mb-12 text-center tracking-tight">
                    Có thể bạn muốn biết?
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-3xl shadow-md overflow-hidden animate-pulse"
                            >
                                <div className="w-full h-56 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center text-[#FF8C00] text-2xl font-semibold">
                        {error}
                    </div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {posts.slice(0, 3).map((post, index) => (
                            <motion.div
                                key={post.id}
                                variants={fadeInUp}
                                className="bg-white rounded-3xl shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                            >
                                <Link to={`/newsdetail/${post.id}`}>
                                    <img
                                        src={
                                            post.images[0]?.url ||
                                            "https://via.placeholder.com/400x300"
                                        }
                                        alt={post.title}
                                        className="w-full h-56 object-cover"
                                        onError={(e) =>
                                        (e.target.src =
                                            "https://via.placeholder.com/400x300")
                                        }
                                    />
                                    <div className="p-6">
                                        <span className="inline-block bg-[#FF8C00] text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                                            {post.category}
                                        </span>
                                        <h3 className="text-xl font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors duration-300 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                            <i className="fas fa-calendar-alt text-[#FBB321]"></i>{" "}
                                            {post.date}
                                        </p>
                                        <p className="text-gray-700 mt-3 text-base line-clamp-2">
                                            {post.summary}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Nút Xem thêm */}
                <div className="text-center mt-12">
                    <Link
                        to="/newsPage"
                        className="inline-block bg-[#FBB321] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#e0a030] hover:text-white transition-all duration-300"
                    >
                        Xem thêm tin tức
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

export default ItemPageHome;