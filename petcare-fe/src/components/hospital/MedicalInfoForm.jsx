import PropTypes from 'prop-types';

const MedicalInfoForm = ({
                             formData,
                             setFormData,
                             filteredVaccines,
                             filteredServices,
                             totalPrice,
                             basePrice,
                             priceMultiplier,
                             loading,
                             handleInputChange,
                             formatPrice,
                         }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#754826]">Thông Tin Bệnh Án</h3>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Triệu Chứng</label>
                    <textarea
                        name="symptoms"
                        value={formData.symptoms || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                        rows="2"
                        placeholder="Nhập triệu chứng"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chẩn Đoán</label>
                    <textarea
                        name="diagnosis"
                        value={formData.diagnosis || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                        rows="2"
                        placeholder="Nhập chẩn đoán"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Điều Trị</label>
                    <textarea
                        name="treatment"
                        value={formData.treatment || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                        rows="2"
                        placeholder="Nhập phương pháp điều trị"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi Chú Bệnh Án</label>
                    <textarea
                        name="medicalNote"
                        value={formData.medicalNote || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                        rows="4"
                        placeholder="Nhập ghi chú nếu có"
                        disabled={loading}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Chọn Vaccine</label>
                <select
                    name="vaccine_id"
                    value={formData.vaccine_id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                    disabled={loading}
                >
                    <option value="">Không chọn</option>
                    {filteredVaccines.map((vaccine) => (
                        <option key={vaccine.id} value={vaccine.id}>
                            {vaccine.name} - {formatPrice(vaccine.sellingPrice)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Chọn Dịch Vụ</label>
                <select
                    name="service_id"
                    value={formData.service_id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#754826] focus:border-[#754826]"
                    disabled={loading}
                >
                    <option value="">Không chọn</option>
                    {filteredServices.map((service) => (
                        <option key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.priceBase)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-4">
                <p className="text-lg font-semibold text-[#754826]">Tổng Chi Phí:</p>
                <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Giá Gốc</span>
                        <span>{formatPrice(basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Hệ Số Giá</span>
                        <span>x{priceMultiplier}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>Tổng</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

MedicalInfoForm.propTypes = {
    formData: PropTypes.object.isRequired,
    setFormData: PropTypes.func.isRequired,
    filteredVaccines: PropTypes.array.isRequired,
    filteredServices: PropTypes.array.isRequired,
    totalPrice: PropTypes.number.isRequired,
    basePrice: PropTypes.number.isRequired,
    priceMultiplier: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    formatPrice: PropTypes.func.isRequired,
};

export default MedicalInfoForm;