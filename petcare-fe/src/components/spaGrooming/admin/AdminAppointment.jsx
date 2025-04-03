import React, { useState, useEffect } from 'react';
import { Select, Input, DatePicker, Button, Radio, Badge, message, notification } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, RightOutlined, BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './AdminAppointment.css';
import BookingService from "../../../service/spaService/BookingService";
import webSocketService from "../../../service/WebSocketService";

// Import the new modal components
import AddAppointmentModal from './AddAppointmentModal';
import OnlineBookingModal from './OnlineBookingModal';
import Calendar from './Calendar';

dayjs.locale('vi');

const AdminAppointment = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isOnlineBookingModalVisible, setIsOnlineBookingModalVisible] = useState(false);
  const [onlineBookings, setOnlineBookings] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Fetch online bookings when component mounts
  useEffect(() => {
    fetchOnlineBookings();
    
    // Setup WebSocket connection for real-time notifications
    webSocketService.connect();
    
    // Subscribe to new appointment notifications
    const unsubscribeNewAppointment = webSocketService.onNewAppointment(handleNewAppointment);
    
    // Subscribe to connection events
    const unsubscribeConnect = webSocketService.onConnect(() => {
      console.log('Connected to WebSocket service');
      // Khi kết nối WebSocket thành công, tải lại danh sách lịch hẹn
      fetchOnlineBookings();
    });
    
    // Thiết lập interval để tải lại danh sách lịch hẹn mỗi 30 giây
    const intervalId = setInterval(() => {
      fetchOnlineBookings();
    }, 30000); // 30 giây
    
    return () => {
      // Cleanup subscriptions when component unmounts
      unsubscribeNewAppointment();
      unsubscribeConnect();
      clearInterval(intervalId);
    };
  }, []);
  
  const handleNewAppointment = (appointment) => {
    // Show notification
    notification.info({
      message: 'Lịch hẹn mới cần xác nhận',
      description: (
        <div>
          <p>Khách hàng <strong>{appointment.customerName}</strong> đã đặt lịch spa</p>
          <p>Ngày: {dayjs(appointment.date).format('DD/MM/YYYY')}</p>
          <p>Giờ: {appointment.time}</p>
          <p>Đã thanh toán: {appointment.paidAmount ? `${appointment.paidAmount.toLocaleString('vi-VN')}đ` : 'Chưa thanh toán'}</p>
          <p><strong>Bấm vào đây để xác nhận lịch hẹn</strong></p>
        </div>
      ),
      placement: 'topRight',
      duration: 10,
      onClick: () => {
        setIsOnlineBookingModalVisible(true);
      }
    });
    
    // Update notification count and refresh bookings
    setNotificationCount(prev => prev + 1);
    fetchOnlineBookings();
  };
  
  const fetchOnlineBookings = async () => {
    try {
      // Fetch pending appointments that need confirmation
      console.log('Fetching online bookings...');
      const response = await BookingService.getPendingAppointments();
      console.log('Fetched pending appointments:', response);
      
      // Kiểm tra response.data tồn tại và là mảng
      if (response && Array.isArray(response.data)) {
        console.log('Setting online bookings from array response:', response.data.length);
        setOnlineBookings(response.data);
        setNotificationCount(response.data.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Setting online bookings from nested data array:', response.data.length);
        setOnlineBookings(response.data);
        setNotificationCount(response.data.length);
      } else {
        // Không có dữ liệu hoặc dữ liệu không đúng định dạng
        console.warn('No online bookings found or invalid format:', response);
        setOnlineBookings([]);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching online bookings:', error);
      
      // Phân loại lỗi để hiển thị thông báo phù hợp
      if (error.code === 'ECONNABORTED') {
        message.warning('Kết nối đến server quá chậm, đang thử lại...');
      } else if (error.message && error.message.includes('Network Error')) {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        message.error('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
      }
      
      setOnlineBookings([]);
      setNotificationCount(0);
    }
  };

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
    // Reset notification count when viewing bookings
    setNotificationCount(0);
  };
  
  const handleConfirmBookings = async (confirmedBookings) => {
    try {
      await Promise.all(
        confirmedBookings.map(booking => 
          BookingService.confirmAppointment(booking.appointmentId, booking.staffId)
        )
      );
      fetchOnlineBookings();
    } catch (error) {
      console.error('Error confirming bookings:', error);
      message.error('Không thể xác nhận lịch hẹn');
    }
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
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
              <Badge count={notificationCount} className="ml-1" />
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
        <Calendar />
      </div>

      {/* Use the new modal components */}
      <AddAppointmentModal 
        isVisible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        services={services}
        handleAddService={handleAddService}
        handleRemoveService={handleRemoveService}
        handleServiceChange={handleServiceChange}
      />

      <OnlineBookingModal 
        isVisible={isOnlineBookingModalVisible}
        onCancel={() => setIsOnlineBookingModalVisible(false)}
        onlineBookings={onlineBookings}
        onConfirm={handleConfirmBookings}
        refreshBookings={fetchOnlineBookings}
      />
    </div>
  );
};

export default AdminAppointment;
