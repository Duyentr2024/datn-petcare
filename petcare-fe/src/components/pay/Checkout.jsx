import React from "react";

const Checkout = () => {
    return (
     

            <div className="min-h-screen flex justify-center items-center relative">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[900px] z-10 relative">
                    {/* Cột bên trái */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[700px]">
                        {/* Left column takes more space */}
                        <div className="md:col-span-2">
                            {/* Thông tin thanh toán */}
                            <h2 className="text-2xl font-bold text-[#fbb321] mb-4">Thông tin thanh toán</h2>
                            <form className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Họ và tên <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Nhập tên của bạn" className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Nhập số điện thoại của bạn" className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">
                                        Tỉnh / Thành phố
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2">
                                        <option>Hà Nội</option>
                                        <option>Hồ Chí Minh</option>
                                        <option>Đà Nẵng</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Quận / Huyện <span className="text-red-500">*</span></label>
                                    <select className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2">
                                        <option>Chọn Quận / Huyện</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Phường / Xã <span className="text-red-500">*</span></label>
                                    <select className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2">
                                        <option>Phường / Xã</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 w-1/3">Địa chỉ <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="Địa chỉ" className="mt-1 block w-2/3 border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                            </form>

                            {/* Phương thức thanh toán */}
                            <div className="mt-8">
                                <h1 className="text-2xl font-bold text-yellow-500 mb-6">Phương thức thanh toán</h1>
                                <div className="flex space-x-4">
                                    <button className="border-2 border-yellow-500 rounded-lg p-2 flex flex-col items-center w-28">
                                        <img src="https://placehold.co/50x50?text=ATM" alt="ATM icon" className="mb-1 w-10 h-10" />
                                        <p className="text-center text-sm">Chuyển khoản ngân hàng</p>
                                    </button>
                                    <button className="bg-gray-100 rounded-lg p-2 flex flex-col items-center w-28">
                                        <img src="https://placehold.co/50x50?text=$" alt="Cash icon" className="mb-1 w-10 h-10" />
                                        <p className="text-center text-sm">Trả tiền mặt khi nhận hàng</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sản phẩm đã mua (Sticky and shortened height) */}
                        <div className="bg-[#fbb321] p-6 rounded-3xl text-white sticky top-0 max-h-[500px] overflow-y-auto w-[300px] shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 border-b border-white pb-2">Sản phẩm đã mua</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <img src="https://placehold.co/60x60" alt="Mật Ong Rừng Đà Lạt 2L" className="w-16 h-16 rounded-md" />
                                    <div className="ml-4">
                                        <p className="font-bold">Mật Ong Rừng Đà Lạt 2L</p>
                                        <p>Khối lượng : 1kg</p>
                                        <p>Số lượng : 1*</p>
                                        <p>234.000₫</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <img src="https://placehold.co/60x60" alt="Mật Ong Hảo Hạn 1L" className="w-16 h-16 rounded-md" />
                                    <div className="ml-4">
                                        <p className="font-bold">Mật Ong Hảo Hạn 1L</p>
                                        <p>Khối lượng : 250gr</p>
                                        <p>Số lượng : 1*</p>
                                        <p>80.000₫</p>
                                    </div>
                                </div>
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
                                <button className="mt-4 w-full bg-[#fef0d3] text-[#fbb321] font-bold py-2 rounded-3xl hover:bg-[#408630] hover:text-white">Thanh toán</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        
    );
};

export default Checkout;
