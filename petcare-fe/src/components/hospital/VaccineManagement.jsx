import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle,
    XCircle,
    Search,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Hàm format giá tiền
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

// Hàm format ngày
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
};

// Hàm tính số ngày còn lại đến ngày hết hạn (đếm ngược thời gian thực tế)
const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Hàm kiểm tra vaccine sắp hết hạn (trong vòng 7 ngày thay vì 30 ngày)
const isExpiringSoon = (expiryDate) => {
    const daysRemaining = getDaysRemaining(expiryDate);
    return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
};

// Hàm kiểm tra vaccine đã hết hạn
const isExpired = (expiryDate) => {
    const daysRemaining = getDaysRemaining(expiryDate);
    return daysRemaining !== null && daysRemaining < 0;
};

// Hàm kiểm tra vaccine sắp hết hàng (số lượng < 5 thay vì 10)
const isLowStock = (quantity) => {
    return quantity < 5 && quantity >= 0;
};

const VaccineManagement = () => {
    // State để lưu danh sách vaccine
    const [vaccines, setVaccines] = useState([]);
    // State để quản lý form nhập liệu
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
    // State để quản lý lỗi
    const [errors, setErrors] = useState({});
    // State để kiểm soát hiển thị form
    const [showForm, setShowForm] = useState(false);
    // State để quản lý tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    // State để quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const vaccinesPerPage = 6; // Số vaccine mỗi trang
    // State để cập nhật thời gian thực tế
    const [currentTime, setCurrentTime] = useState(new Date());

    // Cập nhật thời gian thực tế mỗi giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Xử lý thay đổi giá trị trong form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setErrors({ ...errors, [name]: '' });
    };

    // Xử lý submit form (thêm hoặc cập nhật vaccine)
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        const today = new Date();

        // Bắt lỗi cho các trường bắt buộc
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Tên vaccine phải có ít nhất 3 ký tự';
        }
        if (!formData.type) {
            newErrors.type = 'Loại vaccine không được để trống';
        }
        if (!formData.sellingPrice || formData.sellingPrice < 0) {
            newErrors.sellingPrice = 'Giá bán phải lớn hơn hoặc bằng 0';
        }
        if (!formData.importPrice || formData.importPrice < 0) {
            newErrors.importPrice = 'Giá nhập phải lớn hơn hoặc bằng 0';
        }
        if (!formData.quantity || formData.quantity < 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn hoặc bằng 0';
        }

        // Bắt lỗi cho các trường ngày
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
        if (formData.entryDate) {
            const entry = new Date(formData.entryDate);
            if (entry > today) {
                newErrors.entryDate = 'Ngày nhập kho không được lớn hơn ngày hiện tại';
            }
            if (formData.manufacturingDate) {
                const manufacturing = new Date(formData.manufacturingDate);
                if (entry < manufacturing) {
                    newErrors.entryDate = 'Ngày nhập kho phải lớn hơn hoặc bằng ngày sản xuất';
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (formData.id) {
            // Cập nhật vaccine
            setVaccines(
                vaccines.map((vaccine) =>
                    vaccine.id === formData.id ? { ...formData } : vaccine
                )
            );
        } else {
            // Thêm vaccine mới
            setVaccines([...vaccines, { ...formData, id: vaccines.length + 1 }]);
        }

        // Reset form và ẩn form sau khi thêm/cập nhật
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
    };

    // Xử lý khi nhấp vào vaccine để chỉnh sửa
    const handleEditVaccine = (vaccine) => {
        setFormData({ ...vaccine });
        setShowForm(true);
    };

    // Xử lý xóa vaccine
    const handleDeleteVaccine = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vaccine này?')) {
            setVaccines(vaccines.filter((vaccine) => vaccine.id !== id));
        }
    };

    // Xử lý tìm kiếm và sắp xếp
    const filteredVaccines = vaccines
        .filter((vaccine) => vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            // Ưu tiên vaccine sắp hết hạn hoặc sắp hết hàng
            const aIsCritical = (isExpiringSoon(a.expiryDate) || isExpired(a.expiryDate) || isLowStock(a.quantity)) ? 1 : 0;
            const bIsCritical = (isExpiringSoon(b.expiryDate) || isExpired(b.expiryDate) || isLowStock(b.quantity)) ? 1 : 0;

            if (aIsCritical && bIsCritical) {
                // Nếu cả hai đều gấp, ưu tiên vaccine sắp hết hạn hơn
                const aDays = getDaysRemaining(a.expiryDate) || 0;
                const bDays = getDaysRemaining(b.expiryDate) || 0;
                return aDays - bDays; // Sắp hết hạn trước sẽ lên đầu
            }
            if (aIsCritical) return -1; // a gấp thì lên đầu
            if (bIsCritical) return 1; // b gấp thì lên đầu

            // Nếu không gấp, sắp xếp theo entryDate (mới nhất trước)
            const aDate = a.entryDate ? new Date(a.entryDate) : new Date(0);
            const bDate = b.entryDate ? new Date(b.entryDate) : new Date(0);
            return bDate - aDate;
        });

    // Phân trang
    const indexOfLastVaccine = currentPage * vaccinesPerPage;
    const indexOfFirstVaccine = indexOfLastVaccine - vaccinesPerPage;
    const currentVaccines = filteredVaccines.slice(indexOfFirstVaccine, indexOfLastVaccine);
    const totalPages = Math.ceil(filteredVaccines.length / vaccinesPerPage);

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
                        className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm Vaccine
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10"
                        placeholder="Tìm kiếm vaccine..."
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            {/* Form Thêm/Chỉnh Sửa Vaccine */}
            {showForm && (
                <div className="bg-[#e8dfd7] p-6 rounded-xl shadow-md mb-8 animate-fadeIn">
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                    placeholder="Nhập tên vaccine"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Xuất Xứ
                                </label>
                                <input
                                    type="text"
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                                    placeholder="Nhập xuất xứ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày Sản Xuất
                                </label>
                                <input
                                    type="date"
                                    name="manufacturingDate"
                                    value={formData.manufacturingDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.manufacturingDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] ${
                                        formData.id ? 'cursor-not-allowed bg-gray-100' : ''
                                    }`}
                                    disabled={formData.id} // Không cho chỉnh sửa nếu đang update
                                />
                                {errors.manufacturingDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.manufacturingDate}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày Hết Hạn
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                />
                                {errors.expiryDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày Nhập Kho
                                </label>
                                <input
                                    type="date"
                                    name="entryDate"
                                    value={formData.entryDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        errors.entryDate ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] ${
                                        formData.id ? 'cursor-not-allowed bg-gray-100' : ''
                                    }`}
                                    disabled={formData.id} // Không cho chỉnh sửa nếu đang update
                                />
                                {errors.entryDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.entryDate}</p>
                                )}
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                    placeholder="Nhập loại vaccine"
                                />
                                {errors.type && (
                                    <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                                )}
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                    placeholder="Nhập giá bán"
                                    min="0"
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                    placeholder="Nhập giá nhập"
                                    min="0"
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]`}
                                    placeholder="Nhập số lượng"
                                    min="0"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng Thái
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-[#7b4d2b] focus:ring-[#7b4d2b] border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Hoạt động</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi Chú
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                                placeholder="Nhập ghi chú"
                                rows="3"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="flex items-center px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {formData.id ? 'Cập Nhật Vaccine' : 'Thêm Vaccine'}
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

            {/* Danh Sách Vaccine */}
            <div>
                <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Danh Sách Vaccine</h2>
                {filteredVaccines.length === 0 ? (
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
                                        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-102 animate-fadeIn relative cursor-pointer"
                                    >
                                        {isCritical && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-ripple">
                                                <span className="ripple-circle"></span>
                                                <span className="ripple-circle ripple-delay-1"></span>
                                                <span className="ripple-circle ripple-delay-2"></span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-[#7b4d2b]">
                                                {vaccine.name}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditVaccine(vaccine);
                                                    }}
                                                    className="text-[#7b4d2b] hover:text-[#6a3f1e]"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteVaccine(vaccine.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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
                                                <span className="ml-1 text-xs text-red-600">
                                                    (Sắp hết hàng)
                                                </span>
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
                                        {/* Thêm trường Ghi Chú */}
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

export default VaccineManagement;