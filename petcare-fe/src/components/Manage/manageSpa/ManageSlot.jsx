import { useState, useEffect } from 'react';
import TimeSlotService from '../../../service/spaService/TimeSlotService';


const ManageSlot = () => {
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [slotQuantity, setSlotQuantity] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [slotsConfig, setSlotsConfig] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('active');

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const tomorrow = today.getDate() + 1;
  const futureDates = Array.from(
      { length: daysInMonth - today.getDate() },
      (_, i) => tomorrow + i
  );

  const filteredSlots = slotsConfig.filter(slot =>
      activeTab === 'all' || (activeTab === 'active' && slot.isActive) || (activeTab === 'inactive' && !slot.isActive)
  );

  useEffect(() => {
    fetchSlotsConfig();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ ...notification, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchSlotsConfig = async () => {
    try {
      const date = today.toISOString().split('T')[0];
      const response = await TimeSlotService.getTimeSlots(date);
      const apiSlots = [...response.morning, ...response.afternoon];

      const adjustmentsResponse = await TimeSlotService.getAllSlotAdjustmentsInMonth(today.getFullYear(), today.getMonth() + 1);
      const adjustments = adjustmentsResponse;

      const updatedSlots = timeSlots.map(time => {
        const apiSlot = apiSlots.find(slot => slot.hour === time);
        const defaultEntry = { 
          date: null, 
          quantity: apiSlot ? apiSlot.totalSlots : 4, 
          note: 'Mặc định', 
          isDefault: true 
        };
        
        const entries = [defaultEntry];
        const timeAdjustments = adjustments.filter(adj => adj.time === time);
        timeAdjustments.forEach(adj => {
          const adjDate = new Date(adj.date);
          const day = adjDate.getDate();
          entries.push({
            date: adj.date,
            quantity: adj.slotCount,
            note: `Áp dụng cho ngày ${day}/${today.getMonth() + 1}/${today.getFullYear()}`,
            isDefault: false,
          });
        });

        return {
          time,
          entries,
          isActive: apiSlot ? apiSlot.active : true,
        };
      });

      setSlotsConfig(updatedSlots);
    } catch (error) {
      // showNotification('Lỗi khi tải danh sách slot: ' + error.message, 'error');
    }
  };

  const handleAddSlots = async () => {
    if (selectedDates.length === 0) {
      showNotification('Vui lòng chọn ít nhất một ngày', 'error');
      return;
    }
    try {
      for (const day of selectedDates) {
        const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
        await TimeSlotService.addSlots(date, selectedTimeSlot, slotQuantity);
      }
      await fetchSlotsConfig();
      showNotification(`Đã thêm ${slotQuantity} slot cho khung giờ ${selectedTimeSlot}`, 'success');
      if (window.updateAppointment) window.updateAppointment();
    } catch (error) {
      showNotification('Lỗi khi thêm slot: ' + error.message, 'error');
    }
  };

  const handleRemoveSlots = async () => {
    if (selectedDates.length === 0) {
      showNotification('Vui lòng chọn ít nhất một ngày', 'error');
      return;
    }
    try {
      for (const day of selectedDates) {
        const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
        const slot = slotsConfig.find(s => s.time === selectedTimeSlot);
        const currentEntry = slot.entries.find(e => e.date === date) || slot.entries[0];
        const newQuantity = currentEntry.quantity - slotQuantity;

        if (newQuantity < 0) {
          showNotification('Số lượng slot không thể nhỏ hơn 0', 'error');
          return;
        }

        if (newQuantity <= 4) {
          const updatedSlots = slotsConfig.map(s => {
            if (s.time === selectedTimeSlot) {
              const updatedEntries = s.entries.map(e => 
                e.date === date ? { ...e, quantity: newQuantity } : e
              );
              if (!updatedEntries.some(e => e.date === date)) {
                updatedEntries.push({ date, quantity: newQuantity, note: `Áp dụng cho ngày ${day}/${today.getMonth() + 1}/${today.getFullYear()}`, isDefault: false });
              }
              return { ...s, entries: updatedEntries };
            }
            return s;
          });
          setSlotsConfig(updatedSlots);
        } else {
          await TimeSlotService.removeSlots(date, selectedTimeSlot, slotQuantity);
        }
      }
      await fetchSlotsConfig();
      showNotification(`Đã xóa ${slotQuantity} slot cho khung giờ ${selectedTimeSlot}`, 'success');
      if (window.updateAppointment) window.updateAppointment();
    } catch (error) {
      showNotification('Lỗi khi xóa slot: ' + error.message, 'error');
    }
  };

  const resetSlotToDefault = async (time, date) => {
    try {
      await TimeSlotService.resetToDefault(date, time);
      await fetchSlotsConfig();
      showNotification(`Đã khôi phục khung giờ ${time} về mặc định (4 slot) cho ngày ${new Date(date).getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`, 'success');
      if (window.updateAppointment) window.updateAppointment();
    } catch (error) {
      showNotification('Lỗi khi khôi phục slot: ' + error.message, 'error');
    }
  };

  const toggleSlotVisibility = async (time) => {
    try {
      const slot = slotsConfig.find((s) => s.time === time);
      if (!slot) return;

      const newIsActive = !slot.isActive;
      // Đồng bộ định dạng thời gian với BE
      const formattedTime = time + ":00"; // Chuyển "09:00" thành "09:00:00"
      await TimeSlotService.toggleSlotVisibility(formattedTime, newIsActive);

      await fetchSlotsConfig();
      if (activeTab === "active" && !newIsActive) setActiveTab("inactive");
      else if (activeTab === "inactive" && newIsActive) setActiveTab("active");

      showNotification(`Đã ${newIsActive ? "bật" : "tắt"} hiển thị khung giờ ${time}`, "success");
      if (window.updateAppointment) window.updateAppointment();
    } catch (error) {
      showNotification("Lỗi khi cập nhật trạng thái hiển thị: " + error.message, "error");
    }
  };

  const handleDateChange = (index, value) => {
    const newDates = [...selectedDates];
    newDates[index] = parseInt(value);
    setSelectedDates(newDates);
  };

  const handleAddDate = () => {
    setSelectedDates([...selectedDates, tomorrow]);
  };

  const handleRemoveDate = (index) => {
    const newDates = [...selectedDates];
    newDates.splice(index, 1);
    setSelectedDates(newDates);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  // Giữ nguyên phần return (UI) như cũ
  return (
    <div className="bg-white rounded-xl">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`relative flex items-center p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-800'
                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-800'
            }`}
          >
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-offset-2 p-1.5 inline-flex h-8 w-8 items-center justify-center transition-colors duration-200"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="py-5">
        <div className="flex items-center mb-5">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Quản lý số lượng slot</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn khung giờ <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <select
                  id="timeSlot"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="slotQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng slot (1-100) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="slotQuantity"
                  min="1"
                  max="100"
                  value={slotQuantity}
                  onChange={(e) => setSlotQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ngày cụ thể <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Chọn ngày trong tháng {today.getMonth() + 1}/{today.getFullYear()}
              </label>
              <button
                type="button"
                onClick={handleAddDate}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm ngày
              </button>
            </div>

            {selectedDates.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-

5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Chưa có ngày nào được chọn. Vui lòng nhấn "Thêm ngày".
                    </p>
                  </div>
                </div>
              </div>
            )}
            {selectedDates.length > 0 && (
              <div className="space-y-3">
                {selectedDates.map((date, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <select
                      value={date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {futureDates.map(day => (
                        <option key={day} value={day}>
                          {day} tháng {today.getMonth() + 1}/{today.getFullYear()}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-full focus:outline-none"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={handleAddSlots}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm slot
            </button>
            <button
              type="button"
              onClick={handleRemoveSlots}
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

      <div className="py-5 border-t border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Danh sách slot đã thiết lập</h3>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Trạng thái:
            </label>
            <select
              id="status-filter"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="active">Đang hiển thị</option>
              <option value="inactive">Đã tắt hiển thị</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>

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
                  Thông tin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSlots.length > 0 ? (
                filteredSlots.map((slot) => (
                  slot.entries.map((entry, index) => (
                    <tr key={`${slot.time}-${entry.date || 'default'}`} 
                        className={`hover:bg-gray-50 ${!slot.isActive ? 'bg-gray-100 opacity-75 border-l-4 border-red-400' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {slot.time}
                        {!slot.isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Đã tắt
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entry.quantity} slots
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.note}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            slot.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {slot.isActive ? 'Đang hiển thị' : 'Đã tắt hiển thị'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!entry.isDefault && (
                            <button
                              onClick={() => resetSlotToDefault(slot.time, entry.date)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Khôi phục</span>
                            </button>
                          )}
                          {index === 0 && (
                            <button
                              onClick={() => toggleSlotVisibility(slot.time)}
                              className={`${slot.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-200 flex items-center`}
                            >
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={slot.isActive 
                                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                                    : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                                />
                              </svg>
                              <span>{slot.isActive ? 'Tắt hiển thị' : 'Bật hiển thị'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có slot nào được tìm thấy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageSlot;