import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, Select, Button, message, Input } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BookingService from "../../../service/spaService/BookingService";

const { TextArea } = Input;

const ChangeDateAppointment = ({ isVisible, onCancel, bookingData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [note, setNote] = useState('');
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Load booking data when it changes
  useEffect(() => {
    if (bookingData) {
      const date = bookingData.date ? dayjs(bookingData.date) : null;
      const time = bookingData.time || null;
      const initialNote = bookingData.note || '';
      
      setAppointmentDate(date);
      setAppointmentTime(time);
      setNote(initialNote);
    }
  }, [bookingData]);

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    const time = `${hour}:00`;
    // Check if this slot is available
    const slotData = availableSlots.find(s => 
      s.time === time || 
      s.hour === time ||
      s.time === `0${time}` || 
      s.hour === `0${time}`
    );
    
    const isAvailable = slotData && slotData.availableSlots > 0;
    const remainingSlots = slotData ? slotData.availableSlots : 0;
    
    return {
      value: time,
      label: `${time} ${isAvailable ? `(còn ${remainingSlots} slot)` : '(hết chỗ)'}`,
      disabled: !isAvailable && appointmentTime !== time
    };
  });

  // Kiểm tra slot trống khi thay đổi ngày hoặc giờ
  useEffect(() => {
    const checkSlotAvailability = async () => {
      if (appointmentDate && appointmentTime) {
        try {
          const dateStr = appointmentDate.format('YYYY-MM-DD');
          const slots = await BookingService.getAvailableSlots(dateStr);
          console.log('Retrieved slots for date', dateStr, ':', slots);
          
          const allSlots = [...(slots.morning || []), ...(slots.afternoon || [])];
          console.log('All slots:', allSlots);
          
          // Check time in multiple formats (9:00, 09:00)
          const formattedTime = appointmentTime.includes(':') ? appointmentTime : `${appointmentTime}:00`;
          const time24h = formattedTime.length === 4 ? `0${formattedTime}` : formattedTime;
          
          // Try to find the slot with various time formats
          const slot = allSlots.find(s => 
            s.time === appointmentTime || 
            s.time === formattedTime || 
            s.time === time24h ||
            s.hour === appointmentTime ||
            s.hour === formattedTime ||
            s.hour === time24h
          );
          
          console.log('Matching slot for time', appointmentTime, ':', slot);
          
          const requiredSlots = bookingData?.petCount || 1;
          // If this is an existing appointment with the same date and time, we don't need to check
          const isSameDateTime = bookingData?.date === dateStr && bookingData?.time === appointmentTime;
          
          if (isSameDateTime) {
            setIsSlotAvailable(true);
          } else {
            setIsSlotAvailable(slot && slot.availableSlots >= requiredSlots);
          }
          
          console.log('Slot availability:', isSlotAvailable);
        } catch (error) {
          console.error('Error checking slot availability:', error);
          setIsSlotAvailable(false);
        }
      }
    };
    checkSlotAvailability();
  }, [appointmentDate, appointmentTime, bookingData]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (appointmentDate) {
        try {
          const dateStr = appointmentDate.format('YYYY-MM-DD');
          const slots = await BookingService.getAvailableSlots(dateStr);
          const allSlots = [...(slots.morning || []), ...(slots.afternoon || [])];
          setAvailableSlots(allSlots);
        } catch (error) {
          console.error('Error fetching available slots:', error);
          setAvailableSlots([]);
        }
      }
    };
    fetchAvailableSlots();
  }, [appointmentDate]);

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

    if (!isSlotAvailable) {
      message.error('Khung giờ này không có đủ slot trống');
      return;
    }

    // Kiểm tra nếu giống thời gian hiện tại
    const newDateStr = appointmentDate.format('YYYY-MM-DD');
    const isSameDateTime = bookingData?.date === newDateStr && bookingData?.time === appointmentTime;
    
    if (isSameDateTime) {
      message.error('Vui lòng chọn ngày hoặc giờ khác với hiện tại');
      return;
    }

    try {
      setLoading(true);

      // Format data for update
      const updateData = {
        appointmentId: bookingData.appointmentId,
        date: newDateStr,
        time: appointmentTime,
        note: note.trim(),
        // Thêm thông tin về slot hiện tại để giúp backend xử lý tốt hơn
        currentDate: bookingData?.date,
        currentTime: bookingData?.time,
        // Thêm random token để tránh cache
        _requestId: Math.random().toString(36).substring(2, 15)
      };

      console.log('Cập nhật lịch hẹn với dữ liệu:', updateData);

      // Call API to update appointment
      await BookingService.updateAppointment(updateData);

      message.success('Cập nhật lịch hẹn thành công');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật lịch hẹn';
      message.error(errorMessage);
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
            optionFilterProp="label"
            showSearch
            notFoundContent="Không có khung giờ phù hợp"
            optionLabelProp="label"
          />
          {!isSlotAvailable && (
            <p className="text-red-500 text-sm mt-1">Khung giờ này không có đủ slot trống</p>
          )}
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <TextArea
            placeholder="Nhập ghi chú cho lịch hẹn"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full"
          />
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
            disabled={!isSlotAvailable}
          >
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeDateAppointment;