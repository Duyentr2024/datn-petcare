import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import VetOrderService from '../../service/hospitalService/VetOrderService'; // Import VetOrderService
import { CheckCircle, ChevronLeft } from 'lucide-react';

// Hàm định dạng giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

// Hàm định dạng ngày
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
};

const PaymentPage = () => {
    const { orderId } = useParams(); // Lấy orderId từ URL
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('COMPLETED'); // Mặc định là COMPLETED
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // Mặc định là CASH
    const [loading, setLoading] = useState(false);

    // Lấy thông tin đơn hàng khi component được mount
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const orderData = await VetOrderService.getOrderById(orderId);
                setOrder(orderData);
            } catch (error) {
                toast.error('Lỗi khi tải thông tin đơn hàng: ' + (error.message || 'Không xác định'), {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    // Xử lý thanh toán
    const handlePayment = async () => {
        setLoading(true);
        try {
            const updatedOrder = await VetOrderService.processPayment(orderId, paymentStatus);
            setOrder(updatedOrder);
            toast.success('Thanh toán thành công!', {
                position: 'top-right',
                autoClose: 3000,
            });

            // Chuyển hướng về trang trước hoặc trang chính sau 3 giây
            setTimeout(() => {
                navigate('/medical-records'); // Thay đổi đường dẫn theo nhu cầu của bạn
            }, 3000);
        } catch (error) {
            toast.error('Lỗi khi thanh toán: ' + (error.message || 'Không xác định'), {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý quay lại
    const handleBack = () => {
        navigate(-1); // Quay lại trang trước
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-6"
        >
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-md p-6">
                {loading && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-t-[#754826] border-gray-200 rounded-full animate-spin"></div>
                            <p className="mt-4 text-white text-lg font-medium">Đang xử lý...</p>
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-semibold text-[#754826] mb-6">Thanh Toán Đơn Hàng #{orderId}</h2>

                {order ? (
                    <div className="space-y-4">
                        {/* Thông tin đơn hàng */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-medium">Thông Tin Đơn Hàng</h3>
                            <p><strong>Ngày Đặt:</strong> {formatDate(order.orderDate)}</p>
                            <p><strong>Tổng Tiền:</strong> {formatPrice(order.totalAmount)}</p>
                            <p><strong>Trạng Thái Thanh Toán:</strong> {order.paymentStatus}</p>
                            <p><strong>Phương Thức Thanh Toán:</strong> {order.paymentMethod}</p>
                            <p><strong>Loại Đơn Hàng:</strong> {order.type}</p>
                            {order.statusOrder && (
                                <p><strong>Trạng Thái Đơn Hàng:</strong> {order.statusOrder.statusName}</p>
                            )}
                        </div>

                        {/* Chọn phương thức thanh toán */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Phương Thức Thanh Toán</h3>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#754826]"
                                disabled={loading}
                            >
                                <option value="CASH">Tiền Mặt</option>
                                <option value="CARD">Thẻ Tín Dụng</option>
                                <option value="TRANSFER">Chuyển Khoản</option>
                            </select>
                        </div>

                        {/* Chọn trạng thái thanh toán */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Trạng Thái Thanh Toán</h3>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#754826]"
                                disabled={loading}
                            >
                                <option value="COMPLETED">Hoàn Thành</option>
                                <option value="FAILED">Thất Bại</option>
                                <option value="PENDING">Đang Chờ</option>
                            </select>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handleBack}
                                className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Quay Lại
                            </button>
                            <button
                                onClick={handlePayment}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Xác Nhận Thanh Toán
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Không tìm thấy đơn hàng.</p>
                )}
            </div>
        </motion.div>
    );
};

export default PaymentPage;