import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import ManageSlot from './ManageSlot';
import ManagePetService from './ManagePetService';
import ManageWeight from './ManageWeight';
import TimeSlotService from '../../../service/spaService/TimeSlotService';

const ManageSpaPage = () => {
  const [activeTab, setActiveTab] = useState('slot');
  const [isBookingEnabled, setIsBookingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        setIsLoading(true);
        const status = await TimeSlotService.getBookingStatus();
        setIsBookingEnabled(status);
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái đặt lịch:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingStatus();
  }, []);

  const toggleBookingStatus = async () => {
    const newStatus = !isBookingEnabled;
    try {
      setIsLoading(true);
      await TimeSlotService.updateBookingStatus(newStatus);
      setIsBookingEnabled(newStatus);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt lịch:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Quản lý đặt lịch</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-white">
              {isBookingEnabled ? 'Đang mở đặt lịch' : 'Tạm ngưng đặt lịch'}
            </span>
            <Switch
              checked={isBookingEnabled}
              onChange={toggleBookingStatus}
              disabled={isLoading}
              className={`${
                isBookingEnabled ? 'bg-green-400' : 'bg-red-400'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 ${
                isBookingEnabled ? 'focus:ring-green-400' : 'focus:ring-red-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">Bật/tắt chức năng đặt lịch</span>
              <span
                className={`${
                  isBookingEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-gray-200">
        <div className={`p-3 rounded-lg ${isBookingEnabled ? 'bg-green-50' : 'bg-red-50'} flex items-start`}>
          <div className={`flex-shrink-0 ${isBookingEnabled ? 'text-green-500' : 'text-red-500'}`}>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${isBookingEnabled ? 'text-green-800' : 'text-red-800'}`}>
              {isBookingEnabled ? 'Hệ thống đang hoạt động bình thường' : 'Cửa hàng tạm nghỉ'}
            </h3>
            <div className={`mt-1 text-sm ${isBookingEnabled ? 'text-green-700' : 'text-red-700'}`}>
              <p>
                {isBookingEnabled
                  ? 'Khách hàng có thể đặt lịch bình thường.'
                  : 'Chức năng đặt lịch đã bị vô hiệu hóa. Khách hàng sẽ nhìn thấy thông báo "Cửa hàng tạm nghỉ".'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1.5 rounded-xl shadow-inner flex space-x-1 w-full max-w-2xl">
            <button
              onClick={() => setActiveTab('slot')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'slot'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Quản lý Slot</span>
            </button>
            <button
              onClick={() => setActiveTab('petService')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'petService'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Quản lý Dịch vụ</span>
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'weight'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span>Quản lý Cân nặng</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 transition-all duration-300">
        <div className={`transition-opacity duration-300 ${activeTab === 'slot' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {activeTab === 'slot' && <ManageSlot />}
        </div>
        <div className={`transition-opacity duration-300 ${activeTab === 'petService' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {activeTab === 'petService' && <ManagePetService />}
        </div>
        <div className={`transition-opacity duration-300 ${activeTab === 'weight' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {activeTab === 'weight' && <ManageWeight />}
        </div>
      </div>
    </div>
  );
};

export default ManageSpaPage;