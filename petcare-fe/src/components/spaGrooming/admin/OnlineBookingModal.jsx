import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox, message, Tooltip, Dropdown, Space, Badge, Drawer, Tag, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, CheckOutlined, EditOutlined, DeleteOutlined, CaretDownOutlined, MoreOutlined, UserOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UpdatePetServiceModal from './UpdatePetServiceModal';
import BookingService from '../../../service/spaService/BookingService';
import dayjs from 'dayjs';

const formatDate = (dateString) => (dateString ? dayjs(dateString).format('DD/MM/YYYY') : '-');
const formatTime = (timeString) => (timeString || '-');

const OnlineBookingModal = ({ isVisible, onCancel, onlineBookings, onConfirm, refreshBookings }) => {
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [petDrawerVisible, setPetDrawerVisible] = useState(false);
  const [selectedAppointmentPets, setSelectedAppointmentPets] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Sắp xếp danh sách lịch hẹn theo thời gian (tương lai trước)
  const sortedBookings = onlineBookings?.length 
    ? [...onlineBookings].sort((a, b) => {
        const dateTimeA = dayjs(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm');
        const dateTimeB = dayjs(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm');
        return dateTimeA - dateTimeB;
      })
    : [];

  const filteredBookings = sortedBookings.length 
    ? sortedBookings.filter(booking => {
        const searchLower = searchValue.toLowerCase();
        return (
          booking.appointmentId?.toString().includes(searchValue) ||
          booking.customerName?.toLowerCase().includes(searchLower) ||
          booking.phone?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  useEffect(() => {
    setSelectedBookings([]);
  }, [isVisible, onlineBookings]);

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setIsUpdateModalVisible(true);
  };

  const handleSearchChange = (e) => setSearchValue(e.target.value);

  const toggleSelectBooking = (appointmentId) => {
    setSelectedBookings(prev => 
      prev.includes(appointmentId) ? prev.filter(id => id !== appointmentId) : [...prev, appointmentId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length 
        ? [] 
        : filteredBookings.map(booking => booking.appointmentId)
    );
  };

  const handleConfirmSelection = async () => {
    try {
      setLoading(true);
      if (selectedBookings.length === 0) {
        message.warning('Vui lòng chọn ít nhất một lịch hẹn');
        return;
      }
      await BookingService.confirmAppointments(selectedBookings);
      setSelectedBookings([]);
      message.success('Đã xác nhận lịch hẹn thành công');
      refreshBookings();
    } catch (error) {
      console.error('Error confirming appointments:', error);
      message.error(error.message || 'Không thể xác nhận lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await BookingService.cancelAppointment(appointmentId, 'Huỷ bởi quản trị viên');
      message.success('Đã huỷ lịch hẹn thành công');
      refreshBookings();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('Không thể huỷ lịch hẹn');
    }
  };

  const showPetDetails = async (appointmentId) => {
    try {
      const pets = await BookingService.getPetsByAppointmentId(appointmentId);
      setSelectedAppointmentPets(pets);
      setSelectedAppointmentId(appointmentId);
      setPetDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching pet details:', error);
      message.error('Không thể tải thông tin thú cưng');
    }
  };

  const handleDeletePet = async (appointmentId, petId) => {
    try {
      setLoading(true);
      await BookingService.removePetFromAppointment(appointmentId, petId);
      message.success(`Đã xóa thú cưng khỏi lịch hẹn #${appointmentId}`);
      setSelectedAppointmentPets(prev => prev.filter(pet => pet.id !== petId));
      refreshBookings();
    } catch (error) {
      console.error('Error removing pet from appointment:', error);
      message.error('Không thể xóa thú cưng khỏi lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handlePetNameChange = async (petId, name) => {
    try {
      await BookingService.updatePetName(petId, name);
      message.success('Đã cập nhật tên thú cưng');
      setSelectedAppointmentPets(prev => 
        prev.map(pet => pet.id === petId ? {...pet, name} : pet)
      );
    } catch (error) {
      console.error('Error updating pet name:', error);
      message.error('Không thể cập nhật tên thú cưng');
    }
  };

  console.log('Online bookings displayed in OnlineBookingModal.jsx:', filteredBookings);

  return (
    <>
      <Modal
        title={<div className="flex items-center gap-2"><span>Khách đặt online</span><span className="text-gray-400 text-sm">Chờ xác nhận ({onlineBookings?.length || 0})</span></div>}
        open={isVisible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Đóng</Button>,
          <Button 
            key="submit" 
            type="primary" 
            className="bg-green-500 hover:bg-green-600"
            loading={loading}
            disabled={selectedBookings.length === 0}
            onClick={handleConfirmSelection}
          >
            Xác nhận lịch đã chọn
          </Button>,
        ]}
        width={1100}
      >
        <div className="py-4">
          <Input
            placeholder="Nhập mã lịch hẹn, tên hoặc số điện thoại khách hàng"
            prefix={<SearchOutlined />}
            className="mb-4"
            value={searchValue}
            onChange={handleSearchChange}
          />
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left"><Checkbox checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0} indeterminate={selectedBookings.length > 0 && selectedBookings.length < filteredBookings.length} onChange={toggleSelectAll} /></th>
                <th className="p-3 text-left">Mã đặt lịch</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Thanh toán</th>
                <th className="p-3 text-left">Thú cưng</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const petCount = booking.petCount || 1;
                  
                  return (
                    <tr key={booking.appointmentId} className="border-b hover:bg-gray-50">
                      <td className="p-3"><Checkbox checked={selectedBookings.includes(booking.appointmentId)} onChange={() => toggleSelectBooking(booking.appointmentId)} /></td>
                      <td className="p-3">
                        <div className="font-medium">#{booking.appointmentId}</div>
                        <div className="text-xs text-gray-500">Online booking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Avatar size="small" icon={<UserOutlined />} className="mr-2 bg-blue-500" />
                          <div>
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-green-500 text-sm">{booking.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2 text-orange-500">
                            {dayjs(booking.date).format('D')}
                          </div>
                          <div>
                            <div>{formatDate(booking.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(booking.time)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          {booking.paidAmount > 0 ? (
                            <Tag color="green" className="rounded-full px-2">
                              Đã thanh toán: {booking.paidAmount.toLocaleString('vi-VN')}đ
                            </Tag>
                          ) : booking.depositAmount > 0 ? (
                            <Tag color="blue" className="rounded-full px-2">
                              Đã cọc: {booking.depositAmount.toLocaleString('vi-VN')}đ
                            </Tag>
                          ) : (
                            <Tag color="default" className="rounded-full px-2">Chưa thanh toán</Tag>
                          )}
                          {booking.totalAmount && (
                            <div className="text-xs text-gray-500 mt-1">Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button 
                          type="primary" 
                          size="small" 
                          ghost 
                          className="rounded-full border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600"
                          onClick={() => showPetDetails(booking.appointmentId)}
                        >
                          <span className="mr-1">{petCount}</span>
                          <span>thú cưng</span>
                        </Button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Tooltip title="Xác nhận lịch hẹn">
                            <Button 
                              type="primary"
                              size="small"
                              icon={<CheckOutlined />}
                              className="bg-green-500 hover:bg-green-600" 
                              onClick={async () => {
                                try {
                                  await BookingService.confirmAppointments([booking.appointmentId]);
                                  message.success('Đã xác nhận lịch hẹn thành công');
                                  refreshBookings();
                                } catch (error) {
                                  console.error('Error confirming appointment:', error);
                                  message.error('Không thể xác nhận lịch hẹn');
                                }
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa lịch hẹn">
                            <Button 
                              type="default" 
                              size="small"
                              icon={<EditOutlined />} 
                              onClick={() => handleEditClick(booking)}
                            />
                          </Tooltip>
                          {petCount > 1 ? (
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: '1',
                                    label: 'Xóa toàn bộ lịch hẹn',
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    onClick: () => {
                                      Modal.confirm({
                                        title: 'Xác nhận hủy lịch hẹn',
                                        icon: <ExclamationCircleOutlined />,
                                        content: `Bạn có chắc chắn muốn hủy toàn bộ lịch hẹn #${booking.appointmentId} của khách hàng ${booking.customerName}?`,
                                        okText: 'Hủy lịch',
                                        cancelText: 'Đóng',
                                        okButtonProps: { danger: true },
                                        onOk: () => handleCancelAppointment(booking.appointmentId)
                                      });
                                    }
                                  },
                                  {
                                    key: '2',
                                    label: 'Xóa bớt thú cưng',
                                    icon: <DeleteOutlined />,
                                    onClick: () => showPetDetails(booking.appointmentId)
                                  },
                                ]
                              }}
                              placement="bottomRight"
                              trigger={["click"]}
                            >
                              <Button 
                                type="default" 
                                size="small"
                                danger
                                icon={<MoreOutlined />} 
                              />
                            </Dropdown>
                          ) : (
                            <Popconfirm
                              title="Xác nhận hủy lịch hẹn"
                              description={`Bạn có chắc chắn muốn hủy lịch hẹn #${booking.appointmentId}?`}
                              onConfirm={() => handleCancelAppointment(booking.appointmentId)}
                              okText="Hủy lịch"
                              cancelText="Đóng"
                              okButtonProps={{ danger: true }}
                            >
                              <Tooltip title="Hủy lịch hẹn">
                                <Button 
                                  type="default" 
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                />
                              </Tooltip>
                            </Popconfirm>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="p-3 text-center text-gray-500">{searchValue ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn nào chờ xác nhận'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {selectedBooking && (
        <UpdatePetServiceModal
          isVisible={isUpdateModalVisible}
          onCancel={() => setIsUpdateModalVisible(false)}
          bookingData={selectedBooking}
          onSuccess={refreshBookings}
        />
      )}

      <Drawer
        title={<div className="flex items-center justify-between">
          <span>Chi tiết thú cưng - Lịch hẹn #{selectedAppointmentId}</span>
          <Space>
            <Badge count={selectedAppointmentPets.length} style={{ backgroundColor: '#1890ff' }} />
            <span>Thú cưng</span>
          </Space>
        </div>}
        placement="right"
        width={500}
        onClose={() => setPetDrawerVisible(false)}
        open={petDrawerVisible}
      >
        {selectedAppointmentPets.map((pet, index) => (
          <div key={pet.id} className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-medium">
                  {pet.name ? pet.name.charAt(0) : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={pet.name || ''}
                      placeholder="Nhập tên thú cưng"
                      size="small"
                      className="font-medium text-base mb-1 max-w-[150px]"
                      onChange={(e) => {
                        const newName = e.target.value;
                        setSelectedAppointmentPets(prev => 
                          prev.map(p => p.id === pet.id ? {...p, name: newName} : p)
                        );
                      }}
                      onBlur={(e) => {
                        if (pet.name && pet.name.trim() !== '') {
                          handlePetNameChange(pet.id, pet.name);
                        }
                      }}
                      onPressEnter={(e) => {
                        e.target.blur();
                      }}
                    />
                    <Tooltip title="Tên thú cưng sẽ tự động lưu khi bạn nhấn Enter hoặc click ra ngoài">
                      <Button
                        type="text"
                        size="small"
                        icon={<InfoCircleOutlined />}
                        className="text-gray-400"
                      />
                    </Tooltip>
                  </div>
                  <p className="text-gray-500 text-sm">{pet.type}</p>
                </div>
              </div>
              {selectedAppointmentPets.length > 1 && (
                <Popconfirm
                  title="Xóa thú cưng khỏi lịch hẹn"
                  description={`Bạn có chắc chắn muốn xóa ${pet.name || 'thú cưng này'} khỏi lịch hẹn?`}
                  onConfirm={() => handleDeletePet(selectedAppointmentId, pet.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button 
                    size="small" 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500 text-xs">Tuổi:</span>
                <span className="block font-medium">{pet.age ? `${pet.age} tuổi` : 'Không có thông tin'}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500 text-xs">Cân nặng:</span>
                <span className="block font-medium">{pet.weight ? `${pet.weight} kg` : 'Không có thông tin'}</span>
              </div>
            </div>
            
            <div className="mb-3">
              <span className="text-gray-500 text-xs block mb-1">Dịch vụ đã đặt:</span>
              <div className="flex flex-wrap gap-2">
                {pet.service ? (
                  <Tag color="blue">{pet.service}</Tag>
                ) : (
                  <Tag color="default">Không có dịch vụ</Tag>
                )}
              </div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Thành tiền:</span>
                <span className="font-bold text-orange-500">{pet.price ? pet.price.toLocaleString('vi-VN') : '0'}đ</span>
              </div>
            </div>
            
            {index < selectedAppointmentPets.length - 1 && <div className="border-b my-6"></div>}
          </div>
        ))}
      </Drawer>
    </>
  );
};

export default OnlineBookingModal;