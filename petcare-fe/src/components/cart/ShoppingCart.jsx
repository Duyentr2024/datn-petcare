import React, { useEffect, useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";
import CartDetailsService from "../../service/CartDetailsService/CartDetailsService.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";


const ShoppingCart = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const getUserIdFromToken = () => {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) return null;
        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            return payload.userId;
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken();

    useEffect(() => {
        const fetchCartDetails = async () => {
            try {
                const data = await CartDetailsService.getCartDetailsByUserId(userId);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching cart details:", error);
                toast.error("Failed to load cart details. Please try again.");
            }
        };

        if (userId) {
            fetchCartDetails();
        } else {
            toast.error("You must log in to view your cart.");
        }
    }, [userId]);

    const handleRemoveProduct = async (cartDetailId) => {
        try {
            await CartDetailsService.deleteCartDetails(cartDetailId);
            setProducts((prevProducts) =>
                prevProducts.filter((product) => product.cartDetailId !== cartDetailId)
            );
            toast.success("Product removed successfully!");
        } catch (error) {
            console.error("Error removing product:", error);
            toast.error("Failed to remove product. Please try again.");
        }
    };

    const handleQuantityChange = async (cartDetailId, newQuantity) => {
        if (newQuantity < 1) return;

        // Cập nhật UI trước để có cảm giác mượt mà
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.cartDetailId === cartDetailId ? { ...product, quantityItem: newQuantity } : product
            )
        );

        try {
            // Cập nhật dữ liệu lên server
            await CartDetailsService.updateCartDetails(cartDetailId, newQuantity);
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update quantity. Please try again.");

            // Nếu API lỗi, hoàn tác thay đổi
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.cartDetailId === cartDetailId
                        ? { ...product, quantityItem: newQuantity - 1 }
                        : product
                )
            );
        }
    };


    const handleCheckout = () => {
        const checkoutItems = products.map(({ productDetailId, productName, price, quantityItem }) => ({
            productDetailId,
            productName,
            price,
            quantityItem,
        }));

        navigate("/checkout", { state: { checkoutItems } });
    };

    useEffect(() => {
        localStorage.setItem("cartCount", products.length.toString());
    }, [products]);

    return (
        <div className="max-w-[1200px] mx-auto p-8 bg-white rounded-lg shadow-md mt-10 mb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Giỏ Hàng</h1>
                <span className="text-yellow-500 text-sm md:text-lg">({products.length} sản phẩm)</span>
            </div>

            <div className="mt-6">
                <div className="hidden md:flex justify-between items-center border-b pb-4">
                    <span className="text-green-600 font-medium flex-1 pl-11">Sản phẩm</span>
                    <p className="text-green-600 font-medium flex-1 text-right pl-20">Đơn giá</p>
                    <p className="text-green-600 font-medium flex-1 text-center">Số lượng</p>
                    <p className="text-green-600 font-medium text-left pr-16">Thành tiền</p>
                </div>

                {products.map((product) => (
                    <div
                        key={product.productDetailId}
                        className="flex flex-col md:flex-row items-center mt-6 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <img
                            src={product.image}
                            alt={product.productName}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full mr-0 md:mr-6 shadow-lg"
                        />
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">{product.productName}</h2>
                            <p className="text-gray-600">Trọng lượng: {product.weightValue}kg</p>
                            <p className="text-gray-600">Màu sắc: {product.colorValue}</p>
                            <p className="text-gray-600">Kích cỡ: {product.sizeValue}</p>
                        </div>
                        <div
                            className="flex flex-col md:flex-row flex-1 justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="text-center md:flex-1">
                                <p className="text-lg md:text-xl text-gray-800">{product.price.toLocaleString()}₫</p>
                            </div>
                            <div className="text-center md:flex-1">
                                <div className="flex items-center justify-center space-x-4">
                                    <button onClick={() => handleQuantityChange(product.cartDetailId, product.quantityItem - 1)} className="text-yellow-500 text-xl md:text-2xl">-</button>
                                    <span className="mx-2 text-lg md:text-xl">{product.quantityItem}</span>
                                    <button onClick={() => handleQuantityChange(product.cartDetailId, product.quantityItem + 1)} className="text-yellow-500 text-xl md:text-2xl">+</button>
                                </div>
                            </div>
                            <div className="text-center md:flex-1">
                                <p className="text-lg md:text-xl text-gray-800">
                                    {(product.price * product.quantityItem).toLocaleString()}₫
                                </p>
                            </div>
                            <button
                                className="text-red-500 text-xl md:text-2xl ml-0 md:ml-4"
                                onClick={() => handleRemoveProduct(product.cartDetailId)}
                            >
                                <RiCloseCircleLine/>
                            </button>
                        </div>
                    </div>
                ))}

                <div className="border-t mt-6 pt-6 text-right">
                    <p className="text-lg md:text-xl font-semibold">
                        Tổng tiền: <span className="text-[#fbb321]">{products.reduce((total, product) => total + product.price * product.quantityItem, 0).toLocaleString()}₫</span>
                    </p>
                    <button onClick={handleCheckout} disabled={products.length === 0} className={`font-bold rounded-full px-6 py-3 shadow-lg transition-all duration-300 transform ${products.length === 0 ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#fbb321] text-white hover:bg-[#fef0d3] hover:text-orange-500 hover:scale-105"}`}>
                        Đặt hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;