import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductDetailService from "../../service/productDetailService/ProductDetailService.jsx";
import CartDetailsService from "../../service/cartDetailsService/CartDetailsService.jsx";
import ReactLoading from "react-loading";
import ProductComments from "./ProductComments.jsx";
import RelatedProducts from "./RelatedProducts.jsx";
import { useAuth } from "../../context/AuthContext";
import Cookies from "js-cookie";

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('default-image-url');
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedWeight, setSelectedWeight] = useState(null);
    const [loadingSize, setLoadingSize] = useState(null);
    const [loadingWeight, setLoadingWeight] = useState(null);
    const [loadingColor, setLoadingColor] = useState(null);
    const [validCombinations, setValidCombinations] = useState([]);
    const { userId } = useAuth();

    useEffect(() => {
        setMainImage(product?.productImage); // Cập nhật ảnh mặc định khi product thay đổi
    }, [product]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const data = await ProductDetailService.getProductDetailsDTOByProductId(productId);
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Dữ liệu trả về không hợp lệ.");
                }

                const mainVariant = data[0];
                const sizes = [...new Set(data.map(item => item.sizeValue))];
                const weights = [...new Set(data.map(item => item.weightValue))];
                const colors = [...new Set(data.map(item => item.colorValue))];

                setProduct({
                    ...mainVariant,
                    availableSizes: sizes,
                    availableWeights: weights,
                    availableColors: colors,
                    variants: data,
                });

                setMainImage(mainVariant.imageUrls?.[0] || "");
                setSelectedSize(mainVariant.sizeValue);
                setSelectedColor(mainVariant.colorValue);
                setSelectedWeight(mainVariant.weightValue);
                setValidCombinations(data.map(item => ({
                    size: item.sizeValue,
                    color: item.colorValue,
                    weight: item.weightValue,
                })));

            } catch (error) {
                console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error.message);
                setError("Không thể tải chi tiết sản phẩm. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        } else {
            setError("Không tìm thấy ID sản phẩm.");
        }
    }, [productId]);

    const getUserIdFromToken = () => {
        const accessToken = Cookies.get("accessToken"); // Lấy token từ cookies
        if (!accessToken) return null;

        // Nếu là JWT, giải mã payload để lấy userId
        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            return payload.userId; // Thay đổi key này theo cấu trúc token của bạn
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const handleAddToCart = async () => {
        // Lấy userId từ cookies (hoặc từ context nếu đã được xử lý)
        const userId = getUserIdFromToken();

        if (!userId) {
            alert("Please log in to add items to the cart.");
            return;
        }

        if (!selectedSize || !selectedColor || !selectedWeight) {
            alert("Please select size, color, and weight before adding to the cart.");
            return;
        }

        const selectedVariant = product?.variants?.find(
            (variant) =>
                variant.sizeValue === selectedSize &&
                variant.colorValue === selectedColor &&
                variant.weightValue === selectedWeight
        );

        if (!selectedVariant) {
            alert("Selected product variant is not available.");
            return;
        }

        // Log thông tin trước khi gọi API
        console.log("Adding to cart:", {
            userId,
            productDetailId: selectedVariant.productDetailId,
            quantityItem: quantity,
        });

        try {
            const response = await CartDetailsService.addCartDetails(
                userId,
                selectedVariant.productDetailId,
                quantity
            );
            alert("Added to cart successfully!");
        } catch (error) {
            console.error("Error adding to cart:", error);

            // Kiểm tra nếu BE trả về thông báo lỗi
            if (error.response && error.response.data && error.response.data.message) {
                // Hiển thị thông báo lỗi từ BE
                alert(error.response.data.message);
            } else {
                // Thông báo lỗi chung nếu không có thông tin cụ thể từ BE
                alert("Failed to add to cart. Please try again.");
            }
        }
    };






    const isValidCombination = (size, color, weight) => {
        return validCombinations.some((combination) => {
            return (
                (size === null || combination.size === size) &&
                (color === null || combination.color === color) &&
                (weight === null || combination.weight === weight)
            );
        });
    };

    const handleQuantityChange = (action) => {
        if (action === "increment" && quantity < product?.quantity) {
            setQuantity(quantity + 1);
        } else if (action === "decrement" && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const updateProductDetailBasedOnSelection = (size, color, weight) => {
        const selectedDetail = product?.variants?.find(
            (variant) =>
                variant.sizeValue === size &&
                variant.colorValue === color &&
                variant.weightValue === weight
        );

        if (selectedDetail) {
            setProduct((prev) => ({
                ...prev,
                quantity: selectedDetail.quantity,
            }));
        } else {
            setProduct((prev) => ({
                ...prev,
                quantity: 0,
            }));
        }
    };


    const handleSizeChange = (size) => {
        const newSize = size === selectedSize ? null : size;
        setLoadingSize(size);
        setTimeout(() => {
            setSelectedSize(newSize);
            updateProductDetailBasedOnSelection(newSize, selectedColor, selectedWeight);
            setLoadingSize(null);
        }, 500);
    };

    const handleColorChange = (color) => {
        const newColor = color === selectedColor ? null : color;
        setLoadingColor(color);
        setTimeout(() => {
            setSelectedColor(newColor);
            updateProductDetailBasedOnSelection(selectedSize, newColor, selectedWeight);
            setLoadingColor(null);
        }, 500);
    };

    const handleWeightChange = (weight) => {
        const newWeight = weight === selectedWeight ? null : weight;
        setLoadingWeight(weight);
        setTimeout(() => {
            setSelectedWeight(newWeight);
            updateProductDetailBasedOnSelection(selectedSize, selectedColor, newWeight);
            setLoadingWeight(null);
        }, 500);
    };


    const handleImageChange = (src) => {
        setMainImage(src);
    };

    const Loader = () => (
        <ReactLoading type="spin" color="#F59E0B" height={20} width={20} />
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ReactLoading type="spin" color="#F59E0B" height={64} width={64} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 font-semibold">
                {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center text-red-500 font-semibold">
                Không có thông tin sản phẩm.
            </div>
        );
    }

    return (
        <div className="container max-w-screen-xl mx-auto p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-l-[1px] border-l-amber-500">
                {/* Left Section: Hình ảnh sản phẩm */}
                <div className="flex flex-col items-center space-y-4">
                    <img
                        src={mainImage}
                        alt={product?.productName}
                        className="w-3/4 max-w-sm rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300"
                    />
                    <div className="flex space-x-2">
                        {product?.imageUrls?.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                onClick={() => handleImageChange(url)}
                                className={`w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:ring-2 ring-yellow-500 transition transform hover:scale-105 ${mainImage === url ? 'ring-2 ring-yellow-500' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Section: Chi tiết sản phẩm */}
                <div className="flex flex-col space-y-4">
                    {/* Giảm giá */}
                    <span className="text-xs bg-yellow-100 text-yellow-600 font-semibold px-2 py-1 rounded-md w-fit">
                        -6% Bán chạy
                    </span>

                    {/* Tên sản phẩm */}
                    <h1 className="text-xl font-semibold text-gray-800">
                        {product?.productName}
                    </h1>

                    {/* Giá sản phẩm */}
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-red-700">
                            {product?.price?.toLocaleString()}đ
                        </span>
                        <span className="text-gray-400 line-through text-lg">
                            {(product?.price * 1.06)?.toLocaleString()}đ
                        </span>
                    </div>

                    {/* Mô tả sản phẩm */}
                    <div>
                        <span className="font-semibold text-sm">Mô tả:</span>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {isExpanded ? product?.description : `${product?.description?.slice(0, 150)}...`}
                        </p>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-yellow-600 font-semibold mt-2 underline"
                        >
                            {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                        </button>
                    </div>

                    {/* Kích thước (Size) */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Kích thước:</span>
                        <div className="flex space-x-2">
                            {product?.availableSizes?.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeChange(size)}
                                    disabled={!isValidCombination(size, selectedColor, selectedWeight)}
                                    className={`px-3 py-1 border rounded-full text-sm ${selectedSize === size
                                        ? "bg-yellow-100 text-yellow-600 font-semibold"
                                        : "hover:bg-yellow-100 text-gray-800"
                                    } ${!isValidCombination(size, selectedColor, selectedWeight) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loadingSize === size ? <Loader/> : size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trọng lượng (Weight) */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Trọng lượng:</span>
                        <div className="flex space-x-2">
                            {product?.availableWeights?.map((weight) => (
                                <button
                                    key={weight}
                                    onClick={() => handleWeightChange(weight)}
                                    disabled={!isValidCombination(selectedSize, selectedColor, weight)}
                                    className={`px-3 py-1 border rounded-full text-sm ${selectedWeight === weight
                                        ? "bg-yellow-100 text-yellow-600 font-semibold"
                                        : "hover:bg-yellow-100 text-gray-800"
                                    } ${!isValidCombination(selectedSize, selectedColor, weight) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loadingWeight === weight ? <Loader/> : weight}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Màu sắc (Color) */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">Màu sắc:</span>
                        <div className="flex space-x-2">
                            {product?.availableColors?.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    disabled={!isValidCombination(selectedSize, color, selectedWeight)}
                                    className={`px-3 py-1 border rounded-full text-sm ${selectedColor === color
                                        ? "bg-yellow-100 text-yellow-600 font-semibold"
                                        : "hover:bg-yellow-100 text-gray-800"
                                    } ${!isValidCombination(selectedSize, color, selectedWeight) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loadingColor === color ? <Loader/> : color}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded-lg">
                            <button
                                onClick={() => handleQuantityChange("decrement")}
                                className="px-3 py-2 text-lg hover:bg-gray-200"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-3 py-2 text-md">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange("increment")}
                                className="px-3 py-2 text-lg hover:bg-gray-200"
                                disabled={quantity >= product?.quantity}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-xs text-gray-500">
                        (Còn {product?.quantity} sản phẩm)
                         </span>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex space-x-3">
                        <Link to="/checkout">
                            <button
                                className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600">
                                Thanh toán
                            </button>
                        </Link>

                        <button
                            onClick={handleAddToCart}
                            className="px-5 py-2 border border-yellow-500 text-yellow-500 font-semibold rounded-xl hover:bg-yellow-100">
                            Thêm vào giỏ hàng
                        </button>

                    </div>
                </div>
            </div>

            {/* Bình luận và sản phẩm liên quan */}
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
