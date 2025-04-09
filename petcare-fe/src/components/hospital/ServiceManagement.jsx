import { useState } from 'react';
import { Plus, Dog, Cat, CheckCircle, XCircle, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

// Hàm format giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const ServiceManagement = () => {
    // State để lưu danh sách dịch vụ
    const [services, setServices] = useState([]);
    // State để quản lý form nhập liệu
    const [formData, setFormData] = useState({
        id: null, // Thêm id để biết đang chỉnh sửa dịch vụ nào
        serviceName: '',
        description: '',
        basePrice: '',
        petType: 'DOG',
        statusType: 'ACTIVE',
    });
    // State để quản lý lỗi
    const [errors, setErrors] = useState({});
    // State để kiểm soát hiển thị form
    const [showForm, setShowForm] = useState(false);
    // State để quản lý tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    // State để quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 6; // Số dịch vụ mỗi trang

    // Xử lý thay đổi giá trị trong form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    // Xử lý submit form (thêm hoặc cập nhật dịch vụ)
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.serviceName || formData.serviceName.length < 3) {
            newErrors.serviceName = 'Tên dịch vụ phải có ít nhất 3 ký tự';
        }
        if (!formData.basePrice || formData.basePrice < 0) {
            newErrors.basePrice = 'Giá cơ bản phải lớn hơn hoặc bằng 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (formData.id) {
            // Cập nhật dịch vụ
            setServices(
                services.map((service) =>
                    service.id === formData.id ? { ...formData } : service
                )
            );
        } else {
            // Thêm dịch vụ mới
            setServices([...services, { ...formData, id: services.length + 1 }]);
        }

        // Reset form và ẩn form sau khi thêm/cập nhật
        setFormData({
            id: null,
            serviceName: '',
            description: '',
            basePrice: '',
            petType: 'DOG',
            statusType: 'ACTIVE',
        });
        setShowForm(false);
    };

    // Xử lý khi nhấp vào dịch vụ để chỉnh sửa
    const handleEditService = (service) => {
        setFormData({ ...service });
        setShowForm(true);
    };

    // Xử lý tìm kiếm
    const filteredServices = services.filter((service) =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Phân trang
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="p-6">
            {/* Nút hiển thị form và ô tìm kiếm */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            setFormData({
                                id: null,
                                serviceName: '',
                                description: '',
                                basePrice: '',
                                petType: 'DOG',
                                statusType: 'ACTIVE',
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm Dịch Vụ
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10"
                        placeholder="Tìm kiếm dịch vụ..."
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            {/* Form Thêm/Chỉnh Sửa Dịch Vụ */}
            {showForm && (
                <div className="bg-[#e8dfd7] p-6 rounded-xl shadow-md mb-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">
                        {formData.id ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên Dịch Vụ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.serviceName ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                placeholder="Nhập tên dịch vụ"
                            />
                            {errors.serviceName && (
                                <p className="text-red-500 text-xs mt-1">{errors.serviceName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô Tả (Không bắt buộc)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                                placeholder="Nhập mô tả dịch vụ"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá Cơ Bản (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                placeholder="Nhập giá cơ bản"
                                min="0"
                            />
                            {errors.basePrice && (
                                <p className="text-red-500 text-xs mt-1">{errors.basePrice}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại Thú Cưng <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="petType"
                                value={formData.petType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                            >
                                <option value="DOG">Chó</option>
                                <option value="CAT">Mèo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng Thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="statusType"
                                value={formData.statusType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Không hoạt động</option>
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {formData.id ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-full shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Danh Sách Dịch Vụ */}
            <div>
                <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Danh Sách Dịch Vụ</h2>
                {filteredServices.length === 0 ? (
                    <p className="text-gray-500 text-center">Chưa có dịch vụ nào. Hãy thêm dịch vụ mới!</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => handleEditService(service)}
                                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-102 animate-fadeIn cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[#7b4d2b]">
                                            {service.serviceName}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="group relative">
                                                {service.petType === 'DOG' ? (
                                                    <Dog className="w-6 h-6 text-[#7b4d2b]" />
                                                ) : (
                                                    <Cat className="w-6 h-6 text-[#7b4d2b]" />
                                                )}
                                                <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {service.petType === 'DOG' ? 'Chó' : 'Mèo'}
                                                </span>
                                            </div>
                                            <Edit className="w-5 h-5 text-[#7b4d2b]" />
                                        </div>
                                    </div>
                                    {service.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Mô tả:</span> {service.description}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Giá:</span>{' '}
                                        {formatPrice(service.basePrice)}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <span className="font-medium mr-1">Trạng thái:</span>
                                        {service.statusType === 'ACTIVE' ? (
                                            <span className="flex items-center text-green-600">
                                                <CheckCircle className="w-4 h-4 mr-1" /> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600">
                                                <XCircle className="w-4 h-4 mr-1" /> Không hoạt động
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full ${
                                        currentPage === 1
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#7b4d2b] text-white hover:bg-[#6a3f1e]'
                                    } transition-all duration-300`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`px-4 py-2 rounded-full ${
                                            currentPage === index + 1
                                                ? 'bg-[#7b4d2b] text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-[#e8dfd7]'
                                        } transition-all duration-300`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full ${
                                        currentPage === totalPages
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#7b4d2b] text-white hover:bg-[#6a3f1e]'
                                    } transition-all duration-300`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ServiceManagement;