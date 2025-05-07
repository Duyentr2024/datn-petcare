import React, { useState, useEffect, useRef } from 'react';
import { Input, DatePicker, Select, Table, Tag, Button, Modal, message, Tooltip, Space, Skeleton, Empty, Radio } from 'antd';
import { SearchOutlined, CheckOutlined, FileExcelOutlined, InfoCircleOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import axios from 'axios';import webSocketService from "../../../service/WebSocketService";
import BookingService from "../../../service/spaService/BookingService";
import './AdminAppointment.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [refundUserId, setRefundUserId] = useState(null); // Lưu userId của nhân viên thực hiện hoàn tiền
  
  const [localRefundedData, setLocalRefundedData] = useState([]);
  const webSocketInitialized = useRef(false);

  const fetchRefundedAppointments = async () => {
    try {
      setLoading(true);
      // Truyền filter dựa trên statusFilter
      const filter = statusFilter === 'pending' ? 'pending' : statusFilter === 'completed' ? 'completed' : 'all';
      const response = await BookingService.getRefundedAppointments(filter);
      console.log('API Response:', response);

      if (response.data && Array.isArray(response.data)) {
        const formattedData = response.data.map(item => {
          console.log('Processing item:', item);
          return {
            ...item,
            date: item.date || '',
            time: item.time ? item.time.substring(0, 5) : '',
            refundStatus: item.refundStatus || 'PENDING',
            refundAmount: item.refundAmount || 0,
            nonRefundedDeposit: item.nonRefundedDeposit || 0,
            refundMethod: item.refundMethod || null,
            refundNote: item.refundNote || null,
            cancelReason: item.cancelReason || 'Không có'
          };
        });
        console.log('Formatted Data:', formattedData);
        setLocalRefundedData(formattedData);
        setRefundedData(formattedData);
      } else {
        console.warn('No valid data returned from API, using empty array');
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

  useEffect(() => {
    fetchRefundedAppointments();

    if (webSocketInitialized.current) return;

    if (!webSocketService.connected) {
      webSocketService.connect();
    }

    const unsubscribeConnect = webSocketService.onConnect(() => {
      console.log('RefundedAppointments: WebSocket đã kết nối');
      setIsWebSocketConnected(true);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      console.log('RefundedAppointments: WebSocket đã ngắt kết nối');
      setIsWebSocketConnected(false);
    });

    const handleRefundUpdate = (data) => {
      console.log('RefundedAppointments: Cập nhật trạng thái hoàn tiền qua WebSocket', data);
      if (data.appointmentId) {
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
  }, [statusFilter]); // Thêm statusFilter vào dependency để gọi lại API khi filter thay đổi

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

  const showRefundModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setRefundMethod('CASH');
    setRefundNote('');
    setRefundUserId(null); // Reset userId trước khi lấy mới

    // Lấy userId từ lịch sử hành động nếu lịch hẹn đã được hoàn
    if (appointment.refundStatus === 'COMPLETED') {
      try {
        const userId = await BookingService.getRefundUserId(appointment.appointmentId);
        setRefundUserId(userId);
      } catch (error) {
        console.error('Error fetching refund userId:', error);
        message.error('Không thể lấy thông tin nhân viên thực hiện hoàn tiền');
      }
    }

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

      // Lấy userId từ token
      let userId;
      try {
        userId = BookingService.getCurrentUserId();
      } catch (error) {
        console.error('Error getting userId:', error);
        message.error('Không thể xác định nhân viên thực hiện hoàn tiền');
        return;
      }

      // Gọi API cập nhật trạng thái hoàn tiền
      await BookingService.updateRefundStatus(selectedAppointment.appointmentId, {
        refundStatus: 'COMPLETED',
        refundMethod,
        refundNote,
        userId
      });

      // Cập nhật local state mà không xóa lịch hẹn
      setLocalRefundedData(prev => {
        return prev.map(item => {
          if (item.appointmentId === selectedAppointment.appointmentId) {
            return {
              ...item,
              refundStatus: 'COMPLETED',
              refundMethod,
              refundNote
            };
          }
          return item;
        });
      });
      
      message.success(`Đã hoàn tiền cho lịch hẹn #${selectedAppointment.appointmentId}`);
      setIsModalVisible(false);
      
      webSocketService.notifyRefundStatusUpdated(selectedAppointment.appointmentId);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái hoàn tiền:', error);
      message.error('Không thể cập nhật trạng thái hoàn tiền: ' + (error.response?.data?.message || error.message));
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
      (dayjs(item.date).isAfter(dayjs(dateRange[0]).subtract(1, 'day')) && 
       dayjs(item.date).isBefore(dayjs(dateRange[1]).add(1, 'day'))) : true;
    
    console.log('Filtering item:', item, { matchSearch, matchStatus, matchDate });
    return matchSearch && matchStatus && matchDate;
  });

  console.log('Filtered Data:', filteredData);

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
        title={<div className="text-lg">Xác nhận hoàn tiền</div>}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={500}
        centered
      >
        {selectedAppointment && (
          <div className="space-y-5">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium">Thông tin lịch hẹn</h3>
                <Tag color="orange">#{selectedAppointment.appointmentId}</Tag>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Khách hàng:</div>
                <div className="font-medium">{selectedAppointment.customerName}</div>
                
                <div className="text-gray-500">Số điện thoại:</div>
                <div>{selectedAppointment.phone || 'Không có'}</div>
                
                <div className="text-gray-500">Ngày hẹn:</div>
                <div>{selectedAppointment.date ? dayjs(selectedAppointment.date).format('DD/MM/YYYY') : '-'}</div>
                
                <div className="text-gray-500">Giờ hẹn:</div>
                <div>{selectedAppointment.time || '-'}</div>
                
                <div className="text-gray-500">Số tiền hoàn:</div>
                <div className="font-medium text-green-600">{formatCurrency(selectedAppointment.refundAmount)}</div>
                
                {selectedAppointment.nonRefundedDeposit > 0 && (
                  <>
                    <div className="text-gray-500">Cọc không hoàn:</div>
                    <div className="text-orange-500">{formatCurrency(selectedAppointment.nonRefundedDeposit)}</div>
                  </>
                )}
                
                <div className="text-gray-500">Lý do hủy:</div>
                <div className="italic">{selectedAppointment.cancelReason || 'Không có'}</div>

                {selectedAppointment.refundStatus === 'COMPLETED' && (
                  <>
                    <div className="text-gray-500">Thực hiện bởi:</div>
                    <div>{refundUserId ? `Nhân viên ID #${refundUserId}` : 'Không xác định'}</div>
                  </>
                )}
              </div>
            </div>
            
            {selectedAppointment.refundStatus !== 'COMPLETED' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-3">Phương thức hoàn tiền</h3>
                
                <Radio.Group 
                  value={refundMethod} 
                  onChange={(e) => handleRefundMethodChange(e.target.value)}
                  className="w-full space-y-3"
                >
                  <Radio value="CASH" className="block border p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <WalletOutlined className="text-blue-500 mr-2" />
                      <span className="font-medium">Tiền mặt</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6 mt-1">
                      Hoàn tiền mặt trực tiếp cho khách hàng
                    </div>
                  </Radio>
                  
                  <Radio value="BANK_TRANSFER" className="block border p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <BankOutlined className="text-purple-500 mr-2" />
                      <span className="font-medium">Chuyển khoản</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6 mt-1">
                      Hoàn tiền qua tài khoản ngân hàng
                    </div>
                  </Radio>
                </Radio.Group>
                
                {refundMethod === 'BANK_TRANSFER' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Thông tin chuyển khoản <span className="text-red-500">*</span>
                    </label>
                    <Input.TextArea
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                      placeholder="Nhập thông tin tài khoản, số tiền, nội dung..."
                      rows={3}
                      className="w-full"
                    />
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                      <InfoCircleOutlined className="mr-1" />
                      Vui lòng nhập đầy đủ thông tin để ghi nhận vào hệ thống
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-3">
              <Button 
                onClick={handleModalCancel}
                className="min-w-[100px]"
              >
                Đóng
              </Button>
              {selectedAppointment.refundStatus !== 'COMPLETED' && (
                <Button 
                  type="primary" 
                  onClick={handleRefundConfirm}
                  loading={isSubmitting}
                  className="min-w-[100px] bg-green-500 hover:bg-green-600"
                >
                  Xác nhận
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RefundedAppointments;