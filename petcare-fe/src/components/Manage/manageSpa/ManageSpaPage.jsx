import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import ManageSlot from './ManageSlot';
import ManagePetService from './ManagePetService';
import ManageWeight from './ManageWeight';
import ManageSchedule from './ManageSchedule';
import TimeSlotService from '../../../service/spaService/TimeSlotService';
import { useAuth } from '../../../context/AuthContext.jsx';

const ManageSpaPage = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('slot');
  const [isBookingEnabled, setIsBookingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const status = await TimeSlotService.getBookingStatus();
        setIsBookingEnabled(status);
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái đặt lịch:', error.message);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookingStatus();
  }, []);

  const toggleBookingStatus = async () => {
    if (!user?.userId || !token) {
      console.error('Không tìm thấy userId hoặc token. Vui lòng đăng nhập với vai trò admin.');
      setErrorMessage('Không tìm thấy userId hoặc token. Vui lòng đăng nhập với vai trò admin.');
      return;
    }

    const newStatus = !isBookingEnabled;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await TimeSlotService.updateBookingStatus(newStatus, token);
      setIsBookingEnabled(newStatus);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt lịch:', error.message);
      setErrorMessage(error.message);
      if (error.message.includes("Phiên đăng nhập hết hạn")) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canToggleBooking = user && (user.role === "ADMIN" || user.role === "STAFF");

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Quản lý đặt lịch</h2>
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-full ${isBookingEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isBookingEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-sm font-medium ${isBookingEnabled ? 'text-green-700' : 'text-red-700'}`}>
              {isBookingEnabled ? 'Đang mở đặt lịch' : 'Tạm ngưng đặt lịch'}
            </span>
            <Switch
              checked={isBookingEnabled}
              onChange={toggleBookingStatus}
              disabled={isLoading || !canToggleBooking}
              className={`${
                isBookingEnabled ? 'bg-green-500' : 'bg-red-500'
              } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isBookingEnabled ? 'focus:ring-green-500' : 'focus:ring-red-500'
              } ${isLoading || !canToggleBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">Bật/tắt chức năng đặt lịch</span>
              <span
                className={`${
                  isBookingEnabled ? 'translate-x-7' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out`}
              />
            </Switch>
            {!canToggleBooking && (
              <p className="text-red-500 text-xs whitespace-nowrap">
                Chỉ ADMIN/STAFF mới có quyền
              </p>
            )}
          </div>
        </div>
        {errorMessage && (
          <p className="text-red-700 text-xs mt-2">{errorMessage}</p>
        )}
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
          <div className="bg-gray-100 p-1.5 rounded-xl shadow-inner flex space-x-1 w-full max-w-5xl">
            {/*<button*/}
            {/*  onClick={() => setActiveTab('slot')}*/}
            {/*  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 min-w-[120px] ${*/}
            {/*    activeTab === 'slot'*/}
            {/*      ? 'bg-white text-indigo-600 shadow-sm'*/}
            {/*      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'*/}
            {/*  }`}*/}
            {/*>*/}
            {/*  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
            {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />*/}
            {/*  </svg>*/}
            {/*  <span>Quản lý Slot</span>*/}
            {/*</button>*/}
            <button
              onClick={() => setActiveTab('petService')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 min-w-[140px] ${
                activeTab === 'petService'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Quản lý Dịch vụ</span>
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 min-w-[140px] ${
                activeTab === 'weight'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span>Quản lý Cân nặng</span>
            </button>
            {/*<button*/}
            {/*  onClick={() => setActiveTab('schedule')}*/}
            {/*  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 min-w-[140px] ${*/}
            {/*    activeTab === 'schedule'*/}
            {/*      ? 'bg-white text-indigo-600 shadow-sm'*/}
            {/*      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'*/}
            {/*  }`}*/}
            {/*>*/}
            {/*  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
            {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />*/}
            {/*  </svg>*/}
            {/*  <span>Lên lịch bật/tắt</span>*/}
            {/*</button>*/}
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
        <div className={`transition-opacity duration-300 ${activeTab === 'schedule' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {activeTab === 'schedule' && <ManageSchedule />}
        </div>
      </div>
    </div>
  );
};

export default ManageSpaPage;