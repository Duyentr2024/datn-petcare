import React, { useState, useEffect, useRef } from 'react';
import { Input, DatePicker, Select, Table, Tag, Button, Modal, message, Tooltip, Space, Skeleton, Empty } from 'antd';
import { SearchOutlined, CheckOutlined, FileExcelOutlined, InfoCircleOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import webSocketService from "../../../service/WebSocketService";
import './AdminAppointment.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const VITE_API_BASE_URL = 'http://api.petcarect.store';

const RefundedAppointments = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refundedData, setRefundedData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [refundNote, setRefundNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  
  const [localRefundedData, setLocalRefundedData] = useState([]);
  const webSocketInitialized = useRef(false);

  const getRefundedAppointments = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('Fetching refunded appointments...');
      }
      const response = await axios.get(`${VITE_API_BASE_URL}/api/appointments/refunded`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('API Response:', response.data);
      }
      return response.data || { data: [] };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching refunded appointments:', error);
      }
      return { data: [] };
    }
  };

  useEffect(() => {
    const fetchRefundedAppointments = async () => {
      try {
        setLoading(true);
        const response = await getRefundedAppointments();
        
        if (response.data && Array.isArray(response.data)) {
          const formattedData = response.data.map(item => ({
            ...item,
            date: item.date || '',
            time: item.time ? item.time.substring(0, 5) : '',
            refundStatus: item.refundStatus || 'PENDING',
            refundAmount: item.refundAmount || 0,
            nonRefundedDeposit: item.nonRefundedDeposit || 0,
            refundMethod: item.refundMethod || null,
            refundNote: item.refundNote || null,
            cancelReason: item.cancelReason || 'Không có'
          }));
          setLocalRefundedData(formattedData);
          setRefundedData(formattedData);
          if (import.meta.env.DEV) {
            console.log('Updated refundedData:', formattedData);
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn('No valid data returned from API, using empty array');
          }
          setLocalRefundedData([]);
          setRefundedData([]);
        }
      } catch (error) {
        console.error('Error fetching refunded appointments:', error);
        message.error('Không thể tải danh sách lịch hẹn hoàn tiền');
        setLocalRefundedData([]);
        setRefundedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRefundedAppointments();

    if (webSocketInitialized.current) return;

    if (!webSocketService.connected) {
      webSocketService.connect();
    }

    const unsubscribeConnect = webSocketService.onConnect(() => {
      if (import.meta.env.DEV) {
        console.log('RefundedAppointments: WebSocket đã kết nối');
      }
      setIsWebSocketConnected(true);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      if (import.meta.env.DEV) {
        console.log('RefundedAppointments: WebSocket đã ngắt kết nối');
      }
      setIsWebSocketConnected(false);
    });

    const handleRefundUpdate = (data) => {
      if (import.meta.env.DEV) {
        console.log('RefundedAppointments: Cập nhật trạng thái hoàn tiền qua WebSocket', data);
      }
      if (data.appointmentId && data.refundStatus) {
        message.info(`Trạng thái hoàn tiền cho lịch hẹn #${data.appointmentId} đã được cập nhật`);
        fetchRefundedAppointments();
      }
    };

    const unsubscribeRefundUpdated = webSocketService.onRefundStatusUpdated(handleRefundUpdate);

    webSocketInitialized.current = true;

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeRefundUpdated();
      webSocketInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    setRefundedData(localRefundedData);
  }, [localRefundedData]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const showRefundModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRefundMethod('CASH');
    setRefundNote('');
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleRefundMethodChange = (value) => {
    setRefundMethod(value);
    if (value === 'CASH') {
      setRefundNote('');
    }
  };

  const handleRefundConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      
      if (refundMethod === 'BANK_TRANSFER' && !refundNote.trim()) {
        message.warning('Vui lòng nhập thông tin chuyển khoản');
        return;
      }

      setLocalRefundedData(prev => {
        const updatedData = prev.filter(item => item.appointmentId !== selectedAppointment.appointmentId);
        return updatedData;
      });
      
      message.success(`Đã hoàn tiền cho lịch hẹn #${selectedAppointment.appointmentId}`);
      setIsModalVisible(false);
      
      webSocketService.notifyRefundStatusUpdated(selectedAppointment.appointmentId);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái hoàn tiền:', error);
      message.error('Không thể cập nhật trạng thái hoàn tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `${amount.toLocaleString('vi-VN')}đ` : '0đ';
  };

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
          <div>{date ? dayjs(date).format('DD/MM/YYYY') : '-'}</div>
          <div className="text-sm text-gray-500">{record.time || '-'}</div>
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

  const filteredData = refundedData.filter(item => {
    const matchSearch = searchText ? 
      (item.phone?.includes(searchText) || `#${item.appointmentId}`.includes(searchText)) : true;
    
    const matchStatus = statusFilter === 'all' ? true : 
      (statusFilter === 'pending' ? item.refundStatus === 'PENDING' : item.refundStatus === 'COMPLETED');
    
    const matchDate = dateRange && dateRange[0] && dateRange[1] ? 
      (dayjs(item.date).isAfter(dateRange[0]) && 
       dayjs(item.date).isBefore(dateRange[1])) : true;
    
    return matchSearch && matchStatus && matchDate;
  });

  if (import.meta.env.DEV) {
    console.log('Filtered Data:', filteredData);
  }

  const handleExportExcel = () => {
    message.info('Chức năng xuất Excel đang được phát triển');
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
            placeholder={['Từ ngày đặt lịch', 'Đến ngày đặt lịch']}
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
            styles={{ image: { height: 96, opacity: 0.5 } }}
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
              onClick={() => {setSearchText(''); setDateRange(null); setStatusFilter('pending');}}
              className="bg-[#fbb321] hover:bg-[#e59e14] border-none mt-4"
            >
              Xóa bộ lọc
            </Button>
          </Empty>
        </div>
      )}

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
    </div>
  );
};

export default RefundedAppointments;