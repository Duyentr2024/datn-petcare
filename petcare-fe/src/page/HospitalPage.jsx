import { Routes, Route } from 'react-router-dom';
import Header from '../components/hospital/Header';
import MedicalRecords from '../components/hospital/MedicalRecords';
import ClinicManagementPage from '../components/hospital/ClinicManagementPage';
import VaccineManagement from '../components/hospital/VaccineManagement';
import InvoiceManagement from '../components/hospital/InvoiceManagement';
import ServiceManagement from '../components/hospital/ServiceManagement';

const HospitalPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Thêm lớp no-print để ẩn Header khi in */}
            <Header className="no-print" />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Routes>
                    {/* Route cho ClinicManagementPage và các route con */}
                    <Route path="/clinic-management" element={<ClinicManagementPage />}>
                        <Route path="vaccine" element={<VaccineManagement />} />
                        <Route path="service" element={<ServiceManagement />} />
                        <Route path="invoice" element={<InvoiceManagement />} />
                        <Route index element={<VaccineManagement />} /> {/* Mặc định là vaccine */}
                    </Route>
                    {/* Route cho MedicalRecords */}
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    {/* Route mặc định (tùy chọn, nếu cần) */}
                    <Route index element={<ClinicManagementPage />} />
                </Routes>
            </main>
        </div>
    );
};

export default HospitalPage;