import { useState, useEffect } from 'react';
import PetWeightService from '../../../service/spaService/PetWeightService';

const ManageWeight = () => {
  const initialFormData = {
    id: null,
    pet_type: 'DOG',
    weight_range: '',
    price_multiplier: 1.0,
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [weights, setWeights] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('DOG');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [errors, setErrors] = useState({}); // State để lưu trữ lỗi tại các ô input
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const filteredWeights = weights.filter(
    (weight) =>
      weight.petType === activeTab &&
      (statusFilter === 'ALL' || weight.statusType === statusFilter)
  );

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const data = await PetWeightService.getAllPetWeights();
      setWeights(
        data.map((weight) => ({
          ...weight,
          statusType: weight.statusType.toString(),
        }))
      );
    } catch (error) {
      setNotification({ show: true, message: error.message, type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price_multiplier' ? parseFloat(value) : value,
    }));
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
    if (!formData.weight_range) {
      newErrors.weight_range = 'Vui lòng nhập khoảng cân nặng';
    }
    if (!formData.price_multiplier || formData.price_multiplier <= 0) {
      newErrors.price_multiplier = 'Hệ số giá phải lớn hơn 0';
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
      const weightData = {
        petType: formData.pet_type,
        weightRange: formData.weight_range,
        priceMultiplier: formData.price_multiplier,
        statusType: formData.status,
      };

      if (isEditing && formData.id) {
        await PetWeightService.updatePetWeight(formData.id, weightData);
        setNotification({ show: true, message: 'Cập nhật khoảng cân nặng thành công!', type: 'success' });
      } else {
        await PetWeightService.createPetWeight(weightData);
        setNotification({ show: true, message: 'Thêm khoảng cân nặng mới thành công!', type: 'success' });
      }

      fetchWeights();
      setFormData(initialFormData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      setNotification({ show: true, message: error.message, type: 'error' });
    }
  };

  const handleEdit = (weight) => {
    setFormData({
      id: weight.petWeightId,
      pet_type: weight.petType,
      weight_range: weight.weightRange,
      price_multiplier: weight.priceMultiplier,
      status: weight.statusType,
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleStatusChange = (weight, newStatus) => {
    const action = newStatus === 'ACTIVE' ? PetWeightService.activatePetWeight : PetWeightService.deactivatePetWeight;
    action(weight.petWeightId)
      .then(() => {
        setNotification({
          show: true,
          message: newStatus === 'ACTIVE'
            ? 'Kích hoạt khoảng cân nặng thành công!'
            : 'Vô hiệu hóa khoảng cân nặng thành công!',
          type: 'success',
        });
        fetchWeights();
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
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Chỉnh sửa khoảng cân nặng' : 'Thêm khoảng cân nặng mới'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weight_range" className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng cân nặng <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    id="weight_range"
                    name="weight_range"
                    value={formData.weight_range}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 0-5kg, 5-10kg, 10kg+"
                    className={`block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                      errors.weight_range ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.weight_range && (
                  <p className="mt-2 text-sm text-red-600">{errors.weight_range}</p>
                )}
              </div>
              <div>
                <label htmlFor="price_multiplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Hệ số giá <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="price_multiplier"
                    name="price_multiplier"
                    value={formData.price_multiplier}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0.1"
                    className={`block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                      errors.price_multiplier ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.price_multiplier && (
                  <p className="mt-2 text-sm text-red-600">{errors.price_multiplier}</p>
                )}
              </div>
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
            <h3 className="text-lg font-semibold text-gray-800">Danh sách khoảng cân nặng</h3>
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
              Chó
            </button>
            <button
              onClick={() => setActiveTab('CAT')}
              className={`py-3 px-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'CAT'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mèo
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
                  Khoảng cân nặng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hệ số giá
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
              {filteredWeights.length > 0 ? (
                filteredWeights.map((weight) => (
                  <tr
                    key={weight.petWeightId}
                    className={`hover:bg-gray-50 ${weight.statusType === 'INACTIVE' ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {weight.petWeightId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {weight.weightRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {weight.priceMultiplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          weight.statusType === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {weight.statusType === 'ACTIVE' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {weight.statusType === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleEdit(weight)}
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
                              onClick={() => handleStatusChange(weight, 'INACTIVE')}
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
                              <span>Vô hiệu hóa</span>
                            </button>
                          </>
                        )}
                        {weight.statusType === 'INACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(weight, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200 flex items-center"
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Kích hoạt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có dữ liệu
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

export default ManageWeight;