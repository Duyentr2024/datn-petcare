import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const MedicalRecordService = {
    createMedicalRecord: async (medicalRecordData) => {
        try {
            const response = await axios.post("http://localhost:8080/api/medical-records", medicalRecordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error creating medical record');
        }
    },

    getAllMedicalRecords: async () => {
        try {
            const response = await axios.get(`${API_URL}/medical-records`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical records');
        }
    },

    getMedicalRecordsByPetId: async (petId) => {
        try {
            const response = await axios.get(`${API_URL}/medical-records/pet/${petId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical records for pet');
        }
    },

    getMedicalRecordById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/medical-records/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical record');
        }
    },

    updateMedicalRecord: async (id, medicalRecordData) => {
        try {
            const response = await axios.put(`${API_URL}/medical-records/${id}`, medicalRecordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error updating medical record');
        }
    },
};