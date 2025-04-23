import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { getAllVaccines } from '../../service/hospitalService/vaccineService';
import { getAllVetServices } from '../../service/hospitalService/VetServiceService';

const RecordList = ({
                        medicalRecords,
                        loading,
                        page,
                        totalPages,
                        setPage,
                        handleAddVisit,
                        handleUpdateRecord,
                    }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [visitSearchTerms, setVisitSearchTerms] = useState({});
    const [medicalRecordPages, setMedicalRecordPages] = useState({});
    const [vaccines, setVaccines] = useState([]);
    const [vetServices, setVetServices] = useState([]);
    const [expandedPets, setExpandedPets] = useState({});

    // Fetch vaccines and vet services
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vaccineData, vetServiceData] = await Promise.all([
                    getAllVaccines(),
                    getAllVetServices(),
                ]);
                setVaccines(vaccineData || []);
                setVetServices(vetServiceData || []);
            } catch (error) {
                console.error('Error fetching vaccines or services:', error);
            }
        };
        fetchData();
    }, []);

    // Create lookup maps for vaccines and vet services
    const vaccineMap = vaccines.reduce((map, vaccine) => {
        map[vaccine.id] = vaccine.name;
        return map;
    }, {});

    const vetServiceMap = vetServices.reduce((map, service) => {
        map[service.id] = service.name;
        return map;
    }, {});

    // Deduplicate and group records by petId
    const groupedRecords = medicalRecords.reduce((acc, record) => {
        const petId = record.petId || 'N/A';
        if (!acc[petId]) {
            acc[petId] = {
                petId: petId,
                petName: record.petName || 'N/A',
                petType: record.petType || 'N/A',
                weightRange: record.weightRange || 'N/A',
                petWeightId: record.petWeightId || null,
                breed: record.breed || 'N/A',
                owner: record.owner || 'N/A',
                phoneBoss: record.phoneBoss || 'N/A',
                age: record.age || 0,
                basicNote: record.basicNote || '',
                lastVisit: record.lastVisit || 'N/A',
                medicalRecords: [],
            };
        }
        // Sort records by date (newest first)
        const sortedRecords = (record.records || []).sort((a, b) => {
            const dateA = a.date ? new Date(a.date.split('/').reverse().join('-')) : new Date(0);
            const dateB = b.date ? new Date(b.date.split('/').reverse().join('-')) : new Date(0);
            return dateB - dateA;
        });
        acc[petId].medicalRecords.push({
            id: record.id,
            records: sortedRecords,
            lastVisit: record.lastVisit || 'N/A',
        });
        if (
            record.lastVisit &&
            (!acc[petId].lastVisit || new Date(record.lastVisit) > new Date(acc[petId].lastVisit))
        ) {
            acc[petId].lastVisit = record.lastVisit;
        }
        return acc;
    }, {});

    let groupedRecordsArray = Object.values(groupedRecords);

    // Filter by phoneBoss
    if (searchTerm) {
        groupedRecordsArray = groupedRecordsArray.filter((pet) =>
            pet.phoneBoss.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Paginate pet records
    const itemsPerPage = 3;
    const totalPetPages = Math.ceil(groupedRecordsArray.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const paginatedPetRecords = groupedRecordsArray.slice(startIndex, startIndex + itemsPerPage);

    // Handle search input change for phoneBoss
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    // Clear phoneBoss search
    const handleClearSearch = () => {
        setSearchTerm('');
        setPage(0);
    };

    // Handle visit search input change
    const handleVisitSearchChange = (petId, value) => {
        setVisitSearchTerms((prev) => ({
            ...prev,
            [petId]: value,
        }));
        setMedicalRecordPages((prev) => ({
            ...prev,
            [petId]: 0, // Reset to first page on search
        }));
    };

    // Clear visit search
    const handleClearVisitSearch = (petId) => {
        setVisitSearchTerms((prev) => ({
            ...prev,
            [petId]: '',
        }));
        setMedicalRecordPages((prev) => ({
            ...prev,
            [petId]: 0, // Reset to first page
        }));
    };

    // Handle medical record page change
    const handleMedicalRecordPageChange = (petId, newPage) => {
        setMedicalRecordPages((prev) => ({
            ...prev,
            [petId]: newPage,
        }));
    };

    // Toggle pet expansion
    const togglePetExpansion = (petId) => {
        setExpandedPets((prev) => ({
            ...prev,
            [petId]: !prev[petId],
        }));
    };

    // Jump to page
    const handleJumpToPage = (e) => {
        const pageNum = parseInt(e.target.value, 10);
        if (pageNum > 0 && pageNum <= totalPetPages) {
            setPage(pageNum - 1);
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Search Bar for PhoneBoss */}
            <div className="flex items-center justify-start mb-8">
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo số điện thoại chủ nuôi..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#754826] text-gray-700 placeholder-gray-400 transition-all duration-200"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-t-[#754826] border-gray-200 rounded-full animate-spin"></div>
                </div>
            ) : !groupedRecordsArray || groupedRecordsArray.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-lg font-medium">
                        {searchTerm ? 'Không tìm thấy hồ sơ phù hợp.' : 'Chưa có hồ sơ nào. Vui lòng thêm hồ sơ mới.'}
                    </p>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        {paginatedPetRecords.map((pet) => {
                            const isExpanded = expandedPets[pet.petId] || false;
                            const medicalItemsPerPage = 3;
                            const currentMedicalPage = medicalRecordPages[pet.petId] || 0;
                            const visitSearchTerm = visitSearchTerms[pet.petId] || '';

                            // Filter visits based on search term
                            let filteredMedicalRecords = pet.medicalRecords;
                            if (visitSearchTerm) {
                                filteredMedicalRecords = pet.medicalRecords.map((record) => ({
                                    ...record,
                                    records: record.records.filter((visit) =>
                                        [
                                            visit.date || '',
                                            visit.symptoms || '',
                                            visit.diagnosis || '',
                                            visit.treatment || '',
                                            visit.medicalNote || '',
                                            vaccineMap[visit.vaccineId] || '',
                                            vetServiceMap[visit.vetServiceId] || '',
                                        ].some((field) => field.toLowerCase().includes(visitSearchTerm.toLowerCase()))
                                    ),
                                })).filter((record) => record.records.length > 0);
                            }

                            const totalMedicalPages = Math.ceil(filteredMedicalRecords.length / medicalItemsPerPage);
                            const startMedicalIndex = currentMedicalPage * medicalItemsPerPage;
                            const paginatedMedicalRecords = filteredMedicalRecords.slice(
                                startMedicalIndex,
                                startMedicalIndex + medicalItemsPerPage
                            );

                            return (
                                <motion.div
                                    key={pet.petId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border border-gray-200 rounded-xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-bold text-[#754826]">{pet.petName}</h3>
                                                <button
                                                    onClick={() => togglePetExpansion(pet.petId)}
                                                    className="text-[#754826] hover:text-[#5e3a20] flex items-center"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-gray-600 text-sm">
                                                <p>
                                                    <span className="font-medium">Loại:</span>{' '}
                                                    {pet.petType === 'DOG' ? 'Chó' : pet.petType === 'CAT' ? 'Mèo' : pet.petType}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Cân nặng:</span> {pet.weightRange}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Giống:</span> {pet.breed}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Tuổi:</span> {pet.age} năm
                                                </p>
                                                <p>
                                                    <span className="font-medium">Chủ nuôi:</span> {pet.owner}
                                                </p>
                                                <p>
                                                    <span className="font-medium">SĐT:</span> {pet.phoneBoss}
                                                </p>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-2">
                                                <span className="font-medium">Lần khám gần nhất:</span> {pet.lastVisit}
                                            </p>
                                            {pet.basicNote && (
                                                <p className="text-gray-500 text-sm mt-1">
                                                    <span className="font-medium">Ghi chú:</span> {pet.basicNote}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Collapsible Medical Records */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            {/* Visit Search Bar */}
                                            <div className="flex items-center justify-start mb-4">
                                                <div className="relative w-full max-w-md">
                                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Tìm kiếm lần khám (ngày, triệu chứng, chẩn đoán...)"
                                                        value={visitSearchTerm}
                                                        onChange={(e) => handleVisitSearchChange(pet.petId, e.target.value)}
                                                        className="w-full pl-12 pr-12 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#754826] text-gray-700 placeholder-gray-400 transition-all duration-200"
                                                    />
                                                    {visitSearchTerm && (
                                                        <button
                                                            onClick={() => handleClearVisitSearch(pet.petId)}
                                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {paginatedMedicalRecords.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    {visitSearchTerm ? 'Không tìm thấy lần khám phù hợp.' : 'Chưa có lần khám nào.'}
                                                </div>
                                            ) : (
                                                paginatedMedicalRecords.map((medicalRecord) => (
                                                    <div key={medicalRecord.id} className="mt-4 border-t pt-4">
                                                        <h4 className="text-lg font-semibold text-[#754826] mb-2">
                                                            Lần khám: {medicalRecord.records[0]?.date || 'N/A'}
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {(medicalRecord.records || []).map((visit, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-[#f5f0e9] rounded-lg p-5 shadow-sm"
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center">
                                                                            <History className="w-5 h-5 mr-2 text-[#754826]" />
                                                                            <span className="font-medium text-gray-800">{visit.date || 'N/A'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-4 text-sm">
                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <p className="font-semibold text-gray-700">Triệu chứng:</p>
                                                                                <p className="text-gray-600 whitespace-pre-line">
                                                                                    {visit.symptoms || 'Không có triệu chứng'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-700">Chẩn đoán:</p>
                                                                                <p className="text-gray-600 whitespace-pre-line">
                                                                                    {visit.diagnosis || 'Không có chẩn đoán'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-700">Điều trị:</p>
                                                                                <p className="text-gray-600 whitespace-pre-line">
                                                                                    {visit.treatment || 'Không có điều trị'}
                                                                                </p>
                                                                            </div>
                                                                            {visit.medicalNote && (
                                                                                <div>
                                                                                    <p className="font-semibold text-gray-700">Ghi chú bệnh án:</p>
                                                                                    <p className="text-gray-600">{visit.medicalNote}</p>
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="font-semibold text-gray-700">Vaccine:</p>
                                                                                <p className="text-gray-600">
                                                                                    {visit.vaccineId
                                                                                        ? vaccineMap[visit.vaccineId] || 'Không tìm thấy'
                                                                                        : 'Không có'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-700">Dịch vụ:</p>
                                                                                <p className="text-gray-600">
                                                                                    {visit.vetServiceId
                                                                                        ? vetServiceMap[visit.vetServiceId] || 'Không tìm thấy'
                                                                                        : 'Không có'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {/* Pagination for Medical Records */}
                                            {filteredMedicalRecords.length > medicalItemsPerPage && (
                                                <div className="flex justify-center items-center mt-6 space-x-2">
                                                    <button
                                                        onClick={() => handleMedicalRecordPageChange(pet.petId, currentMedicalPage - 1)}
                                                        disabled={currentMedicalPage === 0 || loading}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                            currentMedicalPage === 0 || loading
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-[#754826] text-white hover:bg-[#5e3a20]'
                                                        }`}
                                                    >
                                                        Trước
                                                    </button>
                                                    {Array.from({ length: totalMedicalPages }, (_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleMedicalRecordPageChange(pet.petId, index)}
                                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                                currentMedicalPage === index
                                                                    ? 'bg-[#754826] text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-[#e8dfd7]'
                                                            } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            disabled={loading}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => handleMedicalRecordPageChange(pet.petId, currentMedicalPage + 1)}
                                                        disabled={currentMedicalPage === totalMedicalPages - 1 || loading}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                            currentMedicalPage === totalMedicalPages - 1 || loading
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-[#754826] text-white hover:bg-[#5e3a20]'
                                                        }`}
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    <div
                                        className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleAddVisit(pet)}
                                            className="px-4 py-2 text-sm font-medium text-[#754826] border border-[#754826] rounded-lg hover:bg-[#e8dfd7] transition-all duration-200 flex items-center"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Thêm Lần Khám
                                        </button>
                                        <button
                                            onClick={() => handleUpdateRecord(pet)}
                                            className="px-4 py-2 text-sm font-medium bg-[#754826] text-white rounded-lg hover:bg-[#5e3a20] transition-all duration-200"
                                        >
                                            Cập Nhật Thông Tin
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Pagination for Pet Records */}
                        {totalPetPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-center items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 0 || loading}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            page === 0 || loading
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#754826] text-white hover:bg-[#5e3a20]'
                                        }`}
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPetPages }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setPage(index)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                page === index
                                                    ? 'bg-[#754826] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-[#e8dfd7]'
                                            } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                            disabled={loading}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPetPages - 1 || loading}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            page === totalPetPages - 1 || loading
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#754826] text-white hover:bg-[#5e3a20]'
                                        }`}
                                    >
                                        Sau
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Chuyển đến trang:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPetPages}
                                        value={page + 1}
                                        onChange={handleJumpToPage}
                                        className="w-16 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#754826] text-center"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

RecordList.propTypes = {
    medicalRecords: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            petId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            petName: PropTypes.string,
            petType: PropTypes.string,
            weightRange: PropTypes.string,
            petWeightId: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
            breed: PropTypes.string,
            owner: PropTypes.string,
            phoneBoss: PropTypes.string,
            age: PropTypes.number,
            basicNote: PropTypes.string,
            lastVisit: PropTypes.string,
            records: PropTypes.arrayOf(
                PropTypes.shape({
                    date: PropTypes.string,
                    symptoms: PropTypes.string,
                    diagnosis: PropTypes.string,
                    treatment: PropTypes.string,
                    medicalNote: PropTypes.string,
                    vaccineId: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
                    vetServiceId: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
                    paid_amount: PropTypes.number,
                })
            ),
        })
    ).isRequired,
    loading: PropTypes.bool.isRequired,
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    handleAddVisit: PropTypes.func.isRequired,
    handleUpdateRecord: PropTypes.func.isRequired,
};

export default RecordList;