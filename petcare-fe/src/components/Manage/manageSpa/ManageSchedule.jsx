import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VITE_API_BASE_URL = 'http://api.petcarect.store';

const ManageSchedule = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    scheduledTime: '',
    status: '',
    isRecurring: false,
    recurrencePattern: 'daily',
    description: ''
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await axios.get(`${VITE_API_BASE_URL}/api/staff/scheduled-booking-changes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('Fetch schedules response:', response.data);
      }
      setSchedules(response.data || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tải danh sách lịch';
      setErrorMessage(message);
      if (import.meta.env.DEV) {
        console.error('Error fetching schedules:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createSchedule = async (data) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Creating schedule:', data);
      }
      const response = await axios.post(`${VITE_API_BASE_URL}/api/staff/schedule-booking-enabled`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('Create schedule response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating schedule:', error);
      }
      throw new Error(error.response?.data?.message || 'Không thể tạo lịch mới');
    }
  };

  const updateSchedule = async (id, data) => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Updating schedule ID: ${id}`, data);
      }
      const response = await axios.put(`${VITE_API_BASE_URL}/api/staff/scheduled-booking-changes/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('Update schedule response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating schedule:', error);
      }
      throw new Error(error.response?.data?.message || 'Không thể cập nhật lịch');
    }
  };

  const deleteSchedule = async (id) => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Deleting schedule ID: ${id}`);
      }
      const response = await axios.delete(`${VITE_API_BASE_URL}/api/staff/scheduled-booking-changes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('Delete schedule response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting schedule:', error);
      }
      throw new Error(error.response?.data?.message || 'Không thể xóa lịch');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentPage]);

  useEffect(() => {
    let timer;
    if (errorMessage) {
      timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheduledTime || !formData.status) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = {
        scheduledTime: new Date(formData.scheduledTime).toISOString(),
        status: formData.status === 'true',
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
        description: formData.description.trim() || null
      };

      if (isEditing && selectedSchedule?.id) {
        await updateSchedule(selectedSchedule.id, data);
      } else {
        await createSchedule(data);
      }
      
      resetForm();
      await fetchSchedules();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      scheduledTime: format(new Date(schedule.scheduledTime), "yyyy-MM-dd'T'HH:mm"),
      status: schedule.status.toString(),
      isRecurring: schedule.isRecurring,
      recurrencePattern: schedule.recurrencePattern || 'daily',
      description: schedule.description || ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch này?')) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await deleteSchedule(id);
      await fetchSchedules();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      scheduledTime: '',
      status: '',
      isRecurring: false,
      recurrencePattern: 'daily',
      description: ''
    });
    setSelectedSchedule(null);
    setIsEditing(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(schedules.length / itemsPerPage);
  const paginatedSchedules = schedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Chỉnh sửa lịch' : 'Đặt lịch bật/tắt hệ thống'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ngày và giờ <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  min={getMinDateTime()}
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 p-3"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-[38px] transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Trạng thái <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 p-3"
                  required
                >
                  <option value="" className="text-gray-400">-- Chọn trạng thái --</option>
                  <option value="true" className="text-green-600">
                    Bật hệ thống
                  </option>
                  <option value="false" className="text-red-600">
                    Tắt hệ thống
                  </option>
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Ghi chú</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                placeholder="Nhập ghi chú (không bắt buộc)"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 p-3 h-24 resize-y"
              />
              <p className="mt-1 text-xs text-gray-500 italic">
                Tối đa 500 ký tự ({500 - formData.description.length} ký tự còn lại)
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Lặp lại</span>
                </label>
              </div>
              {formData.isRecurring && (
                <div className="mt-3 ml-7">
                  <select
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value })}
                    className="w-full md:w-auto rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 p-2"
                  >
                    <option value="daily">Mỗi ngày</option>
                    <option value="weekly">Mỗi tuần</option>
                    <option value="monthly">Mỗi tháng</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 italic">
                    Lịch sẽ lặp lại vào cùng giờ theo chu kỳ đã chọn
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-6 py-3 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-6 py-3 rounded-lg text-white shadow-md transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditing ? 'Cập nhật' : 'Lưu lịch'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Schedule List Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Danh sách lịch đã đặt</h2>
          </div>

          <div className="overflow-x-auto">
            {schedules.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lịch</h3>
                <p className="mt-1 text-sm text-gray-500">Chưa có lịch bật/tắt nào được tạo.</p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Ngày và giờ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Lặp lại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Người tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Trạng thái thực thi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Ghi chú
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSchedules.map((schedule, index) => (
                      <motion.tr 
                        key={schedule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="hover:bg-indigo-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {format(new Date(schedule.scheduledTime), 'dd/MM/yyyy', { locale: vi })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(schedule.scheduledTime), 'HH:mm', { locale: vi })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            schedule.status 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <span className={`h-2 w-2 mr-2 rounded-full ${schedule.status ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            {schedule.status ? 'Bật' : 'Tắt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            schedule.isRecurring
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {schedule.isRecurring ? (
                              <svg className="mr-1.5 h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            {schedule.isRecurring ? (
                              schedule.recurrencePattern === 'daily' ? 'Mỗi ngày' :
                              schedule.recurrencePattern === 'weekly' ? 'Mỗi tuần' :
                              'Mỗi tháng'
                            ) : 'Một lần'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {schedule.createdBy?.fullName || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            schedule.isExecuted
                              ? 'bg-gray-100 text-gray-800 border border-gray-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            <svg className={`mr-1.5 h-4 w-4 ${schedule.isExecuted ? 'text-gray-500' : 'text-yellow-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={schedule.isExecuted ? "M5 13l4 4L19 7" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                            </svg>
                            {schedule.isExecuted ? 'Đã thực thi' : 'Chưa thực thi'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="group relative">
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {schedule.description || 'Không có ghi chú'}
                            </p>
                            {schedule.description && (
                              <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-xs text-white bg-gray-800 rounded-lg">
                                {schedule.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 px-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Trước
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Trang {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  {isEditing ? 'Xác nhận cập nhật lịch?' : 'Xác nhận lưu lịch mới?'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    {isEditing ? 'Bạn có chắc muốn cập nhật lịch này?' : 'Bạn có chắc muốn tạo lịch mới?'}
                  </p>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 rounded-lg bg-red-50 p-4 border border-red-200 shadow-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Đóng</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageSchedule;