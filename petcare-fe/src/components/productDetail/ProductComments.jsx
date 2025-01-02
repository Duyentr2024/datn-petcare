import React, { useState, useEffect } from "react";

const ProductComments = () => {
    const [comments, setComments] = useState([
        { id: 1, name: "Thanh Phát", content: "Sản phẩm tốt", image: "http://nongsan.monamedia.net/wp-content/uploads/2023/10/avatar.jpg", date: "03/10/2023" },
    ]);

    const [newComment, setNewComment] = useState({
        name: "",
        email: "",
        content: "",
        image: null,
    });

    const [view, setView] = useState("info"); // State to toggle between "info" and "comments"
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewComment({ ...newComment, [name]: value });
    };

    const handleImageChange = (e) => {
        setNewComment({ ...newComment, image: URL.createObjectURL(e.target.files[0]) });
    };

    const handleSubmit = () => {
        if (newComment.name && newComment.content) {
            setComments([ ...comments, { ...newComment, id: comments.length + 1, date: new Date().toLocaleDateString() } ]);
            setNewComment({ name: "", email: "", content: "", image: null });
        }
    };

    const handleViewChange = (newView) => {
        setIsTransitioning(true); // Start transition
        setTimeout(() => {
            setView(newView); // Change view after transition
            setIsTransitioning(false); // End transition
        }, 300); // Match this time with the CSS transition duration
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            {/* Navigation Buttons */}
            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        view === "info" ? "text-white bg-yellow-500 shadow-lg" : "text-yellow-500 bg-white border border-yellow-500"
                    }`}
                    onClick={() => handleViewChange("info")}
                >
                    Thông tin sản phẩm
                </button>
                <button
                    className={`px-4 py-2 rounded-lg focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        view === "comments" ? "text-white bg-yellow-500 shadow-lg" : "text-yellow-500 bg-white border border-yellow-500"
                    }`}
                    onClick={() => handleViewChange("comments")}
                >
                    Bình luận về sản phẩm
                </button>
            </div>

            {/* Conditional Rendering Based on State with Transition */}
            <div
                className={`transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                style={{ transitionProperty: "opacity" }}
            >
                {view === "info" ? (
                    <div>
                        {/* Product Information */}
                        <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
                        <p className="text-gray-700 mb-4">
                            <strong className="list-disc pl-4">• Xuất Xứ:</strong> Việt Nam
                        </p>
                        <p className="text-gray-700 mb-4">
                            <strong className="list-disc pl-4">• Tiêu Chuẩn Chất Lượng:</strong> Tốt
                        </p>
                        <p className="text-gray-700 mb-4">
                            <strong className="list-disc pl-4">• Đặc Điểm Sản Phẩm:</strong> Vào tháng 03 hàng năm tại các khu vực miền tây và miền bắc nước ta là thời điểm những trang trại nhãn bắt đầu nở hoa. Đây cũng là thời điểm những nhà nuôi ong ở các nơi sẽ tiến hành di chuyển đàn ong đến thu hoạch mật ong hoa nhãn. Các chú ong khi được đưa đến đây sẽ làm việc chăm chỉ ngày đêm. Ban ngày đi hút mật đưa về tổ, ban đêm tiến hành luyện mật qua một quá trình dài. Khi mật đủ chín, chủ trại nuôi ong mới tiến hành quay lấy mật. Đặc thù hoa nhãn có hương vị rất đặc trưng và dễ nhận biết.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Thành phần trong mật ong hoa nhãn có rất nhiều loại Vitamin và axit amin quan trọng như A, B1, B2, tiền tố Acid Folic… Việc sử dụng mật ong hàng ngày giúp cho chúng ta có một cơ thể khoẻ mạnh, tăng cường sức đề kháng. Giúp ăn ngon miệng, ngủ sâu giấc, có một làn da hồng hào, tươi sáng.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Ngoài ra, việc sử dụng mật ong hoa nhãn giúp trị các loại bệnh liên quan đến đường ruột, tiêu hoá, đặc biệt là dạ dày khi kết hợp cùng với tinh bột nghệ.
                        </p>
                        <img src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/home-banner-1920x730.png" alt="Product" className="w-full h-64 object-cover mt-4" />
                    </div>
                ) : (
                    <div>
                        {/* Comment Form */}
                        <textarea
                            name="content"
                            value={newComment.content}
                            onChange={handleInputChange}
                            placeholder="Viết bình luận của bạn"
                            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-yellow-500 transition-all duration-500 ease-in-out transform"
                        />
                        <div className="flex flex-col space-y-4 mb-4">
                            <label className="flex items-center space-x-2 text-green-600 cursor-pointer">
                                <span className="font-bold">Thêm hình ảnh</span>
                                <input type="file" onChange={handleImageChange} className="hidden" />
                            </label>
                            <div className="flex space-x-4">
                                <input
                                    name="name"
                                    value={newComment.name}
                                    onChange={handleInputChange}
                                    placeholder="Họ và tên"
                                    className="p-2 border border-gray-300 rounded-lg focus:ring focus:ring-yellow-500 transition-all duration-500 ease-in-out transform "
                                />
                                <input
                                    name="email"
                                    value={newComment.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                    className="p-2 border border-gray-300 rounded-lg focus:ring focus:ring-yellow-500 transition-all duration-500 ease-in-out transform "
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 mb-6 text-white bg-yellow-500 rounded-lg transition-all duration-500 ease-in-out transform "
                        >
                            Gửi bình luận
                        </button>
                        {/* Comments Section */}
                        <div>
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-4 mb-4">
                                    <img
                                        src={comment.image || "/default-user.png"}
                                        alt={comment.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{comment.name}</h4>
                                        <p className="text-gray-600">{comment.content}</p>
                                        <p className="text-sm text-gray-400">{comment.date}</p>
                                        <button
                                            className="text-yellow-500 text-sm mt-2 transition-transform duration-300 "
                                        >
                                            Trả lời
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductComments;
