import { X, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// eslint-disable-next-line react/prop-types
const RecordDetailView = ({ selectedDetailRecord, setSelectedDetailRecord, vaccines, services, petWeights, formatDateTime, formatPrice, formatDate, calculateTotalPriceForDetail }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <div className="border rounded-lg p-8 bg-white shadow-lg max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-center text-[#754826] border-b-2 border-[#e8dfd7] pb-2">
                        HỒ SƠ BỆNH ÁN THÚ CƯNG
                    </h3>
                    <button
                        onClick={() => setSelectedDetailRecord(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-sm text-gray-600 mb-6 flex justify-between">
                    <p>
                        <strong>Ngày lập hồ sơ:</strong> {formatDateTime(selectedDetailRecord.examDate)}
                    </p>
                    <p>
                        <strong>Mã hồ sơ:</strong> HS-{Math.floor(Math.random() * 10000)}
                    </p>
                </div>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">
                            Thông tin cơ bản
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Tên Thú Cưng:</strong> {selectedDetailRecord.petName}</p>
                            <p>
                                <strong>Loại Thú Cưng:</strong>{' '}
                                {selectedDetailRecord.petType === 'DOG' ? 'Chó' : selectedDetailRecord.petType === 'CAT' ? 'Mèo' : selectedDetailRecord.petType}
                            </p>
                            <p>
                                <strong>Cân Nặng:</strong>{' '}
                                {petWeights.find((pw) => pw.petWeightId === selectedDetailRecord.petWeightId)?.weightRange || 'N/A'}
                            </p>
                            <p><strong>Tuổi:</strong> {selectedDetailRecord.age} năm</p>
                            <p><strong>Tên Chủ Nuôi:</strong> {selectedDetailRecord.owner}</p>
                            <p><strong>Số Điện Thoại:</strong> {selectedDetailRecord.phoneBoss}</p>
                        </div>
                        {selectedDetailRecord.basicNote && (
                            <div>
                                <p><strong>Ghi Chú:</strong></p>
                                <p className="text-gray-700">{selectedDetailRecord.basicNote}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">
                            Thông tin bệnh án
                        </h4>
                        <p><strong>Thông Tin Bệnh Án:</strong></p>
                        <p className="text-gray-700 whitespace-pre-line">{selectedDetailRecord.medicalInfo}</p>
                        <p><strong>Ngày Tái Khám:</strong> {selectedDetailRecord.nextVisit}</p>
                        {selectedDetailRecord.medicalNote && (
                            <div>
                                <p><strong>Ghi Chú Bệnh Án:</strong></p>
                                <p className="text-gray-700">{selectedDetailRecord.medicalNote}</p>
                            </div>
                        )}
                    </div>
                    {(selectedDetailRecord.vaccineIds?.length || selectedDetailRecord.vetServiceIds?.length) && (
                        <div>
                            <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">
                                Vaccine và Dịch Vụ
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {selectedDetailRecord.vaccineIds?.length ? (
                                        <div>
                                            <p className="font-medium text-gray-700">Vaccines:</p>
                                            {selectedDetailRecord.vaccineIds.map((id) => {
                                                const selectedVaccine = vaccines.find((v) => v.id === parseInt(id));
                                                return selectedVaccine ? (
                                                    <div key={id} className="mb-2">
                                                        <p>Tên: {selectedVaccine.name}</p>
                                                        <p>Xuất xứ: {selectedVaccine.origin}</p>
                                                        <p>Loại: {selectedVaccine.type}</p>
                                                        <p>Giá bán: {formatPrice(selectedVaccine.sellingPrice)}</p>
                                                        <p>Ngày sản xuất: {formatDate(selectedVaccine.manufacturingDate)}</p>
                                                        <p>Ngày hết hạn: {formatDate(selectedVaccine.expiryDate)}</p>
                                                        {selectedVaccine.note && <p>Ghi chú: {selectedVaccine.note}</p>}
                                                    </div>
                                                ) : (
                                                    <p key={id} className="text-sm text-gray-700">Không tìm thấy vaccine ID {id}</p>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="font-medium text-gray-700">Không chọn vaccine</p>
                                    )}
                                </div>
                                <div>
                                    {selectedDetailRecord.vetServiceIds?.length ? (
                                        <div>
                                            <p className="font-medium text-gray-700">Dịch Vụ:</p>
                                            {selectedDetailRecord.vetServiceIds.map((id) => {
                                                const selectedService = services.find((s) => s.id === parseInt(id));
                                                return selectedService ? (
                                                    <div key={id} className="mb-2">
                                                        <p>Tên: {selectedService.name}</p>
                                                        <p>Giá: {formatPrice(selectedService.priceBase)}</p>
                                                        {selectedService.description && <p>Ghi chú: {selectedService.description}</p>}
                                                    </div>
                                                ) : (
                                                    <p key={id} className="text-sm text-gray-700">Không tìm thấy dịch vụ ID {id}</p>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="font-medium text-gray-700">Không chọn dịch vụ</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">
                            Chi phí
                        </h4>
                        <p>
                            <strong>Tổng Giá:</strong>{' '}
                            {formatPrice(calculateTotalPriceForDetail(selectedDetailRecord.vaccineIds, selectedDetailRecord.vetServiceIds))}
                        </p>
                        <p>
                            <strong>Đã Thanh Toán:</strong> {formatPrice(selectedDetailRecord.paid_amount || 0)}
                        </p>
                        <p>
                            <strong>Còn Lại:</strong>{' '}
                            {formatPrice(
                                calculateTotalPriceForDetail(selectedDetailRecord.vaccineIds, selectedDetailRecord.vetServiceIds) -
                                (selectedDetailRecord.paid_amount || 0)
                            )}
                        </p>
                    </div>
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Phòng Khám Thú Y - Chăm sóc sức khỏe thú cưng</p>
                    <p>Hotline: 0123 456 789</p>
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setSelectedDetailRecord(null)}
                    className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Quay Lại
                </button>
            </div>
        </motion.div>
    );
};

export default RecordDetailView;