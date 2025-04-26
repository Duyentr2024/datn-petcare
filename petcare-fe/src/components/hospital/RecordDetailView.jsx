import { X, ChevronLeft, CheckCircle, PawPrint, Syringe, FileText, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import VetOrderService from '../../service/hospitalService/VetOrderService';
import { toast } from 'react-toastify';

// eslint-disable-next-line react/prop-types
const RecordDetailView = ({ selectedDetailRecord, setSelectedDetailRecord, vaccines, services, petWeights, formatDateTime, formatPrice, formatDate, calculateTotalPriceForDetail }) => {
    const [currentTab, setCurrentTab] = useState(selectedDetailRecord.defaultTab || 1);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(false);

    // Tính toán chi phí dựa trên vaccineId và vetServiceId từ selectedDetailRecord
    const calculateTotalPrice = () => {
        let total = 0;
        const vaccineId = selectedDetailRecord.vaccineId || null;
        const vetServiceId = selectedDetailRecord.vetServiceId || null;

        if (vaccineId) {
            const selectedVaccine = vaccines?.find((v) => v.id === vaccineId);
            if (selectedVaccine) {
                total += selectedVaccine.sellingPrice || 0;
            }
        }

        if (vetServiceId) {
            const selectedService = services?.find((s) => s.id === vetServiceId);
            if (selectedService) {
                total += selectedService.priceBase || 0;
            }
        }

        const priceMultiplier = selectedDetailRecord.vetPetDTO?.petWeight?.priceMultiplier || 1;
        return total * priceMultiplier;
    };

    const totalPrice = calculateTotalPrice();
    const paidAmount = selectedDetailRecord.paid_amount || 0;
    const remainingAmount = totalPrice - paidAmount;

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        if (!selectedDetailRecord.orderId) {
            toast.error('Không tìm thấy mã đơn hàng để thanh toán!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        setLoading(true);
        try {
            await VetOrderService.processPayment(selectedDetailRecord.orderId, 'COMPLETED');
            toast.success('Thanh toán thành công!', { position: 'top-right', autoClose: 3000 });
            setSelectedDetailRecord(null); // Đóng modal sau khi thanh toán
        } catch (error) {
            toast.error('Lỗi khi thanh toán', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case 1:
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <PawPrint className="w-5 h-5 mr-2 text-[#754826]" /> Thông Tin Cơ Bản
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                <p><strong>Tên Thú Cưng:</strong> {selectedDetailRecord.vetPetDTO?.namePet || 'N/A'}</p>
                                <p>
                                    <strong>Loại Thú Cưng:</strong>{' '}
                                    {selectedDetailRecord.vetPetDTO?.petType === 'DOG' ? 'Chó' : selectedDetailRecord.vetPetDTO?.petType === 'CAT' ? 'Mèo' : selectedDetailRecord.vetPetDTO?.petType || 'N/A'}
                                </p>
                                <p>
                                    <strong>Cân Nặng:</strong>{' '}
                                    {selectedDetailRecord.vetPetDTO?.petWeight?.weightRange || 'N/A'}
                                </p>
                                <p><strong>Tuổi:</strong> {selectedDetailRecord.vetPetDTO?.age || 0} năm</p>
                                <p><strong>Tên Chủ Nuôi:</strong> {selectedDetailRecord.vetPetDTO?.nameBoss || 'N/A'}</p>
                                <p><strong>Số Điện Thoại:</strong> {selectedDetailRecord.vetPetDTO?.phoneBoss || 'N/A'}</p>
                            </div>
                            {selectedDetailRecord.vetPetDTO?.note && (
                                <div className="mt-4">
                                    <p><strong>Ghi Chú:</strong></p>
                                    <p className="text-gray-600">{selectedDetailRecord.vetPetDTO.note}</p>
                                </div>
                            )}
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <FileText className="w-5 h-5 mr-2 text-[#754826]" /> Thông Tin Bệnh Án
                            </h4>
                            <div className="text-gray-700 space-y-2">
                                <p><strong>Triệu Chứng:</strong> {selectedDetailRecord.symptoms || 'N/A'}</p>
                                <p><strong>Chẩn Đoán:</strong> {selectedDetailRecord.diagnosis || 'N/A'}</p>
                                <p><strong>Điều Trị:</strong> {selectedDetailRecord.treatment || 'N/A'}</p>
                                {selectedDetailRecord.note && (
                                    <div>
                                        <p><strong>Ghi Chú Bệnh Án:</strong></p>
                                        <p className="text-gray-600">{selectedDetailRecord.note}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        {(selectedDetailRecord.vaccineId || selectedDetailRecord.vetServiceId) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                            >
                                <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                    <Syringe className="w-5 h-5 mr-2 text-[#754826]" /> Vaccine và Dịch Vụ
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                    <div>
                                        {selectedDetailRecord.vaccineId ? (
                                            <div>
                                                <p className="font-medium text-gray-700">Vaccine:</p>
                                                {(() => {
                                                    const selectedVaccine = vaccines?.find((v) => v.id === selectedDetailRecord.vaccineId);
                                                    return selectedVaccine ? (
                                                        <div className="mt-2 space-y-1">
                                                            <p><strong>Tên:</strong> {selectedVaccine.name}</p>
                                                            <p><strong>Xuất xứ:</strong> {selectedVaccine.origin}</p>
                                                            <p><strong>Loại:</strong> {selectedVaccine.type}</p>
                                                            <p><strong>Giá bán:</strong> {formatPrice(selectedVaccine.sellingPrice)}</p>
                                                            <p><strong>Ngày sản xuất:</strong> {formatDate(selectedVaccine.manufacturingDate)}</p>
                                                            <p><strong>Ngày hết hạn:</strong> {formatDate(selectedVaccine.expiryDate)}</p>
                                                            {selectedVaccine.note && <p><strong>Ghi chú:</strong> {selectedVaccine.note}</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-600">Không tìm thấy vaccine ID {selectedDetailRecord.vaccineId}</p>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <p className="font-medium text-gray-600">Không chọn vaccine</p>
                                        )}
                                    </div>
                                    <div>
                                        {selectedDetailRecord.vetServiceId ? (
                                            <div>
                                                <p className="font-medium text-gray-700">Dịch Vụ:</p>
                                                {(() => {
                                                    const selectedService = services?.find((s) => s.id === selectedDetailRecord.vetServiceId);
                                                    return selectedService ? (
                                                        <div className="mt-2 space-y-1">
                                                            <p><strong>Tên:</strong> {selectedService.name}</p>
                                                            <p><strong>Giá:</strong> {formatPrice(selectedService.priceBase)}</p>
                                                            {selectedService.description && <p><strong>Ghi chú:</strong> {selectedService.description}</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-600">Không tìm thấy dịch vụ ID {selectedDetailRecord.vetServiceId}</p>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <p className="font-medium text-gray-600">Không chọn dịch vụ</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <CreditCard className="w-5 h-5 mr-2 text-[#754826]" /> Chi Phí
                            </h4>
                            <div className="text-gray-700 space-y-2">
                                <p>
                                    <strong>Tổng Giá:</strong>{' '}
                                    <span className="text-[#754826] font-semibold">{formatPrice(totalPrice)}</span>
                                </p>
                                <p>
                                    <strong>Đã Thanh Toán:</strong> {formatPrice(paidAmount)}
                                </p>
                                <p>
                                    <strong>Còn Lại:</strong>{' '}
                                    <span className={remainingAmount > 0 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
                                        {formatPrice(remainingAmount)}
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <PawPrint className="w-5 h-5 mr-2 text-[#754826]" /> Thông Tin Cơ Bản
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                <p><strong>Tên Thú Cưng:</strong> {selectedDetailRecord.vetPetDTO?.namePet || 'N/A'}</p>
                                <p>
                                    <strong>Loại Thú Cưng:</strong>{' '}
                                    {selectedDetailRecord.vetPetDTO?.petType === 'DOG' ? 'Chó' : selectedDetailRecord.vetPetDTO?.petType === 'CAT' ? 'Mèo' : selectedDetailRecord.vetPetDTO?.petType || 'N/A'}
                                </p>
                                <p>
                                    <strong>Cân Nặng:</strong>{' '}
                                    {selectedDetailRecord.vetPetDTO?.petWeight?.weightRange || 'N/A'}
                                </p>
                                <p><strong>Tuổi:</strong> {selectedDetailRecord.vetPetDTO?.age || 0} năm</p>
                                <p><strong>Tên Chủ Nuôi:</strong> {selectedDetailRecord.vetPetDTO?.nameBoss || 'N/A'}</p>
                                <p><strong>Số Điện Thoại:</strong> {selectedDetailRecord.vetPetDTO?.phoneBoss || 'N/A'}</p>
                            </div>
                            {selectedDetailRecord.vetPetDTO?.note && (
                                <div className="mt-4">
                                    <p><strong>Ghi Chú:</strong> {selectedDetailRecord.vetPetDTO.note}</p>
                                </div>
                            )}
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <FileText className="w-5 h-5 mr-2 text-[#754826]" /> Thông Tin Bệnh Án
                            </h4>
                            <div className="text-gray-700 space-y-2">
                                <p><strong>Triệu Chứng:</strong> {selectedDetailRecord.symptoms || 'Không có'}</p>
                                <p><strong>Chẩn Đoán:</strong> {selectedDetailRecord.diagnosis || 'Không có'}</p>
                                <p><strong>Điều Trị:</strong> {selectedDetailRecord.treatment || 'Không có'}</p>
                                {selectedDetailRecord.note && (
                                    <p><strong>Ghi Chú Bệnh Án:</strong> {selectedDetailRecord.note}</p>
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <Syringe className="w-5 h-5 mr-2 text-[#754826]" /> Vaccine và Dịch Vụ
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                <div>
                                    <p className="font-medium">Vaccine:</p>
                                    {selectedDetailRecord.vaccineId ? (
                                        (() => {
                                            const selectedVaccine = vaccines?.find((v) => v.id === selectedDetailRecord.vaccineId);
                                            return selectedVaccine ? (
                                                <p className="text-gray-700 mt-2">{selectedVaccine.name} - {formatPrice(selectedVaccine.sellingPrice)}</p>
                                            ) : (
                                                <p className="text-gray-600 mt-2">Không tìm thấy vaccine ID {selectedDetailRecord.vaccineId}</p>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-gray-600 mt-2">Không chọn vaccine</p>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">Dịch Vụ:</p>
                                    {selectedDetailRecord.vetServiceId ? (
                                        (() => {
                                            const selectedService = services?.find((s) => s.id === selectedDetailRecord.vetServiceId);
                                            return selectedService ? (
                                                <p className="text-gray-700 mt-2">{selectedService.name} - {formatPrice(selectedService.priceBase)}</p>
                                            ) : (
                                                <p className="text-gray-600 mt-2">Không tìm thấy dịch vụ ID {selectedDetailRecord.vetServiceId}</p>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-gray-600 mt-2">Không chọn dịch vụ</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <CreditCard className="w-5 h-5 mr-2 text-[#754826]" /> Chi Phí
                            </h4>
                            <div className="text-gray-700 space-y-2">
                                <p>
                                    <strong>Tổng Giá:</strong>{' '}
                                    <span className="text-[#754826] font-semibold">{formatPrice(totalPrice)}</span>
                                </p>
                                <p>
                                    <strong>Đã Thanh Toán:</strong> {formatPrice(paidAmount)}
                                </p>
                                <p>
                                    <strong>Còn Lại:</strong>{' '}
                                    <span className={remainingAmount > 0 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
                                        {formatPrice(remainingAmount)}
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h4 className="text-lg font-semibold text-[#754826] flex items-center mb-4">
                                <CreditCard className="w-5 h-5 mr-2 text-[#754826]" /> Thông Tin Thanh Toán
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Phương Thức Thanh Toán *</label>
                                    <div className="flex items-center space-x-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="CASH"
                                                checked={paymentMethod === 'CASH'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="hidden"
                                                disabled={loading}
                                            />
                                            <div className={`flex items-center px-4 py-2 rounded-lg border transition-all ${paymentMethod === 'CASH' ? 'bg-[#754826] text-white border-[#754826]' : 'bg-white border-gray-300'}`}>
                                                <span className="mr-2">Tiền Mặt</span>
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="MOMO"
                                                checked={paymentMethod === 'MOMO'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="hidden"
                                                disabled={loading}
                                            />
                                            <div className={`flex items-center px-4 py-2 rounded-lg border transition-all ${paymentMethod === 'MOMO' ? 'bg-[#754826] text-white border-[#754826]' : 'bg-white border-gray-300'}`}>
                                                <span className="mr-2">MoMo</span>
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-center mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePayment}
                                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                disabled={loading}
                            >
                                <CheckCircle className="w-5 h-5 mr-2" /> Thanh Toán
                            </motion.button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 px-4 sm:px-0"
        >
            <div className="border rounded-xl p-8 bg-gradient-to-b from-white to-gray-50 shadow-lg max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-center text-[#754826] border-b-2 border-[#e8dfd7] pb-2">
                        HỒ SƠ BỆNH ÁN THÚ CƯNG
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedDetailRecord(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </motion.button>
                </div>
                <div className="text-sm text-gray-600 mb-8 flex justify-between">
                    <p>
                        <strong>Ngày lập hồ sơ:</strong> {formatDateTime(selectedDetailRecord.examDate)}
                    </p>
                    <p>
                        <strong>Mã hồ sơ:</strong> HS-{Math.floor(Math.random() * 10000)}
                    </p>
                </div>
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setCurrentTab(1)}
                            className={`flex flex-col items-center space-y-1 ${currentTab === 1 ? 'text-[#754826]' : 'text-gray-500'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTab === 1 ? 'bg-[#754826] text-white' : 'bg-gray-200 text-gray-700'}`}>
                                1
                            </div>
                            <span className="text-xs">Thông Tin</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setCurrentTab(2)}
                            className={`flex flex-col items-center space-y-1 ${currentTab === 2 ? 'text-[#754826]' : 'text-gray-500'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTab === 2 ? 'bg-[#754826] text-white' : 'bg-gray-200 text-gray-700'}`}>
                                2
                            </div>
                            <span className="text-xs">Dịch Vụ</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setCurrentTab(3)}
                            className={`flex flex-col items-center space-y-1 ${currentTab === 3 ? 'text-[#754826]' : 'text-gray-500'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentTab === 3 ? 'bg-[#754826] text-white' : 'bg-gray-200 text-gray-700'}`}>
                                3
                            </div>
                            <span className="text-xs">Thanh Toán</span>
                        </motion.button>
                    </div>
                </div>
                {renderTabContent()}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Phòng Khám Thú Y - Chăm sóc sức khỏe thú cưng</p>
                    <p>Hotline: 0123 456 789</p>
                </div>
            </div>
            {currentTab !== 3 && (
                <div className="flex justify-center mt-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDetailRecord(null)}
                        className="flex items-center px-6 py-3 bg-[#754826] text-white rounded-lg shadow-md hover:bg-[#5e3a20] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" /> Quay Lại
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default RecordDetailView;