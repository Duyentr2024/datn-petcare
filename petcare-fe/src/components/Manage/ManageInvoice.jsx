import { useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "../../service/manageService/Invoice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 15; // Số hóa đơn mỗi trang

const Invoice = () => {
    const [orders, setOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("vi-VN"));
    const [inputDate, setInputDate] = useState(new Date().toLocaleDateString("vi-VN"));
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editOrderData, setEditOrderData] = useState({
        userId: null,
        paymentMethod: "",
        items: [],
        customerPhone: "",
        customerName: "",
        accumulatePoints: false,
    });
    const [phoneError, setPhoneError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            const sortedOrders = data.sort((a, b) => b.orderId - a.orderId);
            setOrders(sortedOrders);
        } catch (error) {
            console.error("Không thể tải danh sách hóa đơn:", error);
            toast.error("Không thể tải danh sách hóa đơn!");
        }
    };

    const filteredOrders = orders.filter(
        (order) => new Date(order.orderDate).toLocaleDateString("vi-VN") === selectedDate
    );

    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleDateChange = (e) => {
        const value = e.target.value;
        setInputDate(value);
    };

    const handleSearchDate = () => {
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (datePattern.test(inputDate)) {
            const [day, month, year] = inputDate.split("/").map(Number);
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date.toLocaleDateString("vi-VN"));
                setCurrentPage(1); // Reset về trang đầu khi thay đổi ngày
            } else {
                toast.error("Ngày không hợp lệ!");
                setInputDate(selectedDate);
            }
        } else {
            toast.error("Vui lòng nhập đúng định dạng DD/MM/YYYY!");
            setInputDate(selectedDate);
        }
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setEditOrderData({
            userId: order.userId,
            paymentMethod: order.paymentMethod,
            items: (order.items || []).map((item) => ({
                productDetailId: item.productDetailId,
                productName: item.productName || "Không xác định",
                quantity: item.quantity || 0,
                colorValue: item.colorValue || "Không xác định",
                sizeValue: item.sizeValue || "Không xác định",
                weightValue: item.weightValue || 0.0,
                price: item.price || 0, // Thêm giá, mặc định là 0 nếu không có
            })),
            customerPhone: order.customerPhone || "",
            customerName: order.customerName || "",
            accumulatePoints: order.pointsEarned > 0,
        });
        setPhoneError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setPhoneError("");
    };

    const handleItemQuantityChange = (index, newQuantity) => {
        const updatedItems = [...editOrderData.items];
        updatedItems[index].quantity = parseInt(newQuantity) || 0;
        setEditOrderData({ ...editOrderData, items: updatedItems });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "customerPhone") {
            validatePhone(value);
        }
        setEditOrderData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone) => {
        const phonePattern = /^0\d{9}$/;
        if (!phone) {
            setPhoneError("");
        } else if (!phonePattern.test(phone)) {
            setPhoneError("Số điện thoại phải có 10 chữ số và bắt đầu bằng 0!");
        } else {
            setPhoneError("");
        }
    };

    const handleUpdateOrder = async () => {
        try {
            if (phoneError) {
                toast.error("Vui lòng nhập số điện thoại hợp lệ!");
                return;
            }

            const hasInvalidQuantity = editOrderData.items.some(
                (item) => item.quantity < 0 || !item.productDetailId
            );
            if (hasInvalidQuantity) {
                toast.error("Số lượng sản phẩm không được nhỏ hơn 0 và phải có productDetailId hợp lệ!");
                return;
            }

            const updateData = {
                userId: editOrderData.userId,
                paymentMethod: editOrderData.paymentMethod,
                items: editOrderData.items.map((item) => ({
                    productDetailId: item.productDetailId,
                    quantity: item.quantity,
                })),
                customerPhone: editOrderData.customerPhone,
                customerName: editOrderData.customerName,
                accumulatePoints: editOrderData.accumulatePoints,
            };

            await updateOrder(selectedOrder.orderId, updateData);
            fetchOrders();
            closeModal();
            toast.success("Cập nhật hóa đơn thành công!");
        } catch (error) {
            console.error("Không thể cập nhật hóa đơn:", error.response || error);
            toast.error(
                "Có lỗi xảy ra khi cập nhật hóa đơn: " + (error.response?.data?.message || error.message)
            );
        }
    };

    return (
        <div className="p-1">
            <h2 className="text-base font-bold mb-2">Quản lý hóa đơn</h2>

            {/* Input nhập ngày với nút Tìm */}
            <div className="mb-3">
                <h3 className="text-sm font-semibold mb-1">Nhập ngày để tìm hóa đơn</h3>
                <div className="flex items-center space-x-1">
                    <label className="mr-1 text-xs font-medium">Ngày:</label>
                    <input
                        type="text"
                        value={inputDate}
                        onChange={handleDateChange}
                        placeholder="DD/MM/YYYY"
                        className="p-1 border rounded text-xs w-28"
                    />
                    <button
                        onClick={handleSearchDate}
                        className="px-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                        Tìm
                    </button>
                </div>
            </div>

            {/* Hiển thị hóa đơn theo ngày được nhập */}
            <div className="mb-3">
                <h3 className="text-sm font-semibold mb-1">Hóa đơn ngày {selectedDate}</h3>
                {paginatedOrders.length > 0 ? (
                    <>
                        <table className="w-full border-collapse border border-gray-300 mb-1">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-1 text-xs">Mã HD</th>
                                    <th className="border p-1 text-xs">Nhân viên</th>
                                    <th className="border p-1 text-xs">Tổng tiền</th>
                                    <th className="border p-1 text-xs">Phương thức TT</th>
                                    <th className="border p-1 text-xs">Trạng thái</th>
                                    <th className="border p-1 text-xs">Ngày tạo</th>
                                    <th className="border p-1 text-xs">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order) => (
                                    <tr key={order.orderId} className="text-center border-b">
                                        <td className="border p-1 text-xs">{order.orderId}</td>
                                        <td className="border p-1 text-xs">{order.staffName}</td>
                                        <td className="border p-1 text-xs">{order.totalAmount.toLocaleString()} VNĐ</td>
                                        <td className="border p-1 text-xs">{order.paymentMethod}</td>
                                        <td className="border p-1 text-xs">{order.status}</td>
                                        <td className="border p-1 text-xs">{new Date(order.orderDate).toLocaleString("vi-VN")}</td>
                                        <td className="border p-1 text-xs">
                                            <button
                                                onClick={() => openModal(order)}
                                                className="px-1 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang giống StockPage */}
                        {totalPages > 1 && (
                            <div className="mt-2 flex justify-center items-center gap-1">
                                <button
                                    className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300 text-xs"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    ⬅️ Trước
                                </button>
                                <span className="text-xs font-semibold">{currentPage} / {totalPages}</span>
                                <button
                                    className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300 text-xs"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Tiếp ➡️
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-xs">Không có hóa đơn nào trong ngày này.</p>
                )}
            </div>

            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-2 rounded-lg shadow-lg w-3/4 max-w-3xl">
                        <h3 className="text-sm font-semibold mb-2">Chi tiết hóa đơn</h3>
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="block text-xs font-medium">Mã HD:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.orderId}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Nhân viên:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.staffName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Ngày tạo:</label>
                                <p className="p-1 border rounded text-xs">{new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Phương thức TT:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.paymentMethod}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Trạng thái:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.status}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Tổng tiền:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.totalAmount.toLocaleString()} VNĐ</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Điểm tích lũy:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.pointsEarned || 0}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium">Tổng điểm:</label>
                                <p className="p-1 border rounded text-xs">{selectedOrder.totalPoints || 0}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium">Tên khách hàng:</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={editOrderData.customerName}
                                    onChange={handleInputChange}
                                    className="p-1 border rounded text-xs w-full"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium">Số điện thoại:</label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    value={editOrderData.customerPhone}
                                    onChange={handleInputChange}
                                    className={`p-1 border rounded text-xs w-full ${phoneError ? "border-red-500" : ""}`}
                                />
                                {phoneError && (
                                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium">Danh sách sản phẩm:</label>
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full border-collapse border border-gray-300 mt-1">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border p-1 text-xs">Tên sản phẩm</th>
                                                <th className="border p-1 text-xs">Thông tin biến thể</th>
                                                <th className="border p-1 text-xs">Số lượng</th>
                                                <th className="border p-1 text-xs">Giá</th> {/* Thêm cột Giá */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editOrderData.items.map((item, index) => (
                                                <tr key={item.productDetailId || index}>
                                                    <td className="border p-1 text-xs">{item.productName}</td>
                                                    <td className="border p-1 text-xs">
                                                        {`${item.colorValue}, ${item.sizeValue}, ${item.weightValue}kg`}
                                                    </td>
                                                    <td className="border p-1 text-xs">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                                            className="p-1 border rounded text-xs w-full"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="border p-1 text-xs text-right">
                                                        {item.price.toLocaleString()} VNĐ
                                                    </td> {/* Hiển thị giá */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-2 space-x-1">
                            <button
                                onClick={closeModal}
                                className="px-1 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleUpdateOrder}
                                className="px-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Invoice;