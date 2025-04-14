import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle,
    XCircle,
    Search,
    Edit,
    ToggleLeft,
    ToggleRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import vaccineService from '../../service/hospitalService/vaccineService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
};

const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpiringSoon = (expiryDate) => {
    const daysRemaining = getDaysRemaining(expiryDate);
    return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
};

const isExpired = (expiryDate) => {
    const daysRemaining = getDaysRemaining(expiryDate);
    return daysRemaining !== null && daysRemaining < 0;
};

const isLowStock = (quantity) => {
    return quantity < 5 && quantity >= 0;
};

const VaccineManagement = () => {
    const [vaccines, setVaccines] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        origin: '',
        manufacturingDate: '',
        expiryDate: '',
        entryDate: '',
        type: '',
        status: true,
        sellingPrice: '',
        importPrice: '',
        quantity: '',
        note: '',
    });
    const [errors, setErrors] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const vaccinesPerPage = 6;

    // Hàm gọi API getAllVaccines
    const fetchVaccines = async () => {
        setIsLoading(true);
        try {
            const data = await vaccineService.getAllVaccines();
            setVaccines(data);
        } catch (error) {
            toast.error(error.message || 'Lỗi khi tải danh sách vaccine', {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccines();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        const today = new Date();

        // Validation
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Tên vaccine phải có ít nhất 3 ký tự';
        }
        if (!formData.type) {
            newErrors.type = 'Loại vaccine không được để trống';
        }
        if (formData.sellingPrice === '' || isNaN(formData.sellingPrice) || parseFloat(formData.sellingPrice) < 0) {
            newErrors.sellingPrice = 'Giá bán phải lớn hơn hoặc bằng 0';
        }
        if (formData.importPrice === '' || isNaN(formData.importPrice) || parseFloat(formData.importPrice) < 0) {
            newErrors.importPrice = 'Giá nhập phải lớn hơn hoặc bằng 0';
        }
        if (
            formData.importPrice !== '' &&
            formData.sellingPrice !== '' &&
            parseFloat(formData.importPrice) > parseFloat(formData.sellingPrice)
        ) {
            newErrors.importPrice = 'Giá nhập không được lớn hơn giá bán';
        }
        if (formData.quantity === '' || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn hoặc bằng 0';
        }
        if (formData.manufacturingDate) {
            const manufacturing = new Date(formData.manufacturingDate);
            if (manufacturing > today) {
                newErrors.manufacturingDate = 'Ngày sản xuất không được lớn hơn ngày hiện tại';
            }
        }
        if (formData.expiryDate) {
            const expiry = new Date(formData.expiryDate);
            if (expiry < today) {
                newErrors.expiryDate = 'Ngày hết hạn không được nhỏ hơn ngày hiện tại';
            }
            if (formData.manufacturingDate) {
                const manufacturing = new Date(formData.manufacturingDate);
                if (expiry <= manufacturing) {
                    newErrors.expiryDate = 'Ngày hết hạn phải lớn hơn ngày sản xuất';
                }
            }
        }
        if (formData.entryDate && formData.manufacturingDate) {
            const entry = new Date(formData.entryDate);
            const manufacturing = new Date(formData.manufacturingDate);
            if (entry < manufacturing) {
                newErrors.entryDate = 'Ngày nhập kho phải lớn hơn hoặc bằng ngày sản xuất';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const vaccineData = {
                ...formData,
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                importPrice: parseFloat(formData.importPrice) || 0,
                quantity: parseInt(formData.quantity) || 0,
                manufacturingDate: formData.manufacturingDate || null,
                expiryDate: formData.expiryDate || null,
                entryDate: formData.entryDate || null,
            };

            if (formData.id) {
                await vaccineService.updateVaccine(formData.id, vaccineData);
                toast.success('Cập nhật vaccine thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                await vaccineService.createVaccine(vaccineData);
                toast.success('Thêm vaccine thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }

            setFormData({
                id: null,
                name: '',
                origin: '',
                manufacturingDate: '',
                expiryDate: '',
                entryDate: '',
                type: '',
                status: true,
                sellingPrice: '',
                importPrice: '',
                quantity: '',
                note: '',
            });
            setShowForm(false);
            await fetchVaccines();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi lưu vaccine', {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditVaccine = (vaccine) => {
        setFormData({
            ...vaccine,
            manufacturingDate: vaccine.manufacturingDate
                ? new Date(vaccine.manufacturingDate).toISOString().split('T')[0]
                : '',
            expiryDate: vaccine.expiryDate
                ? new Date(vaccine.expiryDate).toISOString().split('T')[0]
                : '',
            entryDate: vaccine.entryDate
                ? new Date(vaccine.entryDate).toISOString().split('T')[0]
                : '',
            sellingPrice: vaccine.sellingPrice || '',
            importPrice: vaccine.importPrice || '',
            quantity: vaccine.quantity || '',
        });
        setShowForm(true);
    };

    const handleToggleVaccineStatus = (id, currentStatus, expiryDate, e) => {
        e.stopPropagation(); // Prevent card click event

        // Kiểm tra nếu vaccine đã hết hạn
        if (isExpired(expiryDate)) {
            toast.error('Không thể bật/tắt vaccine đã hết hạn!', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const action = currentStatus ? 'tắt' : 'bật';
        toast.info(
            <div>
                <p>Bạn có chắc chắn muốn {action} vaccine này?</p>
                <div className="flex space-x-2 mt-2">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await vaccineService.deleteVaccine(id); // Assuming this toggles the status
                                toast.dismiss();
                                toast.success(`Vaccine đã được ${action} thành công!`, {
                                    position: 'top-right',
                                    autoClose: 3000,
                                });
                                setVaccines(
                                    vaccines.map((vaccine) =>
                                        vaccine.id === id ? { ...vaccine, status: !currentStatus } : vaccine
                                    )
                                );
                            } catch (error) {
                                toast.dismiss();
                                toast.error(error.message, {
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

    const filteredVaccines = vaccines
        .filter((vaccine) => vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aIsCritical =
                (isExpiringSoon(a.expiryDate) || isExpired(a.expiryDate) || isLowStock(a.quantity)) ? 1 : 0;
            const bIsCritical =
                (isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate) || isLowStock(b.quantity)) ? 1 : 0;
            if (aIsCritical && bIsCritical) {
                const aDays = getDaysRemaining(a.expiryDate) || 0;
                const bDays = getDaysRemaining(b.expiryDate) || 0;
                return aDays - bDays;
            }
            if (aIsCritical) return -1;
            if (bIsCritical) return 1;
            const aDate = a.entryDate ? new Date(a.entryDate) : new Date(0);
            const bDate = b.entryDate ? new Date(b.entryDate) : new Date(0);
            return bDate - aDate;
        });

    const indexOfLastVaccine = currentPage * vaccinesPerPage;
    const indexOfFirstVaccine = indexOfLastVaccine - vaccinesPerPage;
    const currentVaccines = filteredVaccines.slice(indexOfFirstVaccine, indexOfLastVaccine);
    const totalPages = Math.ceil(filteredVaccines.length / vaccinesPerPage);

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
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => {
                        setFormData({
                            id: null,
                            name: '',
                            origin: '',
                            manufacturingDate: '',
                            expiryDate: '',
                            entryDate: '',
                            type: '',
                            status: true,
                            sellingPrice: '',
                            importPrice: '',
                            quantity: '',
                            note: '',
                        });
                        setShowForm(true);
                    }}
                    className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    disabled={isLoading}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Thêm Vaccine
                </button>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10 disabled:bg-gray-100"
                        placeholder="Tìm kiếm vaccine..."
                        disabled={isLoading}
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            {showForm && (
                <div className="bg-[#e8dfd7] p-6 rounded-xl shadow-md mb-8 animate-fade-in">
                    <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">
                        {formData.id ? 'Chỉnh Sửa Vaccine' : 'Thêm Vaccine Mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Vaccine <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    placeholder="Nhập tên vaccine"
                                    disabled={isLoading}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xuất Xứ</label>
                                <input
                                    type="text"
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100"
                                    placeholder="Nhập xuất xứ"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Sản Xuất</label>
                                <input
                                    type="date"
                                    name="manufacturingDate"
                                    value={formData.manufacturingDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.manufacturingDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    disabled={isLoading}
                                />
                                {errors.manufacturingDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.manufacturingDate}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Hết Hạn</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    disabled={isLoading}
                                />
                                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Nhập Kho</label>
                                <input
                                    type="date"
                                    name="entryDate"
                                    value={formData.entryDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.entryDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    disabled={isLoading}
                                />
                                {errors.entryDate && <p className="text-red-500 text-xs mt-1">{errors.entryDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại Vaccine <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.type ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    placeholder="Nhập loại vaccine"
                                    disabled={isLoading}
                                />
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá Bán (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    value={formData.sellingPrice}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    placeholder="Nhập giá bán"
                                    min="0"
                                    disabled={isLoading}
                                />
                                {errors.sellingPrice && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá Nhập (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="importPrice"
                                    value={formData.importPrice}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.importPrice ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    placeholder="Nhập giá nhập"
                                    min="0"
                                    disabled={isLoading}
                                />
                                {errors.importPrice && (
                                    <p className="text-red-500 text-xs mt-1">{errors.importPrice}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số Lượng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100`}
                                    placeholder="Nhập số lượng"
                                    min="0"
                                    disabled={isLoading}
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-[#7b4d2b] focus:ring-[#7b4d2b] border-gray-300 rounded disabled:opacity-50"
                                        disabled={isLoading}
                                    />
                                    <span className="text-sm text-gray-700">Hoạt động</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] disabled:bg-gray-100"
                                placeholder="Nhập ghi chú"
                                rows="3"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {formData.id ? 'Cập Nhật Vaccine' : 'Thêm Vaccine'}
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
                <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Danh Sách Vaccine</h2>
                {isLoading ? (
                    <p className="text-gray-500 text-center">Đang tải danh sách vaccine...</p>
                ) : filteredVaccines.length === 0 ? (
                    <p className="text-gray-500 text-center">Chưa có vaccine nào. Hãy thêm vaccine mới!</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentVaccines.map((vaccine) => {
                                const expiringSoon = isExpiringSoon(vaccine.expiryDate);
                                const expired = isExpired(vaccine.expiryDate);
                                const lowStock = isLowStock(vaccine.quantity);
                                const isCritical = expiringSoon || expired || lowStock;
                                const daysRemaining = getDaysRemaining(vaccine.expiryDate);

                                return (
                                    <div
                                        key={vaccine.id}
                                        onClick={() => handleEditVaccine(vaccine)}
                                        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-102 relative cursor-pointer"
                                    >
                                        {isCritical && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                                        )}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-[#7b4d2b]">{vaccine.name}</h3>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditVaccine(vaccine);
                                                    }}
                                                    className="text-[#7b4d2b] hover:text-[#6a3f1e] disabled:opacity-50"
                                                    disabled={isLoading}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                        handleToggleVaccineStatus(
                                                            vaccine.id,
                                                            vaccine.status,
                                                            vaccine.expiryDate,
                                                            e
                                                        )
                                                    }
                                                    className="flex items-center px-3 py-1 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 text-sm disabled:opacity-50"
                                                    title={
                                                        expired
                                                            ? 'Không thể bật/tắt vaccine đã hết hạn'
                                                            : vaccine.status
                                                                ? 'Tắt vaccine'
                                                                : 'Bật vaccine'
                                                    }
                                                    disabled={isLoading || expired}
                                                >
                                                    {vaccine.status ? (
                                                        <ToggleLeft className="w-4 h-4 mr-1" />
                                                    ) : (
                                                        <ToggleRight className="w-4 h-4 mr-1" />
                                                    )}
                                                    {vaccine.status ? 'Tắt' : 'Bật'}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Loại:</span> {vaccine.type}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Giá Bán:</span>{' '}
                                            {formatPrice(vaccine.sellingPrice)}
                                        </p>
                                        <p
                                            className={`text-sm mb-2 ${
                                                lowStock ? 'text-red-600' : 'text-gray-600'
                                            }`}
                                        >
                                            <span className="font-medium">Số Lượng:</span> {vaccine.quantity}
                                            {lowStock && (
                                                <span className="ml-1 text-xs text-red-600">(Sắp hết hàng)</span>
                                            )}
                                        </p>
                                        <p
                                            className={`text-sm mb-2 ${
                                                expired || expiringSoon ? 'text-red-600' : 'text-gray-600'
                                            }`}
                                        >
                                            <span className="font-medium">Ngày Hết Hạn:</span>{' '}
                                            {formatDate(vaccine.expiryDate)}
                                            {daysRemaining !== null && (
                                                <span className="ml-1 text-xs">
                                                    (Còn {daysRemaining >= 0 ? daysRemaining : 'Đã hết hạn'} ngày)
                                                </span>
                                            )}
                                        </p>
                                        {vaccine.note && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Ghi Chú:</span> {vaccine.note}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <span className="font-medium mr-1">Trạng Thái:</span>
                                            {vaccine.status ? (
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
                                );
                            })}
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

export default VaccineManagement;