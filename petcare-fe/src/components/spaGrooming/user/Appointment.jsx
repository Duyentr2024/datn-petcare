
import React, { useState, useEffect, useRef } from "react";
import {
  FaBath,
  FaCalendarAlt,
  FaClock,
  FaSpa,
  FaHome,
  FaChevronRight,
  FaSyncAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";
import { Client } from '@stomp/stompjs';
import { Link, useNavigate, useLocation } from "react-router-dom";
import BookingService from "../../../service/spaService/BookingService";
import PetServiceService from "../../../service/spaService/PetServiceService";
import PetWeightService from "../../../service/spaService/PetWeightService";
import ServiceModal from "./ServiceModal";
import CustomerModal from "./CustomerModal";
import "./appointment.css";

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [userBookedSlots, setUserBookedSlots] = useState([]);
  const [allBookedSlots, setAllBookedSlots] = useState([]);
  const [pets, setPets] = useState([
    { id: 1, petType: "", service: "", weight: "", note: "", price: 0 },
  ]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    acceptTerms: false,
    paymentType: "",
  });
  const [errors, setErrors] = useState({ fullName: "", phone: "" });
  const [selectedSession, setSelectedSession] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [serviceErrors, setServiceErrors] = useState({ petCount: false, petInfo: false });
  const [isBookingEnabled, setIsBookingEnabled] = useState(true);
  const [timeSlotsState, setTimeSlotsState] = useState({ morning: [], afternoon: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [serviceOptions, setServiceOptions] = useState({ cat: [], dog: [] });
  const [weightOptions, setWeightOptions] = useState({ cat: [], dog: [] });
  const [selectedTimeBlock, setSelectedTimeBlock] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        reconnectDelay: 5000,
        onConnect: () => {
            client.subscribe('/topic/slots', (message) => {
                const updatedDate = message.body;
                const currentDateStr = selectedDate.toISOString().split("T")[0];
                if (updatedDate === currentDateStr) {
                    console.log("Received slot update, refreshing...");
                    fetchBookingStatusAndSlots();
                }
            });
        },
    });

    client.activate();

    return () => {
        client.deactivate();
    };
}, [selectedDate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get("date");
    const isFromPayment = urlParams.get("source") === "payment";
    
    if (dateParam) {
      const dateFromUrl = new Date(dateParam);
      if (!isNaN(dateFromUrl.getTime())) {
        setSelectedDate(dateFromUrl);
      }
    }
    
    if (isFromPayment) {
      setBookingSuccess(true);
      
      // Lấy thông tin slot đã đặt từ localStorage
      const localBookedSlotsData = localStorage.getItem('lastBookedSlots');
      const localAppointmentDate = localStorage.getItem('lastAppointmentDate');
      
      if (localBookedSlotsData && localAppointmentDate) {
        try {
          const localBookedSlots = JSON.parse(localBookedSlotsData);
          console.log('Found booked slots in localStorage:', localBookedSlots);
          
          if (localBookedSlots.length > 0) {
            // Tạo định dạng slot ID hợp lệ (HH:MM-index)
            const processedSlots = localBookedSlots.map(slot => 
              `${slot.time}-${slot.slotIndex}`
            );
            
            // Cập nhật trạng thái các slot đã đặt
            setUserBookedSlots(prev => [...prev, ...processedSlots]);
            setAllBookedSlots(prev => [...prev, ...processedSlots]);
            
            console.log('Added booked slots from localStorage:', processedSlots);
          }
        } catch (error) {
          console.error('Error parsing booked slots from localStorage:', error);
        }
      }
    }
  }, []);
  useEffect(() => {
    // Fetch dữ liệu ban đầu
    fetchBookingStatusAndSlots();

    // Thiết lập interval để refresh dữ liệu thường xuyên
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing slot data...');
      if (selectedDate) {
        fetchBookingStatusAndSlots();
      }
    }, 30000); // 30 giây

    // Cleanup khi component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedDate]);

  useEffect(() => {
    const generateWeekDates = () => {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
      setWeekDates(dates);

      const urlParams = new URLSearchParams(location.search);
      const dateParam = urlParams.get("date");

      if (dateParam) {
        const dateFromUrl = new Date(dateParam);
        if (!isNaN(dateFromUrl.getTime())) {
          setSelectedDate(dateFromUrl);
        }
      } else if (selectedDate.getTime() === 0) {
        setSelectedDate(today);
      }
    };

    generateWeekDates();
  }, []);

  const fetchBookedSlots = async (date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      console.log(`Fetching booked slots for date: ${dateStr}`);
      
      // Khởi tạo mảng lưu trữ slots
      const userSlots = [];
      const allSlots = [];
      
      // THAY ĐỔI: Gọi API để lấy slot đã đặt TRƯỚC KHI kiểm tra localStorage
      // để đảm bảo dữ liệu từ server luôn được ưu tiên
      // Gọi API để lấy thêm slots đã đặt (có thể bao gồm cả slots từ người dùng khác)
      const response = await BookingService.getBookedSlots(dateStr);
      console.log("API response for booked slots:", response);
  
      // Kiểm tra nếu response có bookedSlots
      if (response && response.bookedSlots && Array.isArray(response.bookedSlots)) {
        response.bookedSlots.forEach(slot => {
          if (slot && typeof slot.time === 'string') {
            const slotId = `${slot.time}-${slot.slotIndex || 0}`;
            
            // Thêm vào danh sách tất cả slots
            if (!allSlots.includes(slotId)) {
              allSlots.push(slotId);
            }
  
            if (slot.isCurrentUser && !userSlots.includes(slotId)) {
              userSlots.push(slotId);
            }
          } else {
            console.warn("Invalid slot format:", slot);
          }
        });
      }
      
      // Check localStorage AFTER API call to add any missing session-specific slots
      const localDate = localStorage.getItem('lastAppointmentDate');
      const localBookedSlotsData = localStorage.getItem('lastBookedSlots');
      
      console.log(`LocalStorage check: localDate=${localDate}, current dateStr=${dateStr}`);
      console.log(`LocalStorage slots data: ${localBookedSlotsData}`);
      
      // Nếu có dữ liệu từ localStorage và trùng với ngày đang xem
      if (localDate === dateStr && localBookedSlotsData) {
        try {
          const localBookedSlots = JSON.parse(localBookedSlotsData);
          console.log('LocalStorage slots parsed:', localBookedSlots);
          
          if (localBookedSlots.length > 0) {
            // Tạo định dạng slot ID hợp lệ (HH:MM-index)
            localBookedSlots.forEach(slot => {
              const slotId = `${slot.time}-${slot.slotIndex}`;
              
              // Thêm vào danh sách slots của user
              if (!userSlots.includes(slotId)) {
                userSlots.push(slotId);
              }
              
              // Thêm vào danh sách tất cả slots
              if (!allSlots.includes(slotId)) {
                allSlots.push(slotId);
              }
            });
            
            console.log('Added slots from localStorage:', {
              userSlots,
              allSlots
            });
          }
        } catch (error) {
          console.error('Error parsing local booked slots:', error);
        }
      }
      
      console.log("Final booked slots after merging:", {
        userSlots,
        allSlots
      });
      
      // Cập nhật state
      setUserBookedSlots(userSlots);
      setAllBookedSlots(allSlots);
    } catch (error) {
      console.error('Error in fetchBookedSlots:', error);
      // Mặc dù có lỗi, vẫn hiển thị dữ liệu từ localStorage nếu có
      const localDate = localStorage.getItem('lastAppointmentDate');
      const localBookedSlotsData = localStorage.getItem('lastBookedSlots');
      const dateStr = date.toISOString().split("T")[0];
      
      if (localDate === dateStr && localBookedSlotsData) {
        try {
          const localBookedSlots = JSON.parse(localBookedSlotsData);
          const userSlots = [];
          const allSlots = [];
          
          localBookedSlots.forEach(slot => {
            const slotId = `${slot.time}-${slot.slotIndex}`;
            userSlots.push(slotId);
            allSlots.push(slotId);
          });
          
          setUserBookedSlots(userSlots);
          setAllBookedSlots(allSlots);
        } catch (localError) {
          console.error('Error using localStorage as fallback:', localError);
          setUserBookedSlots([]);
          setAllBookedSlots([]);
        }
      } else {
        setUserBookedSlots([]);
        setAllBookedSlots([]);
      }
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookingStatusAndSlots = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const status = await BookingService.getBookingStatus();
        setIsBookingEnabled(status);

        if (status) {
            console.log("Selected date in fetchBookingStatusAndSlots:", selectedDate);
            const dateStr = selectedDate.toISOString().split("T")[0];
            const data = await BookingService.getAvailableSlots(dateStr);
            console.log("Time slots from server:", data);

            await fetchBookedSlots(selectedDate);

            const morningSlots = data?.morning || [];
            const afternoonSlots = data?.afternoon || [];

            const processedMorning = morningSlots.map(slot => ({
                hour: slot.hour || slot.time,
                totalSlots: slot.totalSlots || 4,
                bookedSlots: slot.bookedSlots || 0,
                availableSlots: slot.availableSlots || (slot.totalSlots - slot.bookedSlots) || 4,
                active: slot.active !== false && slot.isActive !== false,
            }));

            const processedAfternoon = afternoonSlots.map(slot => ({
                hour: slot.hour || slot.time,
                totalSlots: slot.totalSlots || 4,
                bookedSlots: slot.bookedSlots || 0,
                availableSlots: slot.availableSlots || (slot.totalSlots - slot.bookedSlots) || 4,
                active: slot.active !== false && slot.isActive !== false,
            }));

            // Log chi tiết khung giờ 18:00
            const slot1800 = processedAfternoon.find(slot => slot.hour === "18:00");
            if (slot1800) {
                console.log("Processed slot 18:00 details:", slot1800);
            } else {
                console.log("Slot 18:00 not found in processed afternoon slots");
            }

            console.log("Processed morning slots:", processedMorning);
            console.log("Processed afternoon slots:", processedAfternoon);

            setTimeSlotsState({ morning: processedMorning, afternoon: processedAfternoon });
        } else {
            setTimeSlotsState({ morning: [], afternoon: [] });
        }
    } catch (error) {
        console.error("Error fetching time slots:", error);
        setError("Không thể tải thông tin khung giờ. Vui lòng thử lại sau.");
        setTimeSlotsState({ morning: [], afternoon: [] });
    } finally {
        setIsLoading(false);
    }
};

  useEffect(() => {
    fetchBookingStatusAndSlots();
  }, [selectedDate]);

  useEffect(() => {
    // Auto refresh slots data mỗi 30 giây
    const autoRefreshInterval = setInterval(() => {
      console.log("Auto-refreshing slot data...");
      fetchBookingStatusAndSlots();
    }, 30000); // 30 giây
    
    // Clean up interval
    return () => clearInterval(autoRefreshInterval);
  }, [selectedDate]);

  // Khi component mount hoặc unmount
  useEffect(() => {
    window.updateAppointment = () => fetchBookingStatusAndSlots();
    
    // Thêm hàm listener để bắt sự kiện từ browser storage
    // Điều này giúp đồng bộ giữa các tab/window của cùng một browser
    const handleStorageChange = (e) => {
      if (e.key === 'lastBookedSlots' || e.key === 'lastAppointmentDate') {
        console.log("LocalStorage changed, refreshing data");
        fetchBookingStatusAndSlots();
      }
    };
    
    // Đăng ký listener
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.updateAppointment = null;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isSlotBooked = (time, slotIndex) => {
    const slotId = `${time}-${slotIndex}`;
    return selectedSlots.includes(slotId);
  };

  useEffect(() => {
    const fetchServicesAndWeights = async () => {
      try {
        const catServices = await PetServiceService.getServicesByPetType("CAT");
        const dogServices = await PetServiceService.getServicesByPetType("DOG");
        const catWeights = await PetWeightService.getWeightsByPetType("CAT");
        const dogWeights = await PetWeightService.getWeightsByPetType("DOG");

        setServiceOptions({
          cat: catServices
            .filter((service) => service.statusType === "ACTIVE")
            .map((service) => ({
              value: service.id.toString(),
              label: service.serviceName,
              price: Number(service.basePrice),
            })),
          dog: dogServices
            .filter((service) => service.statusType === "ACTIVE")
            .map((service) => ({
              value: service.id.toString(),
              label: service.serviceName,
              price: Number(service.basePrice),
            })),
        });

        setWeightOptions({
          cat: catWeights
            .filter((weight) => weight.statusType === "ACTIVE")
            .map((weight) => ({
              value: weight.petWeightId.toString(),
              label: weight.weightRange,
              priceMultiplier: weight.priceMultiplier,
            })),
          dog: dogWeights
            .filter((weight) => weight.statusType === "ACTIVE")
            .map((weight) => ({
              value: weight.petWeightId.toString(),
              label: weight.weightRange,
              priceMultiplier: weight.priceMultiplier,
            })),
        });
      } catch (error) {
        console.error("Error fetching services and weights:", error);
        setServiceOptions({
          cat: [
            { value: "basic", label: "Tắm + vệ sinh", price: 150000 },
            { value: "full", label: "Tắm + vệ sinh + cắt tỉa lông", price: 250000 },
            { value: "spa", label: "Spa cao cấp", price: 350000 },
          ],
          dog: [
            { value: "basic", label: "Tắm + vệ sinh", price: 200000 },
            { value: "full", label: "Tắm + vệ sinh + cắt tỉa lông", price: 300000 },
            { value: "spa", label: "Spa cao cấp", price: 400000 },
          ],
        });
        setWeightOptions({
          cat: [
            { value: "small", label: "Dưới 3kg", priceMultiplier: 1 },
            { value: "medium", label: "3kg - 5kg", priceMultiplier: 1.2 },
            { value: "large", label: "Trên 5kg", priceMultiplier: 1.4 },
          ],
          dog: [
            { value: "small", label: "Dưới 10kg", priceMultiplier: 1 },
            { value: "medium", label: "10kg - 20kg", priceMultiplier: 1.3 },
            { value: "large", label: "20kg - 40kg", priceMultiplier: 1.6 },
            { value: "xlarge", label: "Trên 40kg", priceMultiplier: 2 },
          ],
        });
      }
    };
    fetchServicesAndWeights();
  }, []);

  const isSlotDisabled = (time) => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hour, minute] = time.split(":").map(Number);
    selectedDateTime.setHours(hour, minute, 0, 0);
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);
    return selectedDateTime < oneHourLater;
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);

  const formatDayDate = (date) => ({
    day: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
    date: new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric" }).format(date),
  });

  const handleSlotSelection = (time, slotIndex) => {
    const slotId = `${time}-${slotIndex}`;
    
    // Kiểm tra xem slot đã được đặt bởi người khác chưa
    const isBookedByOthers = allBookedSlots.includes(slotId) && !userBookedSlots.includes(slotId);
    
    // Kiểm tra xem slot đã được đặt bởi người dùng hiện tại chưa
    const isBookedByUser = userBookedSlots.includes(slotId);
    
    // Nếu slot đã đặt, không cho phép chọn
    if (isBookedByOthers || isBookedByUser) {
      return;
    }
    
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hour, minute] = time.split(":").map(Number);
    selectedDateTime.setHours(hour, minute, 0, 0);
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);

    if (selectedDateTime < oneHourLater) {
      showToast("Bạn chỉ có thể đặt lịch trước ít nhất 1 giờ.", "warning");
      return;
    }

    // Lấy block thời gian hiện tại
    const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === time);
    if (!currentTimeBlock) return;
    
    // Xác định số slot còn trống
    const availableSlots = currentTimeBlock.availableSlots !== undefined 
      ? currentTimeBlock.availableSlots 
      : (currentTimeBlock.totalSlots - (allBookedSlots.filter(s => s.startsWith(`${time}-`)).length - userBookedSlots.filter(s => s.startsWith(`${time}-`)).length));
    
    setSelectedSlots((prev) => {
      // Nếu slot đã được chọn, bỏ chọn nó
      if (prev.includes(slotId)) {
        return prev.filter((slot) => slot !== slotId);
      }
      
      // Nếu chưa chọn, kiểm tra xem có thể chọn thêm không
      const currentSelectedCount = prev.filter(s => s.startsWith(`${time}-`)).length;
      
      // Nếu đã chọn đủ số slot có sẵn, không cho chọn thêm
      if (currentSelectedCount >= availableSlots) {
        showToast(`Bạn chỉ có thể chọn tối đa ${availableSlots} slot cho khung giờ này.`, "warning");
        return prev;
      }
      
      // Nếu còn slot trống, cho phép chọn thêm
      return [...prev, slotId];
    });
  };

  const handlePetChange = (index, field, value) => {
    setPets((prevPets) => {
      const newPets = [...prevPets];
      const updatedPet = { ...newPets[index], [field]: value };

      if (field === "petType") {
        updatedPet.service = "";
        updatedPet.weight = "";
        updatedPet.price = 0;
      }

      if (updatedPet.petType && updatedPet.service && updatedPet.weight) {
        const selectedService = serviceOptions[updatedPet.petType.toLowerCase()]?.find(
          (s) => s.value === updatedPet.service
        );
        const selectedWeight = weightOptions[updatedPet.petType.toLowerCase()]?.find(
          (w) => w.value === updatedPet.weight
        );
        if (selectedService && selectedWeight) {
          updatedPet.price = selectedService.price * selectedWeight.priceMultiplier;
        } else {
          updatedPet.price = 0;
        }
      } else {
        updatedPet.price = 0;
      }

      // Nếu thay đổi tên và thú cưng đã có ID trong DB, cập nhật lên server
      if (field === 'name' && updatedPet.id && !isNaN(updatedPet.id) && updatedPet.id > 0) {
        // Gọi API cập nhật tên thú cưng nếu có ID
        try {
          BookingService.updatePetName(updatedPet.id, value)
            .then(() => console.log(`Đã cập nhật tên thú cưng ID ${updatedPet.id} thành ${value}`))
            .catch(err => console.error('Lỗi khi cập nhật tên thú cưng:', err));
        } catch (error) {
          console.error('Lỗi khi gọi API cập nhật tên thú cưng:', error);
        }
      }

      newPets[index] = updatedPet;
      return newPets;
    });
  };

  const calculateDeposit = () => selectedSlots.length * 50000;

  const addNewPet = () => {
    if (pets.length < selectedSlots.length) {
      setPets([...pets, { id: pets.length + 1, petType: "", service: "", weight: "", note: "", price: 0 }]);
    }
  };

  const removePet = (index) => {
    if (pets.length > 1) setPets(pets.filter((_, i) => i !== index));
  };

  const totalPrice = pets.reduce((sum, pet) => sum + pet.price, 0);

  const validatePhone = (phone) => /^0\d{9}$/.test(phone);

  const handleCustomerInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setCustomerInfo((prev) => ({ ...prev, [name]: newValue }));

    setErrors((prev) => ({
      ...prev,
      fullName: name === "fullName" && !value.trim() ? "Vui lòng nhập họ tên" : "",
      phone:
        name === "phone" && !value.trim()
          ? "Vui lòng nhập số điện thoại"
          : name === "phone" && value.trim() && !validatePhone(value)
          ? "Số điện thoại không hợp lệ"
          : "",
    }));
  };

  const handleBookingClick = () => {
    if (!isBookingEnabled) {
      showToast("Cửa hàng hiện đang tạm nghỉ, không thể đặt lịch.", "error");
      return;
    }
    
    if (selectedTimeBlock === "") {
      showToast("Vui lòng chọn khung giờ trước", "warning");
      return;
    }
    
    // Lấy thông tin block thời gian hiện tại
    const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock);
    if (!currentTimeBlock) {
      showToast("Không tìm thấy thông tin khung giờ đã chọn. Vui lòng làm mới trang và thử lại.", "error");
      return;
    }
    
    // Kiểm tra số slot khả dụng
    const availableSlots = currentTimeBlock.availableSlots || 0;
    if (availableSlots <= 0) {
      showToast("Khung giờ này đã hết slot trống. Vui lòng chọn khung giờ khác.", "warning");
      return;
    }
    
    if (selectedSlots.length === 0) {
      showToast("Vui lòng chọn ít nhất một slot cho thú cưng của bạn", "warning");
      return;
    }
    
    setIsServiceModalOpen(true);
  };

  const handleApiBooking = async () => {
    if (!selectedTime || !customerInfo.fullName || !customerInfo.phone || !customerInfo.paymentType) {
        showToast("Vui lòng điền đầy đủ thông tin!", "warning");
        return;
    }

    if (!selectedDate || !selectedTime || !pets || pets.length === 0 || !selectedSlots || selectedSlots.length === 0) {
        showToast("Vui lòng chọn ngày, thời gian và thông tin thú cưng!", "warning");
        return;
    }

    const hasAlreadyBookedSlot = selectedSlots.some(slot => userBookedSlots.includes(slot));
    if (hasAlreadyBookedSlot) {
        showToast("Bạn đã chọn slot đã được đặt trước đó. Vui lòng chọn slot khác.", "warning");
        return;
    }

    const isPetInfoValid = pets.every((pet) => pet.petType && pet.service && pet.weight && pet.price);
    if (!isPetInfoValid) {
        showToast("Vui lòng nhập đầy đủ thông tin cho tất cả thú cưng!", "warning");
        return;
    }

    try {
        setIsLoading(true);

        const appointmentSlots = selectedSlots.map(slotId => {
            const parts = slotId.split('-');
            const time = parts[0];
            const slotIndex = parts.length > 1 ? parseInt(parts[1], 10) : 0;
            return {
                time: time,
                slotIndex: slotIndex
            };
        });

        const formatTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return new Date(0, 0, 0, hours, minutes).toTimeString().substring(0, 5);
        };

        const payload = {
            date: selectedDate.toISOString().split("T")[0],
            time: formatTime(selectedTime),
            customerName: customerInfo.fullName,
            phone: customerInfo.phone,
            paymentType: customerInfo.paymentType,
            depositAmount: calculateDeposit(),
            pets: pets.map((pet) => ({
                name: pet.name || `Thú cưng ${pets.indexOf(pet) + 1}`,
                petType: pet.petType.toUpperCase(),
                petService: { id: parseInt(pet.service, 10) },
                petWeight: { petWeightId: parseInt(pet.weight, 10) },
                note: pet.note || "",
                price: pet.price || 0,
            })),
            appointmentSlots: appointmentSlots
        };

        console.log("Sending payload to backend:", payload);

        const totalPrice = pets.reduce((sum, pet) => sum + (pet.price || 0), 0);

        const slotIndexes = appointmentSlots.map(slot => slot.slotIndex);
        const isAvailable = await BookingService.checkSlotAvailability(
            payload.date,
            payload.time,
            slotIndexes
        );

        if (!isAvailable) {
            setIsLoading(false);
            showToast("Một hoặc nhiều slot bạn đã chọn vừa được đặt bởi người khác. Vui lòng chọn lại slot khác.", "error");
            fetchBookedSlots(selectedDate);
            return;
        }

        const validateResponse = await BookingService.validateAppointment(payload);
        if (!validateResponse.success) {
            setIsLoading(false);
            throw new Error(validateResponse.message);
        }

        const tempAppointmentSuccess = await BookingService.createTempAppointment({
            ...payload,
            totalPrice,
            selectedSlots
        });

        console.log("Temporary appointment creation result:", tempAppointmentSuccess);

        // Gọi lại API để lấy danh sách slot trống mới nhất từ backend
        await fetchBookingStatusAndSlots();

        // Nếu thanh toán tại chỗ, lưu trạng thái slot vào localStorage
        if (customerInfo.paymentType === 'cash') {
            BookingService.saveBookedSlots(selectedSlots, payload.date);
        }

        sessionStorage.setItem('pendingBookingSlots', JSON.stringify(selectedSlots));
        sessionStorage.setItem('pendingBookingDate', payload.date);

        setIsLoading(false);
        navigate(`/checkout-payment?date=${payload.date}&source=payment`, {
            state: {
                bookingData: { ...payload, totalPrice, selectedSlots },
            },
        });
    } catch (error) {
        console.error("Error validating:", error);
        setIsLoading(false);
        showToast(`Xác thực thất bại: ${error.message}`, "error");
    }
};

  const handleServiceConfirm = () => {
    const isPetCountValid = pets.length === selectedSlots.length;
    const isPetInfoValid = pets.every((pet) => pet.petType && pet.service && pet.weight && pet.price);

    setServiceErrors({ petCount: !isPetCountValid, petInfo: !isPetInfoValid });

    if (isPetCountValid && isPetInfoValid) {
      setIsServiceModalOpen(false);
      setIsCustomerModalOpen(true);
    } else {
      showToast("Vui lòng nhập đầy đủ thông tin cho tất cả thú cưng!", "warning");
    }
  };

  useEffect(() => {
    if (bookingSuccess) {
      const existingMessage = document.getElementById("booking-success-message");
      if (existingMessage) {
        document.body.removeChild(existingMessage);
      }

      const successMessage = document.createElement("div");
      successMessage.id = "booking-success-message";
      successMessage.className =
        "fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50";
      successMessage.innerHTML = `
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Đặt lịch thành công! Bạn có thể xem lịch đã đặt ở đây.</span>
        </div>
      `;

      document.body.appendChild(successMessage);

      const timer = setTimeout(() => {
        const messageToRemove = document.getElementById("booking-success-message");
        if (messageToRemove) {
          document.body.removeChild(messageToRemove);
        }
        setBookingSuccess(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        const messageToRemove = document.getElementById("booking-success-message");
        if (messageToRemove) {
          try {
            document.body.removeChild(messageToRemove);
          } catch (error) {
            console.error("Error removing success message:", error);
          }
        }
      };
    }
  }, [bookingSuccess]);

  // Kiểm tra thông báo thành công từ URL
  useEffect(() => {
    // Kiểm tra nếu URL có chứa source=payment
    const urlParams = new URLSearchParams(location.search);
    const isFromPayment = urlParams.get("source") === "payment";
    
    if (isFromPayment) {
      console.log("Detected return from payment page!");
      
      // Hiển thị thông báo thành công
      setBookingSuccess(true);
      
      // Kiểm tra xem có dữ liệu từ localStorage không
      const localBookedSlotsData = localStorage.getItem('lastBookedSlots');
      const localAppointmentDate = localStorage.getItem('lastAppointmentDate');
      
      console.log('localStorage data:', { 
        localBookedSlotsData, 
        localAppointmentDate,
        selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : null 
      });
      
      if (localBookedSlotsData && localAppointmentDate) {
        try {
          const localBookedSlots = JSON.parse(localBookedSlotsData);
          console.log('Parsed booked slots from localStorage:', localBookedSlots);
          
          // Format lại date để so sánh với selectedDate
          const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
          
          // Kiểm tra xem ngày đã đặt có trùng với ngày hiện tại đang xem không
          if (localAppointmentDate === formattedDate && localBookedSlots.length > 0) {
            // Tạo định dạng slot ID hợp lệ (HH:MM-index)
            const processedSlots = localBookedSlots.map(slot => 
              `${slot.time}-${slot.slotIndex}`
            );
            
            console.log('Adding processed slots to state:', processedSlots);
            
            // Cập nhật trạng thái các slot đã đặt
            setUserBookedSlots(prev => {
              const newSlots = [...prev, ...processedSlots.filter(slot => !prev.includes(slot))];
              console.log('Updated userBookedSlots:', newSlots);
              return newSlots;
            });
            
            setAllBookedSlots(prev => {
              const newSlots = [...prev, ...processedSlots.filter(slot => !prev.includes(slot))];
              console.log('Updated allBookedSlots:', newSlots);
              return newSlots;
            });
          } else {
            console.log('Date mismatch or no slots:', {
              localAppointmentDate,
              formattedDate,
              slotCount: localBookedSlots.length
            });
          }
        } catch (error) {
          console.error('Error parsing booked slots from localStorage:', error);
        }
      } else {
        console.log('No lastBookedSlots or lastAppointmentDate in localStorage');
      }
      
      // Lấy ngày hiện tại để refresh trạng thái slot
      fetchBookingStatusAndSlots();
    }
  }, [location.search, selectedDate]);

  // Thêm log để debugging trạng thái slot khi render component
  useEffect(() => {
    console.log("User booked slots updated:", userBookedSlots);
    console.log("All booked slots updated:", allBookedSlots);
  }, [userBookedSlots, allBookedSlots]);
  
  // Thêm log để xem thông tin timeSlots khi thay đổi
  useEffect(() => {
    console.log("Time slots state updated:", timeSlotsState);
  }, [timeSlotsState]);

  // Thêm một hàm để fetch dữ liệu định kỳ với thời gian ngắn hơn
  useEffect(() => {
    // Fetch dữ liệu ban đầu
    fetchBookingStatusAndSlots();
    
    // Thiết lập interval để refresh dữ liệu thường xuyên hơn (10 giây)
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing slot data...');
      if (selectedDate) {
        fetchBookedSlots(selectedDate);
      }
    }, 10000); // 10 giây
    
    // Cleanup khi component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedDate]);

  const handleTimeBlockSelection = (timeBlock) => {
    // Reset selected slots when changing time block
    setSelectedSlots([]);
    setSelectedTimeBlock(timeBlock);
    setSelectedTime(timeBlock);
  };

  const getAvailableSlotsForTimeBlock = (timeBlock) => {
    // Find the timeBlock in the current session's data
    const block = timeSlotsState[selectedSession]?.find(block => block.hour === timeBlock);
    if (!block) return { available: 0, total: 0 };
    
    // Use the availableSlots directly from the backend data if available
    // Otherwise calculate using totalSlots and bookedSlots
    return {
      available: block.availableSlots !== undefined ? block.availableSlots : Math.max(0, block.totalSlots - block.bookedSlots),
      total: block.totalSlots
    };
  };

  useEffect(() => {
    // Make sure that pets count matches selected slots count
    if (selectedSlots.length > 0 && pets.length !== selectedSlots.length) {
      const difference = selectedSlots.length - pets.length;
      
      if (difference > 0) {
        // Need to add more pets
        const newPets = [...pets];
        for (let i = 0; i < difference; i++) {
          newPets.push({ 
            id: newPets.length + 1, 
            petType: "", 
            service: "", 
            weight: "", 
            note: "", 
            price: 0 
          });
        }
        setPets(newPets);
      } else if (difference < 0) {
        // Need to remove excess pets
        setPets(pets.slice(0, selectedSlots.length));
      }
    }
  }, [selectedSlots]);

  // Toast component
  const Toast = ({ message, type, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    let bgColor, icon, borderColor, textColor;
    
    switch (type) {
      case 'success':
        bgColor = 'bg-green-50';
        borderColor = 'border-green-500';
        icon = <FaCheckCircle className="text-green-500 w-5 h-5" />;
        textColor = 'text-green-800';
        break;
      case 'error':
        bgColor = 'bg-red-50';
        borderColor = 'border-red-500';
        icon = <FaExclamationTriangle className="text-red-500 w-5 h-5" />;
        textColor = 'text-red-800';
        break;
      case 'warning':
        bgColor = 'bg-yellow-50';
        borderColor = 'border-yellow-500';
        icon = <FaExclamationTriangle className="text-yellow-500 w-5 h-5" />;
        textColor = 'text-yellow-800';
        break;
      default:
        bgColor = 'bg-blue-50';
        borderColor = 'border-blue-500';
        icon = <FaInfoCircle className="text-blue-500 w-5 h-5" />;
        textColor = 'text-blue-800';
        break;
    }
    
    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300); // Match animation duration
    };
    
    return (
      <div className={`fixed top-6 right-4 z-50 p-0 rounded-lg shadow-lg max-w-md ${isClosing ? 'animate-fade-out-right' : 'animate-fade-in-right'}`}>
        <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg overflow-hidden`}>
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 mr-3">
              {icon}
            </div>
            <div className="flex-1 pt-0.5">
              <p className={`text-sm font-medium ${textColor}`}>{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                onClick={handleClose}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className={`h-1 ${borderColor.replace('border', 'bg')}`}>
            <div 
              className="h-full bg-white bg-opacity-30" 
              style={{ 
                animation: 'toast-timer 5s linear forwards',
                width: '100%'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to show toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      
      <div className="w-full max-w-7xl">
        <div className="bg-white border-b w-full">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center text-sm">
            <Link to="/" className="flex items-center text-gray-600 hover:text-[#026AC7]">
              <FaHome className="mr-1" /> <span>Trang chủ</span>
            </Link>
            <FaChevronRight className="mx-2 text-gray-400 text-xs" />
            <Link to="/staff/spa-grooming" className="text-gray-600 hover:text-[#026AC7]">
              Dịch vụ spa
            </Link>
            <FaChevronRight className="mx-2 text-gray-400 text-xs" />
            <span className="text-[#026AC7] font-medium">Đặt lịch</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-[#026AC7] mb-8">
            Chăm sóc thú cưng chuyên nghiệp – Đặt lịch ngay tại PetCare!
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-[#CDEBFF] transition-transform hover:translate-y-[-5px]">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div className="bg-[#026AC7] rounded-full p-2 text-white">
                    <FaCalendarAlt className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Chọn thời gian</h2>
                </div>

                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FaClock className="w-5 h-5 text-[#026AC7]" />
                      <h3 className="text-md font-medium">Ngày đặt lịch</h3>
                    </div>
                    <span className="text-[#026AC7] font-medium">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {weekDates.map((date, index) => {
                      const { day, date: dateStr } = formatDayDate(date);
                      return (
                        <div key={index} className="text-center">
                          <input
                            type="radio"
                            id={`date-${index}`}
                            name="booking-date"
                            className="hidden"
                            checked={selectedDate.toDateString() === date.toDateString()}
                            onChange={() => {
                              setSelectedDate(date);
                              setSelectedSession("");
                              setSelectedTime("");
                              setSelectedSlots([]);
                            }}
                          />
                          <label
                            htmlFor={`date-${index}`}
                            className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all ${
                              selectedDate.toDateString() === date.toDateString()
                                ? "bg-[#026AC7] text-white shadow-md transform scale-105"
                                : "hover:bg-[#CDEBFF] border border-gray-100"
                            }`}
                          >
                            <span className="text-sm">{day}</span>
                            <span className="text-lg font-semibold">{dateStr}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-[#026AC7]/20">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#026AC7] rounded-full p-1.5 text-white">
                        <FaSpa className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Chọn khung giờ</h3>
                    </div>
                    <button
                      onClick={fetchBookingStatusAndSlots}
                      className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaSyncAlt className="h-4 w-4 mr-1" /> Làm mới
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedSession("morning")}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedSession === "morning"
                          ? "bg-[#026AC7] text-white shadow-md transform scale-105"
                          : "bg-white hover:bg-[#CDEBFF] border border-gray-200"
                      }`}
                    >
                      <h4 className="font-medium">Buổi sáng</h4>
                      <p className="text-sm">9:00 - 14:00</p>
                    </button>
                    <button
                      onClick={() => setSelectedSession("afternoon")}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedSession === "afternoon"
                          ? "bg-[#026AC7] text-white shadow-md transform scale-105"
                          : "bg-white hover:bg-[#CDEBFF] border border-gray-200"
                      }`}
                    >
                      <h4 className="font-medium">Buổi chiều</h4>
                      <p className="text-sm">14:00 - 20:00</p>
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#026AC7]"></div>
                      <span className="ml-2 text-gray-500">Đang tải khung giờ...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <p className="text-red-500">{error}</p>
                      <button
                        onClick={() => fetchBookingStatusAndSlots()}
                        className="mt-2 px-4 py-2 bg-[#026AC7] text-white rounded-md hover:bg-[#0253a0]"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : !isBookingEnabled ? (
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <h3 className="text-lg font-medium text-red-800">Cửa hàng tạm nghỉ</h3>
                      <p className="text-sm text-red-700 mt-2">
                        Hiện tại chúng tôi không nhận đặt lịch. Vui lòng quay lại sau.
                      </p>
                    </div>
                  ) : selectedSession ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      {timeSlotsState[selectedSession]?.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {timeSlotsState[selectedSession].map((block, blockIndex) => {
                            const { available, total } = getAvailableSlotsForTimeBlock(block.hour);
                            // Khung giờ bị vô hiệu hóa khi: Không còn slot trống, đã qua thời gian, hoặc isActive=false
                            const isDisabled = available === 0 || isSlotDisabled(block.hour) || block.active === false;
                            
                            // Format display time (e.g., "09:00" instead of range)
                            const displayTime = block.hour;
                            
                            return (
                              <div key={blockIndex}>
                                <input
                                  type="radio"
                                  id={`timeblock-${block.hour}`}
                                  name="timeblock"
                                  className="hidden"
                                  disabled={isDisabled}
                                  checked={selectedTimeBlock === block.hour}
                                  onChange={() => handleTimeBlockSelection(block.hour)}
                                />
                                <label
                                  htmlFor={`timeblock-${block.hour}`}
                                  className={`block w-full p-3 rounded-lg transition-all border-2 ${
                                    isDisabled
                                      ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-60"
                                      : selectedTimeBlock === block.hour
                                      ? "bg-[#026AC7] border-[#026AC7] text-white shadow-md transform scale-105"
                                      : "bg-white border-gray-200 hover:border-[#026AC7] hover:shadow-sm"
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className={`text-lg font-bold ${selectedTimeBlock === block.hour ? "text-white" : "text-gray-800"}`}>
                                      {displayTime}
                                    </div>
                                    <div className={`text-xs mt-1 ${
                                      selectedTimeBlock === block.hour 
                                        ? "text-white/90" 
                                        : isDisabled 
                                          ? "text-gray-500" 
                                          : "text-[#026AC7]"
                                    }`}>
                                      {available === 0 ? (
                                        "Đã đầy"
                                      ) : (
                                        `Còn trống ${available}/${total} slot`
                                      )}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Không có khung giờ nào khả dụng</p>
                      )}
                      
                      {/* Show individual slots if a time block is selected */}
                      {selectedTimeBlock && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-3">Chọn số lượng thú cưng ({selectedSlots.length}/{timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock)?.availableSlots || 0})</h4>
                          <div className="grid grid-cols-4 gap-3">
                            {(() => {
                              // Lấy thông tin block thời gian hiện tại
                              const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock);
                              if (!currentTimeBlock) return null;
                              
                              // Lấy danh sách slot đã đặt cho khung giờ này
                              const bookedSlotsForThisTime = allBookedSlots.filter(slot => slot.startsWith(`${selectedTimeBlock}-`));
                              const userSlotsForThisTime = userBookedSlots.filter(slot => slot.startsWith(`${selectedTimeBlock}-`));
                              
                              // Xác định tổng số slot cần hiển thị (chỉ hiển thị slot trống + slot của user)
                              const totalSlots = currentTimeBlock.totalSlots || 4;
                              const bookedCount = bookedSlotsForThisTime.length;
                              const availableSlots = currentTimeBlock.availableSlots !== undefined 
                                ? currentTimeBlock.availableSlots 
                                : (totalSlots - bookedCount);
                              
                              console.log(`Rendering slots for ${selectedTimeBlock}: Available=${availableSlots}, Total=${totalSlots}, BookedByOthers=${bookedCount - userSlotsForThisTime.length}`);
                              
                              // Tạo mảng chứa các index của slot đã bị book bởi người khác
                              const bookedByOthersIndexes = bookedSlotsForThisTime
                                .filter(slot => !userSlotsForThisTime.includes(slot))
                                .map(slot => parseInt(slot.split('-')[1]));
                              
                              // Tạo mảng chứa các slot đã đặt bởi người dùng hiện tại
                              const userSlotIndexes = userSlotsForThisTime.map(slot => parseInt(slot.split('-')[1]));
                              
                              // Xác định các slot index còn trống
                              const availableSlotIndexes = [];
                              for (let i = 0; i < totalSlots; i++) {
                                if (!bookedByOthersIndexes.includes(i)) {
                                  availableSlotIndexes.push(i);
                                }
                              }
                              
                              // Chỉ hiển thị các slot còn trống hoặc do người dùng hiện tại đặt
                              const visibleSlotIndexes = [...new Set([...availableSlotIndexes])];
                              
                              console.log('Visible slot indexes:', visibleSlotIndexes);
                              
                              return visibleSlotIndexes.map((slotIndex) => {
                                const slotId = `${selectedTimeBlock}-${slotIndex}`;
                                
                                // Xác định trạng thái các loại slot
                                const isBookedByUser = userBookedSlots.includes(slotId);
                                const isSelected = selectedSlots.includes(slotId);
                                
                                // Slot bị vô hiệu hóa nếu đã được đặt bởi người dùng hiện tại
                                const isDisabled = isBookedByUser;

                                // Xác định class và text hiển thị
                                let slotClass = "";
                                let slotText = `Slot ${slotIndex + 1}`;

                                if (isBookedByUser) {
                                  // Slot đã đặt bởi người dùng hiện tại
                                  slotClass = "bg-green-500 border-green-700 shadow-md transform scale-105";
                                  slotText = "Đã đặt (Bạn)";
                                } else if (isSelected) {
                                  // Slot đang được chọn
                                  slotClass = "bg-[#026AC7] border-[#026AC7] shadow-md transform scale-105";
                                } else {
                                  // Slot trống, có thể chọn
                                  slotClass = "bg-white border-gray-200 hover:border-[#026AC7] hover:shadow";
                                }

                                // Text class dựa trên trạng thái slot
                                const textClass = (isSelected || isBookedByUser) 
                                  ? "text-white" 
                                  : "text-gray-600";

                                return (
                                  <div key={slotIndex}>
                                    <input
                                      type="checkbox"
                                      id={`time-${selectedTimeBlock}-${slotIndex}`}
                                      className="hidden"
                                      disabled={isDisabled}
                                      checked={isSelected || isBookedByUser}
                                      onChange={() => handleSlotSelection(selectedTimeBlock, slotIndex)}
                                    />
                                    <label
                                      htmlFor={`time-${selectedTimeBlock}-${slotIndex}`}
                                      className={`block w-full h-10 relative rounded-lg transition-all border-2 ${slotClass}`}
                                    >
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-sm font-medium ${textClass}`}>
                                          {slotText}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Vui lòng chọn buổi sáng hoặc buổi chiều để xem các khung giờ khả dụng
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleBookingClick}
                    disabled={selectedSlots.length === 0 || !isBookingEnabled}
                    className={`px-8 py-3 rounded-lg font-medium transition-all ${
                      selectedSlots.length > 0 && isBookingEnabled
                        ? "bg-[#026AC7] text-white hover:bg-[#0253a0] shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Đặt lịch
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-[#CDEBFF] transition-transform hover:translate-y-[-5px] sticky top-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div className="bg-[#026AC7] rounded-full p-2 text-white">
                    <FaCalendarAlt className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Thông tin đặt lịch</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">Ngày</span>
                    <span className="font-medium">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="font-medium text-[#026AC7]">{selectedTime || "--:--"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">Số lượng thú cưng</span>
                    <span className="font-medium">{selectedSlots.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">Tiền cọc</span>
                    <span className="font-bold text-[#026AC7]">{calculateDeposit().toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="p-4 bg-[#CDEBFF] rounded-lg mt-4">
                    <div className="flex items-start">
                      <div className="text-[#026AC7] mr-2 mt-1">
                        <FaClock className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Tiền cọc 50.000đ/slot sẽ được hoàn trả khi bạn hủy lịch trước 12 tiếng. Sau thời gian này,
                        tiền cọc sẽ không được hoàn lại. Vui lòng liên hệ Hotline 0844 233 799 để hủy lịch.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-3 text-gray-700">Quy trình dịch vụ:</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">
                        1
                      </div>
                      <p className="text-sm text-gray-600">Đặt lịch và thanh toán tiền cọc</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">
                        2
                      </div>
                      <p className="text-sm text-gray-600">Mang thú cưng đến Petcare đúng giờ hẹn</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">
                        3
                      </div>
                      <p className="text-sm text-gray-600">Sử dụng dịch vụ và thanh toán phần còn lại</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ServiceModal
          isServiceModalOpen={isServiceModalOpen}
          setIsServiceModalOpen={setIsServiceModalOpen}
          selectedSlots={selectedSlots}
          pets={pets}
          setPets={setPets}
          serviceErrors={serviceErrors}
          setServiceErrors={setServiceErrors}
          serviceOptions={serviceOptions}
          weightOptions={weightOptions}
          handlePetChange={handlePetChange}
          handleServiceConfirm={handleServiceConfirm}
          addNewPet={addNewPet}
          removePet={removePet}
        />
        <CustomerModal
          isCustomerModalOpen={isCustomerModalOpen}
          setIsCustomerModalOpen={setIsCustomerModalOpen}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          errors={errors}
          setErrors={setErrors}
          handleCustomerInfoChange={handleCustomerInfoChange}
          fullNameRef={fullNameRef}
          phoneRef={phoneRef}
          handleApiBooking={handleApiBooking}
          totalPrice={totalPrice}
          calculateDeposit={calculateDeposit}
        />
      </div>
    </div>
  );
};

export default Appointment;