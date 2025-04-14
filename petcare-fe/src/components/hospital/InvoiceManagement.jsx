import { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Eye,
    Printer,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Hàm định dạng ngày
const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
};

// Dữ liệu mẫu cho hóa đơn
const sampleInvoices = [
    {
        id: 1,
        customerName: 'Nguyễn Văn A',
        date: '2025-04-01',
        totalAmount: 1500000,
        status: true,
        note: 'Hóa đơn vaccine cúm',
    },
    {
        id: 2,
        customerName: 'Trần Thị B',
        date: '2025-04-02',
        totalAmount: 2000000,
        status: true,
        note: 'Hóa đơn vaccine viêm gan',
    },
    {
        id: 3,
        customerName: 'Lê Văn C',
        date: '2025-04-03',
        totalAmount: 1000000,
        status: false,
        note: 'Hóa đơn đã hủy',
    },
    {
        id: 4,
        customerName: 'Phạm Thị D',
        date: '2025-04-04',
        totalAmount: 3000000,
        status: true,
        note: '',
    },
    {
        id: 5,
        customerName: 'Hoàng Văn E',
        date: '2025-04-05',
        totalAmount: 2500000,
        status: true,
        note: 'Hóa đơn vaccine sởi',
    },
    {
        id: 6,
        customerName: 'Đỗ Thị F',
        date: '2025-04-06',
        totalAmount: 1800000,
        status: false,
        note: 'Chưa thanh toán',
    },
    {
        id: 7,
        customerName: 'Bùi Văn G',
        date: '2025-04-07',
        totalAmount: 2200000,
        status: true,
        note: '',
    },
];

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState(sampleInvoices);
    const [formData, setFormData] = useState(null); // Lưu hóa đơn đang xem chi tiết
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const invoicesPerPage = 6;

    // Hàm lấy danh sách hóa đơn (giả lập API)
    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            setInvoices(sampleInvoices);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách hóa đơn', {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Xử lý xóa hóa đơn
    const handleDeleteInvoice = (id) => {
        toast.info(
            <div>
                <p>Bạn có chắc chắn muốn xóa hóa đơn này?</p>
                <div className="flex space-x-2 mt-2">
                    <button
                        onClick={() => {
                            setInvoices(invoices.filter((invoice) => invoice.id !== id));
                            toast.dismiss();
                            toast.success('Xóa hóa đơn thành công!', {
                                position: 'top-right',
                                autoClose: 3000,
                            });
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

    // Xử lý xem chi tiết hóa đơn
    const handleViewInvoice = (invoice) => {
        setFormData({
            ...invoice,
            date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
            totalAmount: invoice.totalAmount || '',
        });
        setShowForm(true);
    };

    // Xử lý thanh toán
    const handlePayment = (method) => {
        setIsLoading(true);
        try {
            setInvoices(
                invoices.map((invoice) =>
                    invoice.id === formData.id ? { ...invoice, status: true } : invoice
                )
            );
            toast.success(`Thanh toán bằng ${method} thành công!`, {
                position: 'top-right',
                autoClose: 3000,
            });
            setShowForm(false);
            setFormData(null);
        } catch (error) {
            toast.error(`Lỗi khi thanh toán bằng ${method}`, {
                position: 'top-right',
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý in hóa đơn
    const handlePrintInvoice = () => {
        window.print();
    };

    // Lọc và sắp xếp hóa đơn
    const filteredInvoices = invoices
        .filter((invoice) => invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aValue = sortBy === 'date' ? new Date(a.date) : a.totalAmount;
            const bValue = sortBy === 'date' ? new Date(b.date) : b.totalAmount;
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

    // Phân trang
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

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
            <div className="flex justify-between items-center mb-6 no-print">
                <h2 className="text-2xl font-bold text-[#7b4d2b]">Danh Sách Hóa Đơn</h2>
                <div className="flex space-x-4 items-center">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b] pl-10 disabled:bg-gray-100"
                            placeholder="Tìm kiếm khách hàng..."
                            disabled={isLoading}
                        />
                        <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                        disabled={isLoading}
                    >
                        <option value="date">Sắp xếp theo ngày</option>
                        <option value="totalAmount">Sắp xếp theo tổng tiền</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7b4d2b]"
                        disabled={isLoading}
                    >
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                    </select>
                </div>
            </div>

            {showForm && formData && (
                <div className="bg-[#e8dfd7] p-6 rounded-xl shadow-md mb-8 animate-fade-in no-print">
                    <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Chi Tiết Hóa Đơn</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Khách Hàng
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày Hóa Đơn
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tổng Tiền (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalAmount}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    className="h-4 w-4 text-[#7b4d2b] border-gray-300 rounded disabled:opacity-50"
                                    disabled
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    {formData.status ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                            <textarea
                                value={formData.note}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                                rows="3"
                                disabled
                            />
                        </div>
                        <div className="flex space-x-4">
                            {!formData.status && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handlePayment('Tiền mặt')}
                                        className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        Thanh toán tiền mặt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePayment('MoMo')}
                                        className="px-6 py-2 bg-pink-600 text-white rounded-full shadow-md hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        Thanh toán MoMo
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={handlePrintInvoice}
                                className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <Printer className="w-5 h-5 mr-2 inline" />
                                In Hóa Đơn
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData(null);
                                }}
                                className="px-6 py-2 bg-gray-500 text-white rounded-full shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template in hóa đơn */}
            {formData && (
                <div className="print-only hidden">
                    <div className="p-4 max-w-sm mx-auto">
                        {/* Header */}
                        <div className="text-center mb-2">
                            <h1 className="text-xl font-bold">HÓA ĐƠN BỆNH VIỆN</h1>
                            <p className="text-sm">Bệnh viện XYZ - 123 Đường ABC, TP.HCM</p>
                            <p className="text-sm">Hotline: 0123 456 789</p>
                        </div>

                        {/* Divider */}
                        <hr className="border-t border-dashed border-gray-400 mb-2" />

                        {/* Invoice Details */}
                        <div className="mb-2">
                            <h2 className="text-base font-semibold mb-1">Chi Tiết Hóa Đơn</h2>
                            <div className="space-y-1 text-sm">
                                <p>Mã Hóa Đơn: {formData.id}</p>
                                <p>Tên Khách Hàng: {formData.customerName}</p>
                                <p>Ngày Hóa Đơn: {formatDate(formData.date)}</p>
                                <p>Ngày In: 12/04/2025</p>
                                <p>Tổng Tiền: {new Intl.NumberFormat('vi-VN').format(formData.totalAmount)} đ</p>
                                <p>Trạng Thái: {formData.status ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                                <p>Ghi Chú: {formData.note || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-t border-dashed border-gray-400 mb-2" />

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-sm">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                            <p className="text-sm">Chúc quý khách sức khỏe dồi dào!</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="no-print">
                <h2 className="text-2xl font-bold text-[#7b4d2b] mb-6">Danh Sách Hóa Đơn</h2>
                {isLoading ? (
                    <p className="text-gray-500 text-center">Đang tải danh sách hóa đơn...</p>
                ) : filteredInvoices.length === 0 ? (
                    <p className="text-gray-500 text-center">Chưa có hóa đơn nào.</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-xl shadow-md">
                                <thead>
                                <tr className="bg-[#7b4d2b] text-white">
                                    <th className="py-3 px-4 text-left text-sm font-semibold">ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Tên Khách Hàng</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Ngày</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Tổng Tiền</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Trạng Thái</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Ghi Chú</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold">Hành Động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b border-gray-200 hover:bg-[#e8dfd7] transition-all duration-200"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-700">{invoice.id}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{invoice.customerName}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(invoice.date)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {formatPrice(invoice.totalAmount)}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {invoice.status ? (
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
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    className="text-[#7b4d2b] hover:text-[#6a3f1e] disabled:opacity-50"
                                                    disabled={isLoading}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                    className="text-red-500 hover:text-red-600 disabled:opacity-50"
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
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

            {/* CSS cho in */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    .invoice {
                        width: 100%;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    h1 { font-size: 18px; }
                    h2 { font-size: 14px; }
                    p  { font-size: 12px; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceManagement;