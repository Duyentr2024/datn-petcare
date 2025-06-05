import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostService from "../../service/postsService/PostService";

const NewsPage = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await PostService.getAllPosts();
        console.log("Posts data from API:", postsData);

        if (Array.isArray(postsData) && postsData.length > 0) {
          const featured = postsData.find((p) => p.id === 3) || postsData[0];
          setFeaturedPost(featured);
          const sortedPosts = postsData
            .filter((p) => p.id !== featured.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setAllPosts(sortedPosts);
        } else {
          setError("Không tìm thấy bài viết nào từ API!");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchPosts:", err);
        setError("Không thể tải bài viết từ API!");
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] to-[#FFD700]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FBB321]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] to-[#FF8C00]">
        <div className="text-[#FF8C00] text-2xl font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section - Bài nổi bật */}
        <section className="mb-24">
          <div className="relative rounded-3xl overflow-hidden shadow-xl group transform transition-all duration-300 hover:-translate-y-2">
            <Link to={`/newsdetail/${featuredPost?.id}`}>
              <img
                src={featuredPost?.images[0]?.url || "https://via.placeholder.com/1200x500"}
                alt={featuredPost?.title}
                className="w-full h-[500px] object-cover"
                onError={(e) => (e.target.src = "https://via.placeholder.com/1200x500")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-8">
                <div className="text-white max-w-3xl animate-fade-in-up">
                  <span className="inline-block bg-[#FBB321] text-[#4B2E1A] px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
                    Nổi bật
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight group-hover:text-[#FBB321] transition-colors duration-300">
                    {featuredPost?.title || "Tiêu đề mặc định"}
                  </h1>
                  <p className="text-base sm:text-lg flex items-center gap-3 mb-4">
                    <i className="fas fa-calendar-alt text-[#FBB321]"></i> {featuredPost?.date} •{" "}
                    <span className="bg-[#FF8C00] px-3 py-1 rounded-full text-sm font-medium">{featuredPost?.category}</span>
                  </p>
                  <p className="text-base sm:text-lg line-clamp-3">{featuredPost?.summary}</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Latest News - Bố cục đều đặn */}
        <section className="relative">
          <h2 className="text-4xl font-bold text-[#FBB321] mb-16 text-center tracking-tight animate-fade-in">
            Tin tức mới nhất
          </h2>
          <div className="space-y-20">
            {/* Bố cục 1: 2 bài lớn ngang nhau */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {allPosts.slice(0, 2).map((post) => (
                <Link
                  key={post.id}
                  to={`/newsdetail/${post.id}`}
                  className="bg-white rounded-3xl shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                >
                  <img
                    src={post.images[0]?.url || "https://via.placeholder.com/600x400"}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-[#FBB321]"></i> {post.date}
                    </p>
                    <p className="text-gray-700 mt-3 text-base line-clamp-3">{post.summary}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bố cục 2: 3 bài trung bình ngang nhau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {allPosts.slice(2, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`/newsdetail/${post.id}`}
                  className="bg-white rounded-3xl shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg animate-fade-in-up"
                >
                  <img
                    src={post.images[0]?.url || "https://via.placeholder.com/400x300"}
                    alt={post.title}
                    className="w-full h-56 object-cover"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/400x300")}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-[#FBB321]"></i> {post.date}
                    </p>
                    <p className="text-gray-700 mt-3 text-base line-clamp-2">{post.summary}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bố cục 3: Các bài còn lại (nếu có) */}
            {allPosts.length > 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {allPosts.slice(5).map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/newsdetail/${post.id}`}
                    className="bg-white rounded-3xl shadow-md overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img
                      src={post.images[0]?.url || "https://via.placeholder.com/300x250"}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300x250")}
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-[#FBB321]"></i> {post.date}
                      </p>
                      <p className="text-gray-700 mt-3 text-base line-clamp-2">{post.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewsPage;