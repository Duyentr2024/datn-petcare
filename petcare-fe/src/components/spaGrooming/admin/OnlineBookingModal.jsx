// OnlineBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox, Select, message } from 'antd';
import { SearchOutlined, CheckOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UpdatePetServiceModal from './UpdatePetServiceModal';
import BookingService from "../../../service/spaService/BookingService";
import dayjs from 'dayjs';

const formatDate = (dateString) => (dateString ? dayjs(dateString).format('DD/MM/YYYY') : '-');
const formatTime = (timeString) => (timeString || '-');

const OnlineBookingModal = ({ isVisible, onCancel, onlineBookings, onConfirm, refreshBookings }) => {
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sắp xếp danh sách lịch hẹn theo thời gian (tương lai trước)
  const sortedBookings = onlineBookings?.length 
    ? [...onlineBookings].sort((a, b) => {
        const dateTimeA = dayjs(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
        const dateTimeB = dayjs(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
        return dateTimeA - dateTimeB; // Sắp xếp tăng dần (tương lai trước)
      })
    : [];

  const filteredBookings = sortedBookings.length 
    ? sortedBookings.filter(booking => {
        const searchLower = searchValue.toLowerCase();
        return (
          booking.appointmentId?.toString().includes(searchValue) ||
          booking.customerName?.toLowerCase().includes(searchLower) ||
          booking.phone?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  useEffect(() => {
    setSelectedBookings([]);
  }, [isVisible, onlineBookings]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const employees = await BookingService.getEmployees();
        setStaffOptions(employees);
      } catch (error) {
        console.error('Error fetching staff list:', error);
        message.error('Không thể tải danh sách nhân viên');
        setStaffOptions([]);
      }
    };
    if (isVisible) fetchStaff();
  }, [isVisible]);

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setIsUpdateModalVisible(true);
  };

  const handleSearchChange = (e) => setSearchValue(e.target.value);

  const toggleSelectBooking = (appointmentId) => {
    setSelectedBookings(prev => 
      prev.includes(appointmentId) ? prev.filter(id => id !== appointmentId) : [...prev, appointmentId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length 
        ? [] 
        : filteredBookings.map(booking => booking.appointmentId)
    );
  };

  const handleConfirmSelection = async () => {
    try {
      setLoading(true);
      
      // Tự động gán nhân viên đầu tiên trong danh sách cho các lịch đã chọn
      const defaultStaffId = staffOptions.length > 0 ? staffOptions[0].value : null;
      
      if (!defaultStaffId) {
        message.error('Không có nhân viên nào trong hệ thống');
        setLoading(false);
        return;
      }
      
      const bookingsToConfirm = selectedBookings.map(appointmentId => ({
        appointmentId,
        staffId: defaultStaffId
      }));
      
      await onConfirm(bookingsToConfirm);
      setSelectedBookings([]);
      message.success('Đã xác nhận lịch hẹn thành công');
      refreshBookings();
    } catch (error) {
      console.error('Error confirming appointments:', error);
      message.error('Không thể xác nhận lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await BookingService.cancelAppointment(appointmentId, "Huỷ bởi quản trị viên");
      message.success('Đã huỷ lịch hẹn thành công');
      refreshBookings();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('Không thể huỷ lịch hẹn');
    }
  };

  console.log('Online bookings displayed in OnlineBookingModal.jsx:', filteredBookings);

  return (
    <>
      <Modal
        title={<div className="flex items-center gap-2"><span>Khách đặt online</span><span className="text-gray-400 text-sm">Chờ xác nhận ({onlineBookings?.length || 0})</span></div>}
        open={isVisible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Đóng</Button>,
          <Button 
            key="submit" 
            type="primary" 
            className="bg-green-500 hover:bg-green-600"
            loading={loading}
            disabled={selectedBookings.length === 0}
            onClick={handleConfirmSelection}
          >
            Xác nhận lịch đã chọn
          </Button>,
        ]}
        width={900}
      >
        <div className="py-4">
          <Input
            placeholder="Nhập mã lịch hẹn, tên hoặc số điện thoại khách hàng"
            prefix={<SearchOutlined />}
            className="mb-4"
            value={searchValue}
            onChange={handleSearchChange}
          />
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left"><Checkbox checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0} indeterminate={selectedBookings.length > 0 && selectedBookings.length < filteredBookings.length} onChange={toggleSelectAll} /></th>
                <th className="p-3 text-left">Mã đặt lịch</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Thanh toán</th>
                <th className="p-3 text-left">Thú cưng</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.appointmentId} className="border-b">
                    <td className="p-3"><Checkbox checked={selectedBookings.includes(booking.appointmentId)} onChange={() => toggleSelectBooking(booking.appointmentId)} /></td>
                    <td className="p-3">{booking.appointmentId}</td>
                    <td className="p-3"><div>{booking.customerName}</div><div className="text-green-500">{booking.phone}</div></td>
                    <td className="p-3"><div>{formatDate(booking.date)}</div><div>{formatTime(booking.time)}</div></td>
                    <td className="p-3">
                      <div>
                        {booking.paidAmount > 0 ? (
                          <div className="text-sm font-medium">Đã thanh toán: {booking.paidAmount.toLocaleString('vi-VN')}đ</div>
                        ) : booking.depositAmount > 0 ? (
                          <div className="text-sm font-medium">Đã cọc: {booking.depositAmount.toLocaleString('vi-VN')}đ</div>
                        ) : (
                          <div className="text-sm font-medium">-</div>
                        )}
                        {booking.totalAmount && (
                          <div className="text-xs text-gray-500">Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {booking.petCount || 1} thú cưng
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          type="text" 
                          icon={<CheckOutlined />}
                          title="Xác nhận lịch hẹn" 
                          onClick={() => {
                            const defaultStaffId = staffOptions.length > 0 ? staffOptions[0].value : null;
                            if (defaultStaffId) {
                              onConfirm([{ appointmentId: booking.appointmentId, staffId: defaultStaffId }])
                                .then(() => {
                                  message.success('Đã xác nhận lịch hẹn thành công');
                                  refreshBookings();
                                })
                                .catch(err => {
                                  console.error('Error confirming appointment:', err);
                                  message.error('Không thể xác nhận lịch hẹn');
                                });
                            } else {
                              message.warning('Không có nhân viên nào trong hệ thống');
                            }
                          }}
                        />
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(booking)} />
                        <Button type="text" icon={<DeleteOutlined />} onClick={() => handleCancelAppointment(booking.appointmentId)} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-3 text-center text-gray-500">{searchValue ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn nào chờ xác nhận'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {selectedBooking && (
        <UpdatePetServiceModal
          isVisible={isUpdateModalVisible}
          onCancel={() => setIsUpdateModalVisible(false)}
          bookingData={selectedBooking}
          onSuccess={refreshBookings}
        />
      )}
    </>
  );
};

export default OnlineBookingModal;