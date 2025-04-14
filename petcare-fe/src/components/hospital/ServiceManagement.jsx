import { useState, useEffect } from 'react';
import {
    Plus,
    Dog,
    Cat,
    CheckCircle,
    XCircle,
    Search,
    Edit,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { createVetService, getAllVetServices, updateVetService, toggleVetService } from '../../service/hospitalService/VetServiceService.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hàm format giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        priceBase: '',
        petType: 'DOG',
        active: true,
    });
    const [errors, setErrors] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const servicesPerPage = 6;

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const vetServices = await getAllVetServices();
                setServices(vetServices);
            } catch (error) {
                toast.error(error.message || 'Lỗi khi tải danh sách dịch vụ', {
                    position: 'top-right',
                    autoClose: 5000,
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Tên dịch vụ phải có ít nhất 3 ký tự';
        }
        if (!formData.priceBase || formData.priceBase < 0) {
            newErrors.priceBase = 'Giá cơ bản phải lớn hơn hoặc bằng 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            if (formData.id) {
                const updatedService = await updateVetService(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    priceBase: parseFloat(formData.priceBase),
                    petType: formData.petType,
                    active: formData.active,
                });
                setServices(services.map((s) => (s.id === formData.id ? updatedService : s)));
                toast.success('Cập nhật dịch vụ thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                const newService = await createVetService({
                    name: formData.name,
                    description: formData.description,
                    priceBase: parseFloat(formData.priceBase),
                    petType: formData.petType,
                    active: formData.active,
                });
                setServices([...services, newService]);
                toast.success('Thêm dịch vụ thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }

            setFormData({
                id: null,
                name: '',
                description: '',
                priceBase: '',
                petType: 'DOG',
                active: true,
            });
            setShowForm(false);
        } catch (error) {
            toast.error(error.message || 'Lỗi khi lưu dịch vụ', {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditService = (service) => {
        setFormData({
            id: service.id,
            name: service.name,
            description: service.description || '',
            priceBase: service.priceBase.toString(),
            petType: service.petType,
            active: service.active,
        });
        setShowForm(true);
    };

    const handleToggleService = (id, currentActive, e) => {
        e.stopPropagation();
        const action = currentActive ? 'tắt' : 'bật';
        toast.info(
            <div>
                <p>Bạn có chắc chắn muốn {action} dịch vụ này?</p>
                <div className="flex space-x-2 mt-2">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await toggleVetService(id);
                                toast.dismiss();
                                toast.success(`Dịch vụ đã được ${action} thành công!`, {
                                    position: 'top-right',
                                    autoClose: 3000,
                                });
                                setServices(
                                    services.map((service) =>
                                        service.id === id ? { ...service, active: !currentActive } : service
                                    )
                                );
                            } catch (error) {
                                toast.dismiss();
                                toast.error(error.message || 'Lỗi khi toggle trạng thái dịch vụ', {
                                    position: 'top-right',
                                    autoClose: 5000,
                                });
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="px-3 py-1 bg-[#7b4d2b] text-white rounded hover:bg-[#6a3f1e]"
                        disabled={isLoading}
                    >
                        Xác nhận
                    </button>
                    <button
                        onClick={() => toast.dismiss()}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            {
                position: 'top-center',
                autoClose: false,
                closeOnClick: false,
                draggable: false,
            }
        );
    };

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="p-6">
            <ToastContainer />
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="w-16 h-16 border-4 border-t-[#7b4d2b] border-gray-200 rounded-full animate-spin"></div>
                </div>
            )}
            {errors.api && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {errors.api}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            setFormData({
                                id: null,
                                name: '',
                                description: '',
                                priceBase: '',
                                petType: 'DOG',
                                active: true,
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        disabled={isLoading}
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
                        className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10 disabled:bg-gray-100"
                        placeholder="Tìm kiếm dịch vụ..."
                        disabled={isLoading}
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

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
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                placeholder="Nhập tên dịch vụ"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100"
                                placeholder="Nhập mô tả dịch vụ"
                                rows="3"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá Cơ Bản (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="priceBase"
                                value={formData.priceBase}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    errors.priceBase ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                placeholder="Nhập giá cơ bản"
                                min="0"
                                disabled={isLoading}
                            />
                            {errors.priceBase && (
                                <p className="text-red-500 text-xs mt-1">{errors.priceBase}</p>
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
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100"
                                disabled={isLoading}
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
                                name="active"
                                value={formData.active}
                                onChange={(e) =>
                                    setFormData({ ...formData, active: e.target.value === 'true' })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100"
                                disabled={isLoading}
                            >
                                <option value="true">Hoạt động</option>
                                <option value="false">Không hoạt động</option>
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {formData.id ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-full shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Danh Sách Dịch Vụ</h2>
                {isLoading ? (
                    <p className="text-gray-500 text-center">Đang tải danh sách dịch vụ...</p>
                ) : filteredServices.length === 0 ? (
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
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="group relative">
                                                {service.petType === 'DOG' ? (
                                                    <Dog className="w-5 h-5 text-[#7b4d2b]" />
                                                ) : (
                                                    <Cat className="w-5 h-5 text-[#7b4d2b]" />
                                                )}
                                                <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {service.petType === 'DOG' ? 'Chó' : 'Mèo'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-[#7b4d2b]">
                                                {service.name}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-center space-y-2">
                                            <button
                                                onClick={(e) => handleToggleService(service.id, service.active, e)}
                                                className="flex items-center px-3 py-1 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 text-sm disabled:opacity-50"
                                                disabled={isLoading}
                                            >
                                                {service.active ? (
                                                    <ToggleLeft className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ToggleRight className="w-4 h-4 mr-1" />
                                                )}
                                                {service.active ? 'Tắt' : 'Bật'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditService(service);
                                                }}
                                                className="text-[#7b4d2b] hover:text-[#6a3f1e] disabled:opacity-50"
                                                disabled={isLoading}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {service.description && (
                                        <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mb-1">
                                        Giá: {formatPrice(service.priceBase)}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center">
                                        {service.active ? (
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

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className={`p-2 rounded-full ${
                                        currentPage === 1 || isLoading
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
                                        } transition-all duration-300 ${
                                            isLoading ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                        disabled={isLoading}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className={`p-2 rounded-full ${
                                        currentPage === totalPages || isLoading
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