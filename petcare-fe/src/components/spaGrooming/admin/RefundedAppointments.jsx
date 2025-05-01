import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, DatePicker, Select, Table, Tag, Button, Modal, message, Tooltip, Space, Skeleton, Empty } from 'antd';
import { SearchOutlined, CheckOutlined, FileExcelOutlined, InfoCircleOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import BookingService from "../../../service/spaService/BookingService";
import webSocketService from "../../../service/WebSocketService";
import './AdminAppointment.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Hàm tiện ích để cập nhật dữ liệu cục bộ
const updateRefundedData = (currentData, newData) => {
  if (!newData || !Array.isArray(newData)) return currentData;
  
  // Tạo map từ dữ liệu hiện có để dễ dàng cập nhật
  const dataMap = new Map(currentData.map(item => [item.appointmentId, item]));
  
  // Cập nhật hoặc thêm mới các mục từ dữ liệu mới
  newData.forEach(item => {
    dataMap.set(item.appointmentId, item);
  });
  
  return Array.from(dataMap.values());
};

const RefundedAppointments = () => {
  // State variables
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundedData, setRefundedData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [refundNote, setRefundNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  
  // Thêm state mới và refs cho việc cập nhật dữ liệu tốt hơn
  const [localRefundedData, setLocalRefundedData] = useState([]);
  const lastFetchRef = useRef(0);
  const currentFetchPromise = useRef(null);
  const debounceTimer = useRef(null);

  // Cải thiện fetchRefundedData thành useCallback để tối ưu performance
  const fetchRefundedData = useCallback(async (showLoading = true, force = false) => {
    // Tránh fetch liên tục trong thời gian ngắn
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) {
      console.log('Skipping refunded data fetch, too soon since last fetch');
      return;
    }
    
    // Nếu đang có một fetch đang chạy, đợi nó hoàn thành
    if (currentFetchPromise.current) {
      try {
        await currentFetchPromise.current;
      } catch (error) {
        console.error('Previous refunded data fetch failed:', error);
      }
    }
    
    try {
      if (showLoading) setLoading(true);
      
      // Lưu promise của fetch hiện tại
      const fetchPromise = BookingService.getRefundedAppointments();
      currentFetchPromise.current = fetchPromise;
      lastFetchRef.current = now;
      
      const response = await fetchPromise;
      
      // Clear promise hiện tại sau khi hoàn thành
      currentFetchPromise.current = null;
      
      // Cập nhật dữ liệu cục bộ và state
      const newData = response.data;
      
      // Nếu là lần đầu load hoặc force refresh, thay thế hoàn toàn
      if (force || localRefundedData.length === 0) {
        setLocalRefundedData(newData);
        setRefundedData(newData);
      } else {
        // Ngược lại, merge dữ liệu mới vào dữ liệu hiện có
        const updatedData = updateRefundedData(localRefundedData, newData);
        setLocalRefundedData(updatedData);
        setRefundedData(updatedData);
      }
    } catch (error) {
      console.error('Error fetching refunded appointments:', error);
      message.error('Không thể tải danh sách lịch hẹn hoàn tiền');
      // Nếu chưa có dữ liệu, set empty array
      if (localRefundedData.length === 0) {
        setRefundedData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [localRefundedData]);

  // Cải thiện WebSocket handling để tránh reload liên tục
  useEffect(() => {
    // Load dữ liệu lần đầu
    fetchRefundedData(true, true);

    // Xử lý sự kiện WebSocket
    const handleRefundUpdate = (data) => {
      console.log('RefundedAppointments: Refund update via WebSocket', data);
      
      // Tránh fetch liên tục bằng debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      if (data.appointmentId) {
        message.info(`Trạng thái hoàn tiền cho lịch hẹn #${data.appointmentId} đã được cập nhật`);
        
        // Thử cập nhật cục bộ trước
        if (data.refundStatus) {
          setLocalRefundedData(prev => {
            return prev.map(item => {
              if (item.appointmentId === data.appointmentId) {
                return { ...item, refundStatus: data.refundStatus, refundMethod: data.refundMethod, refundNote: data.refundNote };
              }
              return item;
            });
          });
        } else {
          // Nếu không có đủ thông tin, fetch lại sau một khoảng thời gian
          debounceTimer.current = setTimeout(() => {
            fetchRefundedData(false);
          }, 500);
        }
      } else {
        // Nếu không có appointmentId cụ thể, fetch lại sau một khoảng thời gian
        debounceTimer.current = setTimeout(() => {
          fetchRefundedData(false);
        }, 500);
      }
    };

    // Setup WebSocket connection if not already connected
    if (!webSocketService.connected) {
      webSocketService.connect();
    }

    // Listen for WebSocket events
    const unsubscribeConnect = webSocketService.onConnect(() => {
      console.log('RefundedAppointments: WebSocket connected');
      setIsWebSocketConnected(true);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      console.log('RefundedAppointments: WebSocket disconnected');
      setIsWebSocketConnected(false);
    });

    // Listen for refund status updates via WebSocket
    const unsubscribeRefundUpdated = webSocketService.onRefundStatusUpdated(handleRefundUpdate);

    // Fallback polling for non-WebSocket connections - ít thường xuyên hơn
    const intervalId = setInterval(() => {
      if (!isWebSocketConnected) {
        console.log('RefundedAppointments: Polling for updates because WebSocket is not connected');
        fetchRefundedData(false);
      }
    }, 30000); // 30 giây thay vì 10 giây

    return () => {
      // Cleanup WebSocket listeners
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeRefundUpdated();
      clearInterval(intervalId);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchRefundedData, isWebSocketConnected]);

  // Cập nhật state chính khi localRefundedData thay đổi
  useEffect(() => {
    setRefundedData(localRefundedData);
  }, [localRefundedData]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  // Handle date range filter change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Show refund confirmation modal
  const showRefundModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRefundMethod('CASH');
    setRefundNote('');
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Handle refund method change
  const handleRefundMethodChange = (value) => {
    setRefundMethod(value);
    if (value === 'CASH') {
      setRefundNote('');
    }
  };

  // Cải thiện handleRefundConfirm để cập nhật UI tốt hơn
  const handleRefundConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      
      // Validate bank transfer note
      if (refundMethod === 'BANK_TRANSFER' && !refundNote.trim()) {
        message.warning('Vui lòng nhập thông tin chuyển khoản');
        return;
      }

      // Call API to update refund status
      const response = await BookingService.updateRefundStatus(selectedAppointment.appointmentId, {
        refundStatus: 'COMPLETED',
        refundMethod: refundMethod,
        refundNote: refundNote || null
      });

      // Cập nhật UI ngay lập tức
      setLocalRefundedData(prev => {
        return prev.map(item => {
          if (item.appointmentId === selectedAppointment.appointmentId) {
            return { 
              ...item, 
              refundStatus: 'COMPLETED', 
              refundMethod: refundMethod,
              refundNote: refundNote || null
            };
          }
          return item;
        });
      });
      
      message.success(`Đã hoàn tiền cho lịch hẹn #${selectedAppointment.appointmentId}`);
      setIsModalVisible(false);
      
      // Notify other clients via WebSocket
      webSocketService.notifyRefundStatusUpdated(selectedAppointment.appointmentId);
    } catch (error) {
      console.error('Error updating refund status:', error);
      message.error('Không thể cập nhật trạng thái hoàn tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return amount ? `${amount.toLocaleString('vi-VN')}đ` : '0đ';
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID lịch hẹn',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      width: 120,
      render: (appointmentId) => (
        <Tooltip title="Xem chi tiết lịch hẹn">
          <Button type="link" className="text-[#fbb321] hover:text-[#e59e14] font-medium">
            #{appointmentId}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (customerName, record) => (
        <div>
          <div className="font-medium">{customerName}</div>
          <div className="text-sm text-gray-500">{record.phone || 'Không có SĐT'}</div>
        </div>
      ),
    },
    {
      title: 'Ngày/Giờ',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date, record) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-sm text-gray-500">{record.time || ''}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Số tiền hoàn',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 130,
      render: (refundAmount) => (
        <span className="font-medium text-green-600">{formatCurrency(refundAmount)}</span>
      ),
      sorter: (a, b) => a.refundAmount - b.refundAmount,
    },
    {
      title: 'Cọc không hoàn',
      dataIndex: 'nonRefundedDeposit',
      key: 'nonRefundedDeposit',
      width: 130,
      render: (nonRefundedDeposit) => {
        if (!nonRefundedDeposit) return <span className="text-gray-400">0đ</span>;
        return <span className="text-orange-500">{formatCurrency(nonRefundedDeposit)}</span>;
      },
    },
    {
      title: 'Trạng thái hoàn tiền',
      dataIndex: 'refundStatus',
      key: 'refundStatus',
      width: 150,
      render: (refundStatus) => {
        if (refundStatus === 'COMPLETED') {
          return <Tag color="green">Đã hoàn tiền</Tag>;
        }
        return <Tag color="orange">Chờ hoàn tiền</Tag>;
      },
      filters: [
        { text: 'Đã hoàn tiền', value: 'COMPLETED' },
        { text: 'Chờ hoàn tiền', value: 'PENDING' },
      ],
      onFilter: (value, record) => record.refundStatus === value,
    },
    {
      title: 'Phương thức hoàn',
      dataIndex: 'refundMethod',
      key: 'refundMethod',
      width: 150,
      render: (refundMethod) => {
        if (!refundMethod) return <span className="text-gray-400">Chưa hoàn</span>;
        
        if (refundMethod === 'CASH') {
          return <Tag icon={<WalletOutlined />} color="blue">Tiền mặt</Tag>;
        }
        
        if (refundMethod === 'BANK_TRANSFER') {
          return <Tag icon={<BankOutlined />} color="purple">Chuyển khoản</Tag>;
        }
        
        return <span>{refundMethod}</span>;
      },
      filters: [
        { text: 'Tiền mặt', value: 'CASH' },
        { text: 'Chuyển khoản', value: 'BANK_TRANSFER' },
      ],
      onFilter: (value, record) => record.refundMethod === value,
    },
    {
      title: 'Ghi chú hoàn',
      dataIndex: 'refundNote',
      key: 'refundNote',
      width: 200,
      ellipsis: true,
      render: (refundNote) => {
        if (!refundNote) return <span className="text-gray-400 italic">Không có</span>;
        return (
          <Tooltip title={refundNote}>
            <span>{refundNote}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Lý do hủy',
      dataIndex: 'cancelReason',
      key: 'cancelReason',
      width: 200,
      ellipsis: true,
      render: (cancelReason) => {
        if (!cancelReason) return <span className="text-gray-400 italic">Không có</span>;
        return (
          <Tooltip title={cancelReason}>
            <span>{cancelReason}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        if (record.refundStatus === 'COMPLETED') {
          return (
            <Button
              type="text"
              className="text-green-500"
              icon={<CheckOutlined />}
              disabled
            >
              Đã hoàn
            </Button>
          );
        }
        
        return (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => showRefundModal(record)}
            className="bg-green-500 hover:bg-green-600"
          >
            Hoàn tiền
          </Button>
        );
      },
    },
  ];

  // Filter data based on search and filters
  const filteredData = refundedData.filter(item => {
    // Filter by search text (phone number)
    const matchSearch = searchText ? 
      (item.phone?.includes(searchText) || `#${item.appointmentId}`.includes(searchText)) : true;
    
    // Filter by refund status
    const matchStatus = statusFilter === 'all' ? true : 
      (statusFilter === 'pending' ? item.refundStatus === 'PENDING' : item.refundStatus === 'COMPLETED');
    
    // Filter by date range
    const matchDate = dateRange && dateRange[0] && dateRange[1] ? 
      (dayjs(item.cancelDate || item.date).isAfter(dateRange[0]) && 
       dayjs(item.cancelDate || item.date).isBefore(dateRange[1])) : true;
    
    return matchSearch && matchStatus && matchDate;
  });

  // Function to export data to Excel
  const handleExportExcel = () => {
    message.info('Chức năng xuất Excel đang được phát triển');
    // Implementation would go here, using xlsx library
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-8">
        <WalletOutlined style={{ fontSize: '48px', color: '#fbb321', marginBottom: '16px' }} />
        <h2 className="text-xl font-semibold">Quản lý lịch hẹn hoàn tiền</h2>
        <p className="text-gray-500">Theo dõi và xử lý các lịch hẹn cần hoàn tiền</p>
      </div>
      
      <div className="flex flex-wrap justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Tìm kiếm SĐT hoặc ID lịch hẹn..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={handleSearchChange}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Chưa hoàn</Option>
            <Option value="completed">Đã hoàn</Option>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <RangePicker 
            format="DD/MM/YYYY"
            onChange={handleDateRangeChange}
            placeholder={['Từ ngày hủy', 'Đến ngày hủy']}
          />
          <Button 
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            className="bg-[#52c41a] hover:bg-[#389e0d] text-white border-none"
          >
            Xuất Excel
          </Button>
        </div>
      </div>
      
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : filteredData.length > 0 ? (
        <div className="refund-table-container">
          <Table 
            columns={columns} 
            dataSource={filteredData}
            rowKey="appointmentId"
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
                <h3 className="text-lg font-medium text-gray-600 mt-2">Không tìm thấy dữ liệu hoàn tiền</h3>
                <p className="text-gray-500">Không có bản ghi nào phù hợp với điều kiện tìm kiếm</p>
              </Space>
            }
          >
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={() => {setSearchText(''); setDateRange(null); setStatusFilter('all');}}
              className="bg-[#fbb321] hover:bg-[#e59e14] border-none mt-4"
            >
              Xóa bộ lọc
            </Button>
          </Empty>
        </div>
      )}

      {/* Modal xác nhận hoàn tiền */}
      <Modal
        title="Xác nhận hoàn tiền"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            loading={isSubmitting}
            onClick={handleRefundConfirm}
            className="bg-green-500 hover:bg-green-600"
          >
            Xác nhận hoàn tiền
          </Button>
        ]}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Lịch hẹn #{selectedAppointment.appointmentId}</p>
              <p>Khách hàng: {selectedAppointment.customerName}</p>
              <p className="text-green-600 font-medium">Số tiền hoàn: {formatCurrency(selectedAppointment.refundAmount)}</p>
              {selectedAppointment.nonRefundedDeposit > 0 && (
                <p className="text-orange-500">Cọc không hoàn: {formatCurrency(selectedAppointment.nonRefundedDeposit)}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Phương thức hoàn tiền</label>
              <Select
                value={refundMethod}
                onChange={handleRefundMethodChange}
                style={{ width: '100%' }}
              >
                <Option value="CASH">
                  <WalletOutlined className="mr-2" />
                  Tiền mặt
                </Option>
                <Option value="BANK_TRANSFER">
                  <BankOutlined className="mr-2" />
                  Chuyển khoản
                </Option>
              </Select>
            </div>
            
            {refundMethod === 'BANK_TRANSFER' && (
              <div>
                <label className="block mb-2 font-medium">Thông tin chuyển khoản <span className="text-red-500">*</span></label>
                <Input.TextArea
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  placeholder="Nhập thông tin tài khoản ngân hàng, số tiền, nội dung chuyển khoản..."
                  rows={4}
                />
                <div className="mt-1 text-gray-500 text-sm">
                  <InfoCircleOutlined className="mr-1" />
                  Thông tin này sẽ được lưu vào ghi chú hoàn tiền
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .refund-table-container .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: #111827;
          font-weight: 600;
        }
        
        .refund-table-container .ant-table-tbody > tr:hover > td {
          background-color: rgba(251, 179, 33, 0.05);
        }
        
        .refund-table-container .ant-table-row {
          transition: all 0.3s;
        }
        
        .ant-tooltip-inner {
          max-width: 300px;
        }
      `}</style>
    </div>
  );
};

export default RefundedAppointments; 