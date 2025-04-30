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
import TimeSlotService from "../../../service/spaService/TimeSlotService";
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
    const [isBookingEnabled, setIsBookingEnabled] = useState(null);
    const [isCheckingBookingStatus, setIsCheckingBookingStatus] = useState(true);
    const [bookingStatusError, setBookingStatusError] = useState(null);
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

    // Define showToast before fetchServicesAndWeights
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    useEffect(() => {
        const fetchBookingStatus = async () => {
            try {
                setIsCheckingBookingStatus(true);
                setBookingStatusError(null);
                const status = await TimeSlotService.getBookingStatus();
                setIsBookingEnabled(status);
            } catch (error) {
                setBookingStatusError(error.message);
                setIsBookingEnabled(true); // Default to enabled if error occurs
                showToast("Không thể kiểm tra trạng thái hệ thống. Vui lòng thử lại sau.", "error");
            } finally {
                setIsCheckingBookingStatus(false);
            }
        };
        fetchBookingStatus();
    }, []);

    useEffect(() => {
        BookingService.clearStaleBookings();
        
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
            fetchBookingStatusAndSlots();
        }
    }, [location.search]);

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

    const fetchBookingStatusAndSlots = async () => {
        setIsLoading(true);
        setError(null);
        try {
            BookingService.clearStaleBookings();
            
            const dateStr = selectedDate.toISOString().split("T")[0];
            const data = await BookingService.getAvailableSlots(dateStr);
            console.log("Time slots from server:", data);

            // Process morning slots (slots with isMorning = true)
            const processedMorning = (data?.morning || [])
                .map(slot => ({
                    hour: slot.hour || (slot.time ? (typeof slot.time === 'string' ? slot.time : slot.time.toString()) : ""),
                    totalSlots: slot.totalSlots || 4,
                    bookedSlots: slot.bookedSlots || 0,
                    availableSlots: Math.max(0, (slot.availableSlots !== undefined) ? slot.availableSlots : ((slot.totalSlots || 4) - (slot.bookedSlots || 0))),
                    active: slot.active !== false && slot.isActive !== false
                }));

            // Process afternoon slots (slots with isMorning = false)
            const processedAfternoon = (data?.afternoon || [])
                .map(slot => ({
                    hour: slot.hour || (slot.time ? (typeof slot.time === 'string' ? slot.time : slot.time.toString()) : ""),
                    totalSlots: slot.totalSlots || 4,
                    bookedSlots: slot.bookedSlots || 0,
                    availableSlots: Math.max(0, (slot.availableSlots !== undefined) ? slot.availableSlots : ((slot.totalSlots || 4) - (slot.bookedSlots || 0))),
                    active: slot.active !== false && slot.isActive !== false
                }));

            // Sort slots by time
            const sortByTime = (a, b) => {
                const timeA = parseInt(a.hour.split(':')[0]);
                const timeB = parseInt(b.hour.split(':')[0]);
                return timeA - timeB;
            };

            processedMorning.sort(sortByTime);
            processedAfternoon.sort(sortByTime);

            console.log("Processed morning slots:", processedMorning);
            console.log("Processed afternoon slots:", processedAfternoon);

            // Update state with processed slots
            setTimeSlotsState({ 
                morning: processedMorning, 
                afternoon: processedAfternoon 
            });
        } catch (error) {
            console.error("Error fetching time slots:", error);
            setError("Không thể tải thông tin khung giờ. Vui lòng thử lại sau.");
            setTimeSlotsState({ morning: [], afternoon: [] });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isCheckingBookingStatus) {
            fetchBookingStatusAndSlots();
        }
    }, [selectedDate, isCheckingBookingStatus]);

    useEffect(() => {
        const autoRefreshInterval = setInterval(() => {
            console.log("Auto-refreshing slot data...");
            fetchBookingStatusAndSlots();
        }, 30000);
        
        return () => clearInterval(autoRefreshInterval);
    }, [selectedDate]);

    useEffect(() => {
        window.updateAppointment = () => fetchBookingStatusAndSlots();
        
        const handleStorageChange = (e) => {
            if (e.key === 'lastBookedSlots' || e.key === 'lastAppointmentDate') {
                console.log("LocalStorage changed, refreshing data");
                fetchBookingStatusAndSlots();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.updateAppointment = null;
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const fetchServicesAndWeights = async () => {
            try {
                const catServices = await PetServiceService.getServicesByPetType("CAT");
                const dogServices = await PetServiceService.getServicesByPetType("DOG");
                const catWeights = await PetWeightService.getWeightsByPetType("CAT");
                const dogWeights = await PetWeightService.getWeightsByPetType("DOG");

                console.log("Fetched CAT services:", catServices);
                console.log("Fetched DOG services:", dogServices);
                console.log("Fetched CAT weights:", catWeights);
                console.log("Fetched DOG weights:", dogWeights);

                const mapServices = (services) => {
                    if (!services || services.length === 0) {
                        console.warn("No services available for this pet type");
                        return [];
                    }
                    return services.map((service) => ({
                        value: service.id.toString(),
                        label: service.serviceName,
                        price: Number(service.basePrice),
                    }));
                };

                const mapWeights = (weights) => {
                    if (!weights || weights.length === 0) {
                        console.warn("No weights available for this pet type");
                        return [];
                    }
                    return weights.map((weight) => ({
                        value: weight.petWeightId.toString(),
                        label: weight.weightRange,
                        priceMultiplier: weight.priceMultiplier,
                        active: weight.statusType === 'ACTIVE'
                    }));
                };

                const newServiceOptions = {
                    cat: mapServices(catServices),
                    dog: mapServices(dogServices),
                };

                const newWeightOptions = {
                    cat: mapWeights(catWeights),
                    dog: mapWeights(dogWeights),
                };

                console.log("Processed service options:", newServiceOptions);
                console.log("Processed weight options:", newWeightOptions);

                setServiceOptions(newServiceOptions);
                setWeightOptions(newWeightOptions);

                if (newServiceOptions.cat.length === 0 && newServiceOptions.dog.length === 0) {
                    showToast("Không có dịch vụ nào khả dụng. Vui lòng liên hệ quản trị viên.", "warning");
                }
                if (newWeightOptions.cat.length === 0 && newWeightOptions.dog.length === 0) {
                    showToast("Không có thông tin cân nặng nào khả dụng. Vui lòng liên hệ quản trị viên.", "warning");
                }
            } catch (error) {
                console.error("Error fetching services and weights:", error);
                showToast("Không thể tải dữ liệu dịch vụ và cân nặng. Vui lòng thử lại sau.", "error");
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

        const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === time);
        if (!currentTimeBlock) return;
        
        const availableSlots = currentTimeBlock.availableSlots || 0;
        
        if (availableSlots <= 0) {
            showToast("Khung giờ này đã hết slot trống. Vui lòng chọn khung giờ khác.", "warning");
            return;
        }

        setSelectedSlots((prev) => {
            if (prev.includes(slotId)) {
                return prev.filter((slot) => slot !== slotId);
            }
            
            const currentSelectedCount = prev.filter(s => s.startsWith(`${time}-`)).length;
            
            if (currentSelectedCount >= availableSlots) {
                showToast(`Bạn chỉ có thể chọn tối đa ${availableSlots} slot cho khung giờ này.`, "warning");
                return prev;
            }
            
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
        if (selectedTimeBlock === "") {
            showToast("Vui lòng chọn khung giờ trước", "warning");
            return;
        }
        
        const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock);
        if (!currentTimeBlock) {
            showToast("Không tìm thấy thông tin khung giờ đã chọn. Vui lòng làm mới trang và thử lại.", "error");
            return;
        }
        
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
        // Debug logs to see what values we have
        console.log("Booking data check:", {
          selectedDate,
          selectedTime,
          selectedTimeBlock,
          customerInfo,
          pets,
          selectedSlots
        });
        
        // Check for customer info
        if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.paymentType) {
          console.log("Missing customer info:", customerInfo);
          showToast("Vui lòng điền đầy đủ thông tin khách hàng!", "warning");
          return;
        }
      
        // Check for time selection
        if (!selectedDate || !selectedTimeBlock) {
          console.log("Missing date/time selection");
          showToast("Vui lòng chọn ngày và khung giờ!", "warning");
          return;
        }
        
        // Ensure we have the correct time format
        const selectedTimeValue = selectedTimeBlock;
        
        // Check for pet selection
        if (!pets || pets.length === 0 || !selectedSlots || selectedSlots.length === 0) {
          console.log("Missing pet info or slots");
          showToast("Vui lòng chọn thông tin thú cưng và slot!", "warning");
          return;
        }
      
        // Validate each pet's info
        const isPetInfoValid = pets.every((pet) => {
          const isValid = pet.petType && pet.service && pet.weight && pet.price > 0;
          if (!isValid) {
            console.log("Invalid pet data:", pet);
          }
          return isValid;
        });
        
        if (!isPetInfoValid) {
          showToast("Vui lòng nhập đầy đủ thông tin cho tất cả thú cưng!", "warning");
          return;
        }
      
        try {
          setIsLoading(true);
      
          const formatTime = (timeStr) => {
            if (!timeStr) return "00:00:00";
            const [hours, minutes] = timeStr.split(':').map(Number);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
          };
      
          const totalAmount = pets.reduce((sum, pet) => sum + (pet.price || 0), 0);
          const depositAmount = calculateDeposit();
          const paidAmount = customerInfo.paymentType === 'full' ? totalAmount : depositAmount;
      
          const payload = {
            date: selectedDate.toISOString().split("T")[0],
            time: formatTime(selectedTimeValue),
            customerName: customerInfo.fullName,
            phone: customerInfo.phone,
            paymentType: customerInfo.paymentType,
            depositAmount: depositAmount,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            appointmentSlots: selectedSlots,
            pets: pets.map((pet) => {
              // Make sure we get numeric values for IDs
              const petServiceId = parseInt(pet.service, 10);
              const petWeightId = parseInt(pet.weight, 10);
              
              // Debug log for pet data conversion
              console.log("Processing pet data:", {
                original: pet,
                converted: {
                  name: pet.name || `Thú cưng ${pets.indexOf(pet) + 1}`,
                  petType: pet.petType.toUpperCase(),
                  petServiceId,
                  petWeightId,
                  note: pet.note || "",
                  price: pet.price || 0,
                }
              });
              
              if (isNaN(petServiceId) || isNaN(petWeightId)) {
                console.error("Invalid pet service or weight ID:", { service: pet.service, weight: pet.weight });
                throw new Error("Dữ liệu dịch vụ hoặc cân nặng không hợp lệ");
              }
      
              return {
                name: pet.name || `Thú cưng ${pets.indexOf(pet) + 1}`,
                petType: pet.petType.toUpperCase(),
                petServiceId: petServiceId,
                petWeightId: petWeightId,
                note: pet.note || "",
                price: pet.price || 0,
              };
            })
          };
      
          console.log("Sending payload to checkout:", payload);
      
          const isAvailable = await BookingService.checkSlotAvailability(
            payload.date,
            selectedTimeValue,
            payload.pets.length
          );
      
          if (!isAvailable) {
            showToast("Khung giờ này đã hết slot trống. Vui lòng chọn khung giờ khác.", "error");
            await fetchBookingStatusAndSlots();
            setIsLoading(false);
            return;
          }
      
          setIsLoading(false);
          navigate(`/checkout-payment?date=${payload.date}&source=booking`, {
            state: {
              bookingData: payload,
            },
          });
        } catch (error) {
          console.error("Error processing booking:", error);
          showToast(`Đặt lịch thất bại: ${error.message || "Lỗi hệ thống"}`, "error");
          fetchBookingStatusAndSlots();
          setIsLoading(false);
        }
      };

    const handleServiceConfirm = () => {
        // Debug logging to see what data we have
        console.log("Service confirmation check:", {
            pets,
            selectedSlots
        });
        
        // Check if pet count matches slot count
        const isPetCountValid = pets.length === selectedSlots.length;
        if (!isPetCountValid) {
            console.log("Pet count doesn't match slot count", {
                petCount: pets.length, 
                slotCount: selectedSlots.length
            });
        }
        
        // Check if every pet has all required info
        const isPetInfoValid = pets.every((pet, index) => {
            const isValid = 
                pet.name && // Check name
                pet.petType && // Check pet type
                pet.service && // Check service
                pet.weight && // Check weight
                pet.price > 0; // Check price
                
            if (!isValid) {
                console.log(`Pet ${index + 1} has invalid data:`, pet);
            }
            
            return isValid;
        });

        setServiceErrors({ 
            petCount: !isPetCountValid, 
            petInfo: !isPetInfoValid 
        });

        if (isPetCountValid && isPetInfoValid) {
            console.log("All pet information is valid, proceeding to customer info");
            setIsServiceModalOpen(false);
            setIsCustomerModalOpen(true);
        } else {
            // Show specific error message based on what's missing
            if (!isPetCountValid) {
                showToast("Số lượng thú cưng phải khớp với số lượng slot đã chọn!", "warning");
            } else if (!isPetInfoValid) {
                showToast("Vui lòng nhập đầy đủ thông tin cho tất cả thú cưng!", "warning");
            }
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

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const isFromPayment = urlParams.get("source") === "payment";
        
        if (isFromPayment) {
            console.log("Detected return from payment page!");
            setBookingSuccess(true);
            fetchBookingStatusAndSlots();
        }
    }, [location.search, selectedDate]);

    useEffect(() => {
        console.log("Time slots state updated:", timeSlotsState);
    }, [timeSlotsState]);

    useEffect(() => {
        if (!isCheckingBookingStatus) {
            fetchBookingStatusAndSlots();
            const intervalId = setInterval(() => {
                console.log('Auto-refreshing slot data...');
                if (selectedDate) {
                    fetchBookingStatusAndSlots();
                }
            }, 10000);
            
            return () => clearInterval(intervalId);
        }
    }, [selectedDate, isCheckingBookingStatus]);

    const handleTimeBlockSelection = (timeBlock) => {
        setSelectedSlots([]);
        setSelectedTimeBlock(timeBlock);
        setSelectedTime(timeBlock);
    };

    const getAvailableSlotsForTimeBlock = (timeBlock) => {
        const block = timeSlotsState[selectedSession]?.find(block => block.hour === timeBlock);
        if (!block) return { available: 0, total: 0 };
        
        return {
            available: block.availableSlots !== undefined ? block.availableSlots : Math.max(0, block.totalSlots - block.bookedSlots),
            total: block.totalSlots
        };
    };

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
            }, 300);
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

    if (isCheckingBookingStatus) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (bookingStatusError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-800 text-sm">{bookingStatusError}</p>
                </div>
            </div>
        );
    }

    if (isBookingEnabled === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Cửa hàng tạm nghỉ</h2>
                    <p className="text-gray-600">Chức năng đặt lịch hiện đang tạm ngưng. Vui lòng quay lại sau.</p>
                </div>
            </div>
        );
    }

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
                                        </div>
                                    ) : selectedSession ? (
                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            {timeSlotsState[selectedSession]?.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                    {timeSlotsState[selectedSession].map((block, blockIndex) => {
                                                        const { available, total } = getAvailableSlotsForTimeBlock(block.hour);
                                                        const isDisabled = available === 0 || isSlotDisabled(block.hour) || block.active === false;
                                                        
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
                                            
                                            {selectedTimeBlock && (
                                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">Chọn số lượng thú cưng ({selectedSlots.length}/{timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock)?.availableSlots || 0})</h4>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {(() => {
                                                            const currentTimeBlock = timeSlotsState[selectedSession]?.find(b => b.hour === selectedTimeBlock);
                                                            if (!currentTimeBlock) return null;
                                                            
                                                            const totalSlots = currentTimeBlock.totalSlots || 4;
                                                            const availableSlots = currentTimeBlock.availableSlots || 0;
                                                            
                                                            console.log(`Rendering slots for ${selectedTimeBlock}: Available=${availableSlots}, Total=${totalSlots}`);
                                                            
                                                            const visibleSlotIndexes = Array.from({ length: totalSlots }, (_, i) => i);
                                                            
                                                            console.log('Visible slot indexes:', visibleSlotIndexes);
                                                            
                                                            return visibleSlotIndexes.map((slotIndex) => {
                                                                const slotId = `${selectedTimeBlock}-${slotIndex}`;
                                                                const isSelected = selectedSlots.includes(slotId);

                                                                let slotClass = "";
                                                                let slotText = `Slot ${slotIndex + 1}`;

                                                                if (isSelected) {
                                                                    slotClass = "bg-[#026AC7] border-[#026AC7] shadow-md transform scale-105";
                                                                } else {
                                                                    slotClass = "bg-white border-gray-200 hover:border-[#026AC7] hover:shadow";
                                                                }

                                                                const textClass = isSelected ? "text-white" : "text-gray-600";

                                                                return (
                                                                    <div key={slotIndex}>
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`time-${selectedTimeBlock}-${slotIndex}`}
                                                                            className="hidden"
                                                                            checked={isSelected}
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