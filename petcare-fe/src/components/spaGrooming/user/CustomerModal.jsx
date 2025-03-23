// CustomerModal.jsx
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerModal = memo(
  ({ isCustomerModalOpen, setIsCustomerModalOpen, customerInfo, setCustomerInfo, errors, setErrors, handleCustomerInfoChange, fullNameRef, phoneRef, handleApiBooking }) => {
    const navigate = useNavigate();
    
    const handleConfirm = async () => {
      try {
        await handleApiBooking(); // Gọi hàm đặt lịch
        setIsCustomerModalOpen(false); // Đóng modal sau khi đặt lịch thành công
        navigate('/checkout-payment'); // Chuyển hướng đến trang thanh toán
      } catch (error) {
        console.error('Error during confirmation:', error);
        alert('Xác nhận thất bại! Vui lòng thử lại.');
      }
    };

    return (
      <div className={`fixed inset-0 z-50 ${isCustomerModalOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fullNameRef}
                    type="text"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    id="acceptTerms"
                    checked={customerInfo.acceptTerms}
                    onChange={handleCustomerInfoChange}
                    className="rounded text-[#026AC7] focus:ring-[#026AC7]"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    Tôi đồng ý với các điều khoản dịch vụ
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">ĐIỀU KHOẢN LƯU Ý</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    Quý khách vui lòng đến đúng giờ đã đặt. Trong trường hợp đến trễ quá 15 phút, chúng tôi
                    có quyền hủy lịch đặt để phục vụ khách hàng tiếp theo.
                  </p>
                  <p>
                    Vui lòng cung cấp đầy đủ thông tin về tình trạng sức khỏe của thú cưng để chúng tôi có thể
                    phục vụ tốt nhất.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2.5 bg-[#026AC7] text-white rounded-md ${
                  !customerInfo.acceptTerms ||
                  errors.fullName ||
                  errors.phone ||
                  !customerInfo.fullName ||
                  !customerInfo.phone
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#0253a0]'
                }`}
                disabled={
                  !customerInfo.acceptTerms ||
                  errors.fullName ||
                  errors.phone ||
                  !customerInfo.fullName ||
                  !customerInfo.phone
                }
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CustomerModal;