// Appointment.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaBath, FaCalendarAlt, FaClock, FaSpa, FaHome, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import TimeSlotService from '../../../service/spaService/TimeSlotService';
import PetServiceService from '../../../service/spaService/PetServiceService';
import PetWeightService from '../../../service/spaService/PetWeightService';
import ServiceModal from './ServiceModal';
import CustomerModal from './CustomerModal';
import './appointment.css';

const Appointment = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [pets, setPets] = useState([
    {
      id: 1,
      petType: '',
      service: '',
      weight: '',
      note: '',
      price: 0,
    },
  ]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
  });
  const [selectedSession, setSelectedSession] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [serviceErrors, setServiceErrors] = useState({
    petCount: false,
    petInfo: false,
  });
  const [isBookingEnabled, setIsBookingEnabled] = useState(true);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [serviceOptions, setServiceOptions] = useState({ cat: [], dog: [] });
  const [weightOptions, setWeightOptions] = useState({ cat: [], dog: [] });

  const fullNameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      setSelectedDate(today);
    };
    generateWeekDates();
  }, []);

  useEffect(() => {
    const fetchBookingStatusAndSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const status = await TimeSlotService.getBookingStatus();
        setIsBookingEnabled(status);
        if (status) {
          const data = await TimeSlotService.getTimeSlots(selectedDate.toISOString().split('T')[0]);
          setTimeSlots(data);
        } else {
          setTimeSlots({ morning: [], afternoon: [] });
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError(error.message);
        setTimeSlots({
          morning: [
            { hour: '09:00', totalSlots: 4, bookedSlots: 0 },
            { hour: '10:00', totalSlots: 4, bookedSlots: 0 },
          ],
          afternoon: [
            { hour: '14:00', totalSlots: 4, bookedSlots: 0 },
            { hour: '15:00', totalSlots: 4, bookedSlots: 0 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingStatusAndSlots();
  }, [selectedDate]);

  useEffect(() => {
    const fetchServicesAndWeights = async () => {
      setIsLoadingServices(true);
      setFetchError(null);
      try {
        const catServices = await PetServiceService.getServicesByPetType('CAT');
        const dogServices = await PetServiceService.getServicesByPetType('DOG');

        const catWeights = await PetWeightService.getWeightsByPetType('CAT');
        const dogWeights = await PetWeightService.getWeightsByPetType('DOG');

        setServiceOptions({
          cat: catServices
            .filter(service => service.statusType === 'ACTIVE')
            .map(service => ({
              value: service.id.toString(),
              label: service.serviceName,
              price: Number(service.basePrice),
            })),
          dog: dogServices
            .filter(service => service.statusType === 'ACTIVE')
            .map(service => ({
              value: service.id.toString(),
              label: service.serviceName,
              price: Number(service.basePrice),
            })),
        });

        setWeightOptions({
          cat: catWeights
            .filter(weight => weight.statusType === 'ACTIVE')
            .map(weight => ({
              value: weight.petWeightId.toString(),
              label: weight.weightRange,
              priceMultiplier: weight.priceMultiplier,
            })),
          dog: dogWeights
            .filter(weight => weight.statusType === 'ACTIVE')
            .map(weight => ({
              value: weight.petWeightId.toString(),
              label: weight.weightRange,
              priceMultiplier: weight.priceMultiplier,
            })),
        });
      } catch (error) {
        console.error('Error fetching services and weights:', error);
        setFetchError('Không thể lấy dữ liệu dịch vụ và cân nặng. Vui lòng thử lại.');
        setServiceOptions({
          cat: [
            { value: 'basic', label: 'Tắm + vệ sinh', price: 150000 },
            { value: 'full', label: 'Tắm + vệ sinh + cắt tỉa lông', price: 250000 },
            { value: 'spa', label: 'Spa cao cấp', price: 350000 },
          ],
          dog: [
            { value: 'basic', label: 'Tắm + vệ sinh', price: 200000 },
            { value: 'full', label: 'Tắm + vệ sinh + cắt tỉa lông', price: 300000 },
            { value: 'spa', label: 'Spa cao cấp', price: 400000 },
          ],
        });
        setWeightOptions({
          cat: [
            { value: 'small', label: 'Dưới 3kg', priceMultiplier: 1 },
            { value: 'medium', label: '3kg - 5kg', priceMultiplier: 1.2 },
            { value: 'large', label: 'Trên 5kg', priceMultiplier: 1.4 },
          ],
          dog: [
            { value: 'small', label: 'Dưới 10kg', priceMultiplier: 1 },
            { value: 'medium', label: '10kg - 20kg', priceMultiplier: 1.3 },
            { value: 'large', label: '20kg - 40kg', priceMultiplier: 1.6 },
            { value: 'xlarge', label: 'Trên 40kg', priceMultiplier: 2 },
          ],
        });
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServicesAndWeights();
  }, []);

  const isSlotDisabled = (time) => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hour, minute] = time.split(':').map(Number);
    selectedDateTime.setHours(hour, minute, 0, 0);
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);
    return selectedDateTime < oneHourLater;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatDayDate = (date) => {
    return {
      day: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date),
      date: new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric' }).format(date),
    };
  };

  const handleSlotSelection = (time, slotIndex) => {
    const slotId = `${time}-${slotIndex}`;
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hour, minute] = time.split(':').map(Number);
    selectedDateTime.setHours(hour, minute, 0, 0);
    const oneHourLater = new Date(now);
    oneHourLater.setHours(now.getHours() + 1);

    if (selectedDateTime < oneHourLater) {
      alert('Bạn chỉ có thể đặt lịch trước ít nhất 1 giờ.');
      return;
    }

    if (selectedSlots.length > 0) {
      const existingTime = selectedSlots[0].split('-')[0];
      if (time !== existingTime) return;
    }

    setSelectedSlots((prev) => {
      const newSlots = prev.includes(slotId)
        ? prev.filter((slot) => slot !== slotId)
        : [...prev, slotId];
      setSelectedTime(newSlots.length > 0 ? time : '');
      return newSlots;
    });
  };

  const handlePetChange = (index, field, value) => {
    setPets((prevPets) => {
      const newPets = [...prevPets];
      const updatedPet = { ...newPets[index], [field]: value };

      if (field === 'petType') {
        updatedPet.service = '';
        updatedPet.weight = '';
        updatedPet.price = 0;
      }

      if (updatedPet.petType && updatedPet.service && updatedPet.weight) {
        const selectedService = serviceOptions[updatedPet.petType]?.find(
          (s) => s.value === updatedPet.service
        );
        const selectedWeight = weightOptions[updatedPet.petType]?.find(
          (w) => w.value === updatedPet.weight
        );
        if (selectedService && selectedWeight) {
          updatedPet.price = selectedService.price * selectedWeight.priceMultiplier;
        }
      }

      newPets[index] = updatedPet;
      return newPets;
    });
  };

  const calculateDeposit = () => selectedSlots.length * 50000;

  const addNewPet = () => {
    if (pets.length < selectedSlots.length) {
      setPets([
        ...pets,
        {
          id: pets.length + 1,
          petType: '',
          service: '',
          weight: '',
          note: '',
          price: 0,
        },
      ]);
    }
  };

  const removePet = (index) => {
    if (pets.length > 1) setPets(pets.filter((_, i) => i !== index));
  };

  const totalPrice = pets.reduce((sum, pet) => sum + pet.price, 0);

  const validatePhone = (phone) => /^0\d{9}$/.test(phone);

  const handleCustomerInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setCustomerInfo((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      fullName: name === 'fullName' && !value.trim() ? 'Vui lòng nhập họ tên' : '',
      phone:
        name === 'phone' && !value.trim()
          ? 'Vui lòng nhập số điện thoại'
          : name === 'phone' && value.trim() && !validatePhone(value)
          ? 'Số điện thoại không hợp lệ'
          : '',
    }));
  };

  const handleBookingClick = () => {
    if (!isBookingEnabled) {
      alert('Cửa hàng hiện đang tạm nghỉ, không thể đặt lịch.');
      return;
    }
    if (selectedSlots.length > 0) {
      setIsServiceModalOpen(true);
    } else {
      alert('Vui lòng chọn ít nhất một khung giờ');
    }
  };

  const handleApiBooking = async () => {
    if (!selectedTime || !customerInfo.fullName || !customerInfo.phone) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const payload = {
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        customerName: customerInfo.fullName,
        phone: customerInfo.phone,
        depositAmount: calculateDeposit(),
        pets: pets.map(pet => ({
          petType: pet.petType.toUpperCase(),
          petService: { id: parseInt(pet.service) },
          petWeight: { petWeightId: parseInt(pet.weight) },
          note: pet.note,
          price: pet.price,
        })),
      };

      await TimeSlotService.bookAppointment(payload);
      alert('Đặt lịch thành công! Vui lòng thanh toán để hoàn tất.');
      setSelectedTime('');
      setSelectedSlots([]);
      setCustomerInfo({
        fullName: '',
        phone: '',
        acceptTerms: false,
      });

      const data = await TimeSlotService.getTimeSlots(selectedDate.toISOString().split('T')[0]);
      setTimeSlots(data);
    } catch (error) {
      console.error('Error booking:', error);
      alert('Đặt lịch thất bại!');
    }
  };

  const handleServiceConfirm = () => {
    const isPetCountValid = pets.length === selectedSlots.length;
    const isPetInfoValid = pets.every((pet) => pet.petType && pet.service && pet.weight);

    setServiceErrors({
      petCount: !isPetCountValid,
      petInfo: !isPetInfoValid,
    });

    if (isPetCountValid && isPetInfoValid) {
      setIsServiceModalOpen(false);
      setIsCustomerModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="bg-white border-b w-full">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center text-sm">
            <Link to="/" className="flex items-center text-gray-600 hover:text-[#026AC7]">
              <FaHome className="mr-1" />
              <span>Trang chủ</span>
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

          {fetchError && (
            <div className="bg-red-50 p-4 rounded-lg text-center mb-6">
              <p className="text-red-700">{fetchError}</p>
              <button
                onClick={() => fetchServicesAndWeights()}
                className="mt-2 px-4 py-2 bg-[#026AC7] text-white rounded-md hover:bg-[#0253a0]"
              >
                Thử lại
              </button>
            </div>
          )}

          {isLoadingServices ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#026AC7]"></div>
              <span className="ml-2 text-gray-500">Đang tải dữ liệu dịch vụ...</span>
            </div>
          ) : (
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
                                setSelectedSession('');
                                setSelectedTime('');
                                setSelectedSlots([]);
                              }}
                            />
                            <label
                              htmlFor={`date-${index}`}
                              className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all ${
                                selectedDate.toDateString() === date.toDateString()
                                  ? 'bg-[#026AC7] text-white shadow-md transform scale-105'
                                  : 'hover:bg-[#CDEBFF] border border-gray-100'
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
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-[#026AC7] rounded-full p-1.5 text-white">
                        <FaSpa className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Chọn khung giờ</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setSelectedSession('morning')}
                        className={`p-4 rounded-lg text-center transition-all ${
                          selectedSession === 'morning'
                            ? 'bg-[#026AC7] text-white shadow-md transform scale-105'
                            : 'bg-white hover:bg-[#CDEBFF] border border-gray-200'
                        }`}
                      >
                        <h4 className="font-medium">Buổi sáng</h4>
                        <p className="text-sm">9:00 - 14:00</p>
                      </button>
                      <button
                        onClick={() => setSelectedSession('afternoon')}
                        className={`p-4 rounded-lg text-center transition-all ${
                          selectedSession === 'afternoon'
                            ? 'bg-[#026AC7] text-white shadow-md transform scale-105'
                            : 'bg-white hover:bg-[#CDEBFF] border border-gray-200'
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
                        {timeSlots[selectedSession]?.length > 0 ? (
                          timeSlots[selectedSession].map((block, blockIndex) => (
                            <div key={blockIndex} className="mb-4 last:mb-0">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="w-16 text-sm font-medium text-[#026AC7] mt-2">{block.hour}</span>
                                <div className="flex-1">
                                  <div className="grid grid-cols-4 gap-3">
                                    {Array.from({ length: block.totalSlots }, (_, slotIndex) => {
                                      const slotId = `${block.hour}-${slotIndex}`;
                                      const isBooked = slotIndex < block.bookedSlots;
                                      return (
                                        <div key={slotIndex}>
                                          <input
                                            type="checkbox"
                                            id={`time-${block.hour}-${slotIndex}`}
                                            className="hidden"
                                            disabled={
                                              isBooked ||
                                              (selectedSlots.length > 0 &&
                                                !selectedSlots.includes(slotId) &&
                                                selectedTime !== block.hour) ||
                                              isSlotDisabled(block.hour)
                                            }
                                            checked={selectedSlots.includes(slotId)}
                                            onChange={() => handleSlotSelection(block.hour, slotIndex)}
                                          />
                                          <label
                                            htmlFor={`time-${block.hour}-${slotIndex}`}
                                            className={`block w-full h-10 relative rounded-lg cursor-pointer transition-all border-2
                                              ${
                                                isBooked
                                                  ? 'bg-gray-500 border-gray-200 opacity-50 cursor-not-allowed'
                                                  : selectedSlots.includes(slotId)
                                                  ? 'bg-[#026AC7] border-[#026AC7] shadow-md transform scale-105'
                                                  : selectedTime && selectedTime !== block.hour
                                                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                                                  : isSlotDisabled(block.hour)
                                                  ? 'bg-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                                  : 'bg-white border-gray-200 hover:border-[#026AC7] hover:shadow'
                                              }`}
                                          >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <span
                                                className={`text-sm font-medium ${
                                                  selectedSlots.includes(slotId)
                                                    ? 'text-white'
                                                    : isBooked
                                                    ? 'text-gray-300'
                                                    : 'text-gray-600'
                                                }`}
                                              >
                                                {isBooked ? 'Đã đặt' : `Slot ${slotIndex + 1}`}
                                              </span>
                                            </div>
                                          </label>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">Không có khung giờ nào khả dụng</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Vui lòng chọn buổi sáng hoặc buổi chiều để xem các khung giờ khả dụng
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border-2 border-gray-200 rounded-lg"></div>
                          <span>Còn trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#026AC7] rounded-lg"></div>
                          <span>Đang chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-500 border-2 border-gray-200 rounded-lg opacity-50"></div>
                          <span>Đã đặt</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <button
                        onClick={handleBookingClick}
                        disabled={selectedSlots.length === 0 || !isBookingEnabled}
                        className={`px-8 py-3 rounded-lg font-medium transition-all ${
                          selectedSlots.length > 0 && isBookingEnabled
                            ? 'bg-[#026AC7] text-white hover:bg-[#0253a0] shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Đặt lịch
                      </button>
                    </div>
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
                      <span className="font-medium text-[#026AC7]">{selectedTime || '--:--'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-dashed">
                      <span className="text-gray-600">Số lượng thú cưng</span>
                      <span className="font-medium">{selectedSlots.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-dashed">
                      <span className="text-gray-600">Tiền cọc</span>
                      <span className="font-bold text-[#026AC7]">
                        {calculateDeposit().toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="p-4 bg-[#CDEBFF] rounded-lg mt-4">
                      <div className="flex items-start">
                        <div className="text-[#026AC7] mr-2 mt-1">
                          <FaClock className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-gray-700">
                          Tiền cọc 50.000đ/slot sẽ được hoàn trả khi bạn hủy lịch trước 12 tiếng. Sau thời gian này, tiền cọc sẽ không được hoàn lại. Vui lòng liên hệ Hotline 0844 233 799 để hủy lịch.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-3 text-gray-700">Quy trình dịch vụ:</h3>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">1</div>
                        <p className="text-sm text-gray-600">Đặt lịch và thanh toán tiền cọc</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">2</div>
                        <p className="text-sm text-gray-600">Mang thú cưng đến Petcare đúng giờ hẹn</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#026AC7] text-white flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 text-sm">3</div>
                        <p className="text-sm text-gray-600">Sử dụng dịch vụ và thanh toán phần còn lại</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          handleApiBooking={handleApiBooking} // Truyền handleApiBooking xuống CustomerModal
        />
      </div>
    </div>
  );
};

export default Appointment;