import React, { useState, useEffect } from "react";
import ReviewService from "../../service/reviewService/ReviewService";
import ProductDetailsService from "../../service/serviceProduct/ProductsService";
import { useParams } from "react-router-dom";
import banner from "../../assets/images/BANNER1-03.png";
const ProductComments = () => {
  const { productId } = useParams();
  const [view, setView] = useState("info");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [comments, setComments] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const productDetailId = localStorage.getItem("ProductDetailId");
console.log(productDetailId);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetchProductDetails(productId);
      window.scrollTo(0, 0);
    }
  }, [productId]);

   useEffect(() => {
    if (productDetailId) {
      setLoading(true);
      fetchReviews(productDetailId);
    }
  }, [productDetailId]);

  const fetchReviews = async () => {
    try {
      const reviews = await ReviewService.getReviewsByProductDetail(productDetailId);
      if (Array.isArray(reviews)) {
        setComments(
          reviews.sort(
            (a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)
          )
        );
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
      setComments([]);
    }
  };

  const fetchProductDetails = async (id) => {
    try {
      const data = await ProductDetailsService.getProductSummaryById(id);
      if (Array.isArray(data) && data.length > 0) {
        setProductVariants(data);
      } else {
        setProductVariants([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      setProductVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
      {/* Navigation Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
            view === "info"
              ? "text-white bg-yellow-500 shadow-lg"
              : "text-yellow-500 bg-white border border-yellow-500"
          }`}
          onClick={() => handleViewChange("info")}
        >
          Thông tin sản phẩm
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
            view === "comments"
              ? "text-white bg-yellow-500 shadow-lg"
              : "text-yellow-500 bg-white border border-yellow-500"
          }`}
          onClick={() => handleViewChange("comments")}
        >
          Bình luận về sản phẩm
        </button>
      </div>

      {/* Content with Transition */}
      <div
        className={`transition-all duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {view === "info" ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
            {loading ? (
              <p className="text-gray-500">Đang tải thông tin sản phẩm...</p>
            ) : productVariants.length > 0 ? (
              (() => {
                const product = productVariants[0]; // Lấy sản phẩm đầu tiên
                return (
                  <div
                    key={product.productDetailId}
                    className="border p-4 rounded-lg mb-4 bg-white"
                  >
                    <p className="text-gray-700 mb-2">
                      <strong>• Thương hiệu:</strong>{" "}
                      {product.brandName || "Không có thông tin"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>• Loại sản phẩm:</strong>{" "}
                      {product.categoryName || "Không có thông tin"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>• Mô tả:</strong>{" "}
                      {product.description || "Không có mô tả"}
                    </p>
                    <img
                      src={banner}
                      className="w-full h-64 object-cover mt-4 rounded-lg shadow-md"
                    />
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-500">Không có thông tin sản phẩm.</p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Bình luận về sản phẩm</h2>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.reviewId}
                  className="flex items-start space-x-4 mb-4 border-b-2 py-2"
                >
                  <img
                    src={comment.imageUrl || "/default-user.png"}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {comment.userName || "Người dùng ẩn danh"}
                    </h4>
                    <p className="text-gray-600">
                      {comment.comment || "Không có bình luận"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {comment.reviewDate
                        ? new Date(comment.reviewDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Không có ngày"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có bình luận nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;
