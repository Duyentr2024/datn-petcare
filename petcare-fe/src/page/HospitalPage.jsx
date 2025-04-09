import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Chỉ giữ Routes và Route
import Header from '../components/hospital/Header';
import MedicalRecords from '../components/hospital/MedicalRecords';

const HospitalPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Routes>
                    <Route path="/medical-records" element={<MedicalRecords />} />
                </Routes>
            </main>
        </div>
    );
};

export default HospitalPage;