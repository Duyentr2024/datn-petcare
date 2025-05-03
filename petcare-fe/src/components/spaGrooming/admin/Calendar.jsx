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
      const formattedType = petType.toUpperCase();
      console.log(`Fetching weights for pet type: ${formattedType}`);

      const weights = await BookingService.getPetWeightsByType(formattedType);
      console.log(`Received weights for ${formattedType}:`, weights);

      return weights.map((weight) => ({
        value: weight.id,
        label: weight.weightRange,
        active: weight.active !== false,
      }));
    } catch (error) {
      console.error(`Error fetching weights for pet type ${petType}:`, error);
      message.error(`Không thể tải danh sách cân nặng cho ${petType === 'DOG' ? 'chó' : 'mèo'}`);
      return [];
    }
  };

  const fetchSlotStatus = async (date) => {
    try {
      const response = await BookingService.getConfirmedSlots(
        date.format("YYYY-MM-DD")
      );
      const allSlots = [
        ...(response.morning || []),
        ...(response.afternoon || []),
      ];
      const slotMap = Object.fromEntries(
        allSlots.map((slot) => [
          slot.hour,
          { total: slot.totalSlots, booked: slot.bookedSlots },
        ])
      );
      setTimeSlots(slotMap);
    } catch (error) {
      console.error("Error fetching confirmed slot status:", error);
      setTimeSlots({});
      message.error("Không thể tải trạng thái slot: " + (error.message || "Lỗi không xác định"));
    }
  };

  const fetchBookedSlots = async (date, time) => {
    try {
      setLoading(true);
      let appointments = [];
      if (time) {
        const response = await BookingService.getConfirmedAppointmentsByDateAndTime(
          date.format("YYYY-MM-DD"),
          time
        );
        appointments = response;
      } else {
        const response = await BookingService.getConfirmedAppointmentsByDate(
          date.format("YYYY-MM-DD")
        );
        appointments = response;
      }
      setBookedSlots(
        appointments.map((appointment) => ({
          key: appointment.appointmentId,
          customerName: appointment.customerName,
          phone: appointment.phone,
          quantity: appointment.petCount,
          status: "confirmed",
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
    fetchBookedSlots(selectedDate, selectedTime);
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (
      refreshSlotDate &&
      refreshSlotDate === selectedDate.format("YYYY-MM-DD")
    ) {
      fetchSlotStatus(selectedDate);
      fetchBookedSlots(selectedDate, selectedTime);
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

        return {
          key: pet.id,
          petId: pet.id,
          petServiceId: pet.petServiceId || null,
          petType: petType,
          rawPetType: rawPetType,
          petName: petDisplayName,
          service: pet.serviceName || "Không có dịch vụ",
          staffId: null,
          price: pet.price || 0,
          weightRange: weightRange,
          weightId: weightId,
          appointmentId: record.key,
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

  const handleStartService = (record) => {
    setBookedSlots((prev) =>
      prev.map((slot) =>
        slot.key === record.key ? { ...slot, status: "using" } : slot
      )
    );
  };

  const handleCompleteService = (record) => {
    setBookedSlots((prev) =>
      prev.map((slot) =>
        slot.key === record.key ? { ...slot, status: "completed" } : slot
      )
    );
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
          <Button
            type={record.status === "using" ? "primary" : "default"}
            className={record.status === "using" ? "bg-blue-500" : ""}
            onClick={() => handleStartService(record)}
            disabled={
              record.status === "completed" || record.status === "cancelled"
            }
            size="small"
          >
            Đang sử dụng
          </Button>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleCompleteService(record)}
            disabled={
              record.status === "completed" ||
              record.status === "cancelled" ||
              record.status === "confirmed"
            }
            size="small"
          >
            Thanh toán
          </Button>
          <Button
            type="primary"
            danger
            className="bg-red-500 hover:bg-red-600"
            onClick={() => handleCancelService(record)}
            disabled={
              record.status === "completed" || record.status === "cancelled"
            }
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
      render: (staffId, record) => (
        <Select
          className="w-full"
          size="small"
          value={staffId}
          options={staffOptions}
          placeholder="Chọn nhân viên"
          loading={loadingStaff}
          onChange={(value) => {
            setSlotDetails((prev) =>
              prev.map((detail) =>
                detail.key === record.key ? { ...detail, staffId: value } : detail
              )
            );
          }}
        />
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "weightRange",
      key: "weightRange",
      width: 120,
      render: (weightRange, record) => (
        <div className="flex items-center space-x-2">
          <span>{weightRange || "Không xác định"}</span>
          <Button
            type="link"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditWeight(record)}
          />
        </div>
      ),
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
              locale={{ emptyText: "Không có lịch hẹn" }}
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
                        : selectedCustomer.status === "using"
                        ? "bg-blue-500"
                        : selectedCustomer.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedCustomer.status === "confirmed"
                      ? "Đã xác nhận"
                      : selectedCustomer.status === "using"
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
    </>
  );
};

export default Calendar;