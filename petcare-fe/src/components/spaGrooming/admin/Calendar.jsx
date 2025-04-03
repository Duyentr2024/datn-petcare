import React, { useState, useEffect } from 'react';
import { PawPrint, Plus, X } from 'lucide-react';
import { DatePicker, ConfigProvider, Badge, Table, Button, Space, Select, Modal, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';
import BookingService from "../../../service/spaService/BookingService";
import './Calendar.css';

dayjs.locale('vi');

// Mock data giữ nguyên để không ảnh hưởng logic khác
const mockSlotStatus = {
  '2024-03-28': {
    '09:00': { total: 3, booked: 1 },
    '10:00': { total: 3, booked: 3 },
    '11:00': { total: 3, booked: 0 },
    '12:00': { total: 3, booked: 2 },
    '13:00': { total: 3, booked: 0 },
    '14:00': { total: 3, booked: 1 },
    '15:00': { total: 3, booked: 0 },
    '16:00': { total: 3, booked: 2 },
    '17:00': { total: 3, booked: 3 },
    '18:00': { total: 3, booked: 1 },
    '19:00': { total: 3, booked: 0 },
    '20:00': { total: 3, booked: 0 },
  },
};

const mockBookedSlots = [
  { key: '1', customerName: 'Nguyễn Văn A', phone: '0123456789', quantity: 2, status: 'waiting' },
  { key: '2', customerName: 'Trần Thị B', phone: '0987654321', quantity: 1, status: 'using' },
  { key: '3', customerName: 'Lê Văn C', phone: '0369852147', quantity: 3, status: 'waiting' },
];

const mockServices = [
  { value: '1', label: 'Tắm + vệ sinh', price: 200000 },
  { value: '2', label: 'Cắt tỉa lông', price: 150000 },
  { value: '3', label: 'Spa', price: 300000 },
];

const mockExistingPets = [
  { value: '1', label: 'Lucky (Chó)', type: 'Chó' },
  { value: '2', label: 'Milo (Mèo)', type: 'Mèo' },
];

const mockSlotDetails = [
  { key: '1', petId: '1', petType: 'Chó', petName: 'Lucky', service: 'Tắm + vệ sinh', staffId: '1', price: 200000 },
  { key: '2', petId: '2', petType: 'Mèo', petName: 'Milo', service: 'Cắt tỉa lông', staffId: '2', price: 150000 },
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState(mockBookedSlots);
  const [slotDetails, setSlotDetails] = useState(mockSlotDetails);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addServiceForm] = Form.useForm();
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);

  // Fetch danh sách nhân viên từ API khi component mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const employees = await BookingService.getEmployees();
        setStaffOptions(employees);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        setStaffOptions([]); // Fallback rỗng nếu lỗi
      }
    };
    fetchStaff();
  }, []);

  const fetchSlotStatus = async (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return mockSlotStatus[formattedDate] || Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => {
        const hour = String(i + 9).padStart(2, '0');
        return [`${hour}:00`, { total: 3, booked: 0 }];
      })
    );
  };

  useEffect(() => {
    const updateSlots = async () => {
      const slots = await fetchSlotStatus(selectedDate);
      setTimeSlots(slots);
    };
    updateSlots();
  }, [selectedDate]);

  const getSlotStatusColor = (slot) => {
    const { total, booked } = slot;
    if (booked >= total) return '#EF4444';
    if (booked > total / 2) return '#F59E0B';
    return '#10B981';
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setSelectedCustomer(null);
  };

  const handleSelectBookedSlot = (record) => {
    setSelectedCustomer(record);
  };

  const handleStartService = (record) => {
    setBookedSlots(prev =>
      prev.map(slot => (slot.key === record.key ? { ...slot, status: 'using' } : slot))
    );
  };

  const handleCompleteService = (record) => {
    setBookedSlots(prev =>
      prev.map(slot => (slot.key === record.key ? { ...slot, status: 'completed' } : slot))
    );
  };

  const handleCancelService = (record) => {
    setBookedSlots(prev =>
      prev.map(slot => (slot.key === record.key ? { ...slot, status: 'cancelled' } : slot))
    );
  };

  const handleAddService = () => {
    setIsAddModalVisible(true);
    addServiceForm.resetFields();
  };

  const handleAddModalOk = () => {
    addServiceForm.validateFields().then(values => {
      const newService = {
        key: Date.now().toString(),
        petId: values.petId,
        petType: values.isNewPet ? values.petType : mockExistingPets.find(p => p.value === values.petId)?.type,
        petName: values.isNewPet ? values.petName : mockExistingPets.find(p => p.value === values.petId)?.label.split(' (')[0],
        service: mockServices.find(s => s.value === values.serviceId)?.label,
        staffId: values.staffId,
        price: mockServices.find(s => s.value === values.serviceId)?.price,
      };
      setSlotDetails([...slotDetails, newService]);
      setIsAddModalVisible(false);
      addServiceForm.resetFields();
    });
  };

  const handlePetSelectionChange = (value, option) => {
    if (value === 'new') {
      setSelectedPetType(null);
      addServiceForm.setFieldsValue({ petType: null, petName: '' });
    } else {
      const pet = mockExistingPets.find(p => p.value === value);
      setSelectedPetType(pet.type);
      addServiceForm.setFieldsValue({ petType: pet.type });
    }
  };

  const handleDeleteService = (key) => {
    setSlotDetails(slotDetails.filter(detail => detail.key !== key));
  };

  const columns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true,
      render: (text, record) => (
        <span
          className={`cursor-pointer hover:text-blue-600 ${selectedCustomer?.key === record.key ? 'text-blue-600 font-bold' : ''}`}
          onClick={() => handleSelectBookedSlot(record)}
        >
          {text}
        </span>
      ),
    },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 50, align: 'center' },
    {
      title: <div className="text-center">Hành động</div>,
      key: 'action',
      width: 280,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type={record.status === 'using' ? 'primary' : 'default'}
            className={record.status === 'using' ? 'bg-blue-500' : ''}
            onClick={() => handleStartService(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
            size="small"
          >
            Đang sử dụng
          </Button>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleCompleteService(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled' || record.status === 'waiting'}
            size="small"
          >
            Thanh toán
          </Button>
          <Button
            type="primary"
            danger
            className="bg-red-500 hover:bg-red-600"
            onClick={() => handleCancelService(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
            size="small"
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: 'Thú cưng',
      dataIndex: 'petName',
      key: 'petName',
      width: 120,
      render: (petName, record) => `${petName} (${record.petType})`,
    },
    { title: 'Dịch vụ', dataIndex: 'service', key: 'service', width: 150 },
    {
      title: 'Nhân viên',
      dataIndex: 'staffId',
      key: 'staffId',
      width: 150,
      render: (staffId) => (
        <Select
          className="w-full"
          size="small"
          value={staffId}
          options={staffOptions}
          placeholder="Chọn nhân viên"
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price) => price.toLocaleString('vi-VN') + 'đ',
    },
    {
      title: (
        <Button
          type="primary"
          size="small"
          className="bg-blue-500 hover:bg-blue-600"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAddService}
        />
      ),
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          className="bg-red-500 hover:bg-red-600"
          icon={<X className="w-4 h-4" />}
          onClick={() => handleDeleteService(record.key)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex h-[calc(100vh-280px)] bg-blue-50 p-3 rounded-lg">
        <div className="w-1/12 pr-2 border-r border-blue-200">
          <div className="flex items-center gap-1.5">
            <PawPrint className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900 truncate">Lịch</h3>
          </div>
          <div className="relative my-3">
            <div className="absolute left-0 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-[2px] w-full bg-gradient-to-r from-blue-400 via-blue-200 to-transparent"></div>
            <div className="absolute right-0 w-1 h-1 bg-blue-200 rounded-full"></div>
          </div>
          <div className="overflow-auto h-[calc(100%-3.5rem)]">
            <ConfigProvider locale={locale}>
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                format="DD/MM/YYYY"
                className="custom-datepicker w-full"
                style={{
                  backgroundColor: '#EBF5FF',
                  borderColor: '#93C5FD',
                  padding: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textAlign: 'center',
                  height: 'auto',
                }}
                allowClear={false}
                showToday={true}
                placement="bottomLeft"
                inputReadOnly={true}
                suffixIcon={null}
              />
            </ConfigProvider>
            <div className="mt-2 space-y-0.5">
              {Object.entries(timeSlots).map(([time, status]) => (
                <div
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`flex items-center justify-between px-1.5 py-0.5 rounded-lg cursor-pointer transition-all duration-200 transform
                    ${selectedTime === time ? 'bg-blue-100 border border-blue-400 scale-102 shadow-sm' : 'bg-white hover:bg-blue-50 border border-transparent'}`}
                >
                  <div className="flex items-center gap-1">
                    <Badge color={getSlotStatusColor(status)} />
                    <span className={`font-medium text-xs ${selectedTime === time ? 'text-blue-700' : ''}`}>
                      {time}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold" style={{ color: getSlotStatusColor(status) }}>
                      {status.total - status.booked}
                    </span>
                    <span className="text-gray-500">/{status.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-5/12 px-2 border-r border-blue-200">
          <div className="flex items-center gap-1.5">
            <PawPrint className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Danh sách slot đã đặt</h3>
          </div>
          <div className="relative my-3">
            <div className="absolute left-0 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-[2px] w-full bg-gradient-to-r from-blue-400 via-blue-200 to-transparent"></div>
            <div className="absolute right-0 w-1 h-1 bg-blue-200 rounded-full"></div>
          </div>
          <div className="overflow-auto h-[calc(100%-3.5rem)]">
            <Table
              columns={columns}
              dataSource={bookedSlots}
              pagination={false}
              size="small"
              scroll={{ y: 'calc(100vh - 400px)' }}
              className="border border-blue-200 rounded-lg"
            />
          </div>
        </div>
        <div className="w-6/12 pl-2">
          <div className="flex items-center gap-1.5">
            <PawPrint className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Chi tiết slot</h3>
          </div>
          <div className="relative my-3">
            <div className="absolute left-0 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-[2px] w-full bg-gradient-to-r from-blue-400 via-blue-200 to-transparent"></div>
            <div className="absolute right-0 w-1 h-1 bg-blue-200 rounded-full"></div>
          </div>
          <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            {selectedCustomer ? (
              <>
                <span className="text-sm font-medium text-gray-700">Khách hàng: </span>
                <span className="text-sm font-bold text-blue-800">{selectedCustomer.customerName}</span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-sm font-medium text-gray-700">Số điện thoại: </span>
                <span className="text-sm font-bold text-blue-800">{selectedCustomer.phone}</span>
                <div className="mt-1 text-xs text-blue-600 italic">
                  <span
                    className={`px-1.5 py-0.5 rounded text-white ${
                      selectedCustomer.status === 'waiting'
                        ? 'bg-yellow-500'
                        : selectedCustomer.status === 'using'
                        ? 'bg-blue-500'
                        : selectedCustomer.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {selectedCustomer.status === 'waiting'
                      ? 'Đang chờ'
                      : selectedCustomer.status === 'using'
                      ? 'Đang sử dụng'
                      : selectedCustomer.status === 'completed'
                      ? 'Đã hoàn thành'
                      : 'Đã hủy'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Chọn một khách hàng từ danh sách để xem chi tiết.
              </div>
            )}
          </div>
          <div className="overflow-auto h-[calc(100%-7rem)]">
            <Table
              columns={detailColumns}
              dataSource={slotDetails}
              pagination={false}
              size="small"
              scroll={{ y: 'calc(100vh - 400px)' }}
              className="border border-blue-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      <Modal
        title="Thêm dịch vụ"
        open={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        width={600}
      >
        <Form form={addServiceForm} layout="vertical" initialValues={{ isNewPet: false }}>
          <Form.Item
            name="petId"
            label="Chọn thú cưng"
            rules={[{ required: true, message: 'Vui lòng chọn thú cưng' }]}
          >
            <Select
              placeholder="Chọn thú cưng"
              onChange={handlePetSelectionChange}
              options={[...mockExistingPets, { value: 'new', label: '+ Thêm thú cưng mới' }]}
            />
          </Form.Item>
          {addServiceForm.getFieldValue('petId') === 'new' && (
            <>
              <Form.Item
                name="petType"
                label="Loại thú cưng"
                rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng' }]}
              >
                <Select
                  placeholder="Chọn loại thú cưng"
                  options={[
                    { value: 'Chó', label: 'Chó' },
                    { value: 'Mèo', label: 'Mèo' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="petName"
                label="Tên thú cưng"
                rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng' }]}
              >
                <Input placeholder="Nhập tên thú cưng" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="serviceId"
            label="Dịch vụ"
            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
          >
            <Select placeholder="Chọn dịch vụ" options={mockServices} />
          </Form.Item>
          <Form.Item
            name="staffId"
            label="Nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          >
            <Select placeholder="Chọn nhân viên" options={staffOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Calendar;