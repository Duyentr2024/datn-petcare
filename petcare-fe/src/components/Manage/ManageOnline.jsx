import { useEffect, useState } from "react";
import { getAllOrdersOnline, getOrdersByDateRange } from "../../service/manageService/OrdersOnline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes, FaSearch, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 14;

const ManageOnline = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [phoneSearch, setPhoneSearch] = useState("");
    const [sortBy, setSortBy] = useState("orderId");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchAllOrdersOnline();
    }, []);

    const fetchAllOrdersOnline = async () => {
        try {
            const data = await getAllOrdersOnline();
            const sortedOrders = data.sort((a, b) => b.orderId - a.orderId);
            setOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
        } catch (error) {
            toast.error("Không thể tải danh sách hóa đơn online!");
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
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
            setFilteredOrders(sortedOrders);
            setPhoneSearch("");
            setCurrentPage(1);
            if (data.length === 0) {
                toast.info("Không tìm thấy hóa đơn trong khoảng thời gian này!");
            }
        } catch (error) {
            toast.error("Không thể tìm kiếm hóa đơn!");
            console.error("Lỗi khi tìm kiếm hóa đơn:", error);
        }
    };

    const handlePhoneSearch = (e) => {
        const phone = e.target.value;
        setPhoneSearch(phone);
        setCurrentPage(1);

        if (phone.trim() === "") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter((order) =>
                order.phone?.toLowerCase().includes(phone.toLowerCase())
            );
            setFilteredOrders(filtered);
        }
    };

    const handleSort = (column) => {
        const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newSortOrder);

        const sortedOrders = [...filteredOrders].sort((a, b) => {
            let valueA, valueB;

            switch (column) {
                case "orderId":
                    valueA = a.orderId;
                    valueB = b.orderId;
                    break;
                case "totalAmount":
                    valueA = a.totalAmount;
                    valueB = b.totalAmount;
                    break;
                case "orderDate":
                    valueA = new Date(a.orderDate);
                    valueB = new Date(b.orderDate);
                    break;
                case "userName":
                    valueA = a.userName || "Khách hàng online";
                    valueB = b.userName || "Khách hàng online";
                    break;
                case "phone":
                    valueA = a.phone || "";
                    valueB = b.phone || "";
                    break;
                case "paymentMethod":
                    valueA = a.paymentMethod || "";
                    valueB = b.paymentMethod || "";
                    break;
                case "statusName":
                    valueA = a.statusName || "";
                    valueB = b.statusName || "";
                    break;
                default:
                    valueA = a.orderId;
                    valueB = b.orderId;
            }

            if (newSortOrder === "asc") {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        setFilteredOrders(sortedOrders);
    };

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const calculateSubtotal = (orderDetails) => {
        return orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const calculateDiscount = (order) => {
        const subtotal = calculateSubtotal(order.orderDetails);
        return subtotal + order.shippingCost - order.totalAmount;
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

    // Animation variants for buttons
    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#e0a030", transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } },
    };

    const paginationButtonVariants = {
        hover: { scale: 1.05, backgroundColor: "#e5e7eb", transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } },
    };

    return (
        <div className="container mx-auto p-1 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Quản Lý Hóa Đơn Online</h2>
            {/* Bộ lọc và tìm kiếm */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white p-2 rounded-lg shadow-md mb-4"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                        <motion.button
                            onClick={handleSearchByDateRange}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className="px-3 py-1 bg-[#f0b040] text-white rounded-md transition-colors text-sm self-end"
                        >
                            Tìm
                        </motion.button>
                    </div>
                    <div className="flex items-end gap-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm theo số điện thoại</label>
                            <input
                                type="text"
                                value={phoneSearch}
                                onChange={handlePhoneSearch}
                                placeholder="Nhập số điện thoại"
                                className="w-full p-1 pl-7 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            />
                            <FaSearch className="absolute left-2 top-1/2 transform translate-y-1 text-gray-400 text-sm" />
                        </div>
                    </div>
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
                        <table className="w-full table-auto">
                            <thead className="bg-[#f0b040] text-white text-sm">
                                <tr>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("orderId")}
                                    >
                                        Mã HD
                                        {sortBy === "orderId" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("userName")}
                                    >
                                        Khách hàng
                                        {sortBy === "userName" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("phone")}
                                    >
                                        Số điện thoại
                                        {sortBy === "phone" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("totalAmount")}
                                    >
                                        Tổng tiền
                                        {sortBy === "totalAmount" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("paymentMethod")}
                                    >
                                        Phương thức TT
                                        {sortBy === "paymentMethod" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("statusName")}
                                    >
                                        Trạng thái
                                        {sortBy === "statusName" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
                                    <th
                                        className="p-1 text-left text-[10px] font-semibold cursor-pointer hover:bg-[#e0a030]"
                                        onClick={() => handleSort("orderDate")}
                                    >
                                        Ngày tạo
                                        {sortBy === "orderDate" && (
                                            sortOrder === "asc" ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />
                                        )}
                                    </th>
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
                                        <td className="p-1 text-[10px] truncate max-w-[100px]">
                                            {order.userName || "Khách hàng online"}
                                        </td>
                                        <td className="p-1 text-[10px]">{order.phone}</td>
                                        <td className="p-1 text-[10px]">
                                            {order.totalAmount.toLocaleString()}{" "}
                                            <span className="underline">đ</span>
                                        </td>
                                        <td className="p-1 text-[10px] truncate max-w-[100px]">{order.paymentMethod}</td>
                                        <td className="p-1 text-[10px]">{order.statusName}</td>
                                        <td className="p-1 text-[10px] truncate max-w-[120px]">
                                            {new Date(order.orderDate).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="p-1">
                                            <motion.button
                                                onClick={() => openModal(order)}
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="px-1 py-0.5 bg-[#f0b040] text-white rounded-md text-[10px] transition-colors"
                                            >
                                                Xem chi tiết
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="p-2 flex justify-center items-center gap-2">
                                <motion.button
                                    variants={paginationButtonVariants}
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
                                    variants={paginationButtonVariants}
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
                        Không có hóa đơn online nào trong khoảng thời gian này.
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
                                Chi Tiết Hóa Đơn Online #{selectedOrder.orderId}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Khách hàng</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.userName || "Khách hàng online"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.phone || "Không có"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Trạng thái thanh toán</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.paymentStatus}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Trạng thái đơn hàng</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.statusName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Phương thức TT</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Mã voucher</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.voucherName ||
                                            (selectedOrder.voucherId ? `Voucher #${selectedOrder.voucherId}` : "Không sử dụng")}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Tổng tiền sản phẩm</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {calculateSubtotal(selectedOrder.orderDetails).toLocaleString()}{" "}
                                        <span className="underline">đ</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Phí vận chuyển</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.shippingCost.toLocaleString()}{" "}
                                        <span className="underline">đ</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Số tiền giảm giá</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {calculateDiscount(selectedOrder).toLocaleString()}{" "}
                                        <span className="underline">đ</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Thành tiền</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">
                                        {selectedOrder.totalAmount.toLocaleString()}{" "}
                                        <span className="underline">đ</span>
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">Địa chỉ giao hàng</label>
                                    <p className="mt-1 p-2 bg-gray-100 rounded">{selectedOrder.shippingAddress}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Danh sách sản phẩm</label>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-[#f0b040] text-white text-sm">
                                            <tr>
                                                <th className="p-2 text-left text-xs font-semibold">Hình ảnh</th>
                                                <th className="p-2 text-left text-xs font-semibold">Sản phẩm</th>
                                                <th className="p-2 text-left text-xs font-semibold">Thông tin</th>
                                                <th className="p-2 text-left text-xs font-semibold">Số lượng</th>
                                                <th className="p-2 text-left text-xs font-semibold">Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedOrder.orderDetails || []).map((item, index) => (
                                                <motion.tr
                                                    key={index}
                                                    custom={index}
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={rowVariants}
                                                    className="border-b"
                                                >
                                                    <td className="p-2">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    </td>
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

export default ManageOnline;