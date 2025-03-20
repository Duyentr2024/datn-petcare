import { useState, useEffect } from 'react';
import PetServiceService from '../../../service/spaService/PetServiceService';

const ManagePetService = () => {
  const initialFormData = {
    id: null,
    service_name: '',
    description: '',
    base_price: '',
    pet_type: 'DOG',
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('DOG');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [errors, setErrors] = useState({}); // State để lưu trữ lỗi tại các ô input
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const filteredServices = services.filter(
    (service) =>
      service.petType === activeTab &&
      (statusFilter === 'ALL' || service.statusType === statusFilter)
  );

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await PetServiceService.getAllServices();
      setServices(
        data.map((service) => ({
          ...service,
          statusType: service.statusType.toString(),
        }))
      );
    } catch (error) {
      setNotification({ show: true, message: error.message, type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'base_price') {
      const cleanedValue = value.replace(/[.,]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue === '' ? '' : parseFloat(cleanedValue),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Xóa lỗi khi người dùng bắt đầu nhập
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePetTypeChange = (type) => {
    if (!isEditing) {
      setFormData((prev) => ({ ...prev, pet_type: type }));
      setErrors((prev) => ({ ...prev, pet_type: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pet_type) {
      newErrors.pet_type = 'Vui lòng chọn loại thú cưng';
    }
    if (!formData.service_name) {
      newErrors.service_name = 'Vui lòng nhập tên dịch vụ';
    }
    if (!formData.base_price || formData.base_price <= 0) {
      newErrors.base_price = 'Giá cơ bản phải lớn hơn 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const serviceData = {
        serviceName: formData.service_name,
        description: formData.description || '',
        basePrice: formData.base_price,
        petType: formData.pet_type,
        statusType: formData.status,
      };

      if (isEditing && formData.id) {
        await PetServiceService.updateService(formData.id, serviceData);
        setNotification({ show: true, message: 'Cập nhật dịch vụ thành công!', type: 'success' });
      } else {
        await PetServiceService.createService(serviceData);
        setNotification({ show: true, message: 'Thêm dịch vụ mới thành công!', type: 'success' });
      }

      fetchServices();
      setFormData(initialFormData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      setNotification({ show: true, message: error.message, type: 'error' });
    }
  };

  const handleEdit = (service) => {
    setFormData({
      id: service.id,
      service_name: service.serviceName,
      description: service.description || '',
      base_price: service.basePrice,
      pet_type: service.petType,
      status: service.statusType,
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleStatusChange = (service, newStatus) => {
    const serviceData = {
      serviceName: service.serviceName,
      description: service.description || '',
      basePrice: service.basePrice,
      petType: service.petType,
      statusType: newStatus,
    };
    PetServiceService.updateService(service.id, serviceData)
      .then(() => {
        setNotification({
          show: true,
          message: newStatus === 'ACTIVE'
            ? 'Kích hoạt dịch vụ thành công!'
            : 'Vô hiệu hóa dịch vụ thành công!',
          type: 'success',
        });
        fetchServices();
      })
      .catch((error) => {
        setNotification({ show: true, message: error.message, type: 'error' });
      });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setErrors({});
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="bg-white rounded-xl">
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
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
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

      <div className="py-5">
        <div className="flex items-center mb-5">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <svg
              className="h-5 w-5 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại thú cưng <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="dog-type"
                    name="pet_type"
                    type="radio"
                    checked={formData.pet_type === 'DOG'}
                    onChange={() => handlePetTypeChange('DOG')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    disabled={isEditing}
                  />
                  <label htmlFor="dog-type" className="ml-3 block text-sm font-medium text-gray-700">
                    Chó
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="cat-type"
                    name="pet_type"
                    type="radio"
                    checked={formData.pet_type === 'CAT'}
                    onChange={() => handlePetTypeChange('CAT')}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    disabled={isEditing}
                  />
                  <label htmlFor="cat-type" className="ml-3 block text-sm font-medium text-gray-700">
                    Mèo
                  </label>
                </div>
              </div>
              {errors.pet_type && (
                <p className="mt-2 text-sm text-red-600">{errors.pet_type}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên dịch vụ"
                  className={`block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                    errors.service_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.service_name && (
                <p className="mt-2 text-sm text-red-600">{errors.service_name}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Nhập mô tả chi tiết về dịch vụ (không bắt buộc)"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                Giá cơ bản <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₫</span>
                </div>
                <input
                  type="text"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  placeholder="Nhập giá "
                  className={`block w-full pl-7 pr-12 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                    errors.base_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">VND</span>
                </div>
              </div>
              {errors.base_price && (
                <p className="mt-2 text-sm text-red-600">{errors.base_price}</p>
              )}
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isEditing ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  )}
                </svg>
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="py-5 border-t border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg
                className="h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Danh sách dịch vụ</h3>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Trạng thái:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đã vô hiệu hóa</option>
              <option value="ALL">Tất cả</option>
            </select>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('DOG')}
              className={`py-3 px-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'DOG'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dịch vụ cho Chó
            </button>
            <button
              onClick={() => setActiveTab('CAT')}
              className={`py-3 px-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'CAT'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dịch vụ cho Mèo
            </button>
          </div>
        </div>

        <div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá cơ bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className={`hover:bg-gray-50 ${service.statusType === 'INACTIVE' ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.serviceName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {service.description || 'Không có mô tả'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(service.basePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.statusType === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.statusType === 'ACTIVE' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(service, service.statusType === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                          }
                          className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200 flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                          <span>{service.statusType === 'ACTIVE' ? 'Xóa' : 'Kích hoạt'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có dịch vụ nào.
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

export default ManagePetService;