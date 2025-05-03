import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessModal = ({ show, message, appointmentDetails, onConfirm }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-10 transform transition-all">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <FaCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Đặt lịch thành công!</h3>
                    <p className="text-gray-600 mb-4">{message}</p>
                    {appointmentDetails && (
                        <div className="w-full text-left space-y-2 mb-4">
                            <p><strong>Ngày đặt lịch:</strong> {new Date(appointmentDetails.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</p>
                            <p><strong>Thời gian:</strong> {appointmentDetails.time}</p>
                            <p><strong>Họ và tên:</strong> {appointmentDetails.customerName}</p>
                            <p><strong>Số điện thoại:</strong> {appointmentDetails.phone}</p>
                            <p><strong>Số lượng thú cưng:</strong> {appointmentDetails.pets.length}</p>
                            <p><strong>Tổng tiền:</strong> {appointmentDetails.totalAmount.toLocaleString('vi-VN')}đ</p>
                            <p><strong>Tiền cọc:</strong> {appointmentDetails.depositAmount.toLocaleString('vi-VN')}đ</p>
                            <p><strong>Phương thức thanh toán:</strong> {appointmentDetails.paymentMethod}</p>
                        </div>
                    )}
                    <button
                        onClick={onConfirm}
                        className="bg-[#fbb321] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#e59e14] transition-colors"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;