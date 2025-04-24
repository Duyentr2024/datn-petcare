import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, Select, Button, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BookingService from "../../../service/spaService/BookingService";

const UpdatePetServiceModal = ({ isVisible, onCancel, bookingData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);

  // Load booking data when it changes
  useEffect(() => {
    if (bookingData) {
      // Format date and time
      const date = bookingData.date ? dayjs(bookingData.date) : null;
      const time = bookingData.time || null;
      
      setAppointmentDate(date);
      setAppointmentTime(time);
    }
  }, [bookingData]);

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    return {
      value: `${hour}:00`,
      label: `${hour}:00`
    };
  });

  const handleDateChange = (date) => {
    setAppointmentDate(date);
  };
  
  const handleTimeChange = (time) => {
    setAppointmentTime(time);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!appointmentDate || !appointmentTime) {
      message.error('Vui lòng chọn ngày và giờ hẹn');
      return;
    }

    try {
      setLoading(true);

      // Format data for update
      const updateData = {
        appointmentId: bookingData.appointmentId,
        date: appointmentDate.format('YYYY-MM-DD'),
        time: appointmentTime
      };

      // Call API to update appointment
      await BookingService.updateAppointment(updateData);

      message.success('Cập nhật lịch hẹn thành công');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Error updating appointment:', error);
      message.error('Không thể cập nhật lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa lịch hẹn"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Customer Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng: {bookingData?.customerName || 'Không xác định'}
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại: {bookingData?.phone || 'Không xác định'}
          </label>
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày làm
          </label>
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            value={appointmentDate}
            onChange={handleDateChange}
            suffixIcon={<CalendarOutlined />}
          />
          {/* TODO: Thêm thông báo nếu ngày không có slot trống */}
        </div>

        {/* Appointment Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khung giờ làm
          </label>
          <Select
            style={{ width: '100%' }}
            options={timeSlots}
            value={appointmentTime}
            onChange={handleTimeChange}
            placeholder="Chọn khung giờ"
          />
          {/* TODO: Thêm thông báo nếu khung giờ không có slot trống */}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={onCancel}>
            Bỏ qua
          </Button>
          <Button 
            type="primary" 
            className="bg-green-500 hover:bg-green-600"
            loading={loading}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePetServiceModal;