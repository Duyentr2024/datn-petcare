import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipboardList, Plus } from 'lucide-react';
import { MedicalRecordService } from '../../service/hospitalService/MedicalRecordService';
import MedicalRecordForm from './MedicalRecordForm';
import RecordDetailView from './RecordDetailView';
import RecordList from './RecordList';

const MedicalRecords = () => {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const recordsResponse = await MedicalRecordService.getAllMedicalRecords(page, pageSize);
        const records = recordsResponse.content || recordsResponse;
        setTotalPages(recordsResponse.totalPages || 1);

        const formattedRecords = (records || []).map((record) => ({
          id: record.id || null,
          petId: record.vetPetDTO?.id || record.petId || 'N/A',
          petName: record.vetPetDTO?.namePet || record.petName || 'N/A',
          petType: record.vetPetDTO?.petType || record.petType || 'N/A',
          weightRange: record.vetPetDTO?.petWeight?.weightRange || record.weightRange || 'N/A',
          petWeightId: record.vetPetDTO?.petWeight?.petWeightId || record.petWeightId || null,
          breed: record.breed || 'N/A',
          owner: record.vetPetDTO?.nameBoss || record.owner || 'N/A',
          phoneBoss: record.vetPetDTO?.phoneBoss || record.phoneBoss || 'N/A',
          age: record.vetPetDTO?.age || record.age || 0,
          basicNote: record.vetPetDTO?.note || record.basicNote || '',
          lastVisit: record.examDate ? new Date(record.examDate).toLocaleDateString('vi-VN') : 'N/A',
          records: [
            {
              date: record.examDate ? new Date(record.examDate).toLocaleDateString('vi-VN') : 'N/A',
              symptoms: record.symptoms || 'N/A',
              diagnosis: record.diagnosis || 'N/A',
              treatment: record.treatment || 'N/A',
              medicalNote: record.note || '',
              vaccineId: record.vaccineId || null,
              vetServiceId: record.vetServiceId || null,
              paid_amount: record.paid_amount || 0,
            },
          ],
        }));

        setMedicalRecords(formattedRecords);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách hồ sơ', { position: 'top-right', autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const handleSaveRecord = (data, mode, visitIndex = null) => {
    setMedicalRecords((prevRecords) => {
      if (mode === 'create' || mode === 'addVisit') {
        return [data, ...prevRecords];
      } else if (mode === 'edit') {
        return prevRecords.map((record) => (record.id === data.id ? { ...record, ...data } : record));
      } else if (mode === 'editVisit') {
        return prevRecords.map((record) => {
          if (record.petId === data.petId) {
            const updatedRecords = [...record.records];
            updatedRecords[visitIndex] = {
              date: data.date,
              symptoms: data.symptoms,
              diagnosis: data.diagnosis,
              treatment: data.treatment,
              medicalNote: data.medicalNote,
              vaccineId: data.vaccineId,
              vetServiceId: data.vetServiceId,
              paid_amount: data.paid_amount,
            };
            return { ...record, records: updatedRecords };
          }
          return record;
        });
      }
      return prevRecords;
    });

    setShowForm(false);
    setFormMode('create');
    setSelectedRecord(null);
    setSelectedDetailRecord(null);
    toast.success(
        mode === 'edit'
            ? 'Cập nhật hồ sơ thành công!'
            : mode === 'editVisit'
                ? 'Cập nhật lần khám thành công!'
                : 'Lưu hồ sơ thành công!',
        { position: 'top-right', }
    );
  };

  const handleAddVisit = (record) => {
    setSelectedRecord({
      petId: record.petId,
      petName: record.petName,
      petType: record.petType,
      petWeightId: record.petWeightId || null,
      breed: record.breed,
      owner: record.owner,
      phoneBoss: record.phoneBoss,
      age: record.age,
      basicNote: record.basicNote,
    });
    setFormMode('addVisit');
    setShowForm(true);
    setSelectedDetailRecord(null);
  };

  const handleUpdateRecord = (record) => {
    setSelectedRecord({
      id: record.id,
      petId: record.petId,
      petName: record.petName,
      petType: record.petType,
      petWeightId: record.petWeightId || null,
      breed: record.breed,
      owner: record.owner,
      phoneBoss: record.phoneBoss,
      age: record.age,
      basicNote: record.basicNote,
    });
    setFormMode('edit');
    setShowForm(true);
    setSelectedDetailRecord(null);
  };

  const handleUpdateVisit = async (record, visitIndex) => {
    try {
      const visit = record.records[visitIndex];
      const currentRecord = await MedicalRecordService.getMedicalRecordById(record.id);
      if (!currentRecord) {
        toast.error('Không tìm thấy hồ sơ bệnh án', { position: 'top-right', autoClose: 3000 });
        return;
      }

      setSelectedRecord({
        id: record.id,
        petId: record.petId,
        petName: record.petName,
        petType: record.petType,
        petWeightId: record.petWeightId || null,
        breed: record.breed,
        owner: record.owner,
        phoneBoss: record.phoneBoss,
        age: record.age,
        basicNote: record.basicNote,
        symptoms: visit.symptoms || '',
        diagnosis: visit.diagnosis || '',
        treatment: visit.treatment || '',
        medicalNote: visit.medicalNote || '',
        vaccineId: currentRecord.vaccineId?.toString() || '',
        vetServiceId: currentRecord.vetServiceId?.toString() || '',
        paid_amount: visit.paid_amount?.toString() || '',
        visitIndex,
      });
      setFormMode('editVisit');
      setShowForm(true);
      setSelectedDetailRecord(null);
    } catch (error) {
      toast.error('Lỗi khi chuẩn bị cập nhật lần khám', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleViewDetails = async (record) => {
    try {
      const medicalRecord = await MedicalRecordService.getMedicalRecordById(record.id);
      if (!medicalRecord) throw new Error('Không tìm thấy hồ sơ bệnh án');

      const detailRecord = {
        id: medicalRecord.id,
        petId: medicalRecord.vetPetDTO?.id || medicalRecord.petId || record.petId || 'N/A',
        petName: medicalRecord.vetPetDTO?.namePet || medicalRecord.petName || record.petName || 'N/A',
        petType: medicalRecord.vetPetDTO?.petType || medicalRecord.petType || record.petType || 'N/A',
        petWeightId: medicalRecord.vetPetDTO?.petWeight?.petWeightId || medicalRecord.petWeightId || record.petWeightId || null,
        weightRange: medicalRecord.vetPetDTO?.petWeight?.weightRange || medicalRecord.weightRange || record.weightRange || 'N/A',
        breed: medicalRecord.breed || record.breed || 'N/A',
        owner: medicalRecord.vetPetDTO?.nameBoss || medicalRecord.owner || record.owner || 'N/A',
        phoneBoss: medicalRecord.vetPetDTO?.phoneBoss || medicalRecord.phoneBoss || record.phoneBoss || 'N/A',
        age: medicalRecord.vetPetDTO?.age || medicalRecord.age || record.age || 0,
        basicNote: medicalRecord.vetPetDTO?.note || medicalRecord.basicNote || record.basicNote || '',
        symptoms: medicalRecord.symptoms || 'N/A',
        diagnosis: medicalRecord.diagnosis || 'N/A',
        treatment: medicalRecord.treatment || 'N/A',
        medicalNote: medicalRecord.note || '',
        vaccineId: medicalRecord.vaccineId?.toString() || '',
        vetServiceId: medicalRecord.vetServiceId?.toString() || '',
        paid_amount: medicalRecord.paid_amount || record.paid_amount || 0,
        examDate: medicalRecord.examDate || record.examDate || new Date().toISOString(),
      };

      setSelectedDetailRecord(detailRecord);
      setShowForm(false);
    } catch (error) {
      toast.error('Lỗi khi tải thông tin chi tiết hồ sơ', { position: 'top-right', autoClose: 3000 });
    }
  };

  const formatPrice = (price) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A');

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 p-6"
      >
        <ToastContainer />
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-[#754826]">
              <ClipboardList className="mr-2" /> Hồ Sơ Bệnh Án
            </h2>
            <button
                onClick={() => {
                  setFormMode('create');
                  setSelectedRecord(null);
                  setShowForm(true);
                  setSelectedDetailRecord(null);
                }}
                className="flex items-center px-4 py-2 bg-[#754826] text-white rounded-md hover:bg-[#5e3a20] disabled:opacity-50"
                disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Hồ Sơ Mới
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                  <MedicalRecordForm
                      onSave={handleSaveRecord}
                      mode={formMode}
                      initialData={selectedRecord}
                      petId={formMode === 'addVisit' || formMode === 'editVisit' ? selectedRecord?.petId : null}
                      visitIndex={formMode === 'editVisit' ? selectedRecord?.visitIndex : null}
                  />
                </motion.div>
            )}
          </AnimatePresence>

          {!showForm && (
              <div className="space-y-6">
                {selectedDetailRecord ? (
                    <RecordDetailView
                        selectedDetailRecord={selectedDetailRecord}
                        setSelectedDetailRecord={setSelectedDetailRecord}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                ) : (
                    <RecordList
                        medicalRecords={medicalRecords}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        setPage={setPage}
                        handleViewDetails={handleViewDetails}
                        handleAddVisit={handleAddVisit}
                        handleUpdateRecord={handleUpdateRecord}
                        handleUpdateVisit={handleUpdateVisit}
                        formatPrice={formatPrice}
                    />
                )}
              </div>
          )}
        </div>
      </motion.div>
  );
};

export default MedicalRecords;