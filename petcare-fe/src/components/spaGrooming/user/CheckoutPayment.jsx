import React, { useState, useEffect } from 'react';
import { FaClock, FaQrcode, FaInfoCircle, FaHome, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BookingService from '../../../service/spaService/BookingService';
import MomoLogo from '../../../assets/images/payment/momo.png';
import VnpayLogo from '../../../assets/images/payment/vnpay.png';

const CheckoutPayment = () => {
    const [selectedPayment, setSelectedPayment] = useState('vnpay');
    const [timeLeft, setTimeLeft] = useState(120);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [bookingData, setBookingData] = useState(() => {
        if (location.state?.bookingData) {
            return location.state.bookingData;
        }
        return {};
    });

    useEffect(() => {
        if (Object.keys(bookingData).length === 0) {
            alert("Vui lòng đặt lịch trước khi thanh toán!");
            navigate('/appointment');
        } else {
            console.log("bookingData:", bookingData);
        }
    }, [bookingData, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            navigate('/spa');
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    const handlePayment = async () => {
        try {
            setLoading(true);

            const payload = {
                date: bookingData.date,
                time: bookingData.time,
                customerName: bookingData.customerName,
                phone: bookingData.phone,
                paymentType: bookingData.paymentType,
                depositAmount: bookingData.depositAmount || 0,
                totalAmount: bookingData.totalAmount || 0,
                pets: bookingData.pets,
                appointmentSlots: bookingData.appointmentSlots,
                paymentStatus: 'PENDING',
                paymentMethod: selectedPayment.toUpperCase(),
            };

            const savedAppointment = await BookingService.bookAppointment(payload);

            if (savedAppointment.success) {
                setSuccessMessage("Thanh toán thành công! Lịch hẹn đã được xác nhận.");
                setShowSuccessModal(true);

                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate(`/appointment?date=${bookingData.date}&source=payment&t=${new Date().getTime()}`);
                }, 3000);
            } else {
                throw new Error(savedAppointment.message || "Không thể đặt lịch.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert(`Lỗi thanh toán: ${error.message || "Đã xảy ra lỗi"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = async () => {
        navigate('/appointment');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const customerInfo = {
        name: bookingData.customerName || '',
        phone: bookingData.phone || '',
    };

    const bookingInfo = {
        date: bookingData.date ? new Date(bookingData.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }) : '',
        time: bookingData.time || '',
        petCount: bookingData.pets?.length || 0,
        deposit: bookingData.paymentType === 'deposit' ? `${(bookingData.depositAmount || 0).toLocaleString('vi-VN')}đ` : '0đ',
        total: `${(bookingData.totalAmount || 0).toLocaleString('vi-VN')}đ`,
        remaining: bookingData.paymentType === 'deposit' ? `${((bookingData.totalAmount || 0) - (bookingData.depositAmount || 0)).toLocaleString('vi-VN')}đ` : null,
    };

    const totalPayment = bookingData.paymentType === 'deposit' ? (bookingData.depositAmount || 0) : (bookingData.totalAmount || 0);

    const paymentMethods = [
        { id: 'momo', name: 'MoMo', description: 'MoMo - Nhập mã MOPETPAY giảm 15K cho đơn từ 200K', logo: MomoLogo },
        { id: 'vnpay', name: 'VNPAY', description: 'VNPAY - Nhập mã VNPETPAY giảm 15K cho đơn từ 200K', logo: VnpayLogo },
    ];

    const renderPaymentInstructions = () => {
        const method = paymentMethods.find(m => m.id === selectedPayment);
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                <h3 className="text-[#fbb321] font-semibold text-sm mb-3">Hướng dẫn thanh toán bằng {method?.name}</h3>
                <ol className="text-sm space-y-2 text-gray-700 list-decimal pl-4">
                    <li>Nhấn "Thanh toán ngay" để hoàn tất đặt lịch.</li>
                    <li>Hệ thống sẽ tự động xác nhận lịch hẹn.</li>
                </ol>
            </div>
        );
    };

    const SuccessModal = ({ show, message }) => {
        if (!show) return null;
        
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-10 transform transition-all">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <FaCheckCircle className="text-green-500 text-4xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Thành công!</h3>
                        <p className="text-gray-600 mb-4">{message}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4">
                <nav className="flex items-center text-sm text-gray-600 mb-6">
                    <Link to="/" className="flex items-center hover:text-[#fbb321]">
                        <FaHome className="mr-1" /> Trang chủ
                    </Link>
                    <span className="mx-2">›</span>
                    <Link to="/dich-vu-spa" className="hover:text-[#fbb321]">Dịch vụ spa</Link>
                    <span className="mx-2">›</span>
                    <Link to="/appointment" className="hover:text-[#fbb321]">Đặt lịch</Link>
                    <span className="mx-2">›</span>
                    <span className="text-[#fbb321] font-medium">Thanh toán</span>
                </nav>

                <SuccessModal show={showSuccessModal} message={successMessage} />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                            selectedPayment === method.id ? 'border-[#fbb321] bg-[#fffbf2]' : 'border-gray-200 hover:border-[#fbb321] hover:bg-[#fffbf2]'
                                        }`}
                                        onClick={() => setSelectedPayment(method.id)}
                                    >
                                        <div className="w-6 h-6 flex-shrink-0 mr-3">
                                            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                                {selectedPayment === method.id && <div className="w-3 h-3 rounded-full bg-[#fbb321]"></div>}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 flex-shrink-0 mr-3">
                                            <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium">{method.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                            <div className="flex flex-col items-center">
                                <h2 className="text-xl font-semibold text-center mb-2">Tổng thanh toán</h2>
                                <div className="text-3xl font-bold text-[#fbb321] mb-2">{totalPayment.toLocaleString('vi-VN')}đ</div>
                                <div className="flex items-center text-gray-600 text-sm mb-4">
                                    <FaClock className="mr-1" />
                                    <span>Thời gian giữ chỗ còn lại: {formatTime(timeLeft)}</span>
                                </div>
                                <div className="w-full flex justify-center mb-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <div className="w-56 h-56 relative">
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center border-4 border-white">
                                                <FaQrcode className="text-7xl text-gray-400" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <img src={paymentMethods.find(m => m.id === selectedPayment)?.logo} alt="Payment Logo" className="w-10 h-10 object-contain" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {renderPaymentInstructions()}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-semibold text-[#fbb321] mb-3">Thông tin khách hàng</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Họ và tên:</span>
                                        <span className="font-medium">{customerInfo.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Số điện thoại:</span>
                                        <span className="font-medium">{customerInfo.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-semibold text-[#fbb321] mb-3">Thông tin đặt lịch</h3>
                                <div className="border rounded-lg p-4">
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="py-2 text-gray-600">Ngày</td>
                                                <td className="py-2 text-right font-medium">{bookingInfo.date}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-gray-600">Thời gian</td>
                                                <td className="py-2 text-right font-medium">{bookingInfo.time}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-gray-600">Số lượng thú cưng</td>
                                                <td className="py-2 text-right font-medium">{bookingInfo.petCount}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-gray-600">Tiền cọc</td>
                                                <td className="py-2 text-right font-medium">{bookingInfo.deposit}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td className="py-2 text-gray-600 font-semibold">Tổng tiền</td>
                                                <td className="py-2 text-right font-bold text-[#fbb321]">{bookingInfo.total}</td>
                                            </tr>
                                            {bookingInfo.remaining && (
                                                <tr>
                                                    <td className="py-2 text-gray-600">Còn lại</td>
                                                    <td className="py-2 text-right font-medium">{bookingInfo.remaining}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className={`flex-1 ${loading ? 'bg-gray-400' : 'bg-[#fbb321] hover:bg-[#e59e14]'} text-white font-bold py-3 px-6 rounded-lg transition-colors`}
                                >
                                    {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                </button>
                                <button
                                    onClick={handleGoBack}
                                    disabled={loading}
                                    className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-sm p-4 text-sm text-gray-600">
                    <div className="flex items-start">
                        <FaInfoCircle className="text-[#fbb321] mt-1 mr-2 flex-shrink-0" />
                        <p>Tiền cọc của bạn sẽ được hoàn trả nếu bạn hủy lịch trước 24 giờ. Mọi thắc mắc xin liên hệ số điện thoại 0844 233 799.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPayment;