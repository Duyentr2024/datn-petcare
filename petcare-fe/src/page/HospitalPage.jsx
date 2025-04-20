import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/hospital/Header';
import MedicalRecords from '../components/hospital/MedicalRecords';
import ClinicManagementPage from '../components/hospital/ClinicManagementPage';
import VaccineManagement from '../components/hospital/VaccineManagement';
import InvoiceManagement from '../components/hospital/InvoiceManagement';
import ServiceManagement from '../components/hospital/ServiceManagement';

const HospitalPage = () => {
    const location = useLocation(); // Lấy location để theo dõi thay đổi route

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header className="no-print" />
            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* AnimatePresence để quản lý hiệu ứng khi route thay đổi */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname} // Key thay đổi khi route thay đổi
                        initial={{ opacity: 0, y: 20 }} // Trạng thái ban đầu
                        animate={{ opacity: 1, y: 0 }} // Trạng thái hiển thị
                        exit={{ opacity: 0, y: -20 }} // Trạng thái khi rời đi
                        transition={{ duration: 0.3 }} // Thời gian chuyển tiếp
                    >
                        <Routes location={location} key={location.pathname}>
                            <Route path="/clinic-management" element={<ClinicManagementPage />}>
                                <Route path="vaccine" element={<VaccineManagement />} />
                                <Route path="service" element={<ServiceManagement />} />
                                <Route path="invoice" element={<InvoiceManagement />} />
                                <Route index element={<VaccineManagement />} />
                            </Route>
                            <Route path="/medical-records" element={<MedicalRecords />} />
                            <Route index element={<ClinicManagementPage />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HospitalPage;