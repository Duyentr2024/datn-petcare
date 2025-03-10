import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Select, Input, DatePicker, Button, Radio, Modal, Badge, Checkbox, Space } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, RightOutlined, BellOutlined, CheckOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './AdminAppointment.css';


dayjs.locale('vi');

const AdminAppointment = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isOnlineBookingModalVisible, setIsOnlineBookingModalVisible] = useState(false);
  const [onlineBookings] = useState([
    {
      id: 'BL000003',
      customer: {
        name: 'Chí Cẩm Tú',
        phone: '0777888999'
      },
      time: '26/12/2024 08:30',
      service: 'Hút chỉ thải độc (20\')',
      location: 'Chi Cẩm Tú - Đặt lịch online'
    },
    {
      id: 'BL000002', 
      customer: {
        name: 'Lan Anh',
        phone: '0333444555'
      },
      time: '26/12/2024 09:30',
      service: 'Hút chỉ thải độc (20\')',
      location: 'Lan Anh - Đặt lịch online'
    },
    {
      id: 'BL000001',
      customer: {
        name: 'Chí Hồng',
        phone: '0888777999'
      },
      time: '25/12/2024 17:30', 
      service: 'Gội đầu (30\')',
      location: 'Chí Hồng - Đặt lịch online'
    }
  ]);

  // Mock data for dropdowns
  const staffMembers = [
    { value: 'staff1', label: 'Nhân viên 1' },
    { value: 'staff2', label: 'Nhân viên 2' },
  ];

  // Mock data for calendar events
  const events = [
    {
      id: '1',
      title: 'Khách hàng A - Tắm + vệ sinh',
      start: '2024-03-26T09:30:00',
      end: '2024-03-26T10:25:00',
      backgroundColor: '#10B981', // Đang sử dụng
      borderColor: '#10B981',
    },
    {
      id: '2',
      title: 'Khách hàng B - Spa cao cấp',
      start: '2024-03-26T09:30:00',
      end: '2024-03-26T10:25:00',
      backgroundColor: '#EF4444', // Đang chờ
      borderColor: '#EF4444',
    },
  ];

  // Thêm state mới
  const [services, setServices] = useState([
    {
      id: 1,
      petType: '',
      service: '',
      weight: '',
      note: '',
      price: 150000
    }
  ]);

  // Thêm hàm xử lý
  const handleAddService = () => {
    setServices([
      ...services,
      {
        id: services.length + 1,
        petType: '',
        service: '',
        weight: '',
        note: '',
        price: 150000
      }
    ]);
  };

  const handleRemoveService = (id) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  const handleServiceChange = (id, field, value) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleAddAppointment = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalOk = () => {
    // Handle appointment creation
    setIsModalVisible(false);
  };

  const handleOpenOnlineBookings = () => {
    setIsOnlineBookingModalVisible(true);
  };

  // Custom header rendering for FullCalendar
  const renderDayHeader = (info) => {
    const date = dayjs(info.date);
    const dayName = date.format('dddd'); // Thứ 2, Thứ 3, etc.
    const dayNumber = date.format('DD/MM'); // 04/03
    
    // Format day name to match "Thứ 3" format
    const formattedDayName = dayName.replace('thứ ', 'Thứ ');
    
    return (
      <div className="fc-custom-header">
        <div className="day-name">{formattedDayName}</div>
        <div className="day-number">{dayNumber}</div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Select
              placeholder="Chọn nhân viên"
              style={{ width: 200 }}
              options={staffMembers}
              value={selectedStaff}
              onChange={setSelectedStaff}
            />
            <Input
              placeholder="Tìm khách hàng (F4)"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setSelectedDate(dayjs())}>Hôm nay</Button>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="DD/MM/YYYY"
            />
            <div className="flex items-center space-x-2">
              <Button icon={<LeftOutlined />} />
              <Button icon={<RightOutlined />} />
            </div>
            <Select
              defaultValue="week"
              style={{ width: 120 }}
              options={[
                { value: 'week', label: 'Xem theo tuần' },
                { value: 'day', label: 'Xem theo ngày' },
              ]}
            />
            <Button
              className="notification-btn flex items-center"
              icon={<BellOutlined />}
              onClick={handleOpenOnlineBookings}
            >
              <span className="ml-1">Lịch online</span>
              <Badge count={3} className="ml-1" />
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAppointment}
              className="bg-green-500 hover:bg-green-600"
            >
              Thêm lịch
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div>
            <Radio.Group 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>
              <Radio.Button value="pending">Chờ xác nhận</Radio.Button>
              <Radio.Button value="not_arrived">Chưa tới</Radio.Button>
              <Radio.Button value="waiting">Đang chờ</Radio.Button>
              <Radio.Button value="in_use">Đang sử dụng</Radio.Button>
              <Radio.Button value="completed">Đã xong</Radio.Button>
            </Radio.Group>
          </div>
          <div className="border-l border-gray-300 h-6" />
          <div>
            <Radio.Group 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">Tất cả</Radio.Button>
              <Radio.Button value="unpaid">Chưa thanh toán</Radio.Button>
              <Radio.Button value="paid">Đã thanh toán</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow">
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          slotMinTime="09:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          locale="vi"
          events={events}
          slotDuration="01:00"
          slotLabelInterval="01:00"
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs">
              <div className="font-semibold">{eventInfo.event.title}</div>
              <div>{dayjs(eventInfo.event.start).format('HH:mm')} - {dayjs(eventInfo.event.end).format('HH:mm')}</div>
            </div>
          )}
          height="calc(100vh - 220px)"
          dayHeaderContent={renderDayHeader}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false
          }}
        />
      </div>

      {/* Add Appointment Modal */}
      <Modal
        title="Thêm lịch hẹn mới"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk} className="bg-green-500 hover:bg-green-600">
            Lưu
          </Button>
        ]}
        width={600}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách hàng
            </label>
            <div className="space-y-3">
              <Input
                placeholder="Họ và tên"
                className="w-full"
              />
              <Input
                placeholder="Số điện thoại"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày làm
            </label>
            <div className="space-y-3">
              <DatePicker 
                className="w-full" 
                format="DD/MM/YYYY"
              />
              <Select
                className="w-full"
                placeholder="Chọn giờ"
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: `${9 + i}:00`,
                  label: `${9 + i}:00`
                }))}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Thú cưng</h3>
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-xl">+</span> Thêm thú cưng
              </button>
            </div>
            
            {services.map((service) => (
              <div key={service.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Thú cưng {service.id}</h4>
                  {services.length > 1 && (
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại thú cưng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.petType}
                      onChange={(e) => handleServiceChange(service.id, 'petType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                    >
                      <option value="">Chọn loại thú cưng</option>
                      <option value="cat">Mèo</option>
                      <option value="dog">Chó</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.service}
                      onChange={(e) => handleServiceChange(service.id, 'service', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                    >
                      <option value="">Chọn dịch vụ</option>
                      <option value="service1">Tắm + vệ sinh</option>
                      <option value="service2">Spa cao cấp</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cân nặng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.weight}
                      onChange={(e) => handleServiceChange(service.id, 'weight', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                    >
                      <option value="">Chọn cân nặng</option>
                      <option value="weight1">Dưới 5kg</option>
                      <option value="weight2">5kg - 10kg</option>
                      <option value="weight3">Trên 10kg</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={service.note}
                      onChange={(e) => handleServiceChange(service.id, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-[42px] resize-none"
                      placeholder="Ghi chú thêm về thú cưng..."
                    />
                  </div>
                  
                  <div className="col-span-2 flex justify-end items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Giá dịch vụ:</span>
                    <span className="text-blue-600 font-medium">
                      {service.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <Radio.Group className="w-full">
              <Space direction="vertical">
                <Radio value="not_arrived">Chưa tới</Radio>
                <Radio value="in_use">Đang sử dụng</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú"
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Online Booking Modal */}
      <Modal
        title={<div className="flex items-center gap-2">
          <span>Khách đặt online</span>
          <span className="text-gray-400 text-sm">Chờ xác nhận (3)</span>
        </div>}
        open={isOnlineBookingModalVisible}
        onCancel={() => setIsOnlineBookingModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsOnlineBookingModalVisible(false)}>
            Hủy lịch
          </Button>,
          <Button key="submit" type="primary" className="bg-green-500 hover:bg-green-600">
            Xác nhận
          </Button>
        ]}
        width={900}
      >
        <div className="py-4">
          <Input
            placeholder="Nhập mã lịch hẹn, tên hoặc số điện thoại khách hàng"
            prefix={<SearchOutlined />}
            className="mb-4"
          />
          
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox />
                </th>
                <th className="p-3 text-left">Mã đặt lịch</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Giờ khách đến</th>
                <th className="p-3 text-left">Dịch vụ sử dụng</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Vị trí</th>
                <th className="p-3 text-left">Ghi chú</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {onlineBookings.map((booking) => (
                <tr key={booking.id} className="border-b">
                  <td className="p-3">
                    <Checkbox />
                  </td>
                  <td className="p-3">{booking.id}</td>
                  <td className="p-3">
                    <div>{booking.customer.name}</div>
                    <div className="text-green-500">{booking.customer.phone}</div>
                  </td>
                  <td className="p-3">{booking.time}</td>
                  <td className="p-3">{booking.service}</td>
                  <td className="p-3">-</td>
                  <td className="p-3">{booking.location}</td>
                  <td className="p-3">-</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button type="text" icon={<CheckOutlined />} />
                      <Button type="text" icon={<EditOutlined />} />
                      <Button type="text" icon={<DeleteOutlined />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAppointment;
