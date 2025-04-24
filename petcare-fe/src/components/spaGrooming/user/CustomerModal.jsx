import React from 'react';

const CustomerModal = ({
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    customerInfo,
    setCustomerInfo,
    errors,
    setErrors,
    handleCustomerInfoChange,
    fullNameRef,
    phoneRef,
    handleApiBooking,
    totalPrice,
    calculateDeposit,
}) => {
    const validatePhone = (phone) => /^0\d{9}$/.test(phone);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            fullName: !customerInfo.fullName.trim() ? 'Vui lòng nhập họ tên' : '',
            phone: !customerInfo.phone.trim()
                ? 'Vui lòng nhập số điện thoại'
                : !validatePhone(customerInfo.phone)
                ? 'Số điện thoại không hợp lệ'
                : '',
        };

        setErrors(newErrors);

        if (!newErrors.fullName && !newErrors.phone && customerInfo.acceptTerms) {
            handleApiBooking();
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isCustomerModalOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg w-[800px] mx-4 p-6 grid grid-cols-[1fr,300px] gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={customerInfo.fullName}
                                    onChange={handleCustomerInfoChange}
                                    ref={fullNameRef}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập họ và tên"
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={customerInfo.phone}
                                    onChange={handleCustomerInfoChange}
                                    ref={phoneRef}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập số điện thoại (0xxxxxxxxx)"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hình thức thanh toán <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="deposit"
                                            name="paymentType"
                                            value="deposit"
                                            checked={customerInfo.paymentType === 'deposit'}
                                            onChange={handleCustomerInfoChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="deposit" className="text-sm text-gray-700">
                                            Thanh toán cọc ({calculateDeposit().toLocaleString('vi-VN')}đ)
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="full"
                                            name="paymentType"
                                            value="full"
                                            checked={customerInfo.paymentType === 'full'}
                                            onChange={handleCustomerInfoChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="full" className="text-sm text-gray-700">
                                            Thanh toán toàn bộ ({totalPrice.toLocaleString('vi-VN')}đ)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg flex flex-col">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">ĐIỀU KHOẢN LƯU Ý</h3>
                        <div className="space-y-4 text-sm text-gray-700 flex-grow">
                            <p>Quý khách vui lòng đến đúng giờ đã đặt. Trong trường hợp đến trễ quá 15 phút, chúng tôi có quyền hủy lịch đặt để phục vụ khách hàng tiếp theo.</p>
                            <p>Vui lòng cung cấp đầy đủ thông tin về tình trạng sức khỏe của thú cưng để chúng tôi có thể phục vụ tốt nhất.</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-blue-100">
                            <div className="mb-4 flex items-start">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={customerInfo.acceptTerms}
                                    onChange={handleCustomerInfoChange}
                                    className="mt-1 mr-2"
                                />
                                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                                    Tôi đồng ý với{' '}
                                    <a href="#" className="text-[#026AC7] hover:underline">
                                        điều khoản và chính sách
                                    </a>{' '}
                                    của PetCare
                                </label>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={
                                        !customerInfo.fullName ||
                                        !customerInfo.phone ||
                                        !customerInfo.paymentType ||
                                        !customerInfo.acceptTerms
                                    }
                                    className={`w-full px-6 py-2 rounded-lg font-medium transition-colors ${
                                        customerInfo.fullName &&
                                        customerInfo.phone &&
                                        customerInfo.paymentType &&
                                        customerInfo.acceptTerms
                                            ? 'bg-[#026AC7] text-white hover:bg-[#0253a0]'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Thanh toán
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(false)}
                                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;