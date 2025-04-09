import React, { useState, useEffect } from 'react';
import { FaClock, FaQrcode, FaInfoCircle, FaCheckCircle, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Payment method logos (placeholder imports)
import PetcarePayLogo from '../../../assets/images/logo.png';

const CheckoutPayment = () => {
  const [selectedPayment, setSelectedPayment] = useState('vnpay');
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 in seconds

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const paymentMethods = [
    {
      id: 'petcare',
      name: 'Petcare Pay',
      description: 'Petcare Pay - Nhập mã PETPAY giảm 10K cho đơn từ 200K',
      logo: PetcarePayLogo
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'ZaloPay - Nhập mã ZLPETPAY giảm 10K cho đơn từ 200K',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png'
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      description: 'ShopeePay - Nhập mã SPPETPAY giảm 5% tối đa 200K',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-ShopeePay.png'
    },
    {
      id: 'momo',
      name: 'MoMo',
      description: 'MoMo - Nhập mã MOPETPAY giảm 15K cho đơn từ 200K',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-Momo-Square.png'
    },
    {
      id: 'vnpay',
      name: 'VNPAY',
      description: 'VNPAY - Nhập mã VNPETPAY giảm 15K cho đơn từ 200K',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png'
    },
    {
      id: 'viettelmoney',
      name: 'Viettel Money',
      description: 'Viettel Money - QR chuyển khoản, quét mã thanh toán',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ViettelMoney-Square.png'
    },
    {
      id: 'vietqr',
      name: 'VietQR',
      description: 'VietQR - QR chuyển khoản, quét mã thanh toán',
      logo: 'https://vietqr.org/assets/img/logo/vietqr.svg'
    },
    {
      id: 'atm',
      name: 'Thẻ ATM nội địa',
      description: 'Thẻ ATM nội địa',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-Napas-Square.png'
    },
    {
      id: 'card',
      name: 'Thẻ Visa/Master/JCB',
      description: 'Thẻ Visa/Master/JCB',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-JCB-Card.png'
    }
  ];

  const customerInfo = {
    name: 'DUYEN',
    phone: '0834233799',
    email: 'duyen321@gmail.com'
  };

  const bookingInfo = {
    date: 'Chủ Nhật, 23/3/2025',
    time: '--:--',
    petCount: 0,
    deposit: '0đ',
    total: '435.000đ'
  };
  
  // Helper function to render payment instructions based on selected method
  const renderPaymentInstructions = () => {
    if (selectedPayment === 'vnpay') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <h3 className="text-[#fbb321] font-semibold text-sm mb-3">Hướng dẫn thanh toán bằng VNPAY</h3>
          <ol className="text-sm space-y-2 text-gray-700 list-decimal pl-4">
            <li>Mở ứng dụng VNPay hoặc Ngân hàng (Mobile Banking) trên điện thoại</li>
            <li>Dùng biểu tượng <FaQrcode className="inline text-sm" /> để quét mã QR</li>
            <li>Quét mã ở trang này và thanh toán</li>
          </ol>
        </div>
      );
    } else if (selectedPayment === 'momo') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <h3 className="text-[#fbb321] font-semibold text-sm mb-3">Hướng dẫn thanh toán bằng Momo</h3>
          <ol className="text-sm space-y-2 text-gray-700 list-decimal pl-4">
            <li>Mở ứng dụng Momo trên điện thoại</li>
            <li>Dùng biểu tượng <FaQrcode className="inline text-sm" /> để quét mã QR</li>
            <li>Quét mã ở trang này và thanh toán</li>
          </ol>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <h3 className="text-[#fbb321] font-semibold text-sm mb-3">Hướng dẫn thanh toán bằng {paymentMethods.find(m => m.id === selectedPayment)?.name}</h3>
          <ol className="text-sm space-y-2 text-gray-700 list-decimal pl-4">
            <li>Mở ứng dụng {paymentMethods.find(m => m.id === selectedPayment)?.name} trên điện thoại</li>
            <li>Dùng biểu tượng <FaQrcode className="inline text-sm" /> để quét mã QR</li>
            <li>Quét mã ở trang này và thanh toán</li>
          </ol>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="flex items-center hover:text-[#fbb321]">
            <FaHome className="mr-1" />
            <span>Trang chủ</span>
          </Link>
          <span className="mx-2">›</span>
          <Link to="/dich-vu-spa" className="hover:text-[#fbb321]">Dịch vụ spa</Link>
          <span className="mx-2">›</span>
          <Link to="/dat-lich" className="hover:text-[#fbb321]">Đặt lịch</Link>
          <span className="mx-2">›</span>
          <span className="text-[#fbb321] font-medium">Thanh toán</span>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: Payment Methods (4) */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedPayment === method.id 
                        ? 'border-[#fbb321] bg-[#fffbf2]' 
                        : 'border-gray-200 hover:border-[#fbb321] hover:bg-[#fffbf2]'
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="w-6 h-6 flex-shrink-0 mr-3">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPayment === method.id && (
                          <div className="w-3 h-3 rounded-full bg-[#fbb321]"></div>
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 flex-shrink-0 mr-3">
                      <img 
                        src={method.logo} 
                        alt={method.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Column 2: Total Payment, Timer, QR Code (4) */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4 h-full">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-center mb-2">Tổng thanh toán</h2>
                <div className="text-3xl font-bold text-[#fbb321] mb-2">{bookingInfo.total}</div>
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <FaClock className="mr-1" />
                  <span>Thời gian giữ chỗ còn lại: {formatTime(timeLeft)}</span>
                </div>
                
                {/* QR Code */}
                <div className="w-full flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-56 h-56 relative">
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center border-4 border-white">
                        <FaQrcode className="text-7xl text-gray-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={paymentMethods.find(m => m.id === selectedPayment)?.logo} 
                            alt="Payment Logo" 
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Instructions */}
                {renderPaymentInstructions()}
              </div>
            </div>
          </div>
          
          {/* Column 3: Customer and Booking Info (4) */}
          <div className="md:col-span-4">
            <div className="space-y-6">
              {/* Customer Information */}
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span> 
                    <span className="font-medium">{customerInfo.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Booking Information */}
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
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-[#fbb321] hover:bg-[#e59e14] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Thanh toán ngay
                </button>
                <button className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional information */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 text-sm text-gray-600">
          <div className="flex items-start">
            <FaInfoCircle className="text-[#fbb321] mt-1 mr-2 flex-shrink-0" />
            <p>
              Tiền cọc của bạn sẽ được hoàn trả nếu bạn hủy lịch trước 24 giờ. Vui lòng kiểm tra email sau khi thanh toán để xác nhận đặt lịch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
