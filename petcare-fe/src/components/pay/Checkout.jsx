import React from "react";
import Header from "../../components/header/Header"
import Login from "../../components/account/Login";
const Checkout = () => {
    return (
        <>
        <div className="min-h-screen flex justify-center items-center px-4 md:px-0 relative">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[900px] z-10 relative">
                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
                    {/* Left column */}
                    <div className="md:col-span-2">
                        {/* Payment Information */}
                        <h2 className="text-2xl font-bold text-[#fbb321] mb-4">Thông tin thanh toán</h2>
                        <form className="space-y-4">
                            {[
                                { label: "Họ và tên", type: "text", placeholder: "Nhập tên của bạn", required: true },
                                { label: "Số điện thoại", type: "text", placeholder: "Nhập số điện thoại của bạn", required: true },
                                { label: "Địa chỉ", type: "text", placeholder: "Nhập địa chỉ của bạn", required: true }
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            ))}
                            {[
                                { label: "Tỉnh / Thành phố", options: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"] },
                                { label: "Quận / Huyện", options: ["Chọn Quận / Huyện"] },
                                { label: "Phường / Xã", options: ["Phường / Xã"] }
                            ].map((dropdown, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                        {dropdown.label} <span className="text-red-500">*</span>
                                    </label>
                                    <select className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2">
                                        {dropdown.options.map((option, idx) => (
                                            <option key={idx}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </form>

                        {/* Payment Methods */}
                        <div className="mt-8">
                            <h1 className="text-2xl font-bold text-yellow-500 mb-6">Phương thức thanh toán</h1>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { img: "https://placehold.co/50x50?text=ATM", text: "Chuyển khoản ngân hàng" },
                                    { img: "https://placehold.co/50x50?text=$", text: "Trả tiền mặt khi nhận hàng" }
                                ].map((method, index) => (
                                    <button
                                        key={index}
                                        className="border-2 border-yellow-500 rounded-lg p-4 flex flex-col items-center w-full sm:w-40"
                                    >
                                        <img src={method.img} alt={`${method.text} icon`} className="mb-1 w-10 h-10" />
                                        <p className="text-center text-sm">{method.text}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Purchased Products */}
                    <div className="bg-[#fbb321] p-4 md:p-6 rounded-3xl text-white sticky top-4 max-h-[500px] overflow-y-auto w-full md:w-[300px] shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 border-b border-white pb-2">Sản phẩm đã mua</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    img: "https://placehold.co/60x60",
                                    name: "Mật Ong Rừng Đà Lạt 2L",
                                    weight: "1kg",
                                    quantity: "1*",
                                    price: "234.000₫"
                                },
                                {
                                    img: "https://placehold.co/60x60",
                                    name: "Mật Ong Hảo Hạn 1L",
                                    weight: "250gr",
                                    quantity: "1*",
                                    price: "80.000₫"
                                }
                            ].map((product, index) => (
                                <div key={index} className="flex items-center">
                                    <img src={product.img} alt={product.name} className="w-16 h-16 rounded-md" />
                                    <div className="ml-4">
                                        <p className="font-bold">{product.name}</p>
                                        <p>Khối lượng : {product.weight}</p>
                                        <p>Số lượng : {product.quantity}</p>
                                        <p>{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between">
                                <p>Tạm tính</p>
                                <p>314.000₫</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Giao hàng</p>
                                <p>Đồng giá: 30.000₫</p>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2">
                                <p>Tổng</p>
                                <p>344.000₫</p>
                            </div>
                            <button className="mt-4 w-full bg-[#fef0d3] text-[#fbb321] font-bold py-2 rounded-3xl hover:bg-[#408630] hover:text-white">
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
   
        </>
    );
};

export default Checkout;
