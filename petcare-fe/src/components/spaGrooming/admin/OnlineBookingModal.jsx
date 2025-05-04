import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox, message, Tooltip, Dropdown, Space, Badge, Drawer, Tag, Popconfirm, Avatar, Form } from 'antd';
import { SearchOutlined, CheckOutlined, EditOutlined, DeleteOutlined, CaretDownOutlined, MoreOutlined, UserOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import ChangeDateAppointment from './ChangeDateAppointment';
import webSocketService from "../../../service/WebSocketService";
import dayjs from 'dayjs';

const VITE_API_BASE_URL = 'http://api.petcarect.store';

const formatDate = (dateString) => (dateString ? dayjs(dateString).format('DD/MM/YYYY') : '-');
const formatTime = (timeString) => (timeString || '-');

// Hàm chuẩn hóa tên thú cưng
const getPetName = (pet) => {
  return pet.name || pet['name-pet'] || pet.namePet || pet.pet_name || 'Không có tên';
};

// Hàm chuẩn hóa loại thú cưng
const formatPetType = (type) => {
  if (!type) return 'Không xác định';
  
  const typeLower = type.toLowerCase();
  if (typeLower === 'dog') return 'Chó';
  if (typeLower === 'cat') return 'Mèo';
  return type;
};

// Hàm helper để update dữ liệu cục bộ
const updateLocalBookings = (bookings, updatedBooking, action) => {
  if (action === 'REMOVE') {
    return bookings.filter(booking => booking.appointmentId !== updatedBooking.appointmentId);
  } else if (action === 'UPDATE') {
    return bookings.map(booking => 
      booking.appointmentId === updatedBooking.appointmentId ? updatedBooking : booking
    );
  } else if (action === 'ADD') {
    const exists = bookings.some(booking => booking.appointmentId === updatedBooking.appointmentId);
    return exists ? bookings : [...bookings, updatedBooking];
  }
  return bookings;
};

const confirmAppointments = async (appointmentIds) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Confirming appointments:', appointmentIds);
    }
    const response = await axios.post(`${VITE_API_BASE_URL}/api/appointments/confirm`, {
      appointmentIds
    }, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (import.meta.env.DEV) {
      console.log('Confirm appointments response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error confirming appointments:', error);
    }
    throw new Error(error.response?.data?.message || 'Không thể xác nhận lịch hẹn');
  }
};

const cancelPaidAppointments = async (payload) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Canceling appointments with payload:', payload);
    }
    const response = await axios.post(`${VITE_API_BASE_URL}/api/appointments/cancel`, payload, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (import.meta.env.DEV) {
      console.log('Cancel appointments response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error canceling appointments:', error);
    }
    throw new Error(error.response?.data?.message || 'Không thể hủy lịch hẹn');
  }
};

const getPetsByAppointmentId = async (appointmentId) => {
  try {
    if (import.meta.env.DEV) {
      console.log(`Fetching pets for appointment ID: ${appointmentId}`);
    }
    const response = await axios.get(`${VITE_API_BASE_URL}/api/appointments/${appointmentId}/pets`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    if (import.meta.env.DEV) {
      console.log('Pets response:', response.data);
    }
    return response.data || [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching pets by appointment ID:', error);
    }
    return [];
  }
};

const getAppointmentById = async (appointmentId) => {
  try {
    if (import.meta.env.DEV) {
      console.log(`Fetching appointment ID: ${appointmentId}`);
    }
    const response = await axios.get(`${VITE_API_BASE_URL}/api/appointments/${appointmentId}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    if (import.meta.env.DEV) {
      console.log('Appointment response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching appointment by ID:', error);
    }
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin lịch hẹn');
  }
};

const removePetFromAppointment = async (appointmentId, petId) => {
  try {
    if (import.meta.env.DEV) {
      console.log(`Removing pet ${petId} from appointment ${appointmentId}`);
    }
    const response = await axios.delete(`${VITE_API_BASE_URL}/api/appointments/${appointmentId}/pets/${petId}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    if (import.meta.env.DEV) {
      console.log('Remove pet response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error removing pet from appointment:', error);
    }
    throw new Error(error.response?.data?.message || 'Không thể xóa thú cưng khỏi lịch hẹn');
  }
};

const OnlineBookingModal = ({ isVisible, onCancel, onlineBookings, refreshBookings, setRefreshSlotDate }) => {
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [petDrawerVisible, setPetDrawerVisible] = useState(false);
  const [selectedAppointmentPets, setSelectedAppointmentPets] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [localBookings, setLocalBookings] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (onlineBookings?.length) {
      setLocalBookings(onlineBookings);
    }
  }, [onlineBookings]);

  useEffect(() => {
    const unsubscribeNew = webSocketService.onNewAppointment((data) => {
      if (import.meta.env.DEV) {
        console.log('New appointment via WebSocket:', data);
      }
      if (data.appointment) {
        setLocalBookings(prevBookings => updateLocalBookings(prevBookings, data.appointment, 'ADD'));
      } else {
        refreshBookings();
      }
    });

    const unsubscribeUpdate = webSocketService.onAppointmentUpdated((data) => {
      if (import.meta.env.DEV) {
        console.log('Appointment updated via WebSocket:', data);
      }
      if (data.appointment) {
        setLocalBookings(prevBookings => updateLocalBookings(prevBookings, data.appointment, 'UPDATE'));
        message.info(`Lịch hẹn #${data.appointmentId} đã được cập nhật thời gian`);
        setRefreshSlotDate(data.date);
      } else {
        refreshBookings();
      }
    });

    const unsubscribeCancel = webSocketService.onAppointmentCancelled((data) => {
      if (import.meta.env.DEV) {
        console.log('Appointment cancelled via WebSocket:', data);
      }
      if (data.appointmentId) {
        setLocalBookings(prevBookings => 
          prevBookings.filter(booking => booking.appointmentId !== data.appointmentId)
        );
        message.info(`Lịch hẹn #${data.appointmentId} đã bị hủy. Hoàn tiền: ${data.refundAmount.toLocaleString('vi-VN')}đ`);
        setRefreshSlotDate(data.date);
      } else {
        refreshBookings();
      }
    });

    const unsubscribeConfirm = webSocketService.onAppointmentConfirmed((data) => {
      if (import.meta.env.DEV) {
        console.log('Appointment confirmed via WebSocket:', data);
      }
      if (data.appointmentId) {
        setLocalBookings(prevBookings => 
          prevBookings.filter(booking => booking.appointmentId !== data.appointmentId)
        );
        message.success(`Lịch hẹn #${data.appointmentId} đã được xác nhận`);
        setRefreshSlotDate(data.date);
      }
    });

    const unsubscribePetRemoved = webSocketService.onPetRemoved((data) => {
      if (import.meta.env.DEV) {
        console.log('Pet removed via WebSocket:', data);
      }
      if (data.appointmentId) {
        if (selectedAppointmentId === data.appointmentId) {
          setSelectedAppointmentPets(prev => prev.filter(pet => pet.id !== data.petId));
        }
        if (data.petsRemaining === 0) {
          setLocalBookings(prev => prev.filter(b => b.appointmentId !== data.appointmentId));
        } else {
          getAppointmentById(data.appointmentId)
            .then(updatedAppointment => {
              if (import.meta.env.DEV) {
                console.log('Updated appointment after pet removal:', updatedAppointment);
              }
              getPetsByAppointmentId(data.appointmentId)
                .then(pets => {
                  setLocalBookings(prev => prev.map(b => 
                    b.appointmentId === data.appointmentId 
                      ? { ...b, ...updatedAppointment, petCount: pets.length } 
                      : b
                  ));
                })
                .catch(error => {
                  if (import.meta.env.DEV) {
                    console.error('Error fetching pets after pet removal:', error);
                  }
                });
            })
            .catch(error => {
              if (import.meta.env.DEV) {
                console.error('Error fetching updated appointment after pet removal:', error);
              }
              message.error('Không thể cập nhật thông tin lịch hẹn sau khi xóa thú cưng');
            });
        }
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeCancel();
      unsubscribeConfirm();
      unsubscribePetRemoved();
    };
  }, [refreshBookings, setRefreshSlotDate, selectedAppointmentId]);

  const sortedBookings = localBookings?.length 
    ? [...localBookings].sort((a, b) => {
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
    if (isVisible) {
      setSelectedBookings([]);
      form.resetFields();
    }
  }, [isVisible, form]);

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
      selectedBookings.length === filteredBookings.length && filteredBookings.length > 0 
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
      await confirmAppointments(selectedBookings);
      setSelectedBookings([]);
      message.success('Đã xác nhận lịch hẹn thành công');
      
      const firstBooking = filteredBookings.find(booking => selectedBookings.includes(booking.appointmentId));
      if (firstBooking && firstBooking.date) {
        setRefreshSlotDate(firstBooking.date);
      }
      
      refreshBookings();
    } catch (error) {
      console.error('Error confirming appointments:', error);
      message.error(error.message || 'Không thể xác nhận lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelection = () => {
    if (selectedBookings.length === 0) {
      message.warning('Vui lòng chọn ít nhất một lịch hẹn để hủy');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận hủy lịch hẹn',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          Bạn có chắc chắn muốn hủy {selectedBookings.length} lịch hẹn đã chọn không?
          <ul className="mt-2">
            {selectedBookings.map(id => {
              const booking = filteredBookings.find(b => b.appointmentId === id);
              const dateTime = dayjs(`${booking.date} ${booking.time}`, 'YYYY-MM-DD HH:mm');
              const hoursUntil = dayjs().diff(dateTime, 'hour', true);
              const isWithin12Hours = hoursUntil > -12 && hoursUntil <= 0;
              const refundAmount = isWithin12Hours ? (booking.paidAmount - booking.depositAmount) : booking.paidAmount;
              const nonRefundedDeposit = isWithin12Hours ? booking.depositAmount : 0;
              return (
                <li key={id}>
                  #{id}: Hoàn tiền: {refundAmount.toLocaleString('vi-VN')}đ
                  {nonRefundedDeposit > 0 && `, Cọc không hoàn: ${nonRefundedDeposit.toLocaleString('vi-VN')}đ`}
                </li>
              );
            })}
          </ul>
          <Form form={form} style={{ marginTop: '10px' }}>
            <Form.Item
              name="reason"
              rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
            >
              <Input placeholder="Nhập lý do hủy" />
            </Form.Item>
          </Form>
        </div>
      ),
      okText: 'Hủy lịch',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const values = await form.validateFields();
          const reason = values.reason;
          if (!reason.trim()) {
            message.warning('Vui lòng nhập lý do hủy');
            return Promise.reject();
          }
          setDeleteLoading(true);
          message.loading({ content: 'Đang hủy lịch hẹn...', key: 'bulkCancelLoading', duration: 0 });
          
          const payload = {
            appointmentIds: selectedBookings,
            reason: reason
          };
          
          const response = await cancelPaidAppointments(payload);
          
          setLocalBookings(prev => prev.filter(b => !selectedBookings.includes(b.appointmentId)));
          setSelectedBookings([]);
          form.resetFields();
          
          message.success({ 
            content: `Đã hủy ${selectedBookings.length} lịch hẹn thành công`,
            key: 'bulkCancelLoading'
          });
          
          if (response.length > 0) {
            setRefreshSlotDate(response[0].date);
          }
        } catch (error) {
          console.error('Error in bulk cancel:', error);
          message.error({ 
            content: `Không thể hủy lịch hẹn: ${error.message || 'Lỗi không xác định'}`,
            key: 'bulkCancelLoading',
            duration: 4
          });
          return Promise.reject();
        } finally {
          setDeleteLoading(false);
        }
      },
      onCancel: () => {
        form.resetFields();
      }
    });
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const booking = filteredBookings.find(b => b.appointmentId === appointmentId);
      if (!booking) {
        message.error('Không tìm thấy thông tin lịch hẹn');
        return;
      }
      
      const dateTime = dayjs(`${booking.date} ${booking.time}`, 'YYYY-MM-DD HH:mm');
      const hoursUntil = dayjs().diff(dateTime, 'hour', true);
      const isWithin12Hours = hoursUntil > -12 && hoursUntil <= 0;
      const refundAmount = isWithin12Hours ? (booking.paidAmount - booking.depositAmount) : booking.paidAmount;
      const nonRefundedDeposit = isWithin12Hours ? booking.depositAmount : 0;

      if (import.meta.env.DEV) {
        console.log('Thời gian hiện tại:', dayjs().format('DD/MM/YYYY HH:mm'));
        console.log('Thời gian lịch hẹn:', dateTime.format('DD/MM/YYYY HH:mm'));
        console.log('Hours until:', hoursUntil);
        console.log('Is within 12 hours:', isWithin12Hours);
        console.log('Refund amount:', refundAmount);
        console.log('Non-refunded deposit:', nonRefundedDeposit);
      }

      Modal.confirm({
        title: 'Xác nhận hủy lịch hẹn',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            Bạn có chắc chắn muốn hủy lịch hẹn #{appointmentId} của khách hàng {booking.customerName}?
            <p>- Số tiền hoàn: {refundAmount.toLocaleString('vi-VN')}đ</p>
            {nonRefundedDeposit > 0 && <p>- Tiền cọc không hoàn: {nonRefundedDeposit.toLocaleString('vi-VN')}đ</p>}
            <Form form={form} style={{ marginTop: '10px' }}>
              <Form.Item
                name="reason"
                rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
              >
                <Input placeholder="Nhập lý do hủy" />
              </Form.Item>
            </Form>
          </div>
        ),
        okText: 'Hủy lịch',
        okButtonProps: { danger: true },
        cancelText: 'Đóng',
        onOk: async () => {
          try {
            const values = await form.validateFields();
            const reason = values.reason;
            if (!reason.trim()) {
              message.warning('Vui lòng nhập lý do hủy');
              return Promise.reject();
            }
            message.loading({ content: 'Đang xử lý yêu cầu hủy lịch...', key: 'cancelLoading', duration: 0 });
            
            const payload = {
              appointmentIds: [appointmentId],
              reason: reason
            };
            if (import.meta.env.DEV) {
              console.log('Sending cancel payload (single booking):', payload);
            }
            
            const response = await cancelPaidAppointments(payload);
            if (import.meta.env.DEV) {
              console.log('Cancel response:', response);
            }
            
            setLocalBookings(prev => prev.filter(b => b.appointmentId !== appointmentId));
            form.resetFields();
            
            message.success({ 
              content: 'Đã hủy lịch hẹn thành công', 
              key: 'cancelLoading', 
              duration: 2 
            });
            
            if (booking.date) {
              setRefreshSlotDate(booking.date);
            }
          } catch (error) {
            console.error('Error canceling appointment:', error);
            message.error({ 
              content: `Không thể hủy lịch hẹn: ${error.message || 'Đã xảy ra lỗi khi xử lý. Vui lòng thử lại sau.'}`, 
              key: 'cancelLoading', 
              duration: 5 
            });
            return Promise.reject();
          }
        },
        onCancel: () => {
          form.resetFields();
        }
      });
    } catch (error) {
      console.error('Error in handleCancelAppointment:', error);
      message.error(`Lỗi xử lý: ${error.message || 'Đã xảy ra lỗi không xác định'}`);
    }
  };

  const showPetDetails = async (appointmentId) => {
    try {
      message.loading({ content: 'Đang tải thông tin thú cưng...', key: 'petDetailsLoading', duration: 0 });
      
      try {
        const pets = await getPetsByAppointmentId(appointmentId);
        if (import.meta.env.DEV) {
          console.log(`Pets fetched for appointment #${appointmentId}:`, pets);
        }
        
        if (!pets || pets.length === 0) {
          message.info({ 
            content: 'Không có thú cưng nào trong lịch hẹn này', 
            key: 'petDetailsLoading',
            duration: 2
          });
        } else {
          message.success({ 
            content: `Đã tải thông tin ${pets.length} thú cưng`, 
            key: 'petDetailsLoading',
            duration: 1
          });
        }
        
        setSelectedAppointmentPets(pets);
        setSelectedAppointmentId(appointmentId);
        setPetDrawerVisible(true);
      } catch (petsError) {
        console.error('Error fetching pet details:', petsError);
        message.error({ 
          content: 'Không thể tải thông tin thú cưng: ' + (petsError.message || 'Lỗi không xác định'),
          key: 'petDetailsLoading',
          duration: 3
        });
        setSelectedAppointmentPets([]);
        setSelectedAppointmentId(appointmentId);
        setPetDrawerVisible(true);
      }
    } catch (error) {
      console.error('Error in showPetDetails:', error);
      message.error({ 
        content: `Lỗi hệ thống: ${error.message || 'Đã xảy ra lỗi không xác định'}`,
        key: 'petDetailsLoading',
        duration: 4
      });
    }
  };

  const handleDeletePet = async (appointmentId, petId) => {
    try {
      message.loading({ content: 'Đang xử lý...', key: 'deletePetLoading', duration: 0 });
      
      const pets = await getPetsByAppointmentId(appointmentId);
      if (pets.length <= 1) {
        message.warning({ 
          content: 'Lịch hẹn chỉ có 1 thú cưng. Hủy toàn bộ lịch hẹn thay vì xóa thú cưng', 
          key: 'deletePetLoading' 
        });
        setTimeout(() => {
          message.destroy('deletePetLoading');
          handleCancelAppointment(appointmentId);
        }, 1000);
        return;
      }
  
      await removePetFromAppointment(appointmentId, petId);
      
      message.success({ 
        content: `Đã xóa thú cưng khỏi lịch hẹn #${appointmentId}`, 
        key: 'deletePetLoading', 
        duration: 2 
      });

      setSelectedAppointmentPets(prev => prev.filter(pet => pet.id !== petId));
      
      // Lấy thông tin lịch hẹn và danh sách thú cưng mới nhất từ backend
      const updatedAppointment = await getAppointmentById(appointmentId);
      const updatedPets = await getPetsByAppointmentId(appointmentId);
      if (import.meta.env.DEV) {
        console.log('Updated appointment after deletion:', updatedAppointment);
        console.log('Updated pets after deletion:', updatedPets);
      }
      
      setLocalBookings(prev => prev.map(b => 
        b.appointmentId === appointmentId 
          ? { ...b, ...updatedAppointment, petCount: updatedPets.length } 
          : b
      ));
      
      const booking = filteredBookings.find(b => b.appointmentId === appointmentId);
      if (booking && booking.date) {
        setRefreshSlotDate(booking.date);
      }
    } catch (error) {
      console.error('Error in pet deletion process:', error);
      message.error({ 
        content: `Không thể xóa thú cưng: ${error.message || 'Đã xảy ra lỗi không xác định'}`, 
        key: 'deletePetLoading', 
        duration: 4 
      });
    }
  };

  const handleCloseDrawer = () => {
    setPetDrawerVisible(false);
    setSelectedAppointmentPets([]); // Reset danh sách thú cưng khi đóng drawer
    setSelectedAppointmentId(null);
  };

  if (import.meta.env.DEV) {
    console.log('Online bookings displayed in OnlineBookingModal.jsx:', filteredBookings);
  }

  return (
    <>
      <Modal
        title={<div className="flex items-center gap-2"><span>Khách đặt online</span><span className="text-gray-400 text-sm">Chờ xác nhận ({onlineBookings?.length || 0})</span></div>}
        open={isVisible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Đóng</Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger
            className="bg-red-500 hover:bg-red-600"
            loading={deleteLoading}
            disabled={selectedBookings.length === 0}
            onClick={handleDeleteSelection}
          >
            Xóa
          </Button>,
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
                          {booking.paidAmount && (
                            <div className="text-xs text-gray-500 mt-1">Tổng: {booking.paidAmount.toLocaleString('vi-VN')}đ</div>
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
                                  await confirmAppointments([booking.appointmentId]);
                                  message.success('Đã xác nhận lịch hẹn thành công');
                                  setRefreshSlotDate(booking.date);
                                  refreshBookings();
                                } catch (error) {
                                  console.error('Error confirming appointment:', error);
                                  message.error(error.message || 'Không thể xác nhận lịch hẹn');
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
                                    onClick: () => handleCancelAppointment(booking.appointmentId)
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
                              description={
                                <div>
                                  Bạn có chắc chắn muốn hủy lịch hẹn #{booking.appointmentId}?
                                  <Form form={form} style={{ marginTop: '10px' }}>
                                    <Form.Item
                                      name="reason"
                                      rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
                                    >
                                      <Input placeholder="Nhập lý do hủy" />
                                    </Form.Item>
                                  </Form>
                                </div>
                              }
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
        <ChangeDateAppointment
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
        onClose={handleCloseDrawer}
        open={petDrawerVisible}
      >
        {selectedAppointmentPets.length > 0 ? (
          selectedAppointmentPets.map((pet, index) => (
            <div key={pet.id} className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-medium">
                    {getPetName(pet).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-base mb-1">
                        {getPetName(pet)}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">{formatPetType(pet.petType || pet.type)}</p>
                  </div>
                </div>
                {selectedAppointmentPets.length > 1 && (
                  <Popconfirm
                    title="Xóa thú cưng khỏi lịch hẹn"
                    description={`Bạn có chắc chắn muốn xóa ${getPetName(pet)} khỏi lịch hẹn?`}
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
              
              <div className="bg-gray-50 p-2 rounded mb-3">
                <span className="text-gray-500 text-xs">Cân nặng:</span>
                <span className="block font-medium">{pet.weightRange || 'Không có thông tin'}</span>
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
              
              {pet.note && (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                  <span className="text-gray-700 text-xs block mb-1">Ghi chú:</span>
                  <span className="text-gray-700">{pet.note}</span>
                </div>
              )}
              
              {index < selectedAppointmentPets.length - 1 && <div className="border-b my-6"></div>}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            <InfoCircleOutlined className="text-blue-500 text-2xl mb-2" />
            <p>Không có thông tin thú cưng</p>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default OnlineBookingModal;