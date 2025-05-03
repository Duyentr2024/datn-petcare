import axios from 'axios';
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from '../../config';

export const deleteVaccine = async (id, retries = 2) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.delete(`${API_BASE_URL}/api/vaccines/deleteVaccine/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;

        // Kiểm tra message để xác định thành công, thay vì chỉ dựa vào success
        if (apiResponse.message?.includes("thành công")) {
            return apiResponse.data || apiResponse.message; // Trả về data hoặc message nếu thành công
        }

        throw new Error(apiResponse.message || 'Không thể toggle trạng thái vaccine');
    } catch (error) {
        // Retry chỉ khi lỗi không có response (thường là lỗi mạng) và còn lượt retry
        if (retries > 0 && !error.response) {
            return deleteVaccine(id, retries - 1);
        }

        // Giữ nguyên message từ backend nếu có, nếu không thì báo lỗi chung
        throw new Error(error.response?.data?.message || 'Lỗi khi toggle trạng thái vaccine');
    }
};

// Các hàm khác giữ nguyên như bạn đã cung cấp
export const createVaccine = async (vaccineData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.post(`${API_BASE_URL}/api/vaccines/create`, vaccineData, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const apiResponse = response.data;
        if (!apiResponse.success) {
            throw new Error(apiResponse.message);
        }
        return apiResponse.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo vaccine');
    }
};

export const getAllVaccines = async () => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.get(`${API_BASE_URL}/api/vaccines/getAllVaccines`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;
        if (!apiResponse.success) {
            throw new Error(apiResponse.message);
        }
        return apiResponse.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách vaccine');
    }
};

export const getVaccineById = async (id) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.get(`${API_BASE_URL}/api/vaccines/getVaccine/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const apiResponse = response.data;
        if (!apiResponse.success) {
            throw new Error(apiResponse.message);
        }
        return apiResponse.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin vaccine');
    }
};

export const updateVaccine = async (id, vaccineData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await axios.put(`${API_BASE_URL}/api/vaccines/updateVaccine/${id}`, vaccineData, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const apiResponse = response.data;
        if (!apiResponse.success) {
            throw new Error(apiResponse.message);
        }
        return apiResponse.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật vaccine');
    }
};

export default {
    createVaccine,
    getAllVaccines,
    getVaccineById,
    updateVaccine,
    deleteVaccine,
};