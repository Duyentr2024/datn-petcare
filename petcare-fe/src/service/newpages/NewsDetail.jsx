import React from 'react';
import { Link } from 'react-router-dom';

const NewsDetail = () => {
  // Mock data - trong thực tế sẽ lấy từ API hoặc props
  const newsData = {
    title: "CHĂM SÓC THÚ CƯNG TẠI PETSHOP CỦA CHÚNG TÔI",
    date: "2023-09-20 09:56:24",
    category: "Petshop News",
    author: "Admin",
    tags: ["Thú cưng", "Chăm sóc", "Petshop", "Dịch vụ"],
    content: `
      <p>Tại petshop của chúng tôi, bạn sẽ tìm thấy tất cả những gì cần thiết cho thú cưng của bạn. Chúng tôi cung cấp các dịch vụ chăm sóc toàn diện và sản phẩm chất lượng cao.</p>
      
      <h2>Các dịch vụ chính của chúng tôi</h2>
      <p>1. Tắm và vệ sinh cho thú cưng</p>
      <p>2. Cắt tỉa lông theo yêu cầu</p>
      <p>3. Khám và tư vấn sức khỏe</p>
      <p>4. Spa và massage cho thú cưng</p>

      <h2>Sản phẩm đa dạng</h2>
      <p>Chúng tôi cung cấp đầy đủ các sản phẩm từ thức ăn, đồ chơi, đến các phụ kiện thời trang cho thú cưng của bạn.</p>
    `,
    image: "https://file.hstatic.net/200000263355/article/xo_giun_cho_meo-2_c91339a8e53946cf8d7b0225ff0243fd_large.png",
    relatedPosts: [
      {
        id: 1,
        title: "Mua chó cảnh với giá cả hợp lý",
        image: "https://file.hstatic.net/200000263355/article/thuoc_xo_giun_cho_cho-1_0e28581982ec4ba58642c98b98406b1f_large.png",
        date: "2023-09-20"
      },
      {
        id: 2,
        title: "Dịch vụ tắm gội và chăm sóc cho thú cưng",
        image: "https://file.hstatic.net/200000263355/article/vong_co_cho_meo-5_88e337a5810745129edea6e2b0e60385_large.png",
        date: "2023-09-19"
      },
      {
        id: 3,
        title: "Các sản phẩm thực phẩm và phụ kiện cho thú cưng",
        image: "https://file.hstatic.net/200000263355/article/quan_ao_cho_meo-1_570823559e9d4d248d88191af21c79a1_large.png",
        date: "2023-09-18"
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="flex mb-4 text-gray-500 text-sm">
            <Link to="/" className="hover:text-[#FBB321]">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/news" className="hover:text-[#FBB321]">Tin tức</Link>
            <span className="mx-2">/</span>
            <span className="text-[#FBB321]">Chi tiết</span>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={newsData.image}
              alt={newsData.title}
              className="w-full h-[400px] object-cover"
            />
            
            <div className="p-6">
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-2">
                  <i className="fas fa-calendar"></i>
                  {newsData.date}
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-user"></i>
                  {newsData.author}
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-folder"></i>
                  {newsData.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {newsData.title}
              </h1>

              {/* Content */}
              <div className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: newsData.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {newsData.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/tag/${tag}`}
                    className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-full hover:bg-[#FBB321] hover:text-white transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Share Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết</h3>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                    <i className="fab fa-facebook-f"></i>
                    Facebook
                  </button>
                  <button className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 flex items-center gap-2">
                    <i className="fab fa-twitter"></i>
                    Twitter
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                    <i className="fab fa-whatsapp"></i>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsData.relatedPosts.map((post) => (
                <Link key={post.id} to={`/news/${post.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#FBB321] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">{post.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/thu-cung" className="flex items-center justify-between text-gray-600 hover:text-[#FBB321]">
                  <span>Thú cưng</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">12</span>
                </Link>
              </li>
              <li>
                <Link to="/category/thuc-an" className="flex items-center justify-between text-gray-600 hover:text-[#FBB321]">
                  <span>Thức ăn</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">8</span>
                </Link>
              </li>
              <li>
                <Link to="/category/phu-kien" className="flex items-center justify-between text-gray-600 hover:text-[#FBB321]">
                  <span>Phụ kiện</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">15</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bài viết gần đây</h3>
            <div className="space-y-4">
              {newsData.relatedPosts.map((post) => (
                <Link key={post.id} to={`/news/${post.id}`} className="flex gap-4 group">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-[#FBB321] transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500">{post.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
