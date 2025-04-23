import React, { useState, useEffect } from 'react';
import { Modal, Input, DatePicker, Select, Button, Radio, Space, Row, Col, message } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BookingService from "../../../service/spaService/BookingService";

const UpdatePetServiceModal = ({ isVisible, onCancel, bookingData, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [status, setStatus] = useState('PENDING');

  // Load booking data when it changes
  useEffect(() => {
    if (bookingData) {
      // Format date and time
      const date = bookingData.date ? dayjs(bookingData.date) : null;
      const time = bookingData.time || null;
      
      setAppointmentDate(date);
      setAppointmentTime(time);
      setStatus(bookingData.status || 'PENDING');
      
      // Initialize services based on pets in the booking
      if (bookingData.pets && bookingData.pets.length > 0) {
        const formattedServices = bookingData.pets.map((pet, index) => ({
          id: index + 1,
          petId: pet.petId,
          name: pet.petService?.name || 'Dịch vụ không xác định',
          petType: pet.petType,
          weight: pet.petWeight?.name || '',
          staff: pet.staffId || null,
          note: pet.note || ''
        }));
        setServices(formattedServices);
      } else {
        // Default empty service if no pets
        setServices([{
          id: 1,
          name: 'Dịch vụ mới',
          weight: '',
          staff: null,
          note: ''
        }]);
      }
    }
  }, [bookingData]);

  // Fetch staff list
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

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    return {
      value: `${hour}:00`,
      label: `${hour}:00`
    };
  });

  const handleAddService = () => {
    setServices([
      ...services,
      {
        id: services.length + 1,
        name: 'Dịch vụ mới',
        weight: '',
        staff: null,
        note: ''
      }
    ]);
  };
  
  const handleDateChange = (date) => {
    setAppointmentDate(date);
  };
  
  const handleTimeChange = (time) => {
    setAppointmentTime(time);
  };
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  const handleSave = async () => {
    // Validate required fields
    if (!appointmentDate || !appointmentTime) {
      message.error('Vui lòng chọn ngày và giờ hẹn');
      return;
    }
    
    // Validate staff assignment
    const unassignedServices = services.filter(service => !service.staff);
    if (unassignedServices.length > 0) {
      message.error('Vui lòng chọn nhân viên cho tất cả dịch vụ');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format data for update
      const updateData = {
        appointmentId: bookingData.appointmentId,
        date: appointmentDate.format('YYYY-MM-DD'),
        time: appointmentTime,
        status: status,
        pets: services.map(service => ({
          petId: service.petId,
          staffId: service.staff
        }))
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
      title="Cập nhật lịch hẹn"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Customer Information Row */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khách hàng
          </label>
          <Row gutter={8}>
            <Col span={10}>
              <Input
                value={bookingData?.customerName}
                readOnly
                placeholder="Tên khách hàng"
              />
            </Col>
            <Col span={8}>
              <Input
                value={bookingData?.phone}
                readOnly
                placeholder="Số điện thoại"
              />
            </Col>
            <Col span={6}>
              <Input
                value={services[0]?.petType || '-'}
                readOnly
                placeholder="Loại thú cưng"
              />
            </Col>
          </Row>
        </div>

        {/* Appointment Date and Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày làm
          </label>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={appointmentDate}
              onChange={handleDateChange}
              suffixIcon={<CalendarOutlined />}
            />
            <Select
              style={{ width: '100%' }}
              options={timeSlots}
              value={appointmentTime}
              onChange={handleTimeChange}
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Dịch vụ</th>
                <th className="p-3 text-left">Cân nặng</th>
                <th className="p-3 text-left">Nhân viên</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id} className={index !== 0 ? 'border-t' : ''}>
                  <td className="p-3 w-1/3">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">{index + 1}.</span>
                      {service.name}
                    </div>
                    {service.note && (
                      <div className="text-xs text-gray-500 mt-1">
                        Ghi chú: {service.note}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <Input
                      placeholder="Cân nặng"
                      style={{ width: '100%' }}
                      value={service.weight}
                      readOnly
                    />
                  </td>
                  <td className="p-3">
                    <Select
                      placeholder="Chọn nhân viên"
                      style={{ width: '100%' }}
                      options={staffOptions}
                      value={service.staff}
                      onChange={(value) => {
                        const newServices = [...services];
                        newServices[index].staff = value;
                        setServices(newServices);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Service Button */}
        <div>
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddService}
            className="flex items-center"
          >
            Thêm dịch vụ
          </Button>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <Radio.Group value={status} onChange={handleStatusChange}>
            <Space>
              <Radio value="PENDING">Chờ xác nhận</Radio>
              <Radio value="CONFIRMED">Đã xác nhận</Radio>
              <Radio value="NOT_ARRIVED">Chưa tới</Radio>
              <Radio value="IN_PROGRESS">Đang sử dụng</Radio>
              <Radio value="COMPLETED">Đã hoàn thành</Radio>
              <Radio value="CANCELLED">Đã hủy</Radio>
            </Space>
          </Radio.Group>
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