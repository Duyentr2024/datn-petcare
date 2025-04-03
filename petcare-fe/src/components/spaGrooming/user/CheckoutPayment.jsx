import React, { useState, useEffect } from 'react';
import { FaClock, FaQrcode, FaInfoCircle, FaHome, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MomoService from '../../../service/paymentService/MomoService';
import VNPayService from '../../../service/paymentService/VNPayService';
import BookingService from '../../../service/spaService/BookingService';
import MomoLogo from '../../../assets/images/payment/momo.png';
import VnpayLogo from '../../../assets/images/payment/vnpay.png';

const CheckoutPayment = () => {
  const [selectedPayment, setSelectedPayment] = useState('vnpay');
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(false);
  const [momoQrCode, setMomoQrCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy dữ liệu từ location.state hoặc sessionStorage
  const [bookingData, setBookingData] = useState(() => {
    // Kiểm tra nếu có dữ liệu từ location state
    if (location.state?.bookingData) {
      // Lưu vào sessionStorage để duy trì khi redirect từ cổng thanh toán
      sessionStorage.setItem('spaBookingData', JSON.stringify(location.state.bookingData));
      return location.state.bookingData;
    }
    
    // Kiểm tra nếu có dữ liệu từ sessionStorage
    const savedData = sessionStorage.getItem('spaBookingData');
    return savedData ? JSON.parse(savedData) : {};
  });

  // Kiểm tra URL để xác định xem đây có phải là callback từ cổng thanh toán
  const isPaymentCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("vnp_ResponseCode") || urlParams.has("orderId") || urlParams.has("resultCode") || urlParams.has("partnerCode");
  };

  // Kiểm tra nếu bookingData không tồn tại và không phải là callback thanh toán, chuyển hướng về /appointment
  useEffect(() => {
    if (Object.keys(bookingData).length === 0 && !isPaymentCallback()) {
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

  // Hiển thị modal thành công và điều hướng sau khi đóng
  const showSuccessAndRedirect = (message, appointmentDate) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    
    console.log("Showing success message, will redirect to:", `/appointment?date=${appointmentDate}&source=payment`);
    
    // Kiểm tra xem đã lưu dữ liệu vào localStorage chưa
    const localBookedSlots = localStorage.getItem('lastBookedSlots');
    console.log("Checking localStorage before redirect:", localBookedSlots);
    
    // Tự động chuyển hướng sau 3 giây
    setTimeout(() => {
      setShowSuccessModal(false);
      // Thêm timestamp để đảm bảo URL luôn mới, tránh vấn đề cache
      const timestamp = new Date().getTime();
      navigate(`/appointment?date=${appointmentDate}&source=payment&t=${timestamp}`);
    }, 3000);
  };

  // Xử lý callback từ cổng thanh toán
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const handlePaymentCallback = async () => {
      // Chỉ xử lý nếu có tham số trong URL
      if (urlParams.size === 0) return;
      
      // Lấy bookingData từ sessionStorage
      const savedBookingData = JSON.parse(sessionStorage.getItem('spaBookingData') || '{}');
      
      if (Object.keys(savedBookingData).length === 0) {
        console.error("Không tìm thấy thông tin đặt lịch trong sessionStorage");
        alert("Không tìm thấy thông tin đặt lịch. Vui lòng thử lại!");
        navigate('/appointment');
        return;
      }
      
      // Kiểm tra callback từ VNPay
      if (urlParams.get("vnp_ResponseCode")) {
        const vnpResponseCode = urlParams.get("vnp_ResponseCode");
        if (vnpResponseCode === "00") {
          try {
            // Tạo payload với trạng thái thanh toán thành công
            const payloadWithStatus = { 
              ...savedBookingData, 
              paymentStatus: "SUCCESS",
              paymentMethod: "VNPAY" 
            };
            
            console.log("Saving appointment with data:", payloadWithStatus);
            
            // Lưu thông tin slot đã đặt để hiển thị trên giao diện sau khi redirect
            if (savedBookingData.selectedSlots && savedBookingData.selectedSlots.length > 0) {
              // Lưu slots vào localStorage để duy trì sau khi reload trang
              BookingService.saveBookedSlots(
                savedBookingData.selectedSlots, 
                savedBookingData.date
              );
            }
            
            // Đảm bảo chuyển định dạng slot phù hợp với backend
            if (payloadWithStatus.selectedSlots && !payloadWithStatus.appointmentSlots) {
              // Chuyển đổi từ selectedSlots thành appointmentSlots
              payloadWithStatus.appointmentSlots = payloadWithStatus.selectedSlots.map(slotId => {
                const [time, slotIndex] = slotId.split('-');
                return {
                  time: time,
                  slotIndex: parseInt(slotIndex, 10)
                };
              });
              
              // Xóa selectedSlots để không gửi dữ liệu thừa
              delete payloadWithStatus.selectedSlots;
            }
            
            // Lấy ID lịch hẹn tạm thời (nếu có)
            const tempAppointmentId = sessionStorage.getItem('tempAppointmentId');
            if (tempAppointmentId) {
              // Thêm ID lịch hẹn tạm thời vào payload để backend có thể chuyển đổi từ tạm thời sang chính thức
              payloadWithStatus.tempAppointmentId = tempAppointmentId;
            }
            
            // Gọi API để lưu thông tin lịch hẹn
            const savedAppointment = await BookingService.bookAppointment(payloadWithStatus);
            console.log("Appointment saved successfully:", savedAppointment);
            
            // Xóa dữ liệu từ sessionStorage sau khi lưu thành công
            sessionStorage.removeItem('spaBookingData');
            sessionStorage.removeItem('pendingBookingSlots');
            sessionStorage.removeItem('pendingBookingDate');
            sessionStorage.removeItem('tempAppointmentId');
            
            // Hiển thị thông báo thành công
            showSuccessAndRedirect(
              "Thanh toán thành công! Lịch hẹn đã được xác nhận.",
              savedBookingData.date
            );
          } catch (error) {
            console.error("Error saving appointment:", error);
            alert(`Lưu lịch hẹn thất bại: ${error.message || "Đã xảy ra lỗi"}`);
            navigate('/appointment');
          }
        } else {
          // Thanh toán thất bại - hủy lịch hẹn tạm thời
          await BookingService.cancelTempAppointment();
          
          // Xóa thông tin booking đang chờ
          sessionStorage.removeItem('pendingBookingSlots');
          sessionStorage.removeItem('pendingBookingDate');
          sessionStorage.removeItem('tempAppointmentId');
          
          alert("Thanh toán không thành công! Vui lòng thử lại.");
          navigate('/appointment');
        }
      } 
      // Kiểm tra callback từ MoMo tương tự
      else if (urlParams.get("orderId") || urlParams.get("partnerCode")) {
        const resultCode = urlParams.get("resultCode");
        
        if (resultCode === "0") {
          try {
            // Tạo payload với trạng thái thanh toán thành công
            const payloadWithStatus = { 
              ...savedBookingData, 
              paymentStatus: "SUCCESS",
              paymentMethod: "MOMO" 
            };
            
            console.log("Saving appointment with data:", payloadWithStatus);
            
            // Lưu thông tin slot đã đặt để hiển thị trên giao diện sau khi redirect
            if (savedBookingData.selectedSlots && savedBookingData.selectedSlots.length > 0) {
              // Lưu slots vào localStorage để duy trì sau khi reload trang
              BookingService.saveBookedSlots(
                savedBookingData.selectedSlots, 
                savedBookingData.date
              );
            }
            
            // Đảm bảo chuyển định dạng slot phù hợp với backend
            if (payloadWithStatus.selectedSlots && !payloadWithStatus.appointmentSlots) {
              // Chuyển đổi từ selectedSlots thành appointmentSlots
              payloadWithStatus.appointmentSlots = payloadWithStatus.selectedSlots.map(slotId => {
                const [time, slotIndex] = slotId.split('-');
                return {
                  time: time,
                  slotIndex: parseInt(slotIndex, 10)
                };
              });
              
              // Xóa selectedSlots để không gửi dữ liệu thừa
              delete payloadWithStatus.selectedSlots;
            }
            
            // Lấy ID lịch hẹn tạm thời (nếu có)
            const tempAppointmentId = sessionStorage.getItem('tempAppointmentId');
            if (tempAppointmentId) {
              // Thêm ID lịch hẹn tạm thời vào payload để backend có thể chuyển đổi từ tạm thời sang chính thức
              payloadWithStatus.tempAppointmentId = tempAppointmentId;
            }
            
            // Gọi API để lưu thông tin lịch hẹn
            const savedAppointment = await BookingService.bookAppointment(payloadWithStatus);
            console.log("Appointment saved successfully:", savedAppointment);
            
            // Xóa dữ liệu từ sessionStorage sau khi lưu thành công
            sessionStorage.removeItem('spaBookingData');
            sessionStorage.removeItem('pendingBookingSlots');
            sessionStorage.removeItem('pendingBookingDate');
            sessionStorage.removeItem('tempAppointmentId');
            
            // Hiển thị thông báo thành công
            showSuccessAndRedirect(
              "Thanh toán thành công! Lịch hẹn đã được xác nhận.",
              savedBookingData.date
            );
          } catch (error) {
            console.error("Error saving appointment:", error);
            alert(`Lưu lịch hẹn thất bại: ${error.message || "Đã xảy ra lỗi"}`);
            navigate('/appointment');
          }
        } else {
          // Thanh toán thất bại - hủy lịch hẹn tạm thời
          await BookingService.cancelTempAppointment();
          
          // Xóa thông tin booking đang chờ
          sessionStorage.removeItem('pendingBookingSlots');
          sessionStorage.removeItem('pendingBookingDate');
          sessionStorage.removeItem('tempAppointmentId');
          
          alert("Thanh toán không thành công! Vui lòng thử lại.");
          navigate('/appointment');
        }
      }
    };

    // Chạy xử lý callback khi trang được load và có tham số trong URL
    handlePaymentCallback();
  }, [navigate]);

  // Xử lý khi người dùng rời khỏi trang và hủy thanh toán
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Chỉ xử lý khi là trường hợp thoát trang, không phải callback từ cổng thanh toán
      if (!isPaymentCallback()) {
        try {
          const pendingSlots = sessionStorage.getItem('pendingBookingSlots');
          const pendingDate = sessionStorage.getItem('pendingBookingDate');
          
          if (pendingSlots && pendingDate) {
            console.log('User is leaving page, cancelling temporary appointment...');
            
            // Sử dụng API mới để hủy lịch hẹn tạm thời
            navigator.sendBeacon(
              `${window.location.origin}/api/appointments/cancel-reservation`,
              JSON.stringify({
                date: pendingDate,
                slots: JSON.parse(pendingSlots)
              })
            );
            
            console.log('Sent cancellation request on page unload');
          }
        } catch (error) {
          console.error('Error in beforeunload handler:', error);
        }
      }
    };

    // Đăng ký event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Khi component unmount mà không phải do callback từ payment gateway
      // thì cũng nên hủy lịch hẹn tạm thời
      if (!isPaymentCallback()) {
        BookingService.cancelTempAppointment()
          .then(result => console.log('Temp appointment cancelled on component unmount:', result))
          .catch(err => console.error('Error cancelling temp appointment:', err));
      }
    };
  }, []);
  
  // Xử lý khi người dùng nhấn nút "Quay lại"
  const handleGoBack = async () => {
    try {
      // Hiển thị thông báo loading
      setLoading(true);
      
      // Hủy lịch hẹn tạm thời
      await BookingService.cancelTempAppointment();
      
      // Xóa thông tin pending booking
      sessionStorage.removeItem('pendingBookingSlots');
      sessionStorage.removeItem('pendingBookingDate');
      sessionStorage.removeItem('tempAppointmentId');
      
      // Chuyển về trang appointment
      navigate('/appointment');
    } catch (error) {
      console.error('Error when going back:', error);
      
      // Vẫn chuyển về trang appointment ngay cả khi có lỗi
      navigate('/appointment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const { depositAmount, totalPrice, paymentType } = bookingData;
      const returnUrl = `${window.location.origin}/checkout-payment`;
      const amount = paymentType === "full" ? totalPrice : depositAmount;

      // Tạo orderId riêng cho từng giao dịch
      const orderId = `PETCARE_SPA_${Date.now()}`;
      
      let paymentUrl;
      
      if (selectedPayment === 'momo') {
        console.log("Creating MoMo payment...");
        
        try {
          // Thêm orderId vào request
          paymentUrl = await MomoService.createPayment(amount, returnUrl);
          console.log("MoMo payment URL:", paymentUrl);
          
          if (paymentUrl) {
            // Redirect to MoMo payment page
            window.location.href = paymentUrl;
          } else {
            throw new Error("Không nhận được URL thanh toán từ MoMo");
          }
        } catch (error) {
          console.error("MoMo payment error:", error);
          alert(`Lỗi tạo thanh toán MoMo: ${error.message || "Đã xảy ra lỗi"}`);
        }
      } else if (selectedPayment === 'vnpay') {
        console.log("Creating VNPay payment...");
        
        try {
          paymentUrl = await VNPayService.createPayment(amount, returnUrl);
          console.log("VNPay payment URL:", paymentUrl);
          
          if (paymentUrl) {
            // Redirect to VNPay payment page
            window.location.href = paymentUrl;
          } else {
            throw new Error("Không nhận được URL thanh toán từ VNPay");
          }
        } catch (error) {
          console.error("VNPay payment error:", error);
          alert(`Lỗi tạo thanh toán VNPay: ${error.message || "Đã xảy ra lỗi"}`);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Lỗi tạo thanh toán: ${error.message || "Đã xảy ra lỗi"}`);
    } finally {
      setLoading(false);
    }
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
    total: `${(bookingData.totalPrice || 0).toLocaleString('vi-VN')}đ`,
    remaining: bookingData.paymentType === 'deposit' ? `${((bookingData.totalPrice || 0) - (bookingData.depositAmount || 0)).toLocaleString('vi-VN')}đ` : null,
  };

  const totalPayment = bookingData.paymentType === 'deposit' ? (bookingData.depositAmount || 0) : (bookingData.totalPrice || 0);

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
          <li>Nhấn "Thanh toán ngay" để chuyển đến trang thanh toán của {method?.name}</li>
          <li>Hoàn tất thanh toán theo hướng dẫn trên trang</li>
          <li>Chờ hệ thống xác nhận và lưu lịch hẹn</li>
        </ol>
      </div>
    );
  };

  // Modal thông báo thành công
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

        {/* Modal thông báo thành công */}
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
            <p>Tiền cọc của bạn sẽ được hoàn trả nếu bạn hủy lịch trước 24 giờ. Vui lòng kiểm tra email sau khi thanh toán để xác nhận đặt lịch.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;