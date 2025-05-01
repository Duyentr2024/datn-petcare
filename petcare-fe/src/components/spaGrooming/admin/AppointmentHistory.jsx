import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, DatePicker, Button, Select, Table, Tag, Badge, Tooltip, Empty, Skeleton, Space, message, notification } from 'antd';
import { SearchOutlined, HistoryOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, SwapOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import axios from 'axios';
import webSocketService from "../../../service/WebSocketService";
import './AdminAppointment.css';

const { RangePicker } = DatePicker;

// Hàm helper để merge dữ liệu mới vào dữ liệu hiện có
const mergeHistoryData = (currentData, newData) => {
  if (!newData || newData.length === 0) return currentData;
  
  // Tạo map từ dữ liệu hiện có để kiểm tra trùng lặp nhanh hơn
  const existingMap = new Map(currentData.map(item => [item.id, item]));
  
  // Thêm các bản ghi mới vào
  newData.forEach(item => {
    if (!existingMap.has(item.id)) {
      existingMap.set(item.id, item);
    } else {
      // Cập nhật bản ghi nếu có thay đổi (dựa trên timestamp mới hơn)
      const existing = existingMap.get(item.id);
      if (new Date(item.timestamp) > new Date(existing.timestamp)) {
        existingMap.set(item.id, item);
      }
    }
  });
  
  // Chuyển đổi map trở lại thành mảng và sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
  return Array.from(existingMap.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const AppointmentHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const historyDataRef = useRef([]);
  
  // Thêm flag để kiểm soát việc tự động fetch
  const [shouldAutoFetch, setShouldAutoFetch] = useState(true);
  const isInitialLoad = useRef(true);
  const lastFetchTime = useRef(0);
  const currentFetchPromise = useRef(null);
  const debounceTimer = useRef(null);
  
  // Chuyển đổi fetchHistoryData thành useCallback để tối ưu performance
  const fetchHistoryData = useCallback(async (showLoading = true, forceFull = false) => {
    // Tránh các lần gọi liên tiếp trong thời gian ngắn (throttle)
    const now = Date.now();
    if (!forceFull && now - lastFetchTime.current < 2000) {
      console.log('Skipping fetch, too soon since last fetch');
      return;
    }
    
    // Nếu đang có một fetch đang chạy, đợi nó hoàn thành
    if (currentFetchPromise.current) {
      try {
        await currentFetchPromise.current;
      } catch (error) {
        console.error('Previous fetch failed:', error);
      }
    }
    
    try {
      if (showLoading) setLoading(true);
      
      // Tạo và lưu promise của fetch hiện tại
      const fetchPromise = axios.get('http://localhost:8080/api/appointments/history', {
        timeout: 10000,
      });
      currentFetchPromise.current = fetchPromise;
      lastFetchTime.current = now;
      
      const response = await fetchPromise;
      
      // Clear promise hiện tại sau khi hoàn thành
      currentFetchPromise.current = null;
      
      // Xử lý dữ liệu
      let newData = response.data;
      console.log('Fetched history data:', newData); // Thêm log để kiểm tra dữ liệu
      
      // Logic kiểm tra bản ghi mới và thông báo
      if (historyDataRef.current.length > 0 && !forceFull) {
        const currentIds = new Set(historyDataRef.current.map(item => item.id));
        const newRecords = newData.filter(item => !currentIds.has(item.id));
        
        if (newRecords.length > 0) {
          console.log('New records found:', newRecords); // Thêm log để kiểm tra bản ghi mới
          setNewRecordsCount(prev => prev + newRecords.length);
          notifyNewRecords(newRecords);
        }
        
        // Merge dữ liệu mới vào dữ liệu hiện tại thay vì thay thế hoàn toàn
        newData = mergeHistoryData(historyDataRef.current, newData);
      }
      
      historyDataRef.current = newData;
      setHistoryData(newData);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      message.error('Không thể tải dữ liệu lịch sử: ' + (error.message || 'Lỗi không xác định'));
      if (historyDataRef.current.length === 0) {
        setHistoryData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Đánh dấu đã hoàn thành lần load đầu tiên
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setNewRecordsCount(0);
    fetchHistoryData(true, true); // force full refresh
    message.success("Đang làm mới dữ liệu lịch sử");
  };

  // Cải thiện useEffect ban đầu để sử dụng WebSocket hiệu quả hơn
  useEffect(() => {
    // Load dữ liệu lần đầu
    fetchHistoryData();
    
    // Xử lý các sự kiện WebSocket để cập nhật theo thời gian thực
    const handleAppointmentEvent = (data) => {
      console.log('History: WebSocket event received', data);
      
      // Tránh fetch liên tục trong thời gian ngắn bằng debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Chỉ fetch nếu shouldAutoFetch = true
      if (shouldAutoFetch) {
        debounceTimer.current = setTimeout(() => {
          console.log('Fetching history data after WebSocket event:', data.type);
          fetchHistoryData(false); // Không hiển thị loading khi cập nhật qua WebSocket
        }, 500);
      }
    };
    
    // Setup all WebSocket event listeners to ensure real-time updates
    const unsubscribeNewAppointment = webSocketService.onNewAppointment(handleAppointmentEvent);
    const unsubscribeUpdated = webSocketService.onAppointmentUpdated(handleAppointmentEvent);
    const unsubscribeConfirmed = webSocketService.onAppointmentConfirmed(handleAppointmentEvent);
    const unsubscribeCancelled = webSocketService.onAppointmentCancelled((data) => {
      console.log('Received APPOINTMENT_CANCELLED event:', data);
      handleAppointmentEvent(data);
    }); // Thêm log cụ thể cho sự kiện hủy
    const unsubscribeSlotsUpdated = webSocketService.onSlotsUpdated(handleAppointmentEvent);
    const unsubscribePetRemoved = webSocketService.onPetRemoved(handleAppointmentEvent);
    
    // Connect to WebSocket if not already connected
    if (!webSocketService.connected) {
      webSocketService.connect();
    }

    // Add WebSocket connection status listeners
    const unsubscribeConnect = webSocketService.onConnect(() => {
      console.log('History: WebSocket connected');
      setIsWebSocketConnected(true);
      fetchHistoryData(false); // Làm mới dữ liệu khi WebSocket kết nối
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      console.log('History: WebSocket disconnected');
      setIsWebSocketConnected(false);
    });

    // Polling ít thường xuyên hơn và chỉ khi cần thiết
    const intervalId = setInterval(() => {
      if (!isWebSocketConnected && shouldAutoFetch) {
        console.log('History: Polling for updates because WebSocket is not connected');
        fetchHistoryData(false);
      }
    }, 30000); // Polling chỉ 30 giây/lần thay vì 10 giây

    return () => {
      // Unsubscribe from all WebSocket events when component unmounts
      unsubscribeNewAppointment();
      unsubscribeUpdated();
      unsubscribeConfirmed();
      unsubscribeCancelled();
      unsubscribeSlotsUpdated();
      unsubscribePetRemoved();
      unsubscribeConnect();
      unsubscribeDisconnect();
      clearInterval(intervalId);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchHistoryData, shouldAutoFetch, isWebSocketConnected]);

  // Hiển thị thông báo dịu dàng hơn cho bản ghi mới
  const notifyNewRecords = (newRecords) => {
    if (newRecords.length === 0) return;
    
    // Get the most recent record for notification
    const latestRecord = newRecords[0];
    
    // Hiển thị thông báo không quá phiền nhiễu
    notification.info({
      message: 'Lịch sử lịch hẹn đã được cập nhật',
      description: (
        <div>
          <p>Có {newRecords.length} bản ghi mới</p>
          <p>Thao tác mới nhất: <Tag color="blue">{getActionLabel(latestRecord.action)}</Tag></p>
          <p>Lịch hẹn: #{latestRecord.appointment_id}</p>
        </div>
      ),
      duration: 4,
      placement: 'bottomRight',
      onClick: () => {
        setNewRecordsCount(0);
        // Scroll to top of table
        document.querySelector('.history-table-container')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleActionFilterChange = (value) => {
    setActionFilter(value);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'orange',
      'PAID': 'cyan',
      'CONFIRMED': 'blue',
      'CANCELLED': 'red',
      'COMPLETED': 'green',
      'IN_PROGRESS': 'purple',
      'WAITING': 'cyan',
      'NOT_ARRIVED': 'gold'
    };
    
    return statusColors[status] || 'default';
  };

  const getActionLabel = (action) => {
    const actionLabels = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'CANCEL': 'Hủy lịch',
      'COMPLETE': 'Hoàn thành',
      'RESCHEDULE': 'Đổi lịch',
      'CONFIRM': 'Xác nhận',
      'CHANGE_STATUS': 'Đổi trạng thái',
      'ADD_SERVICE': 'Thêm dịch vụ',
      'REMOVE_SERVICE': 'Bỏ dịch vụ',
      'CHANGE_STAFF': 'Đổi nhân viên',
      'UPDATE_WEIGHT': 'Cập nhật cân nặng',
      'CREATE_ADDITIONAL_FEE': 'Tạo phí bổ sung',
      'PET_REMOVED': 'Xóa thú cưng'
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
        } else if (action === 'UPDATE' || action === 'CHANGE_STATUS' || action === 'RESCHEDULE' || action === 'CONFIRM') {
          color = 'blue';
          icon = <SwapOutlined />;
        } else if (action === 'CANCEL') {
          color = 'red';
        } else if (action === 'PET_REMOVED') {
          color = 'orange';
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
        { text: 'Đổi lịch', value: 'RESCHEDULE' },
        { text: 'Xác nhận', value: 'CONFIRM' },
        { text: 'Đổi trạng thái', value: 'CHANGE_STATUS' },
        { text: 'Cập nhật cân nặng', value: 'UPDATE_WEIGHT' },
        { text: 'Tạo phí bổ sung', value: 'CREATE_ADDITIONAL_FEE' },
        { text: 'Xóa thú cưng', value: 'PET_REMOVED' },
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
        { text: 'Chờ thanh toán', value: 'PENDING' },
        { text: 'Đã thanh toán', value: 'PAID' },
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

  const filteredData = historyData.filter(item => {
    const matchSearch = searchText ? 
      (item.userName?.toLowerCase().includes(searchText.toLowerCase()) || 
      item.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
      `#${item.appointment_id}`.includes(searchText)) : true;
    
    const matchDate = dateRange && dateRange[0] && dateRange[1] ? 
      (dayjs(item.timestamp).isAfter(dateRange[0]) && 
      dayjs(item.timestamp).isBefore(dateRange[1])) : true;
    
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
              { value: 'RESCHEDULE', label: 'Đổi lịch' },
              { value: 'CONFIRM', label: 'Xác nhận' },
              { value: 'CHANGE_STATUS', label: 'Đổi trạng thái' },
              { value: 'UPDATE_WEIGHT', label: 'Cập nhật cân nặng' },
              { value: 'CREATE_ADDITIONAL_FEE', label: 'Tạo phí bổ sung' },
              { value: 'PET_REMOVED', label: 'Xóa thú cưng' },
            ]}
          />
          <Badge count={newRecordsCount} offset={[-5, 0]}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleManualRefresh} 
              loading={refreshing}
              className="bg-[#fbb321] hover:bg-[#e59e14] text-white border-none"
            >
              Làm mới
            </Button>
          </Badge>
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
            rowClassName={(record, index) => {
              // Highlight new records
              const isNew = historyDataRef.current.indexOf(record) < newRecordsCount;
              return isNew ? 'bg-yellow-50 animate-pulse-slow' : '';
            }}
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

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            background-color: rgba(254, 240, 138, 0.2);
          }
          50% {
            background-color: rgba(254, 240, 138, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentHistory;