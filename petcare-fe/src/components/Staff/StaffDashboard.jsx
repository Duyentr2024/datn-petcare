import React from 'react';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaClipboardList, 
  FaReceipt,
  FaClock
} from 'react-icons/fa';

const StatsCard = ({ icon: Icon, title, value, bgColor, textColor }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
    <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mr-4`}>
      <Icon className={`text-xl ${textColor}`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AppointmentCard = ({ time, customer, service, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#fbb321]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <FaClock className="text-[#fbb321] mr-2" />
          <span className="text-gray-600 font-medium">{time}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <p className="font-medium text-gray-800">{customer}</p>
      <p className="text-sm text-gray-600">{service}</p>
    </div>
  );
};

const StaffDashboard = () => {
  // Mock data
  const stats = [
    { icon: FaUsers, title: 'Khách hàng hôm nay', value: '12', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { icon: FaCalendarCheck, title: 'Cuộc hẹn', value: '8', bgColor: 'bg-[#fff8e7]', textColor: 'text-[#fbb321]' },
    { icon: FaClipboardList, title: 'Dịch vụ đã hoàn thành', value: '5', bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { icon: FaReceipt, title: 'Doanh thu', value: '2.500.000đ', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  ];

  const upcomingAppointments = [
    { time: '09:00', customer: 'Nguyễn Văn A', service: 'Spa cơ bản', status: 'confirmed' },
    { time: '10:30', customer: 'Trần Thị B', service: 'Cắt tỉa lông', status: 'pending' },
    { time: '13:15', customer: 'Lê Văn C', service: 'Khám tổng quát', status: 'confirmed' },
    { time: '15:00', customer: 'Phạm Thị D', service: 'Spa + Cắt tỉa', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index} 
            icon={stat.icon} 
            title={stat.title} 
            value={stat.value} 
            bgColor={stat.bgColor} 
            textColor={stat.textColor} 
          />
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-full bg-[#fff8e7] flex items-center justify-center mr-2">
            <FaCalendarCheck className="text-[#fbb321]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Cuộc hẹn sắp tới</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingAppointments.map((appointment, index) => (
            <AppointmentCard 
              key={index} 
              time={appointment.time} 
              customer={appointment.customer} 
              service={appointment.service} 
              status={appointment.status} 
            />
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-[#fbb321] hover:text-[#e09a0d] font-medium flex items-center justify-center mx-auto">
            Xem tất cả cuộc hẹn
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Truy cập nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Tạo cuộc hẹn', color: 'bg-[#fbb321]', href: '/staff/appointments/new' },
            { name: 'Thêm khách hàng', color: 'bg-blue-500', href: '/staff/customers/new' },
            { name: 'Dịch vụ Spa', color: 'bg-purple-500', href: '/staff/spa-grooming' },
            { name: 'Hóa đơn', color: 'bg-green-500', href: '/staff/offline-invoices' }
          ].map((action, index) => (
            <a 
              key={index} 
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 text-center hover:opacity-90 transition-opacity font-medium`}
            >
              {action.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 