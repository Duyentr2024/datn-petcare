import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox, Select, message, notification } from 'antd';
import { SearchOutlined, CheckOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UpdatePetServiceModal from './UpdatePetServiceModal';
import BookingService from "../../../service/spaService/BookingService";
import dayjs from 'dayjs';

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Helper function to format time for display
const formatTime = (timeString) => {
  if (!timeString) return '-';
  return timeString;
};

// Thêm vào phần khai báo hàm để hiển thị trạng thái
const getStatusLabel = (status) => {
  switch (status) {
    case 'PAID':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã thanh toán</span>;
    case 'PENDING':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
    case 'CONFIRMED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đã xác nhận</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã hủy</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
};

const OnlineBookingModal = ({ isVisible, onCancel, onlineBookings, onConfirm, refreshBookings }) => {
  const [staffSelections, setStaffSelections] = useState({});
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter bookings based on search
  const filteredBookings = onlineBookings && onlineBookings.length 
    ? onlineBookings.filter(booking => {
        const searchLower = searchValue.toLowerCase();
        return (
          booking.appointmentId?.toString().includes(searchValue) ||
          booking.customerName?.toLowerCase().includes(searchLower) ||
          booking.phone?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Reset selections when modal opens or bookings change
  useEffect(() => {
    setStaffSelections({});
    setSelectedBookings([]);
  }, [isVisible, onlineBookings]);

  // Fetch staff list when component mounts
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
    
    if (isVisible) {
      fetchStaff();
    }
  }, [isVisible]);

  const handleStaffChange = (value, appointmentId) => {
    setStaffSelections(prev => ({
      ...prev,
      [appointmentId]: value
    }));
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setIsUpdateModalVisible(true);
  };
  
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  const toggleSelectBooking = (appointmentId) => {
    setSelectedBookings(prev => {
      if (prev.includes(appointmentId)) {
        return prev.filter(id => id !== appointmentId);
      } else {
        return [...prev, appointmentId];
      }
    });
  };
  
  const toggleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.appointmentId));
    }
  };
  
  const handleConfirmSelection = async () => {
    // Validate staff assignment for selected bookings
    const unassignedBookings = selectedBookings.filter(id => !staffSelections[id]);
    
    if (unassignedBookings.length > 0) {
      message.error('Vui lòng chọn nhân viên cho tất cả các lịch hẹn đã chọn');
      return;
    }
    
    try {
      setLoading(true);
      
      const bookingsToConfirm = selectedBookings.map(appointmentId => ({
        appointmentId,
        staffId: staffSelections[appointmentId]
      }));
      
      await onConfirm(bookingsToConfirm);
      
      message.success('Đã xác nhận lịch hẹn thành công');
      setSelectedBookings([]);
      
      // Refresh the list to show updated status
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

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Khách đặt online</span>
            <span className="text-gray-400 text-sm">Chờ xác nhận ({onlineBookings?.length || 0})</span>
          </div>
        }
        open={isVisible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Đóng
          </Button>,
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
                <th className="p-3 text-left">
                  <Checkbox 
                    checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                    indeterminate={selectedBookings.length > 0 && selectedBookings.length < filteredBookings.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left">Mã đặt lịch</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Dịch vụ</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Thanh toán</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Thú cưng</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.appointmentId} className="border-b">
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedBookings.includes(booking.appointmentId)}
                        onChange={() => toggleSelectBooking(booking.appointmentId)}
                      />
                    </td>
                    <td className="p-3">{booking.appointmentId}</td>
                    <td className="p-3">
                      <div>{booking.customerName}</div>
                      <div className="text-green-500">{booking.phone}</div>
                    </td>
                    <td className="p-3">
                      <div>{formatDate(booking.date)}</div>
                      <div>{formatTime(booking.time)}</div>
                    </td>
                    <td className="p-3">
                      {booking.pets?.map((pet, index) => (
                        <div key={index} className="text-sm">
                          {pet.petService?.name || pet.petTypeDisplay || pet.petType}
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      {getStatusLabel(booking.status || 'PAID')}
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="text-sm font-medium">
                          {booking.paidAmount ? `${booking.paidAmount.toLocaleString('vi-VN')}đ` : '-'}
                        </div>
                        {booking.totalAmount && (
                          <div className="text-xs text-gray-500">
                            Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        placeholder="Chọn nhân viên"
                        style={{ width: '100%' }}
                        options={staffOptions}
                        value={staffSelections[booking.appointmentId]}
                        onChange={(value) => handleStaffChange(value, booking.appointmentId)}
                      />
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {booking.pets?.length || 1} thú cưng
                      </span>
                      {booking.note && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ghi chú: {booking.note}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          type="text" 
                          icon={<CheckOutlined />} 
                          title="Xác nhận"
                          disabled={!staffSelections[booking.appointmentId]}
                          onClick={() => {
                            if (staffSelections[booking.appointmentId]) {
                              onConfirm([{
                                appointmentId: booking.appointmentId,
                                staffId: staffSelections[booking.appointmentId]
                              }]);
                              message.success('Đã xác nhận lịch hẹn');
                              refreshBookings();
                            } else {
                              message.warning('Vui lòng chọn nhân viên');
                            }
                          }}
                        />
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(booking)} title="Chỉnh sửa" />
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          title="Huỷ lịch" 
                          onClick={() => handleCancelAppointment(booking.appointmentId)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-3 text-center text-gray-500">
                    {searchValue ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn nào chờ xác nhận'}
                  </td>
                </tr>
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