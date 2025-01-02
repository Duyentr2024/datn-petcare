import React, { useState } from "react";
import ReactLoading from "react-loading"; // Import the ReactLoading component
import ProductComments from "./ProductComments.jsx";
import RelatedProducts from "./RelatedProducts.jsx";

const ProductDetail = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState("Gold");
    const [selectedWeight, setSelectedWeight] = useState("1L");
    const [mainImage, setMainImage] = useState(
        "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-1.png"
    );
    const [loadingSize, setLoadingSize] = useState(null);  // Track loading for size
    const [loadingWeight, setLoadingWeight] = useState(null);  // Track loading for weight
    const [loadingColor, setLoadingColor] = useState(null);  // Track loading for color





    const handleQuantityChange = (action) => {
        if (action === "increment" && quantity < 9) {
            setQuantity(quantity + 1);
        } else if (action === "decrement" && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleWeightChange = (weight) => {
        setLoadingWeight(weight);  // Set loading state for weight
        setTimeout(() => {
            setSelectedWeight(weight);
            setLoadingWeight(null);  // Reset loading state
        }, 500); // 500ms delay
    };

    const handleSizeChange = (size) => {
        if (size !== selectedSize) {
            setLoadingSize(size);  // Set loading state for selected size
            setTimeout(() => {
                setSelectedSize(size);
                setLoadingSize(null);  // Reset loading state
            }, 500); // 500ms delay
        }
    };

    const handleColorChange = (color) => {
        setLoadingColor(color);  // Set loading state for color
        setTimeout(() => {
            setSelectedColor(color);
            setLoadingColor(null);  // Reset loading state
        }, 500); // 500ms delay
    };

    const handleImageChange = (src, size, weight, color) => {
        setLoadingSize("image");
        setTimeout(() => {
            setMainImage(src);
            setSelectedSize(size);
            setSelectedWeight(weight);
            setSelectedColor(color);
            setLoadingSize(null);
        }, 100);
    };

    // Loader component inside ProductDetail using react-loading
    const Loader = () => (
        <ReactLoading type="spin" color="#F59E0B" height={24} width={24} />
    );



    const description = `
        Thành phần trong mật ong hoa nhãn có rất nhiều loại Vitamin và axit amin quan trọng như A, B1, B2, tiền tố Acid Folic... 
        Thêm vào đó, mật ong còn chứa các chất chống oxy hóa mạnh mẽ giúp tăng cường sức đề kháng và bảo vệ sức khỏe. 
        Sử dụng mật ong nguyên chất mỗi ngày giúp cải thiện hệ tiêu hóa, làm đẹp da, và mang lại nguồn năng lượng tự nhiên dồi dào.
    `;

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="container max-w-screen-xl mx-auto p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-l-[1px] border-l-amber-500">
                {/* Left Section: Image */}
                <div className="flex flex-col items-center space-y-2">
                    <img
                        src={mainImage}
                        alt="Mật Ong Hảo Hạng"
                        className="w-3/4 max-w-sm rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300 ease-in-out transform hover:scale-100"
                    />
                    <div className="flex space-x-2">
                        {[{ src: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-1.png", size: "M", weight: "1L", color: "Gold" },
                            { src: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-2.png", size: "L", weight: "500gr", color: "Silver" },
                            { src: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-3.png", size: "XL", weight: "250gr", color: "Bronze" },
                            { src: "http://nongsan.monamedia.net/wp-content/uploads/2023/11/sp-1.png", size: "M", weight: "1L", color: "Gold" },
                        ].map((item, index) => (
                            <img
                                key={index}
                                src={item.src}
                                alt={`Thumbnail ${index + 1}`}
                                onClick={() => handleImageChange(item.src, item.size, item.weight, item.color)}
                                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:ring-2 ring-yellow-500 transition transform hover:scale-100"
                            />
                        ))}
                    </div>
                </div>

                {/* Right Section: Details */}
                <div className="flex flex-col space-y-4">
                    {/* Discount Tag */}
                    <span className="text-xs bg-yellow-100 text-yellow-600 font-semibold px-2 py-1 rounded-md w-fit">
                        -6% Bán chạy
                    </span>

                    {/* Product Title and Description */}
                    <h1 className="text-xl font-semibold text-gray-800">Mật Ong Hảo Hạng 1L</h1>
                    <p className="text-sm text-gray-600 border-b-2 font-bold p-3">
                        Phân loại:{" "}
                        <span className="text-green-500">Mật ong nhập khẩu</span>,{" "}
                        <span className="text-green-500">Phấn hoa</span>,{" "}
                        <span className="text-green-500">Sữa ong chúa</span>
                    </p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-red-700">80.000đ</span>
                        <span className="text-gray-400 line-through text-lg">85.000đ</span>
                    </div>

                    {/* Description */}
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-sm whitespace-nowrap">Mô tả:</span>
                        <div className="flex items-start space-x-2 ">
                            <span className="font-semibold text-sm whitespace-nowrap">Mô tả:</span>
                            <div className="text-sm text-gray-700 leading-relaxed">
                                <p>
                                    {isExpanded ? description : `${description.slice(0, 200)}...`}
                                </p>
                                <button
                                    onClick={toggleDescription}
                                    className="text-yellow-600 font-semibold mt-2 underline focus:outline-none"
                                >
                                    {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Size Selection (Bottle Sizes) */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Kích thước:</span>
                        <div className="flex space-x-2">
                            {["M", "L", "XL"].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    className={`px-3 py-1 border rounded-full text-sm ${
                                        selectedSize === size
                                            ? "bg-yellow-100 text-yellow-600 font-semibold"
                                            : "hover:bg-yellow-100 text-gray-800"
                                    } focus:ring-2 focus:ring-yellow-500 transition-all ease-in-out duration-300`}
                                >
                                    {loadingSize === size ? <Loader/> : size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weight Selection */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Trọng lượng:</span>
                        <div className="flex space-x-2">
                            {["1L", "500gr", "250gr"].map((weight) => (
                                <button
                                    key={weight}
                                    onClick={() => handleWeightChange(weight)}
                                    className={`px-3 py-1 border rounded-full text-sm ${
                                        selectedWeight === weight
                                            ? "bg-yellow-100 text-yellow-600 font-semibold"
                                            : "hover:bg-yellow-100 text-gray-800"
                                    } focus:ring-2 focus:ring-yellow-500 transition-all ease-in-out duration-300`}
                                >
                                    {loadingWeight === weight ? <Loader/> : weight}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Màu sắc:</span>
                        <div className="flex space-x-2">
                            {["Gold", "Silver", "Bronze"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`px-3 py-1 border rounded-full text-sm ${
                                        selectedColor === color
                                            ? "bg-yellow-100 text-yellow-600 font-semibold"
                                            : "hover:bg-yellow-100 text-gray-800"
                                    } focus:ring-2 focus:ring-yellow-500 transition-all ease-in-out duration-300`}
                                >
                                    {loadingColor === color ? <Loader/> : color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded-lg">
                            <button
                                onClick={() => handleQuantityChange("decrement")}
                                className="px-3 py-2 text-lg hover:bg-gray-200"
                            >
                                -
                            </button>
                            <span className="px-3 py-2 text-md">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange("increment")}
                                className="px-3 py-2 text-lg hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                        <span className="text-xs text-gray-500">(Còn 9 sản phẩm có sẵn)</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 shadow-xl transition-all ease-in-out duration-300"
                        >
                            Thanh toán
                        </button>
                        <button
                            className="px-5 py-2 border border-yellow-500 text-yellow-500 font-semibold rounded-xl hover:bg-yellow-100 shadow-md transition-all ease-in-out duration-300"
                        >
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments and Related Products */}
            <div className="mt-12">
                <ProductComments/>
            </div>
            <div className="mt-12">
                <RelatedProducts/>
            </div>
        </div>
    );
};

export default ProductDetail;
