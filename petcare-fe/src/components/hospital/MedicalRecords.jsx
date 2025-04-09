import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, History, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Dữ liệu giả lập cho Vaccines
const vaccinesData = [
  {
    id: 1,
    name: 'Vaccine 6 Bệnh',
    origin: 'Pháp',
    manufacturingDate: '2023-01-15',
    expiryDate: '2025-01-15',
    entryDate: '2023-02-01',
    type: 'Phòng bệnh tổng hợp',
    status: true,
    sellingPrice: 2323323,
    importPrice: 2000000,
    quantity: 50,
    note: 'Dành cho chó từ 6 tháng tuổi trở lên',
  },
  {
    id: 2,
    name: 'Vaccine Dại',
    origin: 'Việt Nam',
    manufacturingDate: '2023-06-10',
    expiryDate: '2024-06-10',
    entryDate: '2023-07-01',
    type: 'Phòng dại',
    status: true,
    sellingPrice: 122222,
    importPrice: 100000,
    quantity: 100,
    note: 'Tiêm nhắc lại sau 1 năm',
  },
];

// Dữ liệu giả lập cho Services
const servicesData = [
  { id: 1, name: 'Khám tổng quát', price: 200000, note: 'Kiểm tra sức khỏe toàn diện' },
  { id: 2, name: 'Siêu âm', price: 300000, note: 'Siêu âm bụng' },
  { id: 3, name: 'Xét nghiệm máu', price: 500000, note: 'Xét nghiệm cơ bản' },
];

const MedicalRecordForm = ({ onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name_pet: '',
    name_boss: '',
    phone_boss: '',
    pet_type: 'Chó',
    age: '',
    basicNote: '', // Ghi chú cơ bản (bước 1)
    medicalInfo: '',
    nextVisit: '',
    medicalNote: '', // Ghi chú bệnh án (bước 2)
    vaccine_id: '',
    service_id: '',
    paid_amount: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'vaccine_id' || name === 'service_id') {
      calculateTotalPrice({ ...formData, [name]: value });
    }
  };

  const calculateTotalPrice = (updatedFormData) => {
    let price = 0;
    const selectedVaccine = vaccinesData.find(
      (vaccine) => vaccine.id === parseInt(updatedFormData.vaccine_id)
    );
    if (selectedVaccine) {
      price += selectedVaccine.sellingPrice;
    }
    const selectedService = servicesData.find(
      (service) => service.id === parseInt(updatedFormData.service_id)
    );
    if (selectedService) {
      price += selectedService.price;
    }
    setTotalPrice(price);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatDateTime = () => {
    const now = new Date();
    return now.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleNextStep = () => {
    if (step < 3) {
      if (step === 1) {
        if (!formData.name_pet || !formData.name_boss || !formData.phone_boss || !formData.age) {
          alert('Vui lòng điền đầy đủ thông tin cơ bản!');
          return;
        }
      }
      if (step === 2) {
        if (!formData.medicalInfo || !formData.nextVisit || !formData.vaccine_id || !formData.service_id) {
          alert('Vui lòng điền đầy đủ thông tin bệnh án và chọn vaccine/dịch vụ!');
          return;
        }
      }
      setStep(step + 1);
    }
  };

  const handlePrevStep = (targetStep) => {
    setStep(targetStep);
  };

  const handleSave = () => {
    // Gộp thông tin cơ bản, bệnh án, và ghi chú vào cột note
    const combinedNote = [
      formData.basicNote ? `Thông tin cơ bản - Ghi chú: ${formData.basicNote}` : '',
      `Thông tin bệnh án: ${formData.medicalInfo}`,
      `Ngày tái khám: ${formData.nextVisit}`,
      formData.medicalNote ? `Ghi chú bệnh án: ${formData.medicalNote}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const petData = {
      name_pet: formData.name_pet,
      name_boss: formData.name_boss,
      phone_boss: formData.phone_boss,
      pet_type: formData.pet_type,
      age: parseFloat(formData.age),
      note: combinedNote, // Lưu thông tin vào cột note
      vaccine_id: parseInt(formData.vaccine_id),
      service_id: parseInt(formData.service_id),
      price: totalPrice,
      paid_amount: parseFloat(formData.paid_amount) || 0,
      deleted: 0,
      createdAt: formatDateTime(),
    };

    // Gọi hàm onSave để thêm dữ liệu vào danh sách
    onSave({
      id: Date.now(), // Tạo ID tạm thời
      petName: formData.name_pet,
      petType: formData.pet_type,
      breed: 'N/A', // Không có trường breed trong form, để tạm là N/A
      owner: formData.name_boss,
      lastVisit: formatDateTime().split(',')[0], // Lấy ngày từ createdAt
      records: [
        {
          date: formatDateTime().split(',')[0],
          medicalInfo: formData.medicalInfo,
          nextVisit: formData.nextVisit,
          medicalNote: formData.medicalNote,
        },
      ],
    });

    // Reset form
    setFormData({
      name_pet: '',
      name_boss: '',
      phone_boss: '',
      pet_type: 'Chó',
      age: '',
      basicNote: '',
      medicalInfo: '',
      nextVisit: '',
      medicalNote: '',
      vaccine_id: '',
      service_id: '',
      paid_amount: '',
    });
    setStep(1);
    setTotalPrice(0);
  };

  const selectedVaccine = vaccinesData.find((v) => v.id === parseInt(formData.vaccine_id));
  const selectedService = servicesData.find((s) => s.id === parseInt(formData.service_id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Thanh tiến trình */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-[#754826] text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#754826]' : 'bg-gray-300'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-[#754826] text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step === 3 ? 'bg-[#754826]' : 'bg-gray-300'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 3 ? 'bg-[#754826] text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#754826]">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Thú Cưng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_pet"
                  value={formData.name_pet}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập tên thú cưng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Chủ Nuôi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_boss"
                  value={formData.name_boss}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập tên chủ nuôi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Điện Thoại Chủ Nuôi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_boss"
                  value={formData.phone_boss}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Thú Cưng <span className="text-red-500">*</span>
                </label>
                <select
                  name="pet_type"
                  value={formData.pet_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                >
                  <option value="Chó">Chó</option>
                  <option value="Mèo">Mèo</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuổi Thú Cưng (năm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập tuổi thú cưng"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi Chú
              </label>
              <textarea
                name="basicNote"
                value={formData.basicNote}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                placeholder="Nhập ghi chú (nếu có)"
                rows="3"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#754826]">Thông tin bệnh án</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông Tin Bệnh Án <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập thông tin bệnh án (triệu chứng, chẩn đoán, điều trị)"
                  rows="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Tái Khám <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="nextVisit"
                  value={formData.nextVisit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Vaccine <span className="text-red-500">*</span>
                </label>
                <select
                  name="vaccine_id"
                  value={formData.vaccine_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                >
                  <option value="">Chọn vaccine</option>
                  {vaccinesData.map((vaccine) => (
                    <option key={vaccine.id} value={vaccine.id}>
                      {vaccine.name} ({formatPrice(vaccine.sellingPrice)})
                    </option>
                  ))}
                </select>
                {selectedVaccine && (
                  <div className="mt-2 p-3 bg-[#e8dfd7] rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-[#754826]">Chi tiết Vaccine:</p>
                    <p className="text-sm text-gray-700">Tên: {selectedVaccine.name}</p>
                    <p className="text-sm text-gray-700">Xuất xứ: {selectedVaccine.origin}</p>
                    <p className="text-sm text-gray-700">Loại: {selectedVaccine.type}</p>
                    <p className="text-sm text-gray-700">Giá bán: {formatPrice(selectedVaccine.sellingPrice)}</p>
                    <p className="text-sm text-gray-700">Ngày sản xuất: {formatDate(selectedVaccine.manufacturingDate)}</p>
                    <p className="text-sm text-gray-700">Ngày hết hạn: {formatDate(selectedVaccine.expiryDate)}</p>
                    <p className="text-sm text-gray-700">Ngày nhập kho: {formatDate(selectedVaccine.entryDate)}</p>
                    <p className="text-sm text-gray-700">Số lượng: {selectedVaccine.quantity}</p>
                    {selectedVaccine.note && <p className="text-sm text-gray-700">Ghi chú: {selectedVaccine.note}</p>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Dịch Vụ <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                >
                  <option value="">Chọn dịch vụ</option>
                  {servicesData.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({formatPrice(service.price)})
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <div className="mt-2 p-3 bg-[#e8dfd7] rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-[#754826]">Chi tiết Dịch Vụ:</p>
                    <p className="text-sm text-gray-700">Tên: {selectedService.name}</p>
                    <p className="text-sm text-gray-700">Giá: {formatPrice(selectedService.price)}</p>
                    {selectedService.note && <p className="text-sm text-gray-700">Ghi chú: {selectedService.note}</p>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi Chú Bệnh Án
                </label>
                <textarea
                  name="medicalNote"
                  value={formData.medicalNote}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                  placeholder="Nhập ghi chú bệnh án (nếu có)"
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="border rounded-lg p-8 bg-white shadow-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-center text-[#754826] mb-6 border-b-2 border-[#e8dfd7] pb-2">
                HỒ SƠ BỆNH ÁN THÚ CƯNG
              </h3>
              <div className="text-sm text-gray-600 mb-6 flex justify-between">
                <p><strong>Ngày lập hồ sơ:</strong> {formatDateTime()}</p>
                <p><strong>Mã hồ sơ:</strong> HS-{Math.floor(Math.random() * 10000)}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <p><strong>Tên Thú Cưng:</strong> {formData.name_pet}</p>
                    <p><strong>Loại Thú Cưng:</strong> {formData.pet_type}</p>
                    <p><strong>Tuổi:</strong> {formData.age} năm</p>
                    <p><strong>Tên Chủ Nuôi:</strong> {formData.name_boss}</p>
                    <p><strong>Số Điện Thoại:</strong> {formData.phone_boss}</p>
                  </div>
                  {formData.basicNote && (
                    <div>
                      <p><strong>Ghi Chú:</strong></p>
                      <p className="text-gray-700">{formData.basicNote}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">Thông tin bệnh án</h4>
                  <p><strong>Thông Tin Bệnh Án:</strong></p>
                  <p className="text-gray-700 whitespace-pre-line">{formData.medicalInfo}</p>
                  <p><strong>Ngày Tái Khám:</strong> {formData.nextVisit}</p>
                  {formData.medicalNote && (
                    <div>
                      <p><strong>Ghi Chú Bệnh Án:</strong></p>
                      <p className="text-gray-700">{formData.medicalNote}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">Vaccine và Dịch Vụ</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-700">Vaccine:</p>
                      <p>Tên: {selectedVaccine?.name || 'N/A'}</p>
                      <p>Xuất xứ: {selectedVaccine?.origin || 'N/A'}</p>
                      <p>Loại: {selectedVaccine?.type || 'N/A'}</p>
                      <p>Giá bán: {formatPrice(selectedVaccine?.sellingPrice || 0)}</p>
                      <p>Ngày sản xuất: {selectedVaccine ? formatDate(selectedVaccine.manufacturingDate) : 'N/A'}</p>
                      <p>Ngày hết hạn: {selectedVaccine ? formatDate(selectedVaccine.expiryDate) : 'N/A'}</p>
                      {selectedVaccine?.note && <p>Ghi chú: {selectedVaccine.note}</p>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Dịch Vụ:</p>
                      <p>Tên: {selectedService?.name || 'N/A'}</p>
                      <p>Giá: {formatPrice(selectedService?.price || 0)}</p>
                      {selectedService?.note && <p>Ghi chú: {selectedService.note}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-[#754826] border-b border-[#e8dfd7] pb-1 mb-3">Chi phí</h4>
                  <p><strong>Tổng Giá:</strong> {formatPrice(totalPrice)}</p>
                  <p><strong>Đã Thanh Toán:</strong> {formatPrice(formData.paid_amount || 0)}</p>
                  <p><strong>Còn Lại:</strong> {formatPrice(totalPrice - (formData.paid_amount || 0))}</p>
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Phòng Khám Thú Y - Chăm sóc sức khỏe thú cưng</p>
                <p>Hotline: 0123 456 789</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step === 1 ? (
            <div></div>
          ) : (
            <button
              onClick={() => handlePrevStep(step - 1)}
              className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Quay Lại
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors"
            >
              Tiếp Theo <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Lưu Hồ Sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MedicalRecords = () => {
  const [showForm, setShowForm] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]); // State để lưu danh sách hồ sơ

  const handleSaveRecord = (newRecord) => {
    setMedicalRecords([...medicalRecords, newRecord]); // Thêm hồ sơ mới vào danh sách
    setShowForm(false); // Ẩn form sau khi lưu
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center text-[#754826]">
            <ClipboardList className="mr-2" /> Hồ Sơ Bệnh Án
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm Hồ Sơ Mới
          </button>
        </div>

        {showForm && <MedicalRecordForm onSave={handleSaveRecord} />}

        {!showForm && (
          <div className="space-y-6">
            {medicalRecords.length === 0 ? (
              <p className="text-gray-500 text-center">Chưa có hồ sơ nào. Vui lòng thêm hồ sơ mới.</p>
            ) : (
              medicalRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#754826]">{record.petName}</h3>
                      <p className="text-gray-600">{record.petType} - {record.breed}</p>
                      <p className="text-gray-600">Chủ nuôi: {record.owner}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Lần khám gần nhất: {record.lastVisit}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {record.records.map((visit, index) => (
                      <div key={index} className="bg-[#e8dfd7] rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <History className="w-4 h-4 mr-2 text-[#754826]" />
                          <span className="font-medium">{visit.date}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Thông Tin Bệnh Án:
                            </p>
                            <p className="text-sm text-gray-600 whitespace-pre-line">
                              {visit.medicalInfo}
                            </p>
                            {visit.medicalNote && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Ghi Chú Bệnh Án:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {visit.medicalNote}
                                </p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Tái khám:
                            </p>
                            <p className="text-sm text-gray-600">
                              {visit.nextVisit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="px-4 py-2 text-sm text-[#754826] hover:bg-[#e8dfd7] rounded-md transition-colors">
                      Thêm Lần Khám
                    </button>
                    <button className="px-4 py-2 text-sm bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] transition-colors">
                      Cập Nhật Hồ Sơ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;