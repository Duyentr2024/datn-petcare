import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Mock data cho các slot
const generateMockSlots = () => {
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    return Array.from({ length: 4 }, (_, index) => ({
      id: `${time}-${index + 1}`,
      time: time,
      date: new Date(),
      slot_index: index + 1,
      status: 'AVAILABLE'
    }));
  }).flat();
  return timeSlots;
};

const ManageSlot = () => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [dateOption, setDateOption] = useState('all');
  const [selectedDates, setSelectedDates] = useState([]);
  const [slotQuantity, setSlotQuantity] = useState(1);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [slots, setSlots] = useState(generateMockSlots());
  const [filterDate, setFilterDate] = useState(null);
  const [filterTime, setFilterTime] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, slot: null });
  const slotsPerPage = 10;

  // Generate time slots from 9:00 to 20:00 with default 4 slots each
  const DEFAULT_SLOTS = 4;

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      quantity: DEFAULT_SLOTS,
      isDefault: true
    };
  });

  // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Handle slot deletion
  const handleDeleteSlot = (slot) => {
    if (!slot) {
      setNotification({
        show: true,
        message: 'Vui lòng chọn slot để xóa',
        type: 'error'
      });
      return;
    }

    // Xóa slot khỏi danh sách
    const newSlots = slots.filter(s => s.id !== slot.id);
    setSlots(newSlots);

    setNotification({
      show: true,
      message: 'Xóa slot thành công!',
      type: 'success'
    });
  };

  // Handle adding new slots
  const handleAddSlot = () => {
    if (dateOption === 'specific' && selectedDates.length === 0) {
      setNotification({
        show: true,
        message: 'Vui lòng chọn ít nhất một ngày',
        type: 'error'
      });
      return;
    }

    const dates = dateOption === 'specific' ? selectedDates : [new Date()];
    
    // Thêm slot mới vào danh sách
    const newSlots = [...slots];
    for (const date of dates) {
      for (let i = 0; i < slotQuantity; i++) {
        newSlots.push({
          id: `${selectedTimeSlot}-${newSlots.length + 1}`,
          time: selectedTimeSlot,
          date: date,
          slot_index: newSlots.length + 1,
          status: 'AVAILABLE'
        });
      }
    }
    setSlots(newSlots);

    setNotification({
      show: true,
      message: dateOption === 'all' 
        ? 'Đã tạo slot mặc định cho tất cả khung giờ!' 
        : 'Thêm slot thành công!',
      type: 'success'
    });

    if (dateOption === 'specific') {
      setSelectedDates([]);
    }
  };

  // Thêm useEffect để tự động đóng notification sau 3 giây
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    if (!slot) return false;
    
    try {
      const matchDate = !filterDate || format(new Date(slot.date), 'dd/MM/yyyy') === format(filterDate, 'dd/MM/yyyy');
      const matchTime = !filterTime || slot.time === filterTime;
      const matchStatus = filterStatus === 'all' || slot.status === filterStatus;
      const matchSearch = !searchTerm || 
        format(new Date(slot.date), 'dd/MM/yyyy').includes(searchTerm) ||
        slot.time.includes(searchTerm);
      return matchDate && matchTime && matchStatus && matchSearch;
    } catch (error) {
      console.error('Error filtering slot:', slot, error);
      return false;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredSlots.length / slotsPerPage);
  const paginatedSlots = filteredSlots.slice(
    (currentPage - 1) * slotsPerPage,
    currentPage * slotsPerPage
  );

  // Hiển thị danh sách slot trong bảng
  const renderSlotList = () => {
    return timeSlots.map((timeSlot) => {
      // Tìm tất cả slot cho khung giờ này
      const timeSlots = slots.filter(s => s.time === timeSlot.time);
      const availableSlots = timeSlots.filter(s => s.status === 'AVAILABLE').length;
      const bookedSlots = timeSlots.filter(s => s.status === 'BOOKED').length;
      const totalSlots = timeSlots.length || DEFAULT_SLOTS;

      return (
        <tr key={timeSlot.time} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {timeSlot.time}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {totalSlots} tổng
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {availableSlots} trống
              </span>
              {bookedSlots > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {bookedSlots} đã đặt
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {timeSlots.length > 0 && format(new Date(timeSlots[0].date), 'dd/MM/yyyy', { locale: vi })}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => handleDeleteSlot(timeSlots[0])}
              className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-3 flex items-center justify-end space-x-1"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xóa</span>
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl">
      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => setNotification(prev => ({ ...prev, show: false }))}></div>
            <div className="relative bg-white rounded-lg max-w-sm w-full mx-4 p-6 text-center transform transition-all">
              {/* Thêm nút đóng */}
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              } mb-4`}>
                {notification.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className={`text-lg font-medium ${
                notification.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {notification.message}
              </h3>
              
              {/* Thêm nút OK */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Slot Form */}
      <div className="py-5">
        <div className="flex items-center mb-5">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Thêm slot mới</h3>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Slot Selection */}
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn khung giờ
              </label>
              <div className="relative">
                <select
                  id="timeSlot"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200 bg-white"
                >
                  {timeSlots.map((time) => (
                    <option key={time.time} value={time.time}>
                      {time.time}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Slot Quantity */}
            <div>
              <label htmlFor="slotQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng slot
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="slotQuantity"
                  min="1"
                  value={slotQuantity}
                  onChange={(e) => setSlotQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="block w-full pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày áp dụng
            </label>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center">
                <input
                  id="specific-date"
                  name="date-option"
                  type="radio"
                  checked={dateOption === 'specific'}
                  onChange={() => setDateOption('specific')}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="specific-date" className="ml-3 block text-sm font-medium text-gray-700">
                  Chọn ngày cụ thể
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="all-days"
                  name="date-option"
                  type="radio"
                  checked={dateOption === 'all'}
                  onChange={() => setDateOption('all')}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="all-days" className="ml-3 block text-sm font-medium text-gray-700">
                  Mặc định cho tất cả các ngày
                </label>
              </div>
            </div>
          </div>

          {/* Date Picker (only shown when "specific date" is selected) */}
          {dateOption === 'specific' && (
            <div className="mt-5">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn ngày
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedDates([...selectedDates, new Date()])}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm ngày
                </button>
              </div>
              <div className="space-y-3">
                {selectedDates.map((date, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <select
                        value={date.getDate()}
                        onChange={(e) => {
                          const newDates = [...selectedDates];
                          const newDate = new Date(date);
                          newDate.setDate(parseInt(e.target.value));
                          newDates[index] = newDate;
                          setSelectedDates(newDates);
                        }}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                      >
                        {Array.from(
                          { length: lastDayOfMonth.getDate() },
                          (_, i) => i + 1
                        ).map(day => (
                          <option key={day} value={day}>
                            {day} tháng {today.getMonth() + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDates = selectedDates.filter((_, i) => i !== index);
                          setSelectedDates(newDates);
                        }}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Delete Buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={handleAddSlot}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm slot
            </button>
            <button
              type="button"
              onClick={() => handleDeleteSlot(slots.find(s => s.time === selectedTimeSlot))}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa slot
            </button>
          </div>
        </div>
      </div>

      {/* Slot List Section */}
      <div className="px-6 py-5 border-t border-gray-200">
        <div className="flex items-center mb-5">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Danh sách slot</h3>
        </div>

        {/* Table */}
        <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khung giờ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng slot
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày thay đổi
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderSlotList()}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Xác nhận xóa thay đổi
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Bạn có chắc chắn muốn xóa thay đổi này và khôi phục về mặc định?
                          <br />
                          Khung giờ: {deleteConfirm.slot?.time}
                          <br />
                          Ngày: {deleteConfirm.slot && format(deleteConfirm.slot.date, 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Xóa thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ show: false, slot: null })}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlot;
