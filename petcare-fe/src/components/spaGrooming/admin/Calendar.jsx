import React, { useState, useEffect } from "react";
import { PawPrint, X, Edit } from "lucide-react";
import {
  DatePicker,
  ConfigProvider,
  Badge,
  Table,
  Button,
  Space,
  Select,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import BookingService from "../../../service/spaService/BookingService";
import UpdateWeight from "./UpdateWeight";
import PaymentSpa from "./PaymentSpa";
import "./Calendar.css";

dayjs.locale("vi");

const Calendar = ({ refreshSlotDate }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotDetails, setSlotDetails] = useState([]);
  const [isUpdateWeightModalVisible, setIsUpdateWeightModalVisible] = useState(false);
  const [selectedPetForUpdate, setSelectedPetForUpdate] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [weightOptions, setWeightOptions] = useState({});
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState(null);

  useEffect(() => {
    const fetchStaffAndWeights = async () => {
      try {
        setLoadingStaff(true);
        const employees = await BookingService.getEmployees();
        setStaffOptions(employees);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Không thể tải danh sách nhân viên: " + (error.message || "Lỗi không xác định"));
        setStaffOptions([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaffAndWeights();
  }, []);

  const fetchPetWeightsByType = async (petType) => {
    try {
      const normalizedPetType = petType.toUpperCase() === "CHÓ" || petType.toUpperCase() === "CHO" ? "DOG" : 
                               petType.toUpperCase() === "MÈO" || petType.toUpperCase() === "MEO" ? "CAT" : 
                               petType.toUpperCase();
      console.log(`Fetching weights for pet type: ${normalizedPetType}`);

      const weights = await BookingService.getPetWeightsByType(normalizedPetType);
      console.log(`Received weights for ${normalizedPetType}:`, weights);

      return weights.map((weight) => ({
        value: weight.petWeightId,
        label: weight.weightRange,
        active: weight.statusType === "ACTIVE",
      }));
    } catch (error) {
      console.error(`Error fetching weights for pet type ${petType}:`, error);
      message.error(`Không thể tải danh sách cân nặng cho ${petType === 'DOG' ? 'chó' : 'mèo'}`);
      return [];
    }
  };

  const fetchSlotStatus = async (date) => {
    try {
      const [confirmedResponse, inProgressResponse, completedResponse] = await Promise.all([
        BookingService.getConfirmedSlots(date.format("YYYY-MM-DD")),
        BookingService.getInProgressSlots(date.format("YYYY-MM-DD")),
        BookingService.getCompletedSlots(date.format("YYYY-MM-DD"))
      ]);

      const allSlotsConfirmed = [
        ...(confirmedResponse.morning || []),
        ...(confirmedResponse.afternoon || []),
      ];
      const allSlotsInProgress = [
        ...(inProgressResponse.morning || []),
        ...(inProgressResponse.afternoon || []),
      ];
      const allSlotsCompleted = [
        ...(completedResponse.morning || []),
        ...(completedResponse.afternoon || []),
      ];

      const slotMap = {};
      const allTimes = [...new Set([
        ...allSlotsConfirmed.map(slot => slot.hour),
        ...allSlotsInProgress.map(slot => slot.hour),
        ...allSlotsCompleted.map(slot => slot.hour)
      ])];

      allTimes.forEach(time => {
        const confirmedSlot = allSlotsConfirmed.find(slot => slot.hour === time) || { totalSlots: 4, bookedSlots: 0 };
        const inProgressSlot = allSlotsInProgress.find(slot => slot.hour === time) || { totalSlots: 4, bookedSlots: 0 };
        const completedSlot = allSlotsCompleted.find(slot => slot.hour === time) || { totalSlots: 4, bookedSlots: 0 };

        const totalBookedSlots = confirmedSlot.bookedSlots + inProgressSlot.bookedSlots + completedSlot.bookedSlots;
        slotMap[time] = {
          total: confirmedSlot.totalSlots,
          booked: totalBookedSlots
        };
      });

      setTimeSlots(slotMap);
    } catch (error) {
      console.error("Error fetching slot status:", error);
      setTimeSlots({});
      message.error("Không thể tải trạng thái slot: " + (error.message || "Lỗi không xác định"));
    }
  };

  const fetchBookedSlots = async (date, time) => {
    try {
      setLoading(true);
      let appointments = [];
      if (time) {
        const response = await BookingService.getActiveAppointmentsByDateAndTime(
          date.format("YYYY-MM-DD"),
          time
        );
        appointments = response.filter(appointment => appointment.time === time);
      } else {
        appointments = [];
      }
      setBookedSlots(
        appointments.map((appointment) => ({
          key: appointment.appointmentId,
          customerName: appointment.customerName,
          phone: appointment.phone,
          quantity: appointment.petCount,
          status: appointment.status ? appointment.status.toLowerCase() : "unknown",
        }))
      );
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
      message.error("Không thể tải danh sách lịch hẹn: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotStatus(selectedDate);
    if (selectedTime) {
      fetchBookedSlots(selectedDate, selectedTime);
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (
      refreshSlotDate &&
      refreshSlotDate === selectedDate.format("YYYY-MM-DD")
    ) {
      fetchSlotStatus(selectedDate);
      if (selectedTime) {
        fetchBookedSlots(selectedDate, selectedTime);
      } else {
        setBookedSlots([]);
      }
    }
  }, [refreshSlotDate, selectedDate]);

  const getSlotStatusColor = (slot) => {
    const { total, booked } = slot;
    if (booked >= total) return "#EF4444";
    if (booked > total / 2) return "#F59E0B";
    return "#10B981";
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setSelectedCustomer(null);
    setSlotDetails([]);
    fetchBookedSlots(selectedDate, time);
  };

  const handleSelectBookedSlot = async (record) => {
    setSelectedCustomer(record);
    try {
      setLoadingDetails(true);
      const response = await BookingService.getPetsByAppointmentId(record.key);
      console.log('Pet data for appointment ID', record.key, ':', response);
      if (!response || response.length === 0) {
        message.warning("Không tìm thấy thú cưng cho lịch hẹn này");
        setSlotDetails([]);
        return;
      }

      const petTypeWeightsMap = {};

      const detailsPromises = response.map(async (pet) => {
        console.log('Raw pet data:', pet);
        console.log('All properties of pet:', Object.keys(pet));

        let petDisplayName;
        if (typeof pet.namePet === 'string') {
          petDisplayName = pet.namePet;
        } else if (typeof pet.name === 'string') {
          petDisplayName = pet.name;
        } else if (pet.pet && pet.pet.name) {
          petDisplayName = pet.pet.name;
        } else {
          petDisplayName = `Thú cưng ${pet.id}`;
        }

        const rawPetType = pet.petType || pet.type || pet.pet_type || "Không xác định";
        const petType = rawPetType === "DOG" ? "Chó" : rawPetType === "CAT" ? "Mèo" : rawPetType;

        console.log('Pet name for pet ID', pet.id, ':', petDisplayName);
        console.log('Pet type for pet ID', pet.id, ':', petType);

        let weightId = pet.petWeightId || pet.weightId || pet.weight_id || null;
        const weightRange = pet.weightRange || pet.weight_range || "Không xác định";

        console.log('Weight info for pet ID', pet.id, ':', {
          weightId: weightId,
          weightRange: weightRange,
        });

        if (!petTypeWeightsMap[rawPetType]) {
          const weights = await fetchPetWeightsByType(rawPetType);
          petTypeWeightsMap[rawPetType] = weights;
          console.log(`Weights for ${rawPetType}:`, weights);

          if (!weightId && weightRange && weights.length > 0) {
            const matchingOption = weights.find(
              (option) => option.label === weightRange
            );
            if (matchingOption) {
              weightId = matchingOption.value;
            }
          }
        }

        const employeeId = pet.employeeId || null;
        const employeeName = pet.employeeName || "Không tìm thấy thông tin nhân viên";

        return {
          key: pet.id,
          petId: pet.id,
          petServiceId: pet.petServiceId || null,
          petType: petType,
          rawPetType: rawPetType,
          petName: petDisplayName,
          service: pet.serviceName || "Không có dịch vụ",
          staffId: employeeId,
          staffName: employeeName,
          price: pet.price || 0,
          weightRange: weightRange,
          weightId: weightId,
          appointmentId: record.key,
          weightUpdateCount: pet.weightUpdateCount || 0,
        };
      });

      const petDetails = await Promise.all(detailsPromises);
      console.log('Processed pet details:', petDetails);
      setSlotDetails(petDetails);
      setWeightOptions(petTypeWeightsMap);
    } catch (error) {
      console.error("Error fetching slot details:", error);
      setSlotDetails([]);
      message.error("Không thể tải chi tiết thú cưng: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartService = async (record) => {
    if (selectedCustomer && selectedCustomer.key === record.key) {
      const unassignedPets = slotDetails.filter((detail) => !detail.staffId);
      if (unassignedPets.length > 0) {
        message.error("Vui lòng gán nhân viên cho tất cả thú cưng trước khi bắt đầu sử dụng!");
        return;
      }

      const petAssignments = {};
      slotDetails.forEach((detail) => {
        petAssignments[detail.petId] = detail.staffId;
      });

      try {
        await BookingService.startService(record.key, petAssignments);
        setBookedSlots((prev) =>
          prev.map((slot) =>
            slot.key === record.key ? { ...slot, status: "in_progress" } : slot
          )
        );

        setSelectedCustomer((prev) => ({
          ...prev,
          status: "in_progress",
        }));

        message.success("Bắt đầu dịch vụ thành công!");
      } catch (error) {
        console.error("Error starting service:", error);
        message.error("Không thể bắt đầu dịch vụ: " + (error.message || "Lỗi không xác định"));
      }
    } else {
      message.error("Vui lòng chọn lịch hẹn để xem chi tiết trước khi bắt đầu sử dụng!");
    }
  };

  const handleCompleteService = async (record) => {
    await handleSelectBookedSlot(record);
    setSelectedAppointmentForPayment(record);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentModalClose = (paymentSuccess) => {
    setIsPaymentModalVisible(false);
    setSelectedAppointmentForPayment(null);
    
    if (paymentSuccess) {
      setBookedSlots((prev) =>
        prev.map((slot) =>
          slot.key === selectedCustomer.key ? { ...slot, status: "completed" } : slot
        )
      );

      if (selectedCustomer) {
        setSelectedCustomer((prev) => ({
          ...prev,
          status: "completed",
        }));
      }
      
      fetchSlotStatus(selectedDate);
      message.success("Thanh toán và hoàn thành dịch vụ thành công!");
    }
  };

  const handleCancelService = async (record) => {
    try {
      const payload = {
        appointmentIds: [record.key],
        reason: "Hủy bởi quản trị viên"
      };
      await BookingService.cancelConfirmedAppointments(payload);
      setBookedSlots((prev) =>
        prev.map((slot) =>
          slot.key === record.key ? { ...slot, status: "cancelled" } : slot
        )
      );
      message.success("Đã hủy lịch hẹn thành công");
      fetchSlotStatus(selectedDate);
      refreshSlotDate && refreshSlotDate(selectedDate.format("YYYY-MM-DD"));

      if (selectedCustomer && selectedCustomer.key === record.key) {
        setSelectedCustomer((prev) => ({
          ...prev,
          status: "cancelled",
        }));
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      message.error(error.message || "Không thể hủy lịch hẹn");
    }
  };

  const handleDeleteService = (key) => {
    setSlotDetails(slotDetails.filter((detail) => detail.key !== key));
  };

  const handleEditWeight = (record) => {
    setSelectedPetForUpdate(record);
    setIsUpdateWeightModalVisible(true);
  };

  const handleUpdateWeightCancel = () => {
    setIsUpdateWeightModalVisible(false);
    setSelectedPetForUpdate(null);
  };

  const handleUpdateSuccess = () => {
    setIsUpdateWeightModalVisible(false);
    setSelectedPetForUpdate(null);
    if (selectedCustomer) {
      handleSelectBookedSlot(selectedCustomer);
    }
  };

  const columns = [
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      ellipsis: true,
      render: (text, record) => (
        <span
          className={`cursor-pointer hover:text-blue-600 ${
            selectedCustomer?.key === record.key ? "text-blue-600 font-bold" : ""
          }`}
          onClick={() => handleSelectBookedSlot(record)}
        >
          {text}
        </span>
      ),
    },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 120 },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 50,
      align: "center",
    },
    {
      title: <div className="text-center">Hành động</div>,
      key: "action",
      width: 280,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {record.status === "confirmed" && (
            <Button
              type="default"
              onClick={() => handleStartService(record)}
              size="small"
            >
              Đang sử dụng
            </Button>
          )}
          {(record.status === "in_progress" || record.status === "confirmed") && (
            <Button
              type="primary"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => handleCompleteService(record)}
              size="small"
            >
              Thanh toán
            </Button>
          )}
          {record.status === "confirmed" && (
            <Button
              type="primary"
              danger
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleCancelService(record)}
              size="small"
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Thú cưng",
      dataIndex: "petName",
      key: "petName",
      width: 120,
      render: (_, record) => {
        console.log("Rendering pet details:", {
          petName: record.petName,
          petType: record.petType
        });
        return (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            {record.petName || "Không xác định"} ({record.petType || "Không xác định"})
          </div>
        );
      },
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      width: 150,
      render: (service) => service || "Không có dịch vụ",
    },
    {
      title: "Nhân viên",
      dataIndex: "staffId",
      key: "staffId",
      width: 150,
      render: (staffId, record) => {
        const isUsing = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "in_progress";
        const isCompleted = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "completed";

        if (isUsing || isCompleted) {
          const staff = staffOptions.find(option => option.value === staffId);
          const displayName = staff ? staff.label : record.staffName || "Không tìm thấy thông tin nhân viên";
          return (
            <span className="text-blue-600 font-medium">
              {displayName}
            </span>
          );
        }

        return (
          <Select
            className="w-full"
            size="small"
            value={staffId}
            options={staffOptions}
            placeholder="Chọn nhân viên"
            loading={loadingStaff}
            disabled={isUsing || isCompleted}
            onChange={(value) => {
              const selectedStaff = staffOptions.find(option => option.value === value);
              const selectedStaffName = selectedStaff ? selectedStaff.label : "Không tìm thấy thông tin nhân viên";
              setSlotDetails((prev) =>
                prev.map((detail) =>
                  detail.key === record.key ? { ...detail, staffId: value, staffName: selectedStaffName } : detail
                )
              );
            }}
            notFoundContent={staffOptions.length === 0 ? "Không có nhân viên khả dụng" : null}
          />
        );
      },
    },
    {
      title: "Cân nặng",
      dataIndex: "weightRange",
      key: "weightRange",
      width: 120,
      render: (weightRange, record) => {
        const isUsing = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "in_progress";
        const isCompleted = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "completed";
        return (
          <div className="flex items-center space-x-2">
            <span>{weightRange || "Không xác định"}</span>
            {record.weightUpdateCount === 0 && !isUsing && !isCompleted && (
              <Button
                type="link"
                size="small"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => handleEditWeight(record)}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      align: "right",
      render: (price) => (price || 0).toLocaleString("vi-VN") + "đ",
    },
    {
      title: "",
      key: "action",
      width: 50,
      align: "center",
      render: (_, record) => {
        const isUsing = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "in_progress";
        const isCompleted = bookedSlots.find(slot => slot.key === record.appointmentId)?.status === "completed";
        return (
          !isCompleted && (
            <Button
              type="primary"
              danger
              size="small"
              className="bg-red-500 hover:bg-red-600"
              icon={<X className="w-4 h-4" />}
              onClick={() => handleDeleteService(record.key)}
              disabled={isUsing}
            />
          )
        );
      },
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
                  backgroundColor: "#EBF5FF",
                  borderColor: "#93C5FD",
                  padding: "4px",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "center",
                  height: "auto",
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
                    ${
                      selectedTime === time
                        ? "bg-blue-100 border border-blue-400 scale-102 shadow-sm"
                        : "bg-white hover:bg-blue-50 border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-1">
                    <Badge color={getSlotStatusColor(status)} />
                    <span
                      className={`font-medium text-xs ${
                        selectedTime === time ? "text-blue-700" : ""
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span
                      className="font-bold"
                      style={{ color: getSlotStatusColor(status) }}
                    >
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
            <h3 className="text-lg font-bold text-blue-900">
              Danh sách slot đã đặt
            </h3>
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
              scroll={{ y: "calc(100vh - 400px)" }}
              className="border border-blue-200 rounded-lg"
              loading={loading}
              locale={{ emptyText: "Chưa chọn khung giờ hoặc không có lịch hẹn" }}
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
                <span className="text-sm font-medium text-gray-700">
                  Khách hàng:{" "}
                </span>
                <span className="text-sm font-bold text-blue-800">
                  {selectedCustomer.customerName}
                </span>
                <span className="text-gray-500 mx-2">|</span>
                <span className="text-sm font-medium text-gray-700">
                  Số điện thoại:{" "}
                </span>
                <span className="text-sm font-bold text-blue-800">
                  {selectedCustomer.phone}
                </span>
                <div className="mt-1 text-xs text-blue-600 italic">
                  <span
                    className={`px-1.5 py-0.5 rounded text-white ${
                      selectedCustomer.status === "confirmed"
                        ? "bg-blue-500"
                        : selectedCustomer.status === "in_progress"
                        ? "bg-blue-500"
                        : selectedCustomer.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedCustomer.status === "confirmed"
                      ? "Đã xác nhận"
                      : selectedCustomer.status === "in_progress"
                      ? "Đang sử dụng"
                      : selectedCustomer.status === "completed"
                      ? "Đã hoàn thành"
                      : "Đã hủy"}
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
              scroll={{ y: "calc(100vh - 400px)" }}
              className="border border-blue-200 rounded-lg"
              loading={loadingDetails}
              locale={{ emptyText: "Không có thú cưng" }}
            />
          </div>
        </div>
      </div>

      <UpdateWeight
        visible={isUpdateWeightModalVisible}
        onCancel={handleUpdateWeightCancel}
        pet={selectedPetForUpdate}
        weightOptions={selectedPetForUpdate ? weightOptions[selectedPetForUpdate.rawPetType] || [] : []}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <PaymentSpa
        visible={isPaymentModalVisible}
        onCancel={handlePaymentModalClose}
        appointment={selectedAppointmentForPayment}
        petDetails={slotDetails}
      />
    </>
  );
};

export default Calendar;