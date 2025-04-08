// AdminAppointment.js
import React, { useState, useEffect } from 'react';
import { Select, Input, DatePicker, Button, Radio, Badge, message, notification, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, RightOutlined, BellOutlined, HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './AdminAppointment.css';
import BookingService from "../../../service/spaService/BookingService";
import webSocketService from "../../../service/WebSocketService";
import AddAppointmentModal from './AddAppointmentModal';
import OnlineBookingModal from './OnlineBookingModal';
import Calendar from './Calendar';
import AppointmentHistory from './AppointmentHistory';

const { TabPane } = Tabs;

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
  const [activeTab, setActiveTab] = useState("1");

  const fetchOnlineBookings = async () => {
    try {
      console.log('Fetching PAID appointments...');
      const response = await BookingService.getPendingAppointments();
      console.log('Fetched PAID appointments:', response);
  
      if (response && Array.isArray(response.data)) {
        setOnlineBookings(response.data);
        setNotificationCount(response.data.length);
      } else {
        console.warn('Invalid response format:', response);
        message.warning('Không có lịch hẹn nào chờ xác nhận hoặc dữ liệu không hợp lệ.');
        setOnlineBookings([]);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching online bookings:', error);
      message.error(error.message || 'Không thể tải danh sách lịch hẹn. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
      setOnlineBookings([]);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchOnlineBookings();
    webSocketService.connect();

    const unsubscribeNew = webSocketService.onNewAppointment((appointment) => {
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
        onClick: () => setIsOnlineBookingModalVisible(true),
      });
      setNotificationCount(prev => prev + 1);
      fetchOnlineBookings();
      clearInterval(intervalId);
      intervalId = setInterval(fetchOnlineBookings, 300000);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      console.log('WebSocket disconnected, switching to 30s polling');
      clearInterval(intervalId);
      intervalId = setInterval(fetchOnlineBookings, 30000);
    });

    let intervalId = setInterval(fetchOnlineBookings, 300000);

    return () => {
      unsubscribeNew();
      unsubscribeDisconnect();
      clearInterval(intervalId);
    };
  }, []);

  const [services, setServices] = useState([
    { id: 1, petType: '', service: '', weight: '', note: '', price: 150000 }
  ]);

  const handleAddService = () => {
    setServices([...services, { id: services.length + 1, petType: '', service: '', weight: '', note: '', price: 150000 }]);
  };

  const handleRemoveService = (id) => {
    if (services.length > 1) setServices(services.filter(service => service.id !== id));
  };

  const handleServiceChange = (id, field, value) => {
    setServices(services.map(service => service.id === id ? { ...service, [field]: value } : service));
  };

  const handleAddAppointment = () => setIsModalVisible(true);
  const handleModalCancel = () => setIsModalVisible(false);
  const handleModalOk = () => setIsModalVisible(false);
  const handleOpenOnlineBookings = () => {
    setIsOnlineBookingModalVisible(true);
    setNotificationCount(0);
  };

  const handleConfirmBookings = async (confirmedBookings) => {
    try {
      await Promise.all(
        confirmedBookings.map(booking => 
          BookingService.confirmAppointment(booking.appointmentId, booking.staffId)
        )
      );
      message.success('Xác nhận lịch hẹn thành công');
      fetchOnlineBookings();
    } catch (error) {
      console.error('Error confirming bookings:', error);
      message.error('Không thể xác nhận lịch hẹn');
    }
  };

  // Render the appointment management content
  const renderAppointmentContent = () => (
    <div className="tab-content-container">
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
          <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} buttonStyle="solid">
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="pending">Chờ xác nhận</Radio.Button>
            <Radio.Button value="not_arrived">Chưa tới</Radio.Button>
            <Radio.Button value="waiting">Đang chờ</Radio.Button>
            <Radio.Button value="in_use">Đang sử dụng</Radio.Button>
            <Radio.Button value="completed">Đã xong</Radio.Button>
          </Radio.Group>
          <div className="border-l border-gray-300 h-6" />
          <Radio.Group value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} buttonStyle="solid">
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="unpaid">Chưa thanh toán</Radio.Button>
            <Radio.Button value="paid">Đã thanh toán</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Calendar />
      </div>

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

  // CSS for tabs
  const tabBarStyle = {
    marginBottom: '24px',
    padding: '0 4px',
  };

  return (
    <div className="p-6">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarStyle={tabBarStyle}
        className="appointment-tabs"
        tabBarGutter={24}
      >
        <TabPane 
          tab={
            <span className="tab-label flex items-center">
              <CalendarOutlined className="mr-2" />
              <span>Quản lý lịch hẹn</span>
              {notificationCount > 0 && (
                <Badge count={notificationCount} className="ml-2" />
              )}
            </span>
          } 
          key="1"
        >
          {renderAppointmentContent()}
        </TabPane>
        <TabPane 
          tab={
            <span className="tab-label flex items-center">
              <HistoryOutlined className="mr-2" />
              <span>Lịch sử chỉnh sửa</span>
            </span>
          } 
          key="2"
        >
          <div className="tab-content-container">
            <AppointmentHistory />
          </div>
        </TabPane>
      </Tabs>

      <style jsx>{`
        .appointment-tabs .ant-tabs-nav {
          background-color: white;
          padding: 12px 16px 0;
          border-radius: 8px 8px 0 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          margin-bottom: 0 !important;
        }
        
        .appointment-tabs .ant-tabs-tab {
          padding: 12px 16px;
          transition: all 0.3s;
        }
        
        .appointment-tabs .ant-tabs-tab:hover {
          color: #fbb321;
        }
        
        .appointment-tabs .ant-tabs-tab-active {
          background-color: rgba(251, 179, 33, 0.1);
          border-radius: 8px;
        }
        
        .appointment-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #fbb321 !important;
          font-weight: 600;
        }
        
        .appointment-tabs .ant-tabs-ink-bar {
          background-color: #fbb321;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }
        
        .tab-label {
          font-size: 15px;
        }
        
        .tab-content-container {
          padding-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default AdminAppointment;