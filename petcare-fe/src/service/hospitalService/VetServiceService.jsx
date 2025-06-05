import axios from 'axios';
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from '../../config';

// Toggle trạng thái active (xóa mềm / khôi phục)
export const toggleVetService = async (id, retries = 2) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.patch(`${API_BASE_URL}/api/vet-services/${id}/toggle-active`, null, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;

        if (apiResponse.success && apiResponse.message.includes("thành công")) {
            return apiResponse.data || apiResponse.message; // Note: data is null for this endpoint
        }

        throw new Error(apiResponse.message || 'Không thể toggle trạng thái dịch vụ thú y');
    } catch (error) {
        if (retries > 0 && !error.response) {
            return toggleVetService(id, retries - 1);
        }

        throw new Error(error.response?.data?.message || 'Lỗi khi toggle trạng thái dịch vụ thú y');
    }
};

// Tạo dịch vụ thú y
export const createVetService = async (serviceData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.post(`${API_BASE_URL}/api/vet-services`, serviceData, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const apiResponse = response.data;
        if (apiResponse.success) {
            return apiResponse.data; // Returns the created VetService
        }
        throw new Error(apiResponse.message || 'Lỗi khi tạo dịch vụ thú y');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo dịch vụ thú y');
    }
};

// Lấy tất cả dịch vụ
export const getAllVetServices = async () => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.get(`${API_BASE_URL}/api/vet-services`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;
        if (apiResponse.success) {
            return apiResponse.data; // Returns the list of VetServices
        }
        throw new Error(apiResponse.message || 'Lỗi khi lấy danh sách dịch vụ thú y');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách dịch vụ thú y');
    }
};

// Lấy tất cả dịch vụ đang active
export const getAllActiveVetServices = async () => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.get(`${API_BASE_URL}/api/vet-services/active`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;
        if (apiResponse.success) {
            return apiResponse.data; // Returns the list of active VetServices
        }
        throw new Error(apiResponse.message || 'Lỗi khi lấy danh sách dịch vụ đang hoạt động');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách dịch vụ đang hoạt động');
    }
};

// Lấy chi tiết dịch vụ theo ID
export const getVetServiceById = async (id) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.get(`${API_BASE_URL}/api/vet-services/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;
        if (apiResponse.success) {
            return apiResponse.data; // Returns the VetService
        }
        throw new Error(apiResponse.message || 'Lỗi khi lấy thông tin dịch vụ');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin dịch vụ');
    }
};

// Cập nhật dịch vụ
export const updateVetService = async (id, serviceData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.put(`${API_BASE_URL}/api/vet-services/${id}`, serviceData, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const apiResponse = response.data;
        if (apiResponse.success) {
            return apiResponse.data; // Returns the updated VetService
        }
        throw new Error(apiResponse.message || 'Lỗi khi cập nhật dịch vụ');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật dịch vụ');
    }
};

export default {
    createVetService,
    getAllVetServices,
    getAllActiveVetServices,
    getVetServiceById,
    updateVetService,
    toggleVetService,
};