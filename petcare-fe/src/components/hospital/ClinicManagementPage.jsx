import { NavLink, Routes, Route } from 'react-router-dom';
import { Syringe, Stethoscope, Receipt } from 'lucide-react';
import VaccineManagement from '../hospital/VaccineManagement';
import ServiceManagement from '../hospital/ServiceManagement';
import  InvoiceManagement  from '../hospital/InvoiceManagement';
const ClinicManagementPage = () => {
    const tabs = [
        {
            id: 'vaccine',
            name: 'Quản lý Vaccine',
            icon: <Syringe className="w-5 h-5" />,
            path: 'vaccine',
        },
        {
            id: 'service',
            name: 'Quản lý Dịch vụ',
            icon: <Stethoscope className="w-5 h-5" />,
            path: 'service',
        },
        {
            id: 'invoice',
            name: 'Quản lý Hóa đơn',
            icon: <Receipt className="w-5 h-5" />,
            path: 'invoice',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="container mx-auto px-4 py-10 flex-grow">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-white p-2 rounded-full shadow-md border border-gray-100">
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.id}
                                to={`/hospital/clinic-management/${tab.path}`}
                                className={({ isActive }) =>
                                    `flex items-center px-6 py-2 rounded-full font-medium text-sm transition-all duration-500 ease-in-out transform ${
                                        isActive
                                            ? 'bg-white text-[#7b4d2b] border border-[#7b4d2b] shadow-md scale-105'
                                            : 'bg-transparent text-gray-500 hover:bg-[#e8dfd7] hover:scale-102 hover:shadow-sm'
                                    }`
                                }
                            >
                                <span
                                    className={`mr-2 transition-colors duration-500 ease-in-out ${
                                        tab.id === tab.id ? 'text-[#7b4d2b]' : 'text-gray-500'
                                    }`}
                                >
                                    {tab.icon}
                                </span>
                                <span>{tab.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <Routes>
                        <Route path="vaccine" element={<VaccineManagement />} />
                        <Route path="service" element={<ServiceManagement />} />
                        <Route path="invoice" element={<InvoiceManagement />} />
                        <Route index element={<VaccineManagement />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default ClinicManagementPage;