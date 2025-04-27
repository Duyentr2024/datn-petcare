import React, { useState, useEffect } from 'react';
import VetOrderService from '../../service/hospitalService/VetOrderService.jsx';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const ManageHistory = () => {
    const [vetOrders, setVetOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState({});
    const ordersPerPage = 10;

    // Lấy tất cả hóa đơn và thông tin người dùng
    useEffect(() => {
        const fetchVetOrders = async () => {
            try {
                setLoading(true);
                const orders = await VetOrderService.getAllVetOrders();
                // Lấy thông tin người dùng cho mỗi userId
                const userPromises = [...new Set(orders.map((order) => order.userId))].map(
                    (userId) => VetOrderService.getUserById(userId).catch(() => ({ id: userId, fullName: 'N/A' }))
                );
                const userResponses = await Promise.all(userPromises);
                const userMap = userResponses.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsers(userMap);
                setVetOrders(orders);
                setFilteredOrders(orders);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách hóa đơn hoặc thông tin người dùng.');
                setLoading(false);
            }
        };
        fetchVetOrders();
    }, []);

    // Xử lý tìm kiếm
    useEffect(() => {
        const filtered = vetOrders.filter((order) => {
            const nameBoss = order.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.nameBoss || '';
            const phoneBoss = order.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.phoneBoss || '';
            return (
                nameBoss.toLowerCase().includes(searchTerm.toLowerCase()) ||
                phoneBoss.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toString().includes(searchTerm)
            );
        });
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchTerm, vetOrders]);

    // Xử lý sắp xếp
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredOrders].sort((a, b) => {
            let valueA, valueB;
            if (key === 'orderDate') {
                valueA = new Date(a[key]);
                valueB = new Date(b[key]);
                return direction === 'asc' ? valueA - valueB : valueB - valueA;
            }
            if (key === 'nameBoss') {
                valueA = a.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.nameBoss || '';
                valueB = b.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.nameBoss || '';
            } else if (key === 'phoneBoss') {
                valueA = a.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.phoneBoss || '';
                valueB = b.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.phoneBoss || '';
            } else {
                valueA = a[key] || '';
                valueB = b[key] || '';
            }
            return direction === 'asc'
                ? valueA.toString().localeCompare(valueB.toString())
                : valueB.toString().localeCompare(valueA.toString());
        });
        setFilteredOrders(sorted);
    };

    // Phân trang
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Xem chi tiết hóa đơn
    const handleViewDetails = async (orderId) => {
        try {
            const order = await VetOrderService.getOrderById(orderId);
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (err) {
            setError('Không thể tải chi tiết hóa đơn.');
        }
    };

    // Đóng modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Trạng thái loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                <p className="ml-4 text-lg">Đang tải...</p>
            </div>
        );
    }

    // Trạng thái lỗi
    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-4xl mt-8">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý lịch sử hóa đơn</h2>

            {/* Tìm kiếm */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, số điện thoại hoặc ID hóa đơn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Bảng danh sách hóa đơn */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        {[
                            { key: 'id', label: 'ID Hóa đơn' },
                            { key: 'nameBoss', label: 'Tên khách hàng' },
                            { key: 'phoneBoss', label: 'Số điện thoại' },
                            { key: 'paymentMethod', label: 'Phương thức thanh toán' },
                            { key: 'paymentStatus', label: 'Trạng thái thanh toán' },
                            { key: 'totalAmount', label: 'Tổng tiền' },
                            { key: 'orderDate', label: 'Ngày tạo' },
                        ].map((header) => (
                            <th
                                key={header.key}
                                onClick={() => handleSort(header.key)}
                                className="p-3 text-left cursor-pointer hover:bg-gray-200"
                            >
                                {header.label}
                                {sortConfig.key === header.key && (
                                    <span className="ml-1">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                )}
                            </th>
                        ))}
                        <th className="p-3 text-left">Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                            <tr key={order.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">{order.id}</td>
                                <td className="p-3">
                                    {order.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.nameBoss || 'N/A'}
                                </td>
                                <td className="p-3">
                                    {order.orderVetDetails?.[0]?.medicalRecord?.vetPetDTO?.phoneBoss || 'N/A'}
                                </td>
                                <td className="p-3">{order.paymentMethod}</td>
                                <td className="p-3">{order.paymentStatus}</td>
                                <td className="p-3">{order.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                                <td className="p-3">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleViewDetails(order.id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="p-3 text-center text-gray-500">
                                Không tìm thấy hóa đơn nào.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-4 py-2 mx-1 rounded ${
                                    currentPage === page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-blue-500 border hover:bg-blue-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Modal chi tiết hóa đơn */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold mb-4">
                                        Chi tiết hóa đơn
                                    </Dialog.Title>
                                    {selectedOrder ? (
                                        <div className="space-y-4">
                                            <p><strong>ID Hóa đơn:</strong> {selectedOrder.id}</p>
                                            <p>
                                                <strong>Người lập:</strong>{' '}
                                                {users[selectedOrder.userId]?.fullName || 'N/A'}
                                            </p>
                                            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}</p>
                                            <p><strong>Trạng thái thanh toán:</strong> {selectedOrder.paymentStatus}</p>
                                            <p>
                                                <strong>Tổng tiền:</strong>{' '}
                                                {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                            <p>
                                                <strong>Ngày tạo:</strong>{' '}
                                                {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}
                                            </p>
                                            <h4 className="text-lg font-semibold mt-4">Chi tiết dịch vụ</h4>
                                            {selectedOrder.orderVetDetails &&
                                            selectedOrder.orderVetDetails.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {selectedOrder.orderVetDetails.map((detail, index) => (
                                                        <li key={index} className="border-b pb-4">
                                                            <h5 className="font-medium">Dịch vụ #{index + 1}</h5>
                                                            <p><strong>Số lượng:</strong> {detail.quantity}</p>
                                                            <p>
                                                                <strong>Giá:</strong>{' '}
                                                                {detail.price.toLocaleString('vi-VN')} VNĐ
                                                            </p>
                                                            <h6 className="font-medium mt-2">Hồ sơ y tế</h6>
                                                            <p>
                                                                <strong>Ngày khám:</strong>{' '}
                                                                {new Date(
                                                                    detail.medicalRecord.examDate
                                                                ).toLocaleDateString('vi-VN')}
                                                            </p>
                                                            <p>
                                                                <strong>Triệu chứng:</strong>{' '}
                                                                {detail.medicalRecord.symptoms || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Chẩn đoán:</strong>{' '}
                                                                {detail.medicalRecord.diagnosis || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Điều trị:</strong>{' '}
                                                                {detail.medicalRecord.treatment || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Ghi chú:</strong>{' '}
                                                                {detail.medicalRecord.note || 'N/A'}
                                                            </p>
                                                            <h6 className="font-medium mt-2">Thông tin thú cưng</h6>
                                                            <p>
                                                                <strong>Tên thú cưng:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.namePet || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Loại thú cưng:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.petType || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Tuổi:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.age || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Cân nặng:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.petWeight?.weightRange || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Tên khách hàng:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.nameBoss || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Số điện thoại:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.phoneBoss || 'N/A'}
                                                            </p>
                                                            <p>
                                                                <strong>Ghi chú thú cưng:</strong>{' '}
                                                                {detail.medicalRecord.vetPetDTO.note || 'N/A'}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>Không có chi tiết dịch vụ.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p>Đang tải chi tiết...</p>
                                    )}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={closeModal}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ManageHistory;