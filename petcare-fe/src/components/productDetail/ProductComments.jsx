import React, { useState, useEffect } from "react";
import ReviewService from "../../service/reviewService/ReviewService";

const ProductComments = (productDetailId) => {


    const [view, setView] = useState("info");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (productDetailId) {
            fetchReviews(productDetailId);
        }
    }, [productDetailId]);


    const fetchReviews = async () => {
        try {
            const productDetailId = localStorage.getItem("ProductDetailId");

            if (!productDetailId) {
                console.error("Lỗi: Không tìm thấy productDetailId trong localStorage");
                return;
            }

            const reviews = await ReviewService.getReviewsByProductDetail(productDetailId);
            setComments(reviews);
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
        }
    };


    const handleViewChange = (newView) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setView(newView);
            setIsTransitioning(false);
        }, 300);
    };

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setComments({ ...newComment, [name]: value });
    // };

    // const handleImageChange = (e) => {
    //     setComments({ ...newComment, image: URL.createObjectURL(e.target.files[0]) });
    // };

    // const handleSubmit = () => {
    //     if (newComment.name && newComment.content) {
    //         setComments([...comments, { ...newComment, id: comments.length + 1, date: new Date().toLocaleDateString() }]);
    //         setComments({ name: "", email: "", content: "", image: null });
    //     }
    // };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            {/* Navigation Buttons */}
            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${view === "info" ? "text-white bg-yellow-500 shadow-lg" : "text-yellow-500 bg-white border border-yellow-500"
                        }`}
                    onClick={() => handleViewChange("info")}
                >
                    Thông tin sản phẩm
                </button>
                <button
                    className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${view === "comments" ? "text-white bg-yellow-500 shadow-lg" : "text-yellow-500 bg-white border border-yellow-500"
                        }`}
                    onClick={() => handleViewChange("comments")}
                >
                    Bình luận về sản phẩm
                </button>
            </div>

            {/* Content with Transition */}
            <div className={`transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
                {view === "info" ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
                        <p className="text-gray-700 mb-4"><strong>• Xuất Xứ:</strong> Việt Nam</p>
                        <p className="text-gray-700 mb-4"><strong>• Tiêu Chuẩn Chất Lượng:</strong> Tốt</p>
                        <p className="text-gray-700 mb-4">
                            <strong>• Đặc Điểm Sản Phẩm:</strong> Mật ong hoa nhãn có hương vị đặc trưng, giàu vitamin giúp tăng cường sức khỏe.
                        </p>
                        <img src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/home-banner-1920x730.png" alt="Product" className="w-full h-64 object-cover mt-4" />
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Bình luận về sản phẩm</h2>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.productDetailId} className="flex items-start space-x-4 mb-4 border-b-2 py-2">
                                    
                                    <img
                                        src={comment.imageUrl || "/default-user.png"}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{comment.userName}</h4>
                                        <p className="text-gray-600">{comment.comment}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(comment.reviewDate).toLocaleDateString("vi-VN")}
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
