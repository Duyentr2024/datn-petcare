import axios from 'axios';
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api`;

export const MedicalRecordService = {
    createMedicalRecord: async (medicalRecordData) => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await axios.post(`${API_BASE_URL}/api/medical-records`, medicalRecordData, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error creating medical record');
        }
    },

    getAllMedicalRecords: async () => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await axios.get(`${API_URL}/medical-records`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical records');
        }
    },

    getMedicalRecordsByPetId: async (petId) => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await axios.get(`${API_URL}/medical-records/pet/${petId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical records for pet');
        }
    },

    getMedicalRecordById: async (id) => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await axios.get(`${API_URL}/medical-records/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error fetching medical record');
        }
    },

    updateMedicalRecord: async (id, medicalRecordData) => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await axios.put(`${API_URL}/medical-records/${id}`, medicalRecordData, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Error updating medical record');
        }
    },
};