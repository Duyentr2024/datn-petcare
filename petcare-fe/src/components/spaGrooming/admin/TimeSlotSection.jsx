import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { FaPaw } from 'react-icons/fa';

const TimeSlotSection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState('morning');
  const [timeSlots, setTimeSlots] = useState(Array(20).fill('empty')); // empty, selected, booked

  // Cập nhật số lượng slot khi thay đổi buổi
  useEffect(() => {
    const slotCount = selectedSession === 'morning' ? 20 : 24;
    setTimeSlots(Array(slotCount).fill('empty'));
  }, [selectedSession]);

  // Tạo mảng ngày từ -7 đến +7 ngày
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
      const date = i < 0 ? subDays(today, Math.abs(i)) : addDays(today, i);
      dates.push(date);
    }
    return dates;
  };

  // Tạo mảng giờ dựa vào buổi được chọn
  const getTimeSlots = () => {
    if (selectedSession === 'morning') {
      return ['9:00', '10:00', '11:00', '12:00', '13:00'];
    }
    return ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  };

  return (
    <div>
      {/* Select inputs container */}
      <div className="flex gap-4 mb-6">
        {/* Date select */}
        <select 
          className="flex-1 p-2 border rounded-md"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        >
          {generateDateOptions().map((date) => {
            const isPastDate = date < new Date().setHours(0, 0, 0, 0);
            return (
              <option 
                key={format(date, 'yyyy-MM-dd')} 
                value={format(date, 'yyyy-MM-dd')}
                className={isPastDate ? 'text-gray-400' : 'text-gray-900'}
              >
                {format(date, 'dd/MM/yyyy')}
              </option>
            );
          })}
        </select>

        {/* Session select */}
        <select
          className="flex-1 p-2 border rounded-md"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="morning">Buổi sáng</option>
          <option value="afternoon">Buổi chiều</option>
        </select>
      </div>

      {/* Time slots section */}
      <div className="flex gap-2">
        {/* Time labels */}
        <div className="flex flex-col justify-between py-3">
          {getTimeSlots().map((time) => (
            <div key={time} className="h-10 flex items-center text-sm text-gray-600">
              {time}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="grid grid-cols-4 gap-3 flex-1">
          {timeSlots.map((status, index) => (
            <label key={index} className="relative block">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={status === 'selected'}
                onChange={() => {
                  const newTimeSlots = [...timeSlots];
                  newTimeSlots[index] = status === 'selected' ? 'empty' : 'selected';
                  setTimeSlots(newTimeSlots);
                }}
                disabled={status === 'booked'}
              />
              <div className={`h-10 w-full border rounded cursor-pointer
                ${status === 'booked' ? 'bg-gray-500 cursor-not-allowed' : ''}
                ${status === 'selected' ? 'bg-blue-500' : ''}
                ${status === 'empty' ? 'bg-white hover:bg-gray-100' : ''}
              `}>
                <span className="absolute inset-0 flex items-center justify-center text-sm">
                  <FaPaw className={`${status === 'selected' ? 'text-white' : 'text-gray-600'}`} />
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-300 bg-white"></div>
          <span className="text-sm">Còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-300 bg-blue-500"></div>
          <span className="text-sm">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-gray-300 bg-gray-500"></div>
          <span className="text-sm">Đã đặt</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSection; 