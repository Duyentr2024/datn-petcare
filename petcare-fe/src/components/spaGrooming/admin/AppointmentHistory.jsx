import React, { useState, useEffect } from 'react';
import { Input, DatePicker, Button, Select, Table, Tag, Badge, Tooltip, Empty, Skeleton, Space } from 'antd';
import { SearchOutlined, HistoryOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, SwapOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './AdminAppointment.css';

const { RangePicker } = DatePicker;

const AppointmentHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // Giả lập tải dữ liệu từ API
    const timer = setTimeout(() => {
      setHistoryData(mockHistoryData);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleActionFilterChange = (value) => {
    setActionFilter(value);
  };

  // Hàm lấy màu cho status
  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'orange',
      'CONFIRMED': 'blue',
      'CANCELLED': 'red',
      'COMPLETED': 'green',
      'IN_PROGRESS': 'purple',
      'WAITING': 'cyan',
      'NOT_ARRIVED': 'gold'
    };
    
    return statusColors[status] || 'default';
  };

  // Hàm lấy label cho action
  const getActionLabel = (action) => {
    const actionLabels = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'CANCEL': 'Hủy lịch',
      'COMPLETE': 'Hoàn thành',
      'RESCHEDULE': 'Đổi lịch',
      'CHANGE_STATUS': 'Đổi trạng thái',
      'ADD_SERVICE': 'Thêm dịch vụ',
      'REMOVE_SERVICE': 'Bỏ dịch vụ',
      'CHANGE_STAFF': 'Đổi nhân viên'
    };
    
    return actionLabels[action] || action;
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-gray-500" />
          <div>
            <div className="font-medium">{dayjs(timestamp).format('DD/MM/YYYY')}</div>
            <div className="text-xs text-gray-500">{dayjs(timestamp).format('HH:mm:ss')}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 200,
      render: (user_id, record) => (
        <div className="flex items-center">
          <div className="avatar-circle mr-2">{record.userName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="font-medium">{record.userName}</div>
            <div className="text-xs text-gray-500">#{user_id} - {record.userRole}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => {
        let color = 'blue';
        let icon = <InfoCircleOutlined />;
        
        if (action === 'CREATE') {
          color = 'green';
          icon = <FileTextOutlined />;
        } else if (action === 'UPDATE' || action === 'CHANGE_STATUS') {
          color = 'blue';
          icon = <SwapOutlined />;
        } else if (action === 'CANCEL') {
          color = 'red';
        }
        
        return (
          <Tag color={color} icon={icon} className="px-2 py-1">
            {getActionLabel(action)}
          </Tag>
        );
      },
      filters: [
        { text: 'Tạo mới', value: 'CREATE' },
        { text: 'Cập nhật', value: 'UPDATE' },
        { text: 'Hủy lịch', value: 'CANCEL' },
        { text: 'Hoàn thành', value: 'COMPLETE' },
        { text: 'Đổi trạng thái', value: 'CHANGE_STATUS' },
      ],
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          {record.old_status && (
            <>
              <Tag color={getStatusColor(record.old_status)} className="status-tag">
                {record.old_status}
              </Tag>
              <SwapOutlined className="text-gray-400" />
            </>
          )}
          <Tag color={getStatusColor(record.new_status)} className="status-tag">
            {record.new_status}
          </Tag>
        </div>
      ),
      filters: [
        { text: 'Chờ xác nhận', value: 'PENDING' },
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
      ],
      onFilter: (value, record) => record.new_status === value || record.old_status === value,
    },
    {
      title: 'Lịch hẹn',
      dataIndex: 'appointment_id',
      key: 'appointment_id',
      width: 150,
      render: (appointment_id, record) => (
        <Tooltip title={`${record.customerName} - ${record.petName} (${record.service})`}>
          <Button type="link" className="text-[#fbb321] hover:text-[#e59e14]">
            #{appointment_id}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason) => (
        <Tooltip title={reason || 'Không có lý do'}>
          <span>{reason || <span className="text-gray-400 italic">Không có lý do</span>}</span>
        </Tooltip>
      ),
    },
  ];

  // Giả lập dữ liệu
  const mockHistoryData = [
    {
      id: 1,
      timestamp: '2023-10-10T08:30:00',
      user_id: 1,
      userName: 'Nguyễn Văn Admin',
      userRole: 'Admin',
      action: 'CREATE',
      new_status: 'PENDING',
      old_status: null,
      appointment_id: 1001,
      customerName: 'Nguyễn Văn A',
      petName: 'Kitty',
      service: 'Tắm và cắt tỉa lông',
      reason: null
    },
    {
      id: 2,
      timestamp: '2023-10-10T09:15:00',
      user_id: 2,
      userName: 'Trần Thị Nhân Viên',
      userRole: 'Nhân viên',
      action: 'CHANGE_STATUS',
      new_status: 'CONFIRMED',
      old_status: 'PENDING',
      appointment_id: 1001,
      customerName: 'Nguyễn Văn A',
      petName: 'Kitty',
      service: 'Tắm và cắt tỉa lông',
      reason: 'Đã liên hệ và xác nhận với khách hàng'
    },
    {
      id: 3,
      timestamp: '2023-10-11T10:00:00',
      user_id: 2,
      userName: 'Trần Thị Nhân Viên',
      userRole: 'Nhân viên',
      action: 'CHANGE_STATUS',
      new_status: 'IN_PROGRESS',
      old_status: 'CONFIRMED',
      appointment_id: 1001,
      customerName: 'Nguyễn Văn A',
      petName: 'Kitty',
      service: 'Tắm và cắt tỉa lông',
      reason: 'Khách hàng đã đến, bắt đầu thực hiện dịch vụ'
    },
    {
      id: 4,
      timestamp: '2023-10-11T11:30:00',
      user_id: 2,
      userName: 'Trần Thị Nhân Viên',
      userRole: 'Nhân viên',
      action: 'COMPLETE',
      new_status: 'COMPLETED',
      old_status: 'IN_PROGRESS',
      appointment_id: 1001,
      customerName: 'Nguyễn Văn A',
      petName: 'Kitty',
      service: 'Tắm và cắt tỉa lông',
      reason: 'Hoàn thành dịch vụ'
    },
    {
      id: 5,
      timestamp: '2023-10-12T13:00:00',
      user_id: 1,
      userName: 'Nguyễn Văn Admin',
      userRole: 'Admin',
      action: 'CREATE',
      new_status: 'PENDING',
      old_status: null,
      appointment_id: 1002,
      customerName: 'Trần Văn B',
      petName: 'Lucky',
      service: 'Khám tổng quát',
      reason: null
    },
    {
      id: 6,
      timestamp: '2023-10-12T14:30:00',
      user_id: 3,
      userName: 'Lê Thị Quản Lý',
      userRole: 'Quản lý',
      action: 'CANCEL',
      new_status: 'CANCELLED',
      old_status: 'PENDING',
      appointment_id: 1002,
      customerName: 'Trần Văn B',
      petName: 'Lucky',
      service: 'Khám tổng quát',
      reason: 'Khách hàng gọi điện hủy lịch vì bận việc đột xuất'
    },
  ];

  // Filter dữ liệu dựa trên searchText và dateRange
  const filteredData = historyData.filter(item => {
    // Filter theo text
    const matchSearch = searchText ? 
      (item.userName?.toLowerCase().includes(searchText.toLowerCase()) || 
      item.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
      `#${item.appointment_id}`.includes(searchText)) : true;
    
    // Filter theo ngày
    const matchDate = dateRange && dateRange[0] && dateRange[1] ? 
      (dayjs(item.timestamp).isAfter(dateRange[0]) && 
      dayjs(item.timestamp).isBefore(dateRange[1])) : true;
    
    // Filter theo loại action
    const matchAction = actionFilter !== 'all' ? item.action === actionFilter : true;
    
    return matchSearch && matchDate && matchAction;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-8">
        <HistoryOutlined style={{ fontSize: '48px', color: '#fbb321', marginBottom: '16px' }} />
        <h2 className="text-xl font-semibold">Lịch sử chỉnh sửa lịch hẹn</h2>
        <p className="text-gray-500">Theo dõi các thay đổi của lịch hẹn trong hệ thống</p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Tìm kiếm theo người dùng, lịch hẹn..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
        <div className="flex items-center space-x-4">
          <RangePicker 
            format="DD/MM/YYYY"
            onChange={handleDateRangeChange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleActionFilterChange}
            options={[
              { value: 'all', label: 'Tất cả thay đổi' },
              { value: 'CREATE', label: 'Tạo mới' },
              { value: 'UPDATE', label: 'Cập nhật' },
              { value: 'CANCEL', label: 'Hủy lịch' },
              { value: 'COMPLETE', label: 'Hoàn thành' },
              { value: 'CHANGE_STATUS', label: 'Đổi trạng thái' },
            ]}
          />
        </div>
      </div>
      
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : filteredData.length > 0 ? (
        <div className="history-table-container">
          <Table 
            columns={columns} 
            dataSource={filteredData}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} bản ghi`
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Empty
            image="https://cdn-icons-png.flaticon.com/512/6195/6195678.png"
            imageStyle={{ height: 96, opacity: 0.5 }}
            description={
              <Space direction="vertical" size="small">
                <h3 className="text-lg font-medium text-gray-600 mt-2">Không tìm thấy dữ liệu lịch sử</h3>
                <p className="text-gray-500">Không có bản ghi nào phù hợp với điều kiện tìm kiếm</p>
              </Space>
            }
          >
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={() => {setSearchText(''); setDateRange(null); setActionFilter('all');}}
              className="bg-[#fbb321] hover:bg-[#e59e14] border-none mt-4"
            >
              Xóa bộ lọc
            </Button>
          </Empty>
        </div>
      )}

      <style jsx global>{`
        .history-table-container .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: #111827;
          font-weight: 600;
        }
        
        .history-table-container .ant-table-tbody > tr:hover > td {
          background-color: rgba(251, 179, 33, 0.05);
        }
        
        .history-table-container .ant-table-row {
          transition: all 0.3s;
        }
        
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #fbb321;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .status-tag {
          min-width: 90px;
          text-align: center;
          padding: 0 8px;
          font-weight: 500;
        }
        
        .ant-tooltip-inner {
          max-width: 300px;
        }
      `}</style>
    </div>
  );
};

export default AppointmentHistory; 