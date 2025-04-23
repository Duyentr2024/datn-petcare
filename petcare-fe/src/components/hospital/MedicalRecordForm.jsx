import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { getAllVaccines } from '../../service/hospitalService/vaccineService';
import { getAllActiveVetServices } from '../../service/hospitalService/VetServiceService';
import { getAllPetWeights, createPet } from '../../service/hospitalService/VetPetService';
import { MedicalRecordService } from '../../service/hospitalService/MedicalRecordService';
import VetOrderService from '../../service/hospitalService/VetOrderService';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import BasicInfoForm from './BasicInfoForm';
import MedicalInfoForm from './MedicalInfoForm';
import PropTypes from 'prop-types';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const formatDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A');

const MedicalRecordForm = ({ onSave, mode = 'create', initialData = null, petId = null, visitIndex = null }) => {
    const [step, setStep] = useState(mode === 'addVisit' || mode === 'editVisit' ? 2 : 1);
    const [formData, setFormData] = useState({
        name_pet: '',
        name_boss: '',
        phone_boss: '',
        pet_type: '',
        pet_weight_id: '',
        age: '',
        basicNote: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medicalNote: '',
        vaccine_id: '',
        service_id: '',
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);
    const [priceMultiplier, setPriceMultiplier] = useState(1);
    const [vaccines, setVaccines] = useState([]);
    const [filteredVaccines, setFilteredVaccines] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [petTypes, setPetTypes] = useState([]);
    const [petWeights, setPetWeights] = useState([]);
    const [filteredWeights, setFilteredWeights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId || decoded.id);
            } catch (error) {
                toast.error('Không thể giải mã token!', { position: 'top-right', autoClose: 3000 });
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vaccineData, serviceData, petWeightData] = await Promise.all([
                    getAllVaccines(),
                    getAllActiveVetServices(),
                    getAllPetWeights(),
                ]);
                setVaccines(vaccineData || []);
                setServices(serviceData || []);
                setPetWeights(petWeightData || []);

                const uniquePetTypes = [...new Set(petWeightData.map((item) => item.petType))].filter(
                    (type) => type === 'DOG' || type === 'CAT'
                );
                setPetTypes(uniquePetTypes);

                if (uniquePetTypes.length > 0 && mode === 'create' && !formData.pet_type) {
                    setFormData((prev) => ({ ...prev, pet_type: uniquePetTypes[0] }));
                }
            } catch (error) {
                toast.error('Lỗi khi tải dữ liệu', { position: 'top-right', autoClose: 3000 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mode]);

    useEffect(() => {
        if (initialData) {
            const validVaccineId =
                initialData.vaccineId && vaccines.find((v) => v.id === parseInt(initialData.vaccineId))
                    ? initialData.vaccineId.toString()
                    : '';
            const validServiceId =
                initialData.vetServiceId && services.find((s) => s.id === parseInt(initialData.vetServiceId))
                    ? initialData.vetServiceId.toString()
                    : '';

            const medicalInfoLines = initialData.medicalInfo ? initialData.medicalInfo.split('\n') : [];
            const symptoms = initialData.symptoms || medicalInfoLines[0] || '';
            const diagnosis = initialData.diagnosis || medicalInfoLines[1] || '';
            const treatment = initialData.treatment || medicalInfoLines[2] || '';

            setFormData((prev) => ({
                ...prev,
                name_pet: initialData.petName || '',
                name_boss: initialData.owner || '',
                phone_boss: initialData.phoneBoss || '',
                pet_type: initialData.petType || prev.pet_type || '',
                pet_weight_id: initialData.petWeightId?.toString() || '',
                age: initialData.age?.toString() || '',
                basicNote: initialData.basicNote || '',
                symptoms,
                diagnosis,
                treatment,
                medicalNote: initialData.medicalNote || '',
                vaccine_id: validVaccineId,
                service_id: validServiceId,
            }));

            calculateTotalPrice({
                vaccine_id: validVaccineId,
                service_id: validServiceId,
                pet_weight_id: initialData.petWeightId?.toString() || '',
            });
        }
    }, [initialData, vaccines, services]);

    useEffect(() => {
        if (formData.pet_type) {
            setFilteredWeights(petWeights.filter((item) => item.petType === formData.pet_type));
            setFilteredVaccines(vaccines.filter((vaccine) => vaccine.type === formData.pet_type));
            setFilteredServices(services.filter((service) => service.petType === formData.pet_type));

            if (formData.vaccine_id && !vaccines.find((v) => v.id === parseInt(formData.vaccine_id))) {
                setFormData((prev) => ({ ...prev, vaccine_id: '' }));
            }
            if (formData.service_id && !services.find((s) => s.id === parseInt(formData.service_id))) {
                setFormData((prev) => ({ ...prev, service_id: '' }));
            }
        }
    }, [formData.pet_type, petWeights, vaccines, services, formData.vaccine_id, formData.service_id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (['vaccine_id', 'service_id', 'pet_weight_id'].includes(name)) {
            calculateTotalPrice({ ...formData, [name]: value });
        }
    };

    const calculateTotalPrice = (updatedFormData) => {
        let basePrice = 0;
        const selectedWeight = petWeights.find((weight) => weight.petWeightId === parseInt(updatedFormData.pet_weight_id));
        const priceMultiplier = selectedWeight ? selectedWeight.priceMultiplier : 1;

        if (updatedFormData.vaccine_id) {
            const selectedVaccine = vaccines.find((vaccine) => vaccine.id === parseInt(updatedFormData.vaccine_id));
            if (selectedVaccine) basePrice += selectedVaccine.sellingPrice || 0;
        }
        if (updatedFormData.service_id) {
            const selectedService = services.find((service) => service.id === parseInt(updatedFormData.service_id));
            if (selectedService) basePrice += selectedService.priceBase || 0;
        }

        setBasePrice(basePrice);
        setPriceMultiplier(priceMultiplier);
        setTotalPrice(basePrice * priceMultiplier);
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!formData.name_pet || !formData.name_boss || !formData.phone_boss || !formData.age || !formData.pet_type) {
                toast.error('Vui lòng điền đầy đủ thông tin cơ bản!', { position: 'top-right', autoClose: 3000 });
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.symptoms || !formData.diagnosis || !formData.treatment) {
                toast.error('Vui lòng điền đầy đủ thông tin bệnh án!', { position: 'top-right', autoClose: 3000 });
                return;
            }
            const selectedVaccine = formData.vaccine_id ? vaccines.find((v) => v.id === parseInt(formData.vaccine_id)) : null;
            const selectedService = formData.service_id ? services.find((s) => s.id === parseInt(formData.service_id)) : null;

            if (selectedVaccine && selectedVaccine.type !== formData.pet_type) {
                toast.error('Vaccine không phù hợp với loại thú cưng!', { position: 'top-right', autoClose: 3000 });
                return;
            }
            if (selectedService && selectedService.petType !== formData.pet_type) {
                toast.error('Dịch vụ không phù hợp với loại thú cưng!', { position: 'top-right', autoClose: 3000 });
                return;
            }
            setStep(3); // Chuyển sang tab 3 để xác nhận và thanh toán
        }
    };

    const handlePrevStep = () => setStep(step - 1);

    const handleSave = async () => {
        setLoading(true);
        try {
            const selectedVaccine = formData.vaccine_id ? vaccines.find((v) => v.id === parseInt(formData.vaccine_id)) : null;
            const selectedService = formData.service_id ? services.find((s) => s.id === parseInt(formData.service_id)) : null;

            if (selectedVaccine && selectedVaccine.type !== formData.pet_type) {
                toast.error('Vaccine không phù hợp với loại thú cưng!', { position: 'top-right', autoClose: 3000 });
                return;
            }
            if (selectedService && selectedService.petType !== formData.pet_type) {
                toast.error('Dịch vụ không phù hợp với loại thú cưng!', { position: 'top-right', autoClose: 3000 });
                return;
            }

            if (mode === 'edit' && step === 1) {
                if (!formData.name_pet || !formData.name_boss || !formData.phone_boss || !formData.age || !formData.pet_type) {
                    toast.error('Vui lòng điền đầy đủ thông tin cơ bản!', { position: 'top-right', autoClose: 3000 });
                    return;
                }

                const petData = {
                    namePet: formData.name_pet,
                    nameBoss: formData.name_boss,
                    phoneBoss: formData.phone_boss,
                    age: parseFloat(formData.age) || 0,
                    note: formData.basicNote || '',
                    petType: formData.pet_type,
                    ...(formData.pet_weight_id && { petWeight: { petWeightId: parseInt(formData.pet_weight_id) } }),
                };

                // Thay updatePet bằng createPet vì updatePet chưa được định nghĩa
                const updatedPet = await createPet(petData);
                const newRecord = {
                    id: initialData.id,
                    petId: updatedPet.id,
                    petName: updatedPet.namePet,
                    petType: formData.pet_type,
                    weightRange: formData.pet_weight_id
                        ? petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.weightRange || 'N/A'
                        : 'N/A',
                    breed: 'N/A',
                    owner: updatedPet.nameBoss,
                    phoneBoss: updatedPet.phoneBoss,
                    age: updatedPet.age,
                    basicNote: formData.basicNote,
                    lastVisit: initialData.lastVisit,
                    records: initialData.records || [],
                };

                onSave(newRecord, mode);
                toast.success('Cập nhật thông tin cơ bản thành công!', { position: 'top-right', autoClose: 3000 });

                setFormData({
                    name_pet: '',
                    name_boss: '',
                    phone_boss: '',
                    pet_type: petTypes[0] || '',
                    pet_weight_id: '',
                    age: '',
                    basicNote: '',
                    symptoms: '',
                    diagnosis: '',
                    treatment: '',
                    medicalNote: '',
                    vaccine_id: '',
                    service_id: '',
                });
                setStep(1);
                setTotalPrice(0);
                setBasePrice(0);
                setPriceMultiplier(1);
            } else if (mode === 'editVisit' && step === 2) {
                if (!formData.symptoms || !formData.diagnosis || !formData.treatment) {
                    toast.error('Vui lòng điền đầy đủ thông tin bệnh án!', { position: 'top-right', autoClose: 3000 });
                    return;
                }

                const currentRecord = await MedicalRecordService.getMedicalRecordById(initialData.id);
                if (!currentRecord) throw new Error('Không tìm thấy hồ sơ bệnh án');

                const medicalRecordData = {
                    petId: petId || null,
                    vaccineId: formData.vaccine_id ? parseInt(formData.vaccine_id) : currentRecord.vaccineId,
                    vetServiceId: formData.service_id ? parseInt(formData.service_id) : currentRecord.vetServiceId,
                    examDate: new Date().toISOString(),
                    symptoms: formData.symptoms || 'Không có triệu chứng',
                    diagnosis: formData.diagnosis || 'Không có chẩn đoán',
                    treatment: formData.treatment || 'Không có điều trị',
                    note: formData.medicalNote || '',
                    createdBy: userId || null,
                    status: 'ACTIVE',
                };

                const updatedMedicalRecord = await MedicalRecordService.updateMedicalRecord(initialData.id, medicalRecordData);
                const updatedVisit = {
                    petId: petId,
                    date: formatDate(updatedMedicalRecord.examDate),
                    symptoms: formData.symptoms,
                    diagnosis: formData.diagnosis,
                    treatment: formData.treatment,
                    medicalNote: formData.medicalNote || '',
                    vaccineId: formData.vaccine_id ? parseInt(formData.vaccine_id) : currentRecord.vaccineId,
                    vetServiceId: formData.service_id ? parseInt(formData.service_id) : currentRecord.vetServiceId,
                };

                onSave(updatedVisit, mode, visitIndex);
                toast.success('Cập nhật lần khám thành công!', { position: 'top-right', autoClose: 3000 });

                setFormData({
                    name_pet: '',
                    name_boss: '',
                    phone_boss: '',
                    pet_type: petTypes[0] || '',
                    pet_weight_id: '',
                    age: '',
                    basicNote: '',
                    symptoms: '',
                    diagnosis: '',
                    treatment: '',
                    medicalNote: '',
                    vaccine_id: '',
                    service_id: '',
                });
                setStep(2);
                setTotalPrice(0);
                setBasePrice(0);
                setPriceMultiplier(1);
            }
        } catch (error) {
            toast.error('Lỗi khi lưu hồ sơ bệnh án', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAndPay = async () => {
        if (!paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        setLoading(true);
        try {
            let newPetId = petId;
            if (mode === 'create') {
                const petData = {
                    namePet: formData.name_pet,
                    nameBoss: formData.name_boss,
                    phoneBoss: formData.phone_boss,
                    age: parseFloat(formData.age) || 0,
                    note: formData.basicNote || '',
                    petType: formData.pet_type,
                    ...(formData.pet_weight_id && { petWeight: { petWeightId: parseInt(formData.pet_weight_id) } }),
                };
                const createdPet = await createPet(petData);
                newPetId = createdPet.id;
            }

            const medicalRecordData = {
                petId: newPetId,
                vaccineId: formData.vaccine_id ? parseInt(formData.vaccine_id) : null,
                vetServiceId: formData.service_id ? parseInt(formData.service_id) : null,
                examDate: new Date().toISOString(),
                symptoms: formData.symptoms || 'Không có triệu chứng',
                diagnosis: formData.diagnosis || 'Không có chẩn đoán',
                treatment: formData.treatment || 'Không có điều trị',
                note: formData.medicalNote || '',
                createdBy: userId || null,
                status: 'ACTIVE',
            };

            if (mode === 'create' || mode === 'addVisit') {
                if (!newPetId) throw new Error('Pet ID không tồn tại.');
                const createdMedicalRecord = await MedicalRecordService.createMedicalRecord(medicalRecordData);

                const newRecord = {
                    id: createdMedicalRecord.id,
                    petId: newPetId,
                    petName: formData.name_pet,
                    petType: formData.pet_type,
                    weightRange: formData.pet_weight_id
                        ? petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.weightRange || 'N/A'
                        : 'N/A',
                    breed: 'N/A',
                    owner: formData.name_boss,
                    phoneBoss: formData.phone_boss,
                    age: parseFloat(formData.age) || 0,
                    basicNote: formData.basicNote,
                    lastVisit: formatDate(createdMedicalRecord.examDate),
                    records: [
                        {
                            date: formatDate(createdMedicalRecord.examDate),
                            symptoms: formData.symptoms,
                            diagnosis: formData.diagnosis,
                            treatment: formData.treatment,
                            medicalNote: formData.medicalNote || '',
                            vaccineId: formData.vaccine_id ? parseInt(formData.vaccine_id) : null,
                            vetServiceId: formData.service_id ? parseInt(formData.service_id) : null,
                        },
                    ],
                };

                const currentDate = new Date().toISOString();
                const medicalRecordDTOs = [
                    {
                        id: createdMedicalRecord.id,
                        examDate: currentDate,
                        symptoms: createdMedicalRecord.symptoms,
                        diagnosis: createdMedicalRecord.diagnosis,
                        treatment: createdMedicalRecord.treatment,
                        note: createdMedicalRecord.note,
                        vetServiceId: createdMedicalRecord.vetServiceId,
                        vaccineId: createdMedicalRecord.vaccineId,
                        createdAt: currentDate,
                        updatedAt: currentDate,
                        vetPetDTO: {
                            id: newPetId,
                            namePet: formData.name_pet,
                            nameBoss: formData.name_boss,
                            phoneBoss: formData.phone_boss,
                            age: parseFloat(formData.age) || 0,
                            note: formData.basicNote || '',
                            petType: formData.pet_type,
                            deleted: false,
                            petWeight: formData.pet_weight_id
                                ? {
                                    petWeightId: parseInt(formData.pet_weight_id),
                                    petType: formData.pet_type,
                                    weightRange:
                                        petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.weightRange ||
                                        'N/A',
                                    priceMultiplier:
                                        petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.priceMultiplier ||
                                        1,
                                    statusType: 'ACTIVE',
                                }
                                : null,
                        },
                    },
                ];

                if (!userId) throw new Error('Không tìm thấy userId!');
                const createdOrder = await VetOrderService.createVetOrder(userId, medicalRecordDTOs, paymentMethod);
                // Bỏ gọi processPayment vì không còn paymentStatus
                // await VetOrderService.processPayment(createdOrder.orderId, paymentStatus);

                onSave(newRecord, mode);
                toast.success('Lưu hồ sơ thành công!', { position: 'top-right', autoClose: 3000 });

                setFormData({
                    name_pet: '',
                    name_boss: '',
                    phone_boss: '',
                    pet_type: petTypes[0] || '',
                    pet_weight_id: '',
                    age: '',
                    basicNote: '',
                    symptoms: '',
                    diagnosis: '',
                    treatment: '',
                    medicalNote: '',
                    vaccine_id: '',
                    service_id: '',
                });
                setStep(1);
                setTotalPrice(0);
                setBasePrice(0);
                setPriceMultiplier(1);
                setPaymentMethod('CASH');
                setPaymentNote('');
            }
        } catch (error) {
            toast.error(error.message || 'Lỗi khi lưu hồ sơ bệnh án', { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className="text-xl font-semibold text-[#754826] mb-4">Thông Tin Cơ Bản</h2>
                        <BasicInfoForm
                            formData={formData}
                            setFormData={setFormData}
                            petTypes={petTypes}
                            filteredWeights={filteredWeights}
                            loading={loading}
                            handleInputChange={handleInputChange}
                            mode={mode}
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <h2 className="text-xl font-semibold text-[#754826] mb-4">Thông Tin Bệnh Án</h2>
                        <MedicalInfoForm
                            formData={formData}
                            setFormData={setFormData}
                            filteredVaccines={filteredVaccines}
                            filteredServices={filteredServices}
                            totalPrice={totalPrice}
                            basePrice={basePrice}
                            priceMultiplier={priceMultiplier}
                            loading={loading}
                            handleInputChange={handleInputChange}
                            formatPrice={formatPrice}
                        />
                    </>
                );
            case 3:
                return (
                    <div className="space-y-8">
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-[#754826] mb-2">Thông Tin Cơ Bản</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên Thú Cưng *</label>
                                    <input
                                        type="text"
                                        value={formData.name_pet}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên Chủ Nuôi *</label>
                                    <input
                                        type="text"
                                        value={formData.name_boss}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số Điện Thoại *</label>
                                    <input
                                        type="text"
                                        value={formData.phone_boss}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại Thú Cưng *</label>
                                    <input
                                        type="text"
                                        value={formData.pet_type}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Khoảng Cân Nặng</label>
                                    <input
                                        type="text"
                                        value={
                                            formData.pet_weight_id
                                                ? petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.weightRange || 'N/A'
                                                : 'N/A'
                                        }
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hệ Số Giá</label>
                                    <input
                                        type="text"
                                        value={priceMultiplier}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tuổi Thú Cưng *</label>
                                    <input
                                        type="text"
                                        value={formData.age}
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Ghi Chú Cơ Bản</label>
                                <textarea
                                    value={formData.basicNote || 'Không có ghi chú'}
                                    className="w-full p-2 border rounded-md"
                                    rows="3"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-[#754826] mb-2">Thông Tin Bệnh Án</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vaccine</label>
                                    <input
                                        type="text"
                                        value={
                                            formData.vaccine_id
                                                ? vaccines.find((v) => v.id === parseInt(formData.vaccine_id))?.name || 'N/A'
                                                : 'N/A'
                                        }
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dịch Vụ</label>
                                    <input
                                        type="text"
                                        value={
                                            formData.service_id
                                                ? services.find((s) => s.id === parseInt(formData.service_id))?.name || 'N/A'
                                                : 'N/A'
                                        }
                                        className="w-full p-2 border rounded-md"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Triệu Chứng *</label>
                                <textarea
                                    value={formData.symptoms || 'Không có triệu chứng'}
                                    className="w-full p-2 border rounded-md"
                                    rows="2"
                                    disabled
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Chẩn Đoán *</label>
                                <textarea
                                    value={formData.diagnosis || 'Không có chẩn đoán'}
                                    className="w-full p-2 border rounded-md"
                                    rows="2"
                                    disabled
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Điều Trị *</label>
                                <textarea
                                    value={formData.treatment || 'Không có điều trị'}
                                    className="w-full p-2 border rounded-md"
                                    rows="2"
                                    disabled
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Ghi Chú Y Tế</label>
                                <textarea
                                    value={formData.medicalNote || 'Không có ghi chú'}
                                    className="w-full p-2 border rounded-md"
                                    rows="3"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-medium text-[#754826] mb-2">Chi Tiết Giá</h3>
                            <div className="space-y-2">
                                {formData.vaccine_id && (
                                    <div className="flex justify-between text-sm">
                                        <span>Vaccine: {vaccines.find((v) => v.id === parseInt(formData.vaccine_id))?.name}</span>
                                        <span>{formatPrice(vaccines.find((v) => v.id === parseInt(formData.vaccine_id))?.sellingPrice)}</span>
                                    </div>
                                )}
                                {formData.service_id && (
                                    <div className="flex justify-between text-sm">
                                        <span>Dịch Vụ: {services.find((s) => s.id === parseInt(formData.service_id))?.name}</span>
                                        <span>{formatPrice(services.find((s) => s.id === parseInt(formData.service_id))?.priceBase)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium pt-2 border-t">
                                    <span>Tổng Giá Gốc</span>
                                    <span>{formatPrice(basePrice)}</span>
                                </div>
                                {formData.pet_weight_id && (
                                    <div className="flex justify-between text-sm">
                                        <span>Hệ Số Giá (Cân Nặng: {petWeights.find((pw) => pw.petWeightId === parseInt(formData.pet_weight_id))?.weightRange || 'N/A'})</span>
                                        <span>x{priceMultiplier}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between font-bold text-[#754826]">
                                        <span>Tổng Chi Phí</span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-[#754826] mb-2">Thông Tin Thanh Toán</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phương Thức Thanh Toán *</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        disabled={loading}
                                    >
                                        <option value="CASH">Tiền Mặt</option>
                                        <option value="MOMO">MoMo</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ghi Chú Thanh Toán</label>
                                <textarea
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    rows="3"
                                    placeholder="Nhập ghi chú (nếu có)"
                                    disabled={loading}
                                />
                            </div>
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
            className="space-y-6"
        >
            <ToastContainer />
            <div className="bg-white rounded-lg shadow-md p-6">
                {loading && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-t-[#754826] border-gray-200 rounded-full animate-spin"></div>
                            <p className="mt-4 text-white text-lg font-medium">Đang xử lý...</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step >= 1 ? 'bg-[#754826] text-white' : 'bg-gray-300 text-gray-700'
                            } ${mode === 'addVisit' || mode === 'editVisit' || mode === 'edit' ? 'opacity-50' : ''}`}
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
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-[#754826]' : 'bg-gray-300'}`}></div>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step >= 3 ? 'bg-[#754826] text-white' : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                            3
                        </div>
                    </div>
                </div>

                {renderTabContent()}

                <div className="flex justify-between mt-6">
                    {step > 1 && mode !== 'addVisit' && mode !== 'editVisit' && (
                        <button
                            onClick={handlePrevStep}
                            className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] disabled:opacity-50"
                            disabled={loading}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Quay Lại
                        </button>
                    )}
                    {step === 1 ? (
                        mode === 'edit' ? (
                            <button
                                onClick={handleSave}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Cập Nhật Thông Tin
                            </button>
                        ) : (
                            <button
                                onClick={handleNextStep}
                                className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] disabled:opacity-50"
                                disabled={loading}
                            >
                                Tiếp Theo
                            </button>
                        )
                    ) : step === 2 ? (
                        mode === 'editVisit' ? (
                            <button
                                onClick={handleSave}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Cập Nhật Lần Khám
                            </button>
                        ) : (
                            <button
                                onClick={handleNextStep}
                                className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] disabled:opacity-50"
                                disabled={loading}
                            >
                                Xác Nhận và Thanh Toán
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleConfirmAndPay}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Thanh Toán và Lưu
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

MedicalRecordForm.propTypes = {
    onSave: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['create', 'edit', 'addVisit', 'editVisit']),
    initialData: PropTypes.object,
    petId: PropTypes.string,
    visitIndex: PropTypes.number,
};

MedicalRecordForm.defaultProps = {
    mode: 'create',
    initialData: null,
    petId: null,
    visitIndex: null,
};

export default MedicalRecordForm;