import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Img } from "react-image";
import PostService from "../../service/postsService/PostService";

const NewsDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs để theo dõi các section
  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const sectionsRef = useRef([]);
  const relatedPostsRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postsData = await PostService.getAllPosts();
        console.log("Posts data:", postsData);

        if (!postsData || !Array.isArray(postsData)) {
          throw new Error("Dữ liệu bài viết không hợp lệ hoặc không tồn tại!");
        }

        const postId = parseInt(id);
        const selectedPost = postsData.find((p) => p.id === postId);

        if (selectedPost) {
          setPost(selectedPost);
          const allPostsExceptCurrent = postsData.filter((p) => p.id !== postId);
          const shuffledPosts = allPostsExceptCurrent.sort(() => 0.5 - Math.random());
          const randomRelatedPosts = shuffledPosts.slice(0, 3);
          setRelatedPosts(randomRelatedPosts);
          const sortedPosts = postsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
          setRecentPosts(sortedPosts);
        } else {
          setError("Không tìm thấy bài viết với id: " + id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Không thể tải bài viết: " + err.message);
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchPost();
  }, [id]);

  // Intersection Observer để thêm hiệu ứng khi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // Ngừng theo dõi sau khi hiển thị
          }
        });
      },
      { threshold: 0.1 } // Hiển thị khi 10% phần tử vào viewport
    );
  
    if (headerRef.current) observer.observe(headerRef.current);
    if (summaryRef.current) observer.observe(summaryRef.current);
    sectionsRef.current.forEach((ref) => ref && observer.observe(ref));
    if (relatedPostsRef.current) observer.observe(relatedPostsRef.current);
    if (sidebarRef.current) observer.observe(sidebarRef.current);
  
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (summaryRef.current) observer.unobserve(summaryRef.current);
      sectionsRef.current.forEach((ref) => ref && observer.unobserve(ref));
      if (relatedPostsRef.current) observer.unobserve(relatedPostsRef.current);
      if (sidebarRef.current) observer.unobserve(sidebarRef.current);
    };
  }, [post, relatedPosts, recentPosts]);

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
        <div className="text-[#FF8C00] text-2xl font-semibold font-poppins">{error}</div>
      </div>
    );
  }

  const renderSection = (type, title, data, ref) => {
    switch (type) {
      case "benefits":
      case "services":
      case "treatments":
      case "techniques":
      case "types":
      case "top_spas":
        return (
          <section ref={ref} className="mt-12 animate-section">
            <h2 className="text-2xl font-semibold text-[#FBB321] mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#FFD700]/20 rounded-lg hover:bg-[#FFD700]/40 transition-colors shadow-sm"
                >
                  <strong className="text-[#FF8C00]">
                    {item.title || item.name || item.type || item.service || item.technique}:
                  </strong>{" "}
                  {item.description}
                </div>
              ))}
            </div>
          </section>
        );
      case "process":
      case "steps":
        return (
          <section ref={ref} className="mt-12 animate-section">
            <h2 className="text-2xl font-semibold text-[#FBB321] mb-4">{title}</h2>
            <ol className="list-decimal pl-6 space-y-4">
              {data.map((item, index) => (
                <li key={index}>
                  <span className="font-bold text-[#FF8C00]">
                    Bước {item.step} - {item.title}:
                  </span>{" "}
                  {item.description}
                </li>
              ))}
            </ol>
          </section>
        );
      case "tips":
      case "products":
      case "scents":
      case "criteria":
      case "red_flags":
      case "prep":
        return (
          <section ref={ref} className="mt-12 animate-section">
            <h2 className="text-2xl font-semibold text-[#FBB321] mb-4">{title}</h2>
            <ul className="list-disc pl-6 space-y-3">
              {data.map((item, index) => (
                <li key={index}>
                  {typeof item === "string"
                    ? item
                    : `${item.criterion || item.myth || item.prep || item.scent || item.tool || ""}: ${
                        item.description || item.truth || ""
                      }`}
                </li>
              ))}
            </ul>
          </section>
        );
      case "myths":
        return (
          <section ref={ref} className="mt-12 animate-section">
            <h2 className="text-2xl font-semibold text-[#FBB321] mb-4">{title}</h2>
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index}>
                  <p>
                    <strong className="text-[#FF8C00]">Quan niệm sai: </strong>
                    {item.myth}
                  </p>
                  <p>
                    <strong className="text-[#FF8C00]">Sự thật: </strong>
                    {item.truth}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      case "who_should_try":
      case "target_audience":
        return (
          <section ref={ref} className="mt-12 animate-section">
            <h2 className="text-2xl font-semibold text-[#FBB321] mb-4">{title}</h2>
            <p className="italic text-gray-600">{data}</p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-poppins">
      {/* Header Section */}
      <header
        ref={headerRef}
        className="relative bg-gradient-to-r from-[#FBB321] to-[#FF8C00] text-white py-12 mb-8 animate-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl mb-6 tracking-tight"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
          >
            {post?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
            <span className="flex items-center gap-2 bg-[#FFD700] text-[#4B2E1A] px-3 py-1 rounded-full">
              <i className="fas fa-calendar-alt"></i> {post?.date}
            </span>
            <span className="flex items-center gap-2">
              <i className="fas fa-user-circle"></i> {post?.author}
            </span>
            <span className="flex items-center gap-2 bg-[#FF8C00] px-3 py-1 rounded-full">
              <i className="fas fa-tag"></i> {post?.category}
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#FFF3E0] to-transparent"></div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Content */}
          <main className="lg:col-span-8 bg-white rounded-xl shadow-md p-8">
            <Img
              src={[post?.images[0]?.url, "https://via.placeholder.com/800x400"]}
              alt={post?.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg mb-6 shadow-sm"
              loader={<div className="w-full h-64 md:h-80 bg-gray-200 animate-pulse rounded-lg"></div>}
            />

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-gray-600 text-sm border-b border-gray-200 pb-4">
              <span className="flex items-center gap-2">
                <i className="fas fa-eye text-[#FBB321]"></i> {post?.views} lượt xem
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-heart text-[#FBB321]"></i> {post?.likes} lượt thích
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-comment text-[#FBB321]"></i> {post?.comments} bình luận
              </span>
            </div>

            {/* Highlight Summary */}
            <div
              ref={summaryRef}
              className="bg-[#FFD700]/10 border-l-4 border-[#FBB321] p-4 mb-8 rounded-r-lg shadow-sm overflow-hidden animate-section"
            >
              <p className="text-gray-700 italic text-lg">{post?.summary}</p>
            </div>

            <div className="prose prose-custom max-w-none mb-10 text-gray-700">
              <p className="text-lg leading-relaxed">{post?.content}</p>

              {/* Hiển thị các phần trong details */}
              {post?.details &&
                Object.entries(post.details).map(([key, value], index) => {
                  const sectionTitles = {
                    benefits: "Lợi ích",
                    process: "Quy trình thực hiện",
                    steps: "Các bước thực hiện",
                    tips: "Mẹo thực hiện",
                    who_should_try: "Ai nên thử?",
                    products: "Sản phẩm sử dụng",
                    services: "Dịch vụ",
                    techniques: "Kỹ thuật",
                    types: "Các loại",
                    myths: "Quan niệm sai lầm",
                    top_spas: "Top spa",
                    criteria: "Tiêu chí",
                    red_flags: "Dấu hiệu cảnh báo",
                    prep: "Chuẩn bị",
                    scents: "Mùi hương",
                    treatments: "Phương pháp điều trị",
                    target_audience: "Đối tượng phù hợp",
                  };
                  return renderSection(
                    key,
                    sectionTitles[key] || key,
                    value,
                    (el) => (sectionsRef.current[index] = el)
                  );
                })}
            </div>

            {/* Additional Images */}
            {post?.images.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {post.images.slice(1).map((img, index) => (
                  <figure key={index}>
                    <Img
                      src={[img.url, "https://via.placeholder.com/300"]}
                      alt={img.caption}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      loader={<div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>}
                    />
                    <figcaption className="text-sm text-gray-500 mt-2 text-center">
                      {img.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {post?.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/tag/${tag}`}
                  className="px-4 py-1 bg-[#FFD700] text-[#4B2E1A] rounded-full text-sm font-medium hover:bg-[#FF8C00] hover:text-white transition-all duration-300"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
              <span className="text-[#4B2E1A] font-medium">Chia sẻ:</span>
              <button className="p-2 bg-[#FBB321] text-white rounded-full hover:bg-[#FF8C00] transition">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="p-2 bg-[#FBB321] text-white rounded-full hover:bg-[#FF8C00] transition">
                <i className="fab fa-twitter"></i>
              </button>
              <button className="p-2 bg-[#FBB321] text-white rounded-full hover:bg-[#FF8C00] transition">
                <i className="fab fa-whatsapp"></i>
              </button>
            </div>
          </main>

          {/* Sidebar */}
          <aside ref={sidebarRef} className="lg:col-span-4 animate-section">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-[150px]">
              <h3 className="text-xl font-bold text-[#FBB321] mb-6">Tin mới nhất</h3>
              <div className="space-y-8">
                {recentPosts.map((recent) => (
                  <Link
                    key={recent.id}
                    to={`/newsdetail/${recent.id}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      <Img
                        src={[recent.images[0]?.url, "https://via.placeholder.com/100"]}
                        alt={recent.title}
                        className="w-full h-full object-cover rounded-lg shadow-md group-hover:-translate-y-1 transition-transform duration-300"
                        loader={<div className="w-full h-20 bg-gray-200 animate-pulse rounded-lg"></div>}
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors line-clamp-2">
                        {recent.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        <i className="fas fa-calendar-alt text-[#FBB321] mr-2"></i> {recent.date}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-eye text-[#FBB321]"></i> {recent.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-heart text-[#FBB321]"></i> {recent.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-comment text-[#FBB321]"></i> {recent.comments}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section ref={relatedPostsRef} className="mt-12 mb-8 animate-section">
            <h2 className="text-3xl font-bold text-[#FBB321] mb-8 text-center tracking-tight">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/newsdetail/${related.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#FBB321] hover:-translate-y-1 transition-all duration-300"
                >
                  <Img
                    src={[related.images[0]?.url, "https://via.placeholder.com/300"]}
                    alt={related.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                    loader={<div className="w-full h-48 bg-gray-200 animate-pulse rounded-t-xl"></div>}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#4B2E1A] group-hover:text-[#FBB321] transition-colors duration-200 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-[#FBB321]"></i> {related.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;