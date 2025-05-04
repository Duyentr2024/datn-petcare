import { useState, useEffect } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Eye,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import VetOrderService from '../../service/hospitalService/VetOrderService';
import { getVaccineById } from '../../service/hospitalService/vaccineService';
import { getVetServiceById } from '../../service/hospitalService/VetServiceService';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Hàm định dạng ngày
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
};

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [formData, setFormData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('orderDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [activeTab, setActiveTab] = useState('invoiceInfo');
    const [userId, setUserId] = useState(null);
    const invoicesPerPage = 6;

    // Lấy userId từ cookie khi component mount
    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId || decoded.id);
            } catch (error) {
                toast.error('Không thể giải mã token!', { position: 'top-right', autoClose: 3000 });
                console.error('Error decoding token:', error);
            }
        } else {
            toast.error('Không tìm thấy token!', { position: 'top-right', autoClose: 3000 });
        }
    }, []);

    // Hàm lấy danh sách hóa đơn từ API
    const fetchInvoices = async () => {
        if (!userId) return; // Không gọi API nếu chưa có userId
        setIsLoading(true);
        try {
            const orders = await VetOrderService.getOrdersByUserId(userId);
            const mappedInvoices = orders.map((order) => ({
                id: order.id,
                customerName: order.orderVetDetails[0]?.medicalRecord?.vetPetDTO?.nameBoss || 'N/A',
                phoneBoss: order.orderVetDetails[0]?.medicalRecord?.vetPetDTO?.phoneBoss || 'N/A',
                orderDate: order.orderDate,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus === 'Đã thanh toán',
                paymentMethod: order.paymentMethod,
                note: order.orderVetDetails[0]?.medicalRecord?.note || '',
                orderVetDetails: order.orderVetDetails,
            }));
            setInvoices(mappedInvoices);
        } catch (error) {
            const errorMessage = error.response?.data === 'Không tìm thấy hóa đơn'
                ? 'Không tìm thấy hóa đơn'
                : `Lỗi khi tải danh sách hóa đơn: ${error.response?.data || error.message}`;
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
            });
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchInvoices();
        }
    }, [userId]);

    // Xử lý xem chi tiết hóa đơn và lấy tên vaccine/dịch vụ
    const handleViewInvoice = async (invoice) => {
        setIsLoading(true);
        try {
            const updatedDetails = await Promise.all(
                invoice.orderVetDetails.map(async (detail) => {
                    let vaccineName = 'Không sử dụng';
                    let vetServiceName = 'Không sử dụng';

                    if (detail.medicalRecord.vaccineId) {
                        try {
                            const vaccine = await getVaccineById(detail.medicalRecord.vaccineId);
                            vaccineName = vaccine?.name || 'N/A';
                        } catch (error) {
                            console.error(`Error fetching vaccine ${detail.medicalRecord.vaccineId}:`, error);
                            vaccineName = 'N/A';
                            toast.error(`Lỗi khi tải thông tin vaccine ID ${detail.medicalRecord.vaccineId}`, {
                                position: 'top-right',
                                autoClose: 3000,
                            });
                        }
                    }

                    if (detail.medicalRecord.vetServiceId) {
                        try {
                            const vetService = await getVetServiceById(detail.medicalRecord.vetServiceId);
                            vetServiceName = vetService?.name || 'N/A';
                        } catch (error) {
                            console.error(`Error fetching vet service ${detail.medicalRecord.vetServiceId}:`, error);
                            vetServiceName = 'N/A';
                            toast.error(`Lỗi khi tải thông tin dịch vụ ID ${detail.medicalRecord.vetServiceId}`, {
                                position: 'top-right',
                                autoClose: 3000,
                            });
                        }
                    }

                    return {
                        ...detail,
                        vaccineName,
                        vetServiceName,
                    };
                })
            );

            setFormData({
                ...invoice,
                orderDate: invoice.orderDate ? new Date(invoice.orderDate).toISOString().split('T')[0] : '',
                totalAmount: invoice.totalAmount || '',
                phoneBoss: invoice.phoneBoss || 'N/A',
                orderVetDetails: updatedDetails,
            });
            setShowModal(true);
            setActiveTab('invoiceInfo');
        } catch (error) {
            toast.error('Lỗi khi tải chi tiết hóa đơn', {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle hiển thị chi tiết orderVetDetails
    const toggleDetail = (detailId) => {
        setExpandedDetails((prev) => ({
            ...prev,
            [detailId]: !prev[detailId],
        }));
    };

    // Xử lý click vào header để sắp xếp
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Lọc và sắp xếp hóa đơn
    const filteredInvoices = invoices
        .filter((invoice) =>
            invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.phoneBoss.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'customerName':
                    aValue = a.customerName.toLowerCase();
                    bValue = b.customerName.toLowerCase();
                    break;
                case 'phoneBoss':
                    aValue = a.phoneBoss.toLowerCase();
                    bValue = b.phoneBoss.toLowerCase();
                    break;
                case 'orderDate':
                    aValue = new Date(a.orderDate);
                    bValue = new Date(b.orderDate);
                    break;
                case 'totalAmount':
                    aValue = a.totalAmount;
                    bValue = b.totalAmount;
                    break;
                case 'paymentStatus':
                    aValue = a.paymentStatus;
                    bValue = b.paymentStatus;
                    break;
                case 'note':
                    aValue = a.note.toLowerCase();
                    bValue = b.note.toLowerCase();
                    break;
                default:
                    aValue = a.orderDate;
                    bValue = b.orderDate;
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        });

    // Phân trang
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Định nghĩa variants cho hiệu ứng
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const modalVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    };

    const tabVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
            className="p-6"
        >
            <ToastContainer />
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="w-16 h-16 border-4 border-t-[#7b4d2b] border-gray-200 rounded-full animate-spin"></div>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#7b4d2b]">Danh Sách Hóa Đơn</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10 disabled:bg-gray-100"
                        disabled={isLoading}
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            <AnimatePresence>
                {showModal && formData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                            className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-3xl font-bold text-[#7b4d2b] mb-6">Chi Tiết Hóa Đơn #{formData.id}</h2>
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button
                                    className={`px-4 py-2 font-semibold text-lg ${
                                        activeTab === 'invoiceInfo'
                                            ? 'border-b-2 border-[#7b4d2b] text-[#7b4d2b]'
                                            : 'text-gray-500 hover:text-[#7b4d2b]'
                                    }`}
                                    onClick={() => setActiveTab('invoiceInfo')}
                                >
                                    Thông Tin Hóa Đơn
                                </button>
                                <button
                                    className={`px-4 py-2 font-semibold text-lg ${
                                        activeTab === 'serviceDetails'
                                            ? 'border-b-2 border-[#7b4d2b] text-[#7b4d2b]'
                                            : 'text-gray-500 hover:text-[#7b4d2b]'
                                    }`}
                                    onClick={() => setActiveTab('serviceDetails')}
                                >
                                    Chi Tiết Dịch Vụ
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {activeTab === 'invoiceInfo' && (
                                        <div className="bg-[#f8f1eb] p-6 rounded-lg shadow-sm">
                                            <h3 className="text-xl font-semibold text-[#7b4d2b] mb-4">Thông Tin Hóa Đơn</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Tên Khách Hàng
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                                                        {formData.customerName}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Số Điện Thoại
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                                                        {formData.phoneBoss}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Ngày Hóa Đơn
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                                                        {formatDate(formData.orderDate)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Tổng Tiền
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                                                        {formatPrice(formData.totalAmount)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Trạng Thái
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 flex items-center">
                                                        {formData.paymentStatus ? (
                                                            <span className="flex items-center text-green-600">
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Đã thanh toán
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center text-red-600">
                                                                <XCircle className="w-4 h-4 mr-1" /> Chưa thanh toán
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Phương Thức Thanh Toán
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                                                        {formData.paymentMethod || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                                                        Ghi Chú
                                                    </label>
                                                    <div className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 min-h-[100px]">
                                                        {formData.note || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'serviceDetails' && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-[#7b4d2b] mb-4">Chi Tiết Dịch Vụ</h3>
                                            {formData.orderVetDetails.map((detail) => (
                                                <div
                                                    key={detail.id}
                                                    className="mb-4 bg-[#f8f1eb] p-6 rounded-lg shadow-sm"
                                                >
                                                    <button
                                                        onClick={() => toggleDetail(detail.id)}
                                                        className="flex items-center w-full text-left text-[#7b4d2b] hover:text-[#6a3f1e] font-semibold text-lg"
                                                    >
                                                        <span>Dịch vụ #{detail.id} - {detail.medicalRecord.vetPetDTO.namePet}</span>
                                                        {expandedDetails[detail.id] ? (
                                                            <ChevronUp className="w-5 h-5 ml-2" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 ml-2" />
                                                        )}
                                                    </button>
                                                    {expandedDetails[detail.id] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="mt-4"
                                                        >
                                                            <table className="w-full text-sm text-gray-700">
                                                                <tbody>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Tên Thú Cưng</td>
                                                                    <td className="py-2">{detail.medicalRecord.vetPetDTO.namePet}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Loại Thú Cưng</td>
                                                                    <td className="py-2">{detail.medicalRecord.vetPetDTO.petType}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Triệu Chứng</td>
                                                                    <td className="py-2">{detail.medicalRecord.symptoms || 'N/A'}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Chẩn Đoán</td>
                                                                    <td className="py-2">{detail.medicalRecord.diagnosis || 'N/A'}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Điều Trị</td>
                                                                    <td className="py-2">{detail.medicalRecord.treatment || 'N/A'}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Vaccine Đã Sử Dụng</td>
                                                                    <td className="py-2">{detail.vaccineName}</td>
                                                                </tr>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 font-semibold text-gray-600">Dịch Vụ Đã Sử Dụng</td>
                                                                    <td className="py-2">{detail.vetServiceName}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="py-2 font-semibold text-gray-600">Giá Dịch Vụ</td>
                                                                    <td className="py-2">{formatPrice(detail.price)}</td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData(null);
                                        setExpandedDetails({});
                                        setActiveTab('invoiceInfo');
                                    }}
                                    className="px-6 py-2 bg-[#7b4d2b] text-white rounded-full shadow-md hover:bg-[#6a3f1e] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Đóng
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLoading ? (
                        <p className="text-gray-500 text-center">Đang tải danh sách hóa đơn...</p>
                    ) : !userId ? (
                        <p className="text-red-500 text-center">Không thể tải hóa đơn do lỗi xác thực người dùng.</p>
                    ) : filteredInvoices.length === 0 ? (
                        <p className="text-gray-500 text-center">Chưa có hóa đơn nào.</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-xl shadow-md">
                                    <thead>
                                    <tr className="bg-[#7b4d2b] text-white">
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('id')}
                                        >
                                            <div className="flex items-center">
                                                ID
                                                {sortBy === 'id' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('customerName')}
                                        >
                                            <div className="flex items-center">
                                                Tên Khách Hàng
                                                {sortBy === 'customerName' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('phoneBoss')}
                                        >
                                            <div className="flex items-center">
                                                Số Điện Thoại
                                                {sortBy === 'phoneBoss' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('orderDate')}
                                        >
                                            <div className="flex items-center">
                                                Ngày
                                                {sortBy === 'orderDate' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('totalAmount')}
                                        >
                                            <div className="flex items-center">
                                                Tổng Tiền
                                                {sortBy === 'totalAmount' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('paymentStatus')}
                                        >
                                            <div className="flex items-center">
                                                Trạng Thái
                                                {sortBy === 'paymentStatus' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-[#6a3f1e] transition-all duration-200"
                                            onClick={() => handleSort('note')}
                                        >
                                            <div className="flex items-center">
                                                Ghi Chú
                                                {sortBy === 'note' && (
                                                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold">
                                            Hành Động
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentInvoices.map((invoice) => (
                                        <motion.tr
                                            key={invoice.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-b border-gray-200 hover:bg-[#e8dfd7] transition-all duration-200"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-700">{invoice.id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{invoice.customerName}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{invoice.phoneBoss}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{formatDate(invoice.orderDate)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {formatPrice(invoice.totalAmount)}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {invoice.paymentStatus ? (
                                                    <span className="flex items-center text-green-600">
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Đã thanh toán
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600">
                                                        <XCircle className="w-4 h-4 mr-1" /> Chưa thanh toán
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {invoice.note || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    className="text-[#7b4d2b] hover:text-[#6a3f1e] disabled:opacity-50"
                                                    disabled={isLoading}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
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
                                        } transition-all duration-200`}
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
                                            } transition-all duration-200 ${
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
                                        } transition-all duration-200`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default InvoiceManagement;