import React, { useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";

const ShoppingCart = () => {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: "Mật Ong Rừng Đà Lạt 2L",
            price: 234000,
            quantity: 1,
            image: "https://product.hstatic.net/200000521195/product/4f48748b-f0e3-48a9-9ecd-2f10acb538c3_bbacd6cfa7054e8e8aab5dc9cb5ee2cd_1024x1024.jpeg",
        },
        {
            id: 1,
            name: "Mật Ong Rừng Đà Lạt 2L",
            price: 234000,
            quantity: 1,
            image: "https://product.hstatic.net/200000521195/product/4f48748b-f0e3-48a9-9ecd-2f10acb538c3_bbacd6cfa7054e8e8aab5dc9cb5ee2cd_1024x1024.jpeg",
        },
        
    ]);

    // Handle product removal
    const handleRemoveProduct = (productId) => {
        setProducts(products.filter(product => product.id !== productId));
    };

    return (
        <div className="max-w-[1200px] mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Giỏ Hàng</h1>
          <span className="text-yellow-500 text-sm md:text-lg">({products.length} sản phẩm)</span>
        </div>
      
        <div className="mt-6">
          {/* Header Row */}
          <div className="hidden md:flex justify-between items-center border-b pb-4">
            <span className="text-green-600 font-medium flex-1 pl-11">Sản phẩm</span>
            <p className="text-green-600 font-medium flex-1 text-right pl-20">Đơn giá</p>
            <p className="text-green-600 font-medium flex-1 text-center">Số lượng</p>
            <p className="text-green-600 font-medium text-left pr-16">Thành tiền</p>
          </div>
      
          {/* Product Rows */}
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col md:flex-row items-center mt-6 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mr-0 md:mr-6 shadow-lg"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">{product.name}</h2>
                <p className="text-gray-600">Trọng lượng: 1kg</p>
                <p className="text-gray-600">Màu sắc: xanh</p>
                <p className="text-gray-600">Kích cỡ: XL</p>
              </div>
              <div className="flex flex-col md:flex-row flex-1 justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="text-center md:flex-1">
                  <p className="text-lg md:text-xl text-gray-800">{product.price.toLocaleString()}₫</p>
                </div>
                <div className="text-center md:flex-1">
                  <div className="flex items-center justify-center space-x-4">
                    <button className="text-yellow-500 text-xl md:text-2xl">-</button>
                    <span className="mx-2 text-lg md:text-xl">{product.quantity}</span>
                    <button className="text-yellow-500 text-xl md:text-2xl">+</button>
                  </div>
                </div>
                <div className="text-center md:flex-1">
                  <p className="text-lg md:text-xl text-gray-800">
                    {(product.price * product.quantity).toLocaleString()}₫
                  </p>
                </div>
                <button
                  className="text-red-500 text-xl md:text-2xl ml-0 md:ml-4"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <RiCloseCircleLine />
                </button>
              </div>
            </div>
          ))}
      
          {/* Border for separation */}
          <div className="border-t mt-6 pt-6">
            <h3 className="text-md md:text-lg font-semibold text-gray-800 mb-4">
              Ưu đãi & Mã giảm giá
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Combobox for Discount Code */}
              <select className="border rounded-lg p-2 md:p-4 text-sm md:text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 w-full md:w-1/3">
                <option value="">Chọn mã giảm giá</option>
                <option value="10off">Giảm 10%</option>
                <option value="20off">Giảm 20%</option>
              </select>
      
              {/* Total Price */}
              <div className="text-right">
                <p className="text-lg md:text-xl font-semibold">
                  Tổng tiền: <span className="text-[#fbb321]">234.000₫</span>
                </p>
              </div>
            </div>
      
            {/* Order Button - Positioned below the total price */}
            <div className="mt-6 text-right">
              <button className="bg-[#fbb321] font-bold text-white rounded-full px-6 py-3 shadow-lg hover:bg-[#fef0d3] hover:text-orange-500 transition-all duration-300 transform hover:scale-105">
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      
    );
};

export default ShoppingCart;
