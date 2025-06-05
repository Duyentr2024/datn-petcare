import { useEffect, useState } from "react";
import { getAllOrders, getOrdersByDateRange } from "../../service/manageService/Invoice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 14;

const Invoice = () => {
    const [orders, setOrders] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            const data = await getAllOrders();
            const sortedOrders = data.sort((a, b) => b.orderId - a.orderId);
            setOrders(sortedOrders);
        } catch (error) {
            toast.error("Không thể tải danh sách hóa đơn!");
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSearchByDateRange = async () => {
        if (!startDate || !endDate) {
            toast.error("Vui lòng chọn cả ngày bắt đầu và kết thúc!");
            return;
        }

        if (startDate > endDate) {
            toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
            return;
        }

        try {
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            const data = await getOrdersByDateRange(formattedStartDate, formattedEndDate);
            const sortedOrders = data.sort((a, b) => b.orderId - a.orderId);
            setOrders(sortedOrders);
            setCurrentPage(1);
            if (data.length === 0) {
                toast.info("Không tìm thấy hóa đơn trong khoảng thời gian này!");
            }
        } catch (error) {
            toast.error("Không thể tìm kiếm hóa đơn!");
        }
    };

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Animation variants for table rows
    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (index) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeInOut",
            },
        }),
    };

    // Animation variants for modal
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeInOut" } },
    };

    // Animation variants for pagination buttons
    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#e5e7eb", transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } },
    };

    return (
        <div className="container mx-auto p-1 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Quản Lý Hóa Đơn Offline</h2>
            {/* Bộ lọc ngày */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white p-2 rounded-lg shadow-md mb-4"
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-end gap-2">
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                className="w-55 p-1 pl-7 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                maxDate={new Date()}
                            />
                            <FaCalendarAlt className="absolute left-2 top-1/2 transform translate-y-1 text-gray-400 text-sm" />
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="dd/mm/yyyy"
                                className="w-55 p-1 pl-7 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                maxDate={new Date()}
                                minDate={startDate}
                            />
                            <FaCalendarAlt className="absolute left-2 top-1/2 transform translate-y-1 text-gray-400 text-sm" />
                        </div>
                    </div>
                    <motion.button
                        onClick={handleSearchByDateRange}
                        className="px-3 py-1 bg-[#f0b040] text-white rounded-md hover:bg-[#e0a030] transition-colors text-sm self-end"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Tìm
                    </motion.button>
                </div>
            </motion.div>

            {/* Bảng hóa đơn */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white rounded-lg shadow-md"
            >
                {paginatedOrders.length > 0 ? (
                    <>
                        <table className="w-full [table-layout:fixed] overflow-x-hidden">
                            <thead className="bg-[#f0b040] text-white text-sm">
                                <tr>
                                    <th className="p-1 text-left text-[10px] font-semibold">Mã HD</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Nhân viên</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Tổng tiền</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Phương thức TT</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Trạng thái</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Ngày tạo</th>
                                    <th className="p-1 text-left text-[10px] font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order, index) => (
                                    <motion.tr
                                        key={order.orderId}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        variants={rowVariants}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-1 text-[10px]">{order.orderId}</td>
                                        <td className="p-1 text-[10px] truncate max-w-[100px]">{order.staffName}</td>
                                        <td className="p-1 text-[10px]">
                                            {order.totalAmount.toLocaleString()}{" "}
                                            <span className="underline">đ</span>
                                        </td>
                                        <td className="p-1 text-[10px] truncate max-w-[100px]">{order.paymentMethod}</td>
                                        <td className="p-1 text-[10px]">{order.status}</td>
                                        <td className="p-1 text-[10px] truncate max-w-[120px]">
                                            {new Date(order.orderDate).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="p-1">
                                            <motion.button
                                                onClick={() => openModal(order)}
                                                className="px-1 py-0.5 bg-[#f0b040] text-white rounded-md hover:bg-[#e0a030] text-[10px] transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Xem chi tiết
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="p-2 flex justify-center items-center gap-2">
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="px-3 py-1 border rounded-md bg-gray-100 disabled:opacity-50 text-xs"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Trước
                                </motion.button>
                                <span className="text-xs font-medium">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="px-3 py-1 border rounded-md bg-gray-100 disabled:opacity-50 text-xs"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Tiếp
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 text-gray-500 text-center"
                    >
                        Không có hóa đơn nào trong khoảng thời gian này.
                    </motion.p>
                )}
            </motion.div>

            {/* Modal chi tiết */}
            <AnimatePresence>
                {isModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <motion.button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes />
                            </motion.button>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Chi Tiết Hóa Đơn #{selectedOrder.orderId}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Nhân viên</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.staffName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Ngày tạo</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Phương thức TT</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Trạng thái</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.status}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Tổng tiền</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.totalAmount.toLocaleString()}{" "}
                                        <span className="underline">đ</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Điểm tích lũy</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.pointsEarned || 0}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Điểm đã sử dụng</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.pointUsed || 0}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Tổng điểm</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.totalPoints || 0}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Khách hàng</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.customerName || "Khách lẻ"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.customerPhone || "Không"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Danh sách sản phẩm
                                </label>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[#f0b040] text-white text-sm">
                                            <tr>
                                                <th className="p-2 text-left text-xs font-semibold">Sản phẩm</th>
                                                <th className="p-2 text-left text-xs font-semibold">Thông tin</th>
                                                <th className="p-2 text-left text-xs font-semibold">Số lượng</th>
                                                <th className="p-2 text-left text-xs font-semibold">Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedOrder.items || []).map((item, index) => (
                                                <motion.tr
                                                    key={index}
                                                    custom={index}
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={rowVariants}
                                                    className="border-b"
                                                >
                                                    <td className="p-2 text-xs">{item.productName}</td>
                                                    <td className="p-2 text-xs">{`${item.colorValue}, ${item.sizeValue}, ${item.weightValue}kg`}</td>
                                                    <td className="p-2 text-xs">{item.quantity}</td>
                                                    <td className="p-2 text-xs">
                                                        {item.price.toLocaleString()}{" "}
                                                        <span className="underline">đ</span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default Invoice;